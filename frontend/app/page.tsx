'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, TrendingUp, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()
  const { user, company, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // If user is authenticated, redirect based on onboarding status
    if (user && company) {
      if (!company.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push('/new-dashboard')
      }
    }
  }, [router, user, company, loading])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>
    )
  }

  // If authenticated, show loading (will redirect via useEffect)
  if (user && company) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>
    )
  }

  // Show welcome page for unauthenticated users
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg"></div>
            <span className="text-xl font-semibold">Endless Moments</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            AI Accounting Platform
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Financial intelligence
            <br />
            <span className="text-gray-500">for modern business</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Automated bookkeeping, real-time insights, and AI-powered financial analysis.
            Built for companies that move fast.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/signup')}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 border border-white/10 rounded-lg hover:border-white/20 transition-colors font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Insights */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-4 group-hover:bg-emerald-400/20 transition-colors">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Intelligent anomaly detection and automated categorization
            </p>
          </div>

          {/* Real-time Analytics */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Dashboards</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Real-time financial metrics and predictive analytics
            </p>
          </div>

          {/* Automation */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center mb-4 group-hover:bg-purple-400/20 transition-colors">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Automation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Automated journal entries and reconciliation workflows
            </p>
          </div>

          {/* Security */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center mb-4 group-hover:bg-blue-400/20 transition-colors">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bank-grade encryption and SOC 2 compliance
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold mb-4">Built for speed</h2>
          <p className="text-gray-400">
            Get started in minutes. Our AI learns your business patterns and handles the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Connect</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Link your bank accounts and financial systems in seconds
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Automate</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI categorizes transactions and generates journal entries
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-2">Insights</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Get real-time dashboards and actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Trusted by finance teams</h3>
            <p className="text-sm text-gray-400">
              Join companies modernizing their accounting operations
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to modernize your accounting?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start your free trial. No credit card required.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center gap-2 text-lg"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg"></div>
              <span>Endless Moments</span>
            </div>
            <div className="flex items-center gap-6">
              <span>© 2026 Endless Moments</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
