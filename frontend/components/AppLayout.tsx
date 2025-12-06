'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import NewSidebar from './NewSidebar'
import AskAIButton from './AskAIButton'

const publicRoutes = ['/login', '/signup', '/company-setup']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarWidth = useMemo(() => (sidebarCollapsed ? 96 : 280), [sidebarCollapsed])

  if (isPublicRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NewSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} />

      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="min-h-screen">{children}</main>
      </div>

      <AskAIButton />
    </div>
  )
}
