import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logger } from "./lib/logger";
import { httpRequestDuration, httpRequests } from "./lib/metrics";
import { initSentry, Sentry } from "./lib/sentry";

// Initialize Sentry
initSentry();

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Metrics and logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = path.startsWith("/api") ? path : "static";
    
    // Record metrics
    httpRequestDuration.observe(
      { method: req.method, route, status: res.statusCode.toString() },
      duration
    );
    httpRequests.inc({ method: req.method, route, status: res.statusCode.toString() });

    // Log API requests
    if (path.startsWith("/api")) {
      logger.info(`${req.method} ${path}`, {
        statusCode: res.statusCode,
        duration: `${(duration * 1000).toFixed(2)}ms`,
        response: capturedJsonResponse
      });
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Sentry error handler must be before other error handlers
  // setupExpressErrorHandler modifies the app directly
  Sentry.setupExpressErrorHandler(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with Winston
    logger.error('Request error', {
      error: err.message,
      stack: err.stack,
      status,
      path: _req.path
    });

    // Capture error in Sentry with additional context
    Sentry.captureException(err, {
      tags: {
        route: _req.path,
        method: _req.method,
      },
      extra: {
        statusCode: status,
        body: _req.body,
        query: _req.query,
      }
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server started on port ${port}`, { port, env: process.env.NODE_ENV });
    log(`serving on port ${port}`);
  });
})();
