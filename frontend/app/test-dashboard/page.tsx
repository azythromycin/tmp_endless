'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function TestDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/')
      setCompanies(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedCompany(response.data[0].id)
        fetchCompanyData(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchCompanyData = async (companyId: string) => {
    try {
      setLoading(true)

      // Fetch accounts
      const accountsResponse = await api.get(`/accounts/company/${companyId}`)
      setAccounts(accountsResponse || [])

      // Fetch stats
      const statsResponse = await api.get(`/dashboard/stats/${companyId}`)
      setStats(statsResponse || {})

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch company data:', error)
      setLoading(false)
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId)
    fetchCompanyData(companyId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Dashboard (No Auth)</h1>

        {/* Company Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Company</h2>
          {companies.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">No companies found. Create one first.</p>
              <a href="/company-setup" className="text-blue-600 hover:underline">
                Go to Company Setup →
              </a>
            </div>
          ) : (
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.industry})
                </option>
              ))}
            </select>
          )}
        </div>

        {loading && <p>Loading...</p>}

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Financial Stats</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.total_income?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.total_expenses?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Position</p>
                <p className="text-2xl font-bold">
                  ${stats.net_position?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{stats.transaction_count || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart of Accounts */}
        {accounts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Chart of Accounts</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Subtype</th>
                    <th className="text-right p-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{account.account_code}</td>
                      <td className="p-2">{account.account_name}</td>
                      <td className="p-2">{account.account_type}</td>
                      <td className="p-2">{account.account_subtype}</td>
                      <td className="p-2 text-right">
                        ${account.current_balance?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-8 space-x-4">
          <a href="/test-journals" className="text-blue-600 hover:underline">
            Test Journals →
          </a>
          <a href="/company-setup" className="text-blue-600 hover:underline">
            Company Setup →
          </a>
        </div>
      </div>
    </div>
  )
}
