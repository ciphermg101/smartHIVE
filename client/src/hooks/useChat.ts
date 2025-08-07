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
      // Fix: Handle nested data structure
      return data.data?.data || data.data || data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined;
      const messages = lastPage.messages;
      if (!messages || messages.length === 0) return undefined;
      return new Date(messages[0].createdAt);
    },
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      messages: data.pages.flatMap(page => page.messages || [])
    }),
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

        // Disconnect existing socket if any
        if (socketRef.current?.connected) {
          socketRef.current.disconnect();
        }

        const socket = io(SOCKET_URL, {
          auth: { token },
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          query: { apartmentId },
          forceNew: true,
        });

        socket.on('connect', () => {
          console.log('Connected to chat socket');
          // Join apartment room after connection
          socket.emit('join-apartment', { apartmentId });
        });

        socket.on('joined-apartment', (data) => {
          console.log('Joined apartment:', data.apartmentId);
        });

        socket.on('new-message', (message: IMessage) => {
          console.log('Received new message:', message);
          queryClient.setQueryData(['chatMessages', apartmentId], (old: any) => {
            if (!old) {
              return {
                pages: [{ messages: [message], hasMore: false }],
                pageParams: [undefined]
              };
            }

            const firstPage = old.pages[0];
            if (!firstPage) {
              return {
                ...old,
                pages: [{ messages: [message], hasMore: false }]
              };
            }

            // Check if message already exists
            const messageExists = firstPage.messages.some((m: IMessage) => m._id === message._id);
            if (messageExists) return old;

            // Add message to first page
            const newFirstPage = {
              ...firstPage,
              messages: [...firstPage.messages, message]
            };

            return {
              ...old,
              pages: [newFirstPage, ...old.pages.slice(1)]
            };
          });
        });

        socket.on('message-updated', (updatedMessage: IMessage) => {
          queryClient.setQueryData(['chatMessages', apartmentId], (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: IMessage) =>
                  msg._id === updatedMessage._id ? updatedMessage : msg
                )
              }))
            };
          });
        });

        socket.on('message-deleted', (messageId: string) => {
          queryClient.setQueryData(['chatMessages', apartmentId], (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.filter((msg: IMessage) => msg._id !== messageId)
              }))
            };
          });
        });

        socket.on('user-typing', (data) => {
          // Handle typing indicator
          console.log('User typing:', data);
        });

        socket.on('user-stopped-typing', (data) => {
          // Handle stop typing indicator
          console.log('User stopped typing:', data);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    }

    connect();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.emit('leave-apartment', { apartmentId });
        socket.current.disconnect();
        socketRef.current = null;
      }
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