'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Loader2, TrendingUp, Scale, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function ReportsPage() {
  const { company } = useAuth()
  const [pl, setPl] = useState<any>(null)
  const [bs, setBs] = useState<any>(null)
  const [cf, setCf] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company?.id) {
      setLoading(false)
      return
    }
    Promise.all([
      api.get('/reports/profit-loss').catch(() => null),
      api.get('/reports/balance-sheet').catch(() => null),
      api.get('/reports/cash-flow').catch(() => null),
    ]).then(([a, b, c]) => {
      setPl(a)
      setBs(b)
      setCf(c)
    }).finally(() => setLoading(false))
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
        <BarChart3 className="h-16 w-16 text-neutral-400 dark:text-white/30 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No company set up</h2>
        <p className="text-neutral-600 dark:text-white/60 max-w-md mb-6">Finish onboarding to use Reports.</p>
        <a href="/onboarding" className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-sm font-semibold text-white">Complete onboarding</a>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-fuchsia-500" />
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-neutral-500">Profit & Loss, Balance Sheet, Cash Flow</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-2 text-neutral-500 mb-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Profit & Loss</span>
          </div>
          {pl && (
            <div className="space-y-1">
              <p>Revenue: ${Number(pl.revenue_total || 0).toFixed(2)}</p>
              <p>Expenses: ${Number(pl.expense_total || 0).toFixed(2)}</p>
              <p className="font-semibold pt-2">Net income: ${Number(pl.net_income || 0).toFixed(2)}</p>
            </div>
          )}
          {!pl && <p className="text-neutral-500 text-sm">No data yet</p>}
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-2 text-neutral-500 mb-3">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-medium">Balance Sheet</span>
          </div>
          {bs && (
            <div className="space-y-1">
              <p>Assets: ${Number(bs.assets || 0).toFixed(2)}</p>
              <p>Liabilities: ${Number(bs.liabilities || 0).toFixed(2)}</p>
              <p>Equity: ${Number(bs.equity || 0).toFixed(2)}</p>
            </div>
          )}
          {!bs && <p className="text-neutral-500 text-sm">No data yet</p>}
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-2 text-neutral-500 mb-3">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Cash Flow</span>
          </div>
          {cf && (
            <p className="font-semibold">Cash & equivalents: ${Number(cf.cash_and_equivalents || 0).toFixed(2)}</p>
          )}
          {!cf && <p className="text-neutral-500 text-sm">No data yet</p>}
        </div>
      </div>
    </div>
  )
}
