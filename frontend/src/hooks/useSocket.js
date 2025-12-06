// src/hooks/useSocket.js
import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * useSocket
 *
 * - url: socket server url (optional; if not provided uses API_BASE with /socket)
 * - opts: { autoConnect, params, reconnectionAttempts, reconnectionDelay, onConnect, onDisconnect }
 *
 * Returns:
 * - socketRef.current (socket instance)
 * - connected boolean
 * - emit(event, payload)
 * - on(event, handler) -> registers a handler and returns an off() function
 * - off(event, handler)
 * - close()
 *
 * The hook will create a socket and cleanup on unmount.
 */
export default function useSocket(url = null, opts = {}) {
  const {
    autoConnect = true,
    params = {}, // e.g. { token }
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    onConnect,
    onDisconnect,
  } = opts

  const socketRef = useRef(null)
  const handlersRef = useRef(new Map()) // event => Set(handler)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const base = url || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '')
    const socketUrl = url || `${base}` // backend must support socket.io at same origin
    // build options
    const sock = io(socketUrl, {
      autoConnect,
      transports: ['websocket', 'polling'],
      reconnectionAttempts,
      reconnectionDelay,
      auth: params
    })

    socketRef.current = sock

    function handleConnect() {
      setConnected(true)
      onConnect?.()
    }
    function handleDisconnect(reason) {
      setConnected(false)
      onDisconnect?.(reason)
    }

    sock.on('connect', handleConnect)
    sock.on('disconnect', handleDisconnect)

    // forward handlers stored in handlersRef
    handlersRef.current.forEach((setOfHandlers, event) => {
      setOfHandlers.forEach(h => sock.on(event, h))
    })

    return () => {
      try {
        if (sock) {
          sock.off('connect', handleConnect)
          sock.off('disconnect', handleDisconnect)
          sock.disconnect()
        }
      } catch (e) { /* ignore */ }
      socketRef.current = null
      setConnected(false)
      handlersRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params)])

  const emit = useCallback((event, payload, ack) => {
    const sock = socketRef.current
    if (!sock) return
    return sock.emit(event, payload, ack)
  }, [])

  const on = useCallback((event, handler) => {
    const sock = socketRef.current
    if (!handlersRef.current.has(event)) handlersRef.current.set(event, new Set())
    handlersRef.current.get(event).add(handler)
    if (sock) sock.on(event, handler)

    // return unsubscribe
    return () => {
      off(event, handler)
    }
  }, [])

  const off = useCallback((event, handler) => {
    const sock = socketRef.current
    const setOf = handlersRef.current.get(event)
    if (!setOf) return
    setOf.delete(handler)
    if (sock) sock.off(event, handler)
  }, [])

  const close = useCallback(() => {
    const sock = socketRef.current
    if (sock) {
      sock.disconnect()
      socketRef.current = null
    }
  }, [])

  return {
    socket: socketRef,
    connected,
    emit,
    on,
    off,
    close
  }
}
