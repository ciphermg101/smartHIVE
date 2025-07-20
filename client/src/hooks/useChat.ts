import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@clerk/clerk-react'

const API = '/api/v1/chat'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export function useChatMessages(room: string) {
  return useQuery({
    queryKey: ['chatMessages', room],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/messages`, { params: { room } })
      return data.data
    },
    enabled: !!room,
  })
}

export function useSocket(room: string) {
  const { getToken } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    let active = true
    async function connect() {
      const token = await getToken()
      if (!active) return
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      })
      socket.emit('joinRoom', { room })
      socketRef.current = socket
    }
    if (room) connect()
    return () => {
      active = false
      socketRef.current?.disconnect()
    }
  }, [room, getToken])

  return socketRef
}

export function useSendMessage(room: string) {
  const socketRef = useSocket(room)
  return (content: string) => {
    socketRef.current?.emit('sendMessage', { room, content })
  }
} 