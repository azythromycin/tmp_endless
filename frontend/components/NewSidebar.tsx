'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Sparkles,
  User,
  Building2,
  Menu,
  PanelRight,
  Globe
} from 'lucide-react'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/new-dashboard', icon: LayoutDashboard },
  { name: 'Journals', href: '/new-journals', icon: BookOpen },
  { name: 'Chart of Accounts', href: '/chart-of-accounts', icon: FolderTree },
  { name: 'Ask AI', href: '/ai', icon: Sparkles },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Company', href: '/company', icon: Globe }
]

export default function NewSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, company } = useAuth()
  const initials = useMemo(() => {
    const source = user?.full_name || company?.name || 'Endless'
    return (
      source
        .split(' ')
        .filter(Boolean)
        .map(word => word[0]?.toUpperCase())
        .slice(0, 2)
        .join('') || 'EN'
    )
  }, [user?.full_name, company?.name])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 96 : 280 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_20px_120px_rgba(15,23,42,0.7)]"
    >
      <div className="relative flex h-20 items-center justify-between px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 via-cyan-400/10 to-transparent blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-white shadow-[0_10px_40px_rgba(129,80,255,0.4)]">
            <Building2 className="h-5 w-5 text-fuchsia-200" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="leading-tight"
              >
                <p className="text-[11px] uppercase tracking-[0.5em] text-white/60">Endless</p>
                <p className="text-lg font-semibold text-white">Finance OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/60 transition hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                collapsed ? 'justify-center' : ''
              } ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isActive
                    ? 'border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-500/40 to-cyan-500/40 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 group-hover:border-fuchsia-400/30'
                }`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="flex-1"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-sm font-semibold">
              {initials}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="min-w-0"
                >
                  <p className="truncate text-sm font-semibold text-white">{company?.name || 'Demo Company'}</p>
                  <p className="truncate text-xs text-white/60">{user?.email || 'demo@endless.finance'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!collapsed && (
            <p className="mt-3 text-xs text-white/40">Realtime ledgers synced to Endless Copilot.</p>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
