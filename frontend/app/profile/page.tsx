'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const { user, company, signOut, refreshUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'personal' | 'company'>('personal')
  const [loading, setLoading] = useState(false)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    avatar: ''
  })

  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    taxId: '',
    fiscalYearEnd: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      setPersonalInfo({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: '',
        role: user.role || '',
        avatar: ''
      })
    }

    if (company) {
      setCompanyInfo({
        name: company.name || '',
        industry: company.industry || '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        taxId: '',
        fiscalYearEnd: company.fiscal_year_end || ''
      })
    }
  }, [user, company, authLoading, router])

  const handlePersonalSave = async () => {
    if (!user) return

    try {
      setLoading(true)
      await api.patch(`/users/${user.id}`, {
        full_name: personalInfo.fullName,
        email: personalInfo.email
      })
      await refreshUser()
      alert('Personal information saved!')
    } catch (error) {
      console.error('Failed to save personal info:', error)
      alert('Failed to save personal information')
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySave = async () => {
    if (!company) return

    try {
      setLoading(true)
      await api.patch(`/companies/${company.id}`, {
        name: companyInfo.name,
        industry: companyInfo.industry,
        fiscal_year_end: companyInfo.fiscalYearEnd
      })
      await refreshUser()
      alert('Company information saved!')
    } catch (error) {
      console.error('Failed to save company info:', error)
      alert('Failed to save company information')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const initials = useMemo(() => {
    const source = personalInfo.fullName || companyInfo.name || 'Endless'
    return source
      .split(' ')
      .filter(Boolean)
      .map(word => word[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || 'EN'
  }, [personalInfo.fullName, companyInfo.name])

  const inputStyles = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40'
  const labelStyles = 'text-xs uppercase tracking-[0.35em] text-white/50'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Control Center</p>
          <h1 className="text-3xl font-semibold mt-2">Profile & Company Settings</h1>
          <p className="text-white/60 mt-1">Keep your identity and firm metadata in sync with Endless Copilot.</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
            <div>
              <p className="text-sm text-white/60 uppercase tracking-[0.3em]">Identity</p>
              <h3 className="text-2xl font-semibold">{personalInfo.fullName || 'Demo User'}</h3>
              <p className="text-white/60 text-sm">{personalInfo.email || 'demo@endless.finance'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-fuchsia-300" />
              {personalInfo.role || 'Admin'}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-300" />
              Joined Endless
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-fuchsia-200" />
            </div>
            <div>
              <p className="text-sm text-white/60 uppercase tracking-[0.3em]">Company</p>
              <h3 className="text-2xl font-semibold">{companyInfo.name || 'Demo Company'}</h3>
              <p className="text-white/60 text-sm">{companyInfo.industry || 'Technology'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-300" />
              {companyInfo.phone || '—'}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-300" />
              {companyInfo.city ? `${companyInfo.city}, ${companyInfo.state}` : 'Unknown HQ'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-b border-white/10 pb-1">
        {[
          { key: 'personal', label: 'Personal Identity', icon: User },
          { key: 'company', label: 'Company Metadata', icon: Building2 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'personal' | 'company')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-fuchsia-500/50 to-cyan-500/50 text-white shadow-[0_10px_40px_rgba(147,51,234,0.35)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Profile photo</p>
              <h3 className="text-lg font-semibold text-white mt-1">Update your avatar</h3>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
              <Upload className="w-4 h-4" />
              Upload photo
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className={labelStyles}>Full name</p>
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Email</p>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Phone</p>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className={inputStyles}
                placeholder="+1 555 0100"
              />
            </div>
            <div>
              <p className={labelStyles}>Role</p>
              <select
                value={personalInfo.role}
                onChange={(e) => setPersonalInfo({ ...personalInfo, role: e.target.value })}
                className={`${inputStyles} bg-slate-950/40`}
              >
                <option value="Admin">Admin</option>
                <option value="Accountant">Accountant</option>
                <option value="User">User</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6">
            <button className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handlePersonalSave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-[0_15px_45px_rgba(129,80,255,0.45)] disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Logo</p>
              <h3 className="text-lg font-semibold text-white mt-1">Refresh brand identity</h3>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
              <Upload className="w-4 h-4" />
              Upload logo
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <p className={labelStyles}>Company name</p>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Industry</p>
              <select
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                className={`${inputStyles} bg-slate-950/40`}
              >
                <option value="Technology">Technology</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <p className={labelStyles}>Tax ID (EIN)</p>
              <input
                type="text"
                value={companyInfo.taxId}
                onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Email</p>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Phone</p>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div className="md:col-span-2">
              <p className={labelStyles}>Address</p>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>City</p>
              <input
                type="text"
                value={companyInfo.city}
                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>State</p>
              <input
                type="text"
                value={companyInfo.state}
                onChange={(e) => setCompanyInfo({ ...companyInfo, state: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>ZIP code</p>
              <input
                type="text"
                value={companyInfo.zipCode}
                onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Country</p>
              <input
                type="text"
                value={companyInfo.country}
                onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                className={inputStyles}
              />
            </div>
            <div>
              <p className={labelStyles}>Fiscal year end</p>
              <input
                type="text"
                value={companyInfo.fiscalYearEnd}
                onChange={(e) => setCompanyInfo({ ...companyInfo, fiscalYearEnd: e.target.value })}
                placeholder="MM-DD"
                className={inputStyles}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6">
            <button className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleCompanySave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-[0_15px_45px_rgba(129,80,255,0.45)] disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-rose-300">Danger zone</p>
            <h3 className="text-lg font-semibold text-white mt-1">Delete account</h3>
          </div>
        </div>
        <p className="text-sm text-white/70">
          Permanently remove this user and company data from Endless Copilot. This cannot be undone once confirmed.
        </p>
        <button className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-5 py-2 text-sm font-semibold shadow-[0_15px_45px_rgba(225,29,72,0.4)]">
          Delete account
        </button>
      </div>
    </div>
  )
}
