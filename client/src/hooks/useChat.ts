import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { io, Socket } from 'socket.io-client';
import type { IMessage, SendMessageParams } from '@interfaces/chat';
import api from '@lib/axios';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;
const MESSAGES_PER_PAGE = 20;

interface GetMessagesParams {
  apartmentId: string;
  before?: Date;
  limit?: number;
}

export function useChatMessages(apartmentId: string) {
  return useInfiniteQuery({
    queryKey: ['chatMessages', apartmentId],
    queryFn: async ({ pageParam }: { pageParam?: Date }) => {
      const params: GetMessagesParams = {
        apartmentId,
        limit: MESSAGES_PER_PAGE,
      };

      if (pageParam) {
        params.before = pageParam;
      }

      const { data } = await api.get(`/chat/${apartmentId}`, { params });
      return data.data || [];
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < MESSAGES_PER_PAGE) return undefined;
      return new Date(lastPage[lastPage.length - 1].createdAt);
    },
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUnreadCount(apartmentId: string) {
  return useQuery({
    queryKey: ['unreadCount', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/${apartmentId}/unread-count`);
      return data.data?.unreadCount || 0;
    },
    enabled: !!apartmentId,
    refetchInterval: 30000, // 30 seconds
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.post(`/chat/message/${messageId}/read`);
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apartmentId: string) => {
      await api.post(`/chat/${apartmentId}/mark-all-read`);
    },
    onSuccess: (_, apartmentId) => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount', apartmentId] });
    },
  });
}

export function useReactToMessage() {
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      await api.post(`/chat/message/${messageId}/react`, { emoji });
    },
  });
}

export function useSocket(apartmentId: string) {
  const { getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    async function connect() {
      try {
        const token = await getToken();
        if (!active || !token || !apartmentId) return;

        const socket = io(SOCKET_URL, {
          auth: { token },
          path: '/socket.io',
          transports: ['websocket'],
          query: { apartmentId },
        });

        socket.on('connect', () => {
          console.log('Connected to chat socket');
        });

        socket.on('newMessage', (message: IMessage) => {
          queryClient.setQueryData<IMessage[]>(['chatMessages', apartmentId], (old = []) => {
            if (old.some(m => m._id === message._id)) return old;
            return [...old, message];
          });
        });

        socket.on('messageUpdated', (updatedMessage: IMessage) => {
          queryClient.setQueryData<IMessage[]>(['chatMessages', apartmentId], (old = []) =>
            old.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg)
          );
        });

        socket.on('messageDeleted', (messageId: string) => {
          queryClient.setQueryData<IMessage[]>(['chatMessages', apartmentId], (old = []) =>
            old.filter(msg => msg._id !== messageId)
          );
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socketRef.current = socket;
        return () => {
          socket.disconnect();
        };
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    }

    connect();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [apartmentId, getToken, queryClient]);

  return socketRef;
}

export function useSendMessage(apartmentId: string) {
  // We'll keep the socket connection active through the socket provider
  useSocket(apartmentId);

  const sendMessage = useCallback(async (params: Omit<SendMessageParams, 'apartmentId'>) => {
    if (!apartmentId) {
      throw new Error('No apartment selected');
    }

    const messageData: SendMessageParams = {
      ...params,
      apartmentId,
    };

    try {
      const { data } = await api.post('/chat', messageData);
      return data.data as IMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [apartmentId]);

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => { },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/chat/message/${messageId}`);
    },
    onSuccess: (_, messageId) => {
      const queryCache = queryClient.getQueryCache();
      const query = queryCache.find({
        queryKey: ['chatMessages'],
        exact: false,
      });

      if (query) {
        queryClient.setQueryData<IMessage[]>(query.queryKey, (old = []) =>
          old.filter(msg => msg._id !== messageId)
        );
      }
    },
  });
}