import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getAccessToken } from '../api/client.js'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

let _socket = null
let _refCount = 0

function getSocket() {
  if (!_socket) {
    _socket = io('/', {
      auth: (cb) => cb({ token: getAccessToken() }),
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      autoConnect: false,
    })
  }
  return _socket
}

/** Connect to the socket server and subscribe to events.
 *  Returns a cleanup function that unsubscribes. */
export function useSocket(events) {
  const eventsRef = useRef(events)
  eventsRef.current = events

  const handlersRef = useRef({})

  useEffect(() => {
    if (IS_DEMO) return

    const socket = getSocket()
    _refCount++

    if (!socket.connected) {
      socket.connect()
    }

    // Register wrapped handlers so we can remove them by reference
    const wrapped = {}
    for (const [event, handler] of Object.entries(eventsRef.current || {})) {
      wrapped[event] = (...args) => eventsRef.current[event]?.(...args)
      socket.on(event, wrapped[event])
    }
    handlersRef.current = wrapped

    return () => {
      for (const [event, handler] of Object.entries(handlersRef.current)) {
        socket.off(event, handler)
      }
      _refCount--
      if (_refCount <= 0) {
        socket.disconnect()
        _socket = null
        _refCount = 0
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Emit a socket event if connected */
export function socketEmit(event, data) {
  if (IS_DEMO || !_socket?.connected) return
  _socket.emit(event, data)
}
