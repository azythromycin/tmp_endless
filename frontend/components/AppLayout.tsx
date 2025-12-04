'use client'

import { usePathname } from 'next/navigation'
import NewSidebar from './NewSidebar'
import AskAIButton from './AskAIButton'

const publicRoutes = ['/login', '/signup', '/company-setup']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <NewSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-auto">
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Floating Ask AI Button */}
      <AskAIButton />
    </div>
  )
}
