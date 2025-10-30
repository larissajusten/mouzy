import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketMessage } from '@shared/schema';

interface UseWebSocketOptions {
  roomCode: string;
  playerId: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  initialMessage?: object;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  roomCode,
  playerId,
  onMessage,
  initialMessage,
  onError,
}: UseWebSocketOptions) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  
  // Use refs to avoid recreating the socket when callbacks change
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const sendMessage = useCallback((message: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [ws]);

  useEffect(() => {
    if (!roomCode || !playerId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Send initial join message or custom initial message
      const message = initialMessage || { type: 'join-room', roomCode, playerId };
      socket.send(JSON.stringify(message));
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessageRef.current?.(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      onErrorRef.current?.(error);
      setConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      setConnected(false);
      setWs(null);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [roomCode, playerId, initialMessage]);

  return { ws, connected, sendMessage };
}

