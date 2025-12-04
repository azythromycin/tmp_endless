'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight, Upload, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export default function CompanySetup() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    fiscalYearEnd: '12-31',
    coaOption: 'sample' // 'sample' or 'upload'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const industries = [
    'Technology',
    'Retail',
    'Manufacturing',
    'Services',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Construction',
    'Food & Beverage',
    'Other'
  ]

  const handleContinue = () => {
    if (step === 1 && !companyData.name) {
      alert('Please enter company name')
      return
    }
    if (step === 2 && !companyData.industry) {
      alert('Please select an industry')
      return
    }
    setStep(step + 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    try {
      // Convert MM-DD format to full date (using current year)
      const currentYear = new Date().getFullYear()
      const fiscalYearEndDate = `${currentYear}-${companyData.fiscalYearEnd}`

      // Create company
      const companyResponse = await api.post('/companies/', {
        name: companyData.name,
        industry: companyData.industry,
        fiscal_year_end: fiscalYearEndDate,
        onboarding_completed: true
      })

      // Extract the company from the response
      const newCompany = companyResponse.data[0]
      console.log('Created company:', newCompany)

      // Update user with company_id if user exists
      if (user) {
        await api.patch(`/users/${user.id}`, {
          company_id: newCompany.id
        })
      }

      // Create default chart of accounts if sample option selected
      if (companyData.coaOption === 'sample') {
        await createDefaultChartOfAccounts(newCompany.id)
      }

      // Refresh user data to get the new company
      if (user) {
        await refreshUser()
      }

      // Redirect to dashboard
      router.push('/new-dashboard')
    } catch (error: any) {
      console.error('Setup failed:', error)
      setError(error.response?.data?.detail || error.message || 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createDefaultChartOfAccounts = async (companyId: string) => {
    // Default accounts structure based on industry
    const defaultAccounts = [
      // Assets
      { account_code: '1000', account_name: 'Assets', type: 'asset', subtype: 'current_asset', parent_account_id: null },
      { account_code: '1010', account_name: 'Cash', type: 'asset', subtype: 'bank', parent_account_id: null },
      { account_code: '1020', account_name: 'Accounts Receivable', type: 'asset', subtype: 'accounts_receivable', parent_account_id: null },
      { account_code: '1030', account_name: 'Inventory', type: 'asset', subtype: 'inventory', parent_account_id: null },

      // Liabilities
      { account_code: '2000', account_name: 'Liabilities', type: 'liability', subtype: 'current_liability', parent_account_id: null },
      { account_code: '2010', account_name: 'Accounts Payable', type: 'liability', subtype: 'accounts_payable', parent_account_id: null },
      { account_code: '2020', account_name: 'Credit Card', type: 'liability', subtype: 'credit_card', parent_account_id: null },

      // Equity
      { account_code: '3000', account_name: 'Owner Equity', type: 'equity', subtype: 'equity', parent_account_id: null },
      { account_code: '3010', account_name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings', parent_account_id: null },

      // Revenue
      { account_code: '4000', account_name: 'Revenue', type: 'revenue', subtype: 'income', parent_account_id: null },
      { account_code: '4010', account_name: 'Sales', type: 'revenue', subtype: 'income', parent_account_id: null },

      // Expenses
      { account_code: '5000', account_name: 'Cost of Goods Sold', type: 'expense', subtype: 'cost_of_goods_sold', parent_account_id: null },
      { account_code: '6000', account_name: 'Operating Expenses', type: 'expense', subtype: 'operating_expense', parent_account_id: null },
      { account_code: '6010', account_name: 'Rent', type: 'expense', subtype: 'operating_expense', parent_account_id: null },
      { account_code: '6020', account_name: 'Utilities', type: 'expense', subtype: 'operating_expense', parent_account_id: null },
      { account_code: '6030', account_name: 'Salaries', type: 'expense', subtype: 'operating_expense', parent_account_id: null },
    ]

    // Create accounts one by one
    for (const account of defaultAccounts) {
      try {
        await api.post('/accounts/', {
          company_id: companyId,
          ...account
        })
      } catch (err) {
        console.error(`Failed to create account ${account.account_name}:`, err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Endless</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up your company</h1>
          <p className="text-gray-600">Just a few steps to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Company Info</span>
            <span>Industry</span>
            <span>Chart of Accounts</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Company Name *</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  placeholder="Acme Corporation"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Fiscal Year End</label>
                <input
                  type="text"
                  value={companyData.fiscalYearEnd}
                  onChange={(e) => setCompanyData({ ...companyData, fiscalYearEnd: e.target.value })}
                  placeholder="MM-DD"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">Format: MM-DD (e.g., 12-31 for December 31st)</p>
              </div>
            </div>
          )}

          {/* Step 2: Industry */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label">Select Your Industry *</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setCompanyData({ ...companyData, industry })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        companyData.industry === industry
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{industry}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chart of Accounts */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Chart of Accounts</label>
                <div className="space-y-3 mt-2">
                  {/* Sample COA */}
                  <button
                    onClick={() => setCompanyData({ ...companyData, coaOption: 'sample' })}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      companyData.coaOption === 'sample'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        companyData.coaOption === 'sample'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {companyData.coaOption === 'sample' && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Use Sample Chart of Accounts</p>
                        <p className="text-sm text-gray-600">
                          We'll set up a standard chart of accounts based on your industry. You can customize it later.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Upload COA */}
                  <button
                    onClick={() => setCompanyData({ ...companyData, coaOption: 'upload' })}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      companyData.coaOption === 'upload'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        companyData.coaOption === 'upload'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {companyData.coaOption === 'upload' && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Upload Your Own Chart of Accounts</p>
                        <p className="text-sm text-gray-600 mb-3">
                          Import your existing chart of accounts from a CSV file.
                        </p>
                        {companyData.coaOption === 'upload' && (
                          <label className="btn btn-secondary text-sm inline-flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Upload CSV
                            <input type="file" accept=".csv" className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
              >
                Back
              </button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={handleContinue}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
