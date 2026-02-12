'use client'

import { useState, useEffect } from 'react'
import { Receipt, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function BillsPage() {
  const { company } = useAuth()
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company?.id) {
      setLoading(false)
      return
    }
    api.get('/bills/')
      .then((data: any) => setBills(Array.isArray(data) ? data : []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false))
  }, [company?.id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!company?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Receipt className="h-16 w-16 text-neutral-400 dark:text-white/30 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No company set up</h2>
        <p className="text-neutral-600 dark:text-white/60 max-w-md mb-6">Finish onboarding to use Bills.</p>
        <a href="/onboarding" className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-sm font-semibold text-white">Complete onboarding</a>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-fuchsia-500" />
        <div>
          <h1 className="text-2xl font-semibold">Bills</h1>
          <p className="text-sm text-neutral-500">Enter bills and pay vendors</p>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        {bills.length === 0 ? (
          <p className="text-neutral-500">No bills yet. Create a vendor, then enter a bill. When you pay it, use Bill Payments.</p>
        ) : (
          <ul className="space-y-2">
            {bills.map((b: any) => (
              <li key={b.id} className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span>{b.bill_number} — {b.contacts?.display_name || 'Vendor'}</span>
                <span>${Number(b.total || 0).toFixed(2)} ({b.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
