'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type MonthlyTrendPoint = { month: string; income: number; expenses: number }

interface RecentTransaction {
  id: string
  journal_number: string
  entry_date: string
  memo: string
  total_debit: number
  total_credit: number
  status: string
}

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netPosition: number
  transactionCount: number
  topVendor: string
  healthScore: number
  monthlyTrend: MonthlyTrendPoint[]
  categoryBreakdown: Array<{ name: string; value: number }>
  recentTransactions: RecentTransaction[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

export default function NewDashboard() {
  const { company } = useAuth()
  const companyId = company?.id || null
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)

  const fetchDashboardData = useCallback(async (targetCompanyId: string) => {
    try {
      setLoading(true)

      const statsResponse = await api.get(`/dashboard/stats/${targetCompanyId}`)
      const trendResponse = await api.get(`/dashboard/monthly-trend/${targetCompanyId}`)
      const breakdownResponse = await api.get(`/dashboard/category-breakdown/${targetCompanyId}`)
      const transactionsResponse = await api.get(`/dashboard/recent-transactions/${targetCompanyId}`)

      setStats({
        totalIncome: statsResponse.total_income || 0,
        totalExpenses: statsResponse.total_expenses || 0,
        netPosition: statsResponse.net_position || 0,
        transactionCount: statsResponse.transaction_count || 0,
        topVendor: statsResponse.top_vendor || 'N/A',
        healthScore: statsResponse.health_score || 0,
        monthlyTrend: trendResponse || [],
        categoryBreakdown: breakdownResponse || [],
        recentTransactions: transactionsResponse || []
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        netPosition: 0,
        transactionCount: 0,
        topVendor: 'N/A',
        healthScore: 0,
        monthlyTrend: [],
        categoryBreakdown: [],
        recentTransactions: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAISummary = useCallback(async (targetCompanyId: string) => {
    try {
      setLoadingSummary(true)
      const response = await api.post('/ai/query', {
        company_id: targetCompanyId,
        question: 'Give me a brief summary of my business financial health'
      })
      setAiSummary(response.answer || 'No summary available')
    } catch (error) {
      console.error('Failed to fetch AI summary:', error)
      setAiSummary('AI summary unavailable')
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    if (!companyId) return
    fetchDashboardData(companyId)
    fetchAISummary(companyId)
  }, [companyId, fetchDashboardData, fetchAISummary])

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) return 0
      return 100
    }
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const getLatestAndPrevious = (key: 'income' | 'expenses'): [number, number] => {
    const series = stats?.monthlyTrend || []
    if (series.length === 0) {
      const fallback = key === 'income' ? stats?.totalIncome ?? 0 : stats?.totalExpenses ?? 0
      return [fallback, fallback]
    }
    if (series.length === 1) {
      const current = series[0][key] || 0
      return [current, current]
    }
    const current = series[series.length - 1]?.[key] || 0
    const previous = series[series.length - 2]?.[key] || 0
    return [current, previous]
  }

  const formatPercentChange = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0
    const formatted = Math.abs(safeValue).toFixed(1)
    const sign = safeValue >= 0 ? '+' : '-'
    return `${sign}${formatted}%`
  }

  const buildChangeMeta = (value: number, goodWhenPositive: boolean = true) => {
    const isPositive = value >= 0
    return {
      Icon: isPositive ? ArrowUpRight : ArrowDownRight,
      colorClass:
        isPositive === goodWhenPositive ? 'text-green-600' : 'text-red-600',
      label: formatPercentChange(value)
    }
  }

  const [
    incomeChangeMeta,
    expenseChangeMeta,
    netPositionChangeMeta
  ] = useMemo(() => {
    if (!stats) {
      return [
        buildChangeMeta(0),
        buildChangeMeta(0, false),
        buildChangeMeta(0)
      ]
    }

    const [currentIncome, previousIncome] = getLatestAndPrevious('income')
    const [currentExpenses, previousExpenses] = getLatestAndPrevious('expenses')

    const incomeChange = getPercentChange(currentIncome, previousIncome)
    const expenseChange = getPercentChange(currentExpenses, previousExpenses)
    const netPositionChange = getPercentChange(
      currentIncome - currentExpenses,
      previousIncome - previousExpenses
    )

    return [
      buildChangeMeta(incomeChange),
      buildChangeMeta(expenseChange, false),
      buildChangeMeta(netPositionChange)
    ]
  }, [stats])

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  const IncomeChangeIcon = incomeChangeMeta.Icon
  const ExpenseChangeIcon = expenseChangeMeta.Icon
  const NetChangeIcon = netPositionChangeMeta.Icon
  const hasTransactions = stats.recentTransactions.length > 0

  return (
    <div className="min-h-screen p-8 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Financial cockpit</p>
        <h1 className="text-3xl font-semibold text-white mt-2">Live performance overview</h1>
        <p className="text-white/60 mt-1">Glass dashboard blending ledgers with AI insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-400/40 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-300" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${incomeChangeMeta.colorClass.replace('text-', 'text-')}`}>
              <IncomeChangeIcon className="w-4 h-4" />
              {incomeChangeMeta.label}
            </span>
          </div>
          <p className="text-white/60 text-sm tracking-wide">Total Income</p>
          <p className="text-3xl font-semibold text-white mt-2">
            ${stats.totalIncome.toLocaleString()}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-400/40 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-300" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${expenseChangeMeta.colorClass.replace('text-', 'text-')}`}>
              <ExpenseChangeIcon className="w-4 h-4" />
              {expenseChangeMeta.label}
            </span>
          </div>
          <p className="text-white/60 text-sm tracking-wide">Total Expenses</p>
          <p className="text-3xl font-semibold text-white mt-2">
            ${stats.totalExpenses.toLocaleString()}
          </p>
        </div>

        {/* Net Position */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-400/40 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-sky-300" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${netPositionChangeMeta.colorClass.replace('text-', 'text-')}`}>
              <NetChangeIcon className="w-4 h-4" />
              {netPositionChangeMeta.label}
            </span>
          </div>
          <p className="text-white/60 text-sm tracking-wide">Net Position</p>
          <p className="text-3xl font-semibold text-white mt-2">
            ${stats.netPosition.toLocaleString()}
          </p>
        </div>

        {/* Health Score */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-fuchsia-400/40 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-fuchsia-300" />
            </div>
            <span className="text-fuchsia-200 text-sm font-medium">Good</span>
          </div>
          <p className="text-white/60 text-sm tracking-wide">Health Score</p>
          <p className="text-3xl font-semibold text-white mt-2">{stats.healthScore}/100</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-900/70 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
        <div className="flex items-start gap-4 relative">
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-fuchsia-200" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">AI financial summary</h3>
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing your finances...</span>
              </div>
            ) : (
              <p className="text-white/75 leading-relaxed">{aiSummary}</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  color: '#f8fafc'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#fb7185"
                strokeWidth={2}
                dot={{ fill: '#fb7185', r: 4 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  color: '#f8fafc'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <button className="text-sm text-fuchsia-300 hover:text-fuchsia-200 font-medium">
            View all →
          </button>
        </div>
        {hasTransactions ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Journal #</th>
                  <th className="px-4 py-3">Memo</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="px-4 py-3 text-white/70">
                      {txn.entry_date ? new Date(txn.entry_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{txn.journal_number || '—'}</td>
                    <td className="px-4 py-3 text-white/70">{txn.memo || 'No memo provided'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      ${(txn.total_debit || txn.total_credit || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'posted'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : txn.status === 'draft'
                              ? 'bg-amber-500/15 text-amber-200'
                              : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {txn.status ? txn.status.replace('_', ' ') : 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-white/40" />
            <p>No recent transactions</p>
            <p className="text-sm mt-1 text-white/40">Start by creating a journal entry</p>
          </div>
        )}
      </div>
    </div>
  )
}
