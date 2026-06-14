import { useState, useEffect, useCallback } from 'react'
import { Bell, MessageCircle, Heart, Users, BookOpen } from 'lucide-react'
import { get, post } from '../api/client.js'

const POLL_INTERVAL = 30000

const TYPE_ICONS = {
  post: BookOpen,
  reply: MessageCircle,
  like: Heart,
  chat: MessageCircle,
  club_join: Users,
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    try {
      const data = await get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch { /* bell is non-critical, ignore failures */ }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    const interval = setInterval(load, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [load])

  async function markRead(id) {
    setNotifications(ns => ns.map(n => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount(c => Math.max(0, c - 1))
    try { await post(`/notifications/${id}/read`, {}) } catch { /* optimistic update already applied */ }
  }

  async function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    try { await post('/notifications/read-all', {}) } catch { /* optimistic update already applied */ }
  }

  function handleSelect(n) {
    if (!n.read) markRead(n.id)
    setOpen(false)
    onNavigate?.(n.target)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="relative rounded-lg p-1.5 transition-colors"
        style={{ background: 'var(--border)', color: 'var(--text-dim)' }} title="Notifications">
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-semibold leading-none min-w-[16px] h-4 px-1"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-t06 shadow-lg z-40 overflow-hidden"
            style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-t06">
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--accent)' }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-t40">No notifications yet</div>
              ) : notifications.map(n => {
                const Icon = TYPE_ICONS[n.type] || Bell
                return (
                  <button key={n.id} onClick={() => handleSelect(n)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors hover:opacity-90"
                    style={{ background: n.read ? 'transparent' : 'var(--accent-12)' }}>
                    <div className="rounded-full p-1.5 mt-0.5 shrink-0" style={{ background: 'var(--border-08)', color: 'var(--text-dim)' }}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{n.message}</p>
                      <p className="text-xs text-t35 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
