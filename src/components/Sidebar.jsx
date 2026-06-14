import { Search, Sun, Moon, BookOpen, ChevronsLeft, ChevronsRight } from 'lucide-react'
import NotificationBell from './NotificationBell.jsx'

function Avatar({ user, size = 26 }) {
  if (!user) return <div className="rounded-full bg-s10 shrink-0" style={{ width: size, height: size }} />
  return (
    <div className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, background: user.avatarColor || 'var(--accent)', fontSize: size * 0.35, color: '#fff' }}>
      {user.avatarInitials || (user.displayName || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function Sidebar({
  tabs, activeTab, onTabChange, onOpenSearch,
  isDark, onToggleTheme, user, onNotificationNavigate,
  collapsed, onToggleCollapsed,
}) {
  return (
    <aside className="sidebar hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:self-start shrink-0 border-r border-t06"
      style={{ width: collapsed ? '76px' : '232px', background: 'var(--nav-bg)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 h-14 px-4 border-b border-t06 overflow-hidden">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8A020' }}>
          <BookOpen size={14} style={{ color: 'var(--bg)' }} />
        </div>
        {!collapsed && <span className="font-display text-base font-semibold whitespace-nowrap">Hobbyist</span>}
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-3 overflow-y-auto no-scrollbar">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onTabChange(id)} title={collapsed ? label : undefined}
            className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
            style={activeTab === id ? { background: 'var(--accent-12)', color: '#E8A020' } : { color: 'var(--text-50)' }}>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-1 px-3 py-3 border-t border-t06">
        <button onClick={onOpenSearch} title={collapsed ? 'Search' : undefined}
          className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'var(--text-50)' }}>
          <Search size={18} className="shrink-0" />
          {!collapsed && <span>Search</span>}
        </button>

        <button onClick={onToggleTheme} title={collapsed ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
          className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'var(--text-50)' }}>
          {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        <div className="flex items-center gap-3 px-1 py-1 text-sm font-medium" style={{ color: 'var(--text-50)' }}>
          <NotificationBell onNavigate={onNotificationNavigate} />
          {!collapsed && <span>Notifications</span>}
        </div>

        <button onClick={() => onTabChange('profile')} title={collapsed ? 'Your profile' : undefined}
          className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'var(--text-70)' }}>
          <Avatar user={user} size={26} />
          {!collapsed && <span className="truncate">{user?.displayName || 'Profile'}</span>}
        </button>

        <button onClick={onToggleCollapsed} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'var(--text-35)' }}>
          {collapsed ? <ChevronsRight size={18} className="shrink-0" /> : <ChevronsLeft size={18} className="shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
