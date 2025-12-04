'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function TestJournals() {
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // New journal entry form
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    memo: '',
    lines: [
      { account_id: '', description: '', debit: 0, credit: 0 },
      { account_id: '', description: '', debit: 0, credit: 0 }
    ]
  })

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
      const accountsResponse = await api.get(`/accounts/company/${companyId}`)
      setAccounts(accountsResponse || [])

      const journalsResponse = await api.get(`/journals/company/${companyId}?limit=20`)
      setJournals(journalsResponse || [])

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

  const addLine = () => {
    setNewEntry({
      ...newEntry,
      lines: [...newEntry.lines, { account_id: '', description: '', debit: 0, credit: 0 }]
    })
  }

  const updateLine = (index: number, field: string, value: any) => {
    const updatedLines = [...newEntry.lines]
    updatedLines[index] = { ...updatedLines[index], [field]: value }
    setNewEntry({ ...newEntry, lines: updatedLines })
  }

  const removeLine = (index: number) => {
    const updatedLines = newEntry.lines.filter((_, i) => i !== index)
    setNewEntry({ ...newEntry, lines: updatedLines })
  }

  const createJournalEntry = async () => {
    if (!selectedCompany) {
      alert('Please select a company')
      return
    }

    try {
      setLoading(true)
      await api.post('/journals/', {
        company_id: selectedCompany,
        entry_date: newEntry.entry_date,
        memo: newEntry.memo,
        lines: newEntry.lines.map((line, index) => ({
          ...line,
          line_number: index + 1,
          debit: parseFloat(line.debit.toString()) || 0,
          credit: parseFloat(line.credit.toString()) || 0
        }))
      })

      alert('Journal entry created successfully!')
      fetchCompanyData(selectedCompany)

      // Reset form
      setNewEntry({
        entry_date: new Date().toISOString().split('T')[0],
        memo: '',
        lines: [
          { account_id: '', description: '', debit: 0, credit: 0 },
          { account_id: '', description: '', debit: 0, credit: 0 }
        ]
      })
    } catch (error: any) {
      console.error('Failed to create journal entry:', error)
      alert('Failed to create journal entry: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const totalDebits = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.debit.toString()) || 0), 0)
  const totalCredits = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.credit.toString()) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Journals (No Auth)</h1>

        {/* Company Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Company</h2>
          {companies.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">No companies found.</p>
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
                  {company.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* New Journal Entry Form */}
        {selectedCompany && accounts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Journal Entry</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newEntry.entry_date}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Memo</label>
                <input
                  type="text"
                  value={newEntry.memo}
                  onChange={(e) => setNewEntry({ ...newEntry, memo: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Description of transaction"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {newEntry.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <select
                      value={line.account_id}
                      onChange={(e) => updateLine(index, 'account_id', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_code} - {account.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.debit}
                      onChange={(e) => updateLine(index, 'debit', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Debit"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.credit}
                      onChange={(e) => updateLine(index, 'credit', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Credit"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeLine(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={newEntry.lines.length <= 2}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                onClick={addLine}
                className="text-blue-600 hover:underline"
              >
                + Add Line
              </button>
              <div className="text-sm">
                <span className="mr-4">Debits: ${totalDebits.toFixed(2)}</span>
                <span className="mr-4">Credits: ${totalCredits.toFixed(2)}</span>
                <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                  {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                </span>
              </div>
            </div>

            <button
              onClick={createJournalEntry}
              disabled={!isBalanced || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Journal Entry'}
            </button>
          </div>
        )}

        {/* Recent Journal Entries */}
        {journals.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Journal Entries</h2>
            <div className="space-y-4">
              {journals.map((journal) => (
                <div key={journal.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{journal.memo || 'No memo'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(journal.entry_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-medium">{journal.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-8 space-x-4">
          <a href="/test-dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
