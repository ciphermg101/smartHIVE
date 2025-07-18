import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

interface SocketContextProps {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (room: string, content: string, meta?: Record<string, any>) => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    if (isSignedIn) {
      getToken().then((token) => {
        socket = io('/', {
          auth: { token },
          autoConnect: true,
          transports: ['websocket'],
        });
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socketRef.current = socket;
      });
    }
    return () => {
      socket?.disconnect();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const joinRoom = (room: string) => {
    socketRef.current?.emit('joinRoom', { room });
  };
  const leaveRoom = (room: string) => {
    socketRef.current?.emit('leaveRoom', { room });
  };
  const sendMessage = (room: string, content: string, meta?: Record<string, any>) => {
    socketRef.current?.emit('sendMessage', { room, content, ...meta });
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinRoom, leaveRoom, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
} 