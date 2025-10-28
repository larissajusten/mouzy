import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import CreateRoom from "@/pages/CreateRoom";
import JoinRoom from "@/pages/JoinRoom";
import Lobby from "@/pages/Lobby";
import Game from "@/pages/Game";
import Results from "@/pages/Results";
import Achievements from "@/pages/Achievements";
import Training from "@/pages/Training";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateRoom} />
      <Route path="/join" component={JoinRoom} />
      <Route path="/lobby/:code" component={Lobby} />
      <Route path="/game/:code" component={Game} />
      <Route path="/results/:code" component={Results} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/training" component={Training} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
