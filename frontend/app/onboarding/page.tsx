'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { useTheme } from '@/contexts/ThemeContext'
import { Building2, Users, TrendingUp, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

const INDUSTRIES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Professional Services',
  'Healthcare',
  'Manufacturing',
  'Food & Beverage',
  'Real Estate',
  'Construction',
  'Marketing / Advertising',
  'Education',
  'Consulting',
  'Other'
]

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 's_corp', label: 'S-Corporation' },
  { value: 'corporation', label: 'C-Corporation' },
  { value: 'partnership', label: 'Partnership' }
]

const GROWTH_STAGES = [
  { value: 'startup', label: 'Startup (0-2 years)' },
  { value: 'growth', label: 'Growth (2-5 years)' },
  { value: 'mature', label: 'Mature (5+ years)' },
  { value: 'enterprise', label: 'Enterprise (established)' }
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { theme } = useTheme()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState('')

  const [formData, setFormData] = useState({
    // Step 1: Company Basics
    name: '',
    industry: '',
    location_city: '',
    location_state: '',
    location_country: 'USA',

    // Step 2: Business Profile
    business_type: '',
    founded_year: new Date().getFullYear(),
    employee_count: 1,
    annual_revenue: 0,

    // Step 3: Market Context
    growth_stage: '',
    target_market: 'B2B',
    primary_products: [] as string[],
    competitors: [] as string[],

    // Tracking
    onboarding_completed: false,
    onboarding_step: 1
  })

  const [productInput, setProductInput] = useState('')
  const [competitorInput, setCompetitorInput] = useState('')

  useEffect(() => {
    // Load existing company data if available
    const loadCompanyData = async () => {
      try {
        const response = await api.get('/companies/')
        if (response.data && response.data.length > 0) {
          const company = response.data[0]
          setCompanyId(company.id)

          // Pre-fill form if data exists
          setFormData(prev => ({
            ...prev,
            ...company,
            primary_products: company.primary_products || [],
            competitors: company.competitors || []
          }))

          // Resume from last step if onboarding not completed
          if (!company.onboarding_completed && company.onboarding_step) {
            setStep(company.onboarding_step)
          }
        }
      } catch (error) {
        console.error('Failed to load company data:', error)
      }
    }

    if (user) {
      loadCompanyData()
    }
  }, [user])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addProduct = () => {
    if (productInput.trim()) {
      setFormData(prev => ({
        ...prev,
        primary_products: [...prev.primary_products, productInput.trim()]
      }))
      setProductInput('')
    }
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      primary_products: prev.primary_products.filter((_, i) => i !== index)
    }))
  }

  const addCompetitor = () => {
    if (competitorInput.trim()) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, competitorInput.trim()]
      }))
      setCompetitorInput('')
    }
  }

  const removeCompetitor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }))
  }

  const saveProgress = async (currentStep: number): Promise<boolean> => {
    try {
      setLoading(true)

      const updateData = {
        ...formData,
        onboarding_step: currentStep,
        onboarding_completed: currentStep === 4
      }

      console.log('Saving progress for step:', currentStep, 'Data:', updateData)

      if (companyId) {
        const response = await api.patch(`/companies/${companyId}`, updateData)
        console.log('Company updated successfully:', response)
      } else {
        console.log('Creating new company...')
        const response = await api.post('/companies/', updateData)
        console.log('Company creation response:', response)

        // Backend returns { status: "success", data: [...] }
        if (response.status === 'success' && response.data && response.data.length > 0) {
          const newCompanyId = response.data[0].id
          console.log('New company created with ID:', newCompanyId)
          setCompanyId(newCompanyId)

          // Update user with company_id
          if (user) {
            console.log('Updating user with company_id...')
            await api.patch(`/users/${user.id}`, {
              company_id: newCompanyId
            })
            console.log('User updated successfully')
          }
        } else {
          console.error('Invalid response structure:', response)
          throw new Error('Failed to create company - invalid response')
        }
      }

      console.log('Progress saved successfully')
      return true
    } catch (error: any) {
      console.error('Failed to save progress:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert(`Failed to save progress: ${error.response?.data?.detail || error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    const success = await saveProgress(step + 1)
    if (success) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const completeOnboarding = async () => {
    const success = await saveProgress(4)
    if (success) {
      // Refresh auth context to get updated company data
      await refreshUser()
      router.push('/new-dashboard')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Building2 className="w-6 h-6" style={{ color: 'var(--neon-cyan)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Company Basics</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Let's start with the essentials</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Company Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  boxShadow: theme === 'dark' ? '0 0 20px rgba(34, 211, 238, 0.1)' : 'none'
                }}
                placeholder="Acme Inc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Industry *</label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                required
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>City *</label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="San Francisco"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>State *</label>
                <select
                  value={formData.location_state}
                  onChange={(e) => handleInputChange('location_state', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                >
                  <option value="">Select state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Users className="w-6 h-6" style={{ color: 'var(--neon-fuchsia)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Business Profile</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Help us understand your business size and structure</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Business Type *</label>
              <select
                value={formData.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                required
              >
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Founded Year</label>
                <input
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Number of Employees</label>
                <input
                  type="number"
                  value={formData.employee_count}
                  onChange={(e) => handleInputChange('employee_count', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Annual Revenue (USD)</label>
              <input
                type="number"
                value={formData.annual_revenue}
                onChange={(e) => handleInputChange('annual_revenue', parseFloat(e.target.value))}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="100000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Growth Stage *</label>
              <select
                value={formData.growth_stage}
                onChange={(e) => handleInputChange('growth_stage', e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                required
              >
                <option value="">Select growth stage</option>
                {GROWTH_STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--neon-emerald)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Market Context</h2>
                <p style={{ color: 'var(--text-secondary)' }}>This helps us provide better AI-powered insights</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Target Market</label>
              <select
                value={formData.target_market}
                onChange={(e) => handleInputChange('target_market', e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B2C">B2B2C (Both)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Primary Products/Services</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="e.g., Cloud software, Consulting"
                />
                <button
                  onClick={addProduct}
                  className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-fuchsia))',
                    color: 'white'
                  }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.primary_products.map((product, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.2)',
                      color: 'var(--neon-cyan)',
                      border: '1px solid var(--neon-cyan)'
                    }}
                  >
                    {product}
                    <button onClick={() => removeProduct(i)} className="hover:opacity-70">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Competitors (for AI comparisons)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="e.g., Competitor Inc."
                />
                <button
                  onClick={addCompetitor}
                  className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--neon-emerald), var(--neon-cyan))',
                    color: 'white'
                  }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.competitors.map((competitor, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                      color: 'var(--neon-emerald)',
                      border: '1px solid var(--neon-emerald)'
                    }}
                  >
                    {competitor}
                    <button onClick={() => removeCompetitor(i)} className="hover:opacity-70">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8 text-center">
            <div className="flex justify-center">
              <div className="p-6 rounded-full" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}>
                <CheckCircle2 className="w-20 h-20" style={{ color: 'var(--neon-cyan)' }} />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>You're All Set!</h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Your profile is complete. You can now access:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-8">
              {[
                { icon: '📊', title: 'Industry Benchmarks', desc: 'See how you compare to similar businesses' },
                { icon: '🎯', title: 'Competitor Analysis', desc: 'Real-time insights on your competitive landscape' },
                { icon: '📈', title: 'Growth Recommendations', desc: 'Personalized strategies from similar companies' },
                { icon: '📋', title: 'Tax Updates', desc: 'Latest compliance requirements for your state' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl backdrop-blur-xl border transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    boxShadow: theme === 'dark' ? '0 0 30px rgba(217, 70, 239, 0.1)' : 'none'
                  }}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
              Powered by Perplexity AI for real-time market intelligence
            </p>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        const step1Valid = formData.name && formData.industry && formData.location_city && formData.location_state
        console.log('Step 1 validation:', {
          name: !!formData.name,
          industry: !!formData.industry,
          location_city: !!formData.location_city,
          location_state: !!formData.location_state,
          canProceed: step1Valid
        })
        return step1Valid
      case 2:
        return formData.business_type && formData.growth_stage
      case 3:
        return true // Optional fields
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Neon background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-[200px] transition-opacity duration-500"
          style={{ backgroundColor: 'var(--neon-fuchsia)', opacity: 'var(--glow-opacity)' }}
        />
        <div
          className="absolute top-1/3 right-0 h-80 w-80 rounded-full blur-[180px] transition-opacity duration-500"
          style={{ backgroundColor: 'var(--neon-cyan)', opacity: 'var(--glow-opacity)' }}
        />
        <div
          className="absolute bottom-10 left-10 h-72 w-72 rounded-full blur-[160px] transition-opacity duration-500"
          style={{ backgroundColor: 'var(--neon-emerald)', opacity: 'var(--glow-opacity)' }}
        />
      </div>

      <div
        className="max-w-3xl w-full rounded-2xl backdrop-blur-xl p-8 md:p-12 relative z-10 border transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: theme === 'dark'
            ? '0 0 60px rgba(217, 70, 239, 0.15), 0 0 100px rgba(34, 211, 238, 0.1)'
            : '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full mx-1 transition-all duration-500"
                style={{
                  background: i <= step
                    ? 'linear-gradient(90deg, var(--neon-cyan), var(--neon-fuchsia))'
                    : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
              />
            ))}
          </div>
          <div className="text-sm text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
            Step {step} of 4
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-10">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          {step > 1 && step < 4 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step < 4 && (
            <div className="ml-auto flex flex-col items-end gap-2">
              <button
                onClick={nextStep}
                className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: canProceed()
                    ? 'linear-gradient(135deg, var(--neon-cyan), var(--neon-fuchsia))'
                    : 'rgba(128, 128, 128, 0.3)',
                  color: 'white'
                }}
                disabled={!canProceed() || loading}
              >
                {loading ? 'Saving...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
              {!canProceed() && step === 1 && (
                <p className="text-xs text-red-400">
                  Please fill all required fields (*)
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <button
              onClick={completeOnboarding}
              className="w-full px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--neon-emerald), var(--neon-cyan))',
                color: 'white',
                boxShadow: theme === 'dark' ? '0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
              }}
              disabled={loading}
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
