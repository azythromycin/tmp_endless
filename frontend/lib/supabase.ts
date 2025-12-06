import { createClient, SupabaseClient } from '@supabase/supabase-js'

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient: SupabaseClient | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  if (!demoMode) {
    throw new Error('Missing Supabase environment variables')
  } else {
    if (typeof window !== 'undefined') {
      console.warn('Supabase credentials missing. Running frontend in demo mode.')
    }
  }
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

export type User = {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string | null
  created_at: string
}

export type Company = {
  id: string
  name: string
  industry: string
  fiscal_year_end: string
  onboarding_completed: boolean
  created_at: string
}
