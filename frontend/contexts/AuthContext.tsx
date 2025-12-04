'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User, Company } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  company: Company | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserData = async (authUser: SupabaseUser) => {
    try {
      // Fetch user data from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError

      setUser(userData)

      // Fetch company data if user has a company
      if (userData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userData.company_id)
          .single()

        if (companyError) throw companyError
        setCompany(companyData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user)
      } else {
        setUser(null)
        setCompany(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Create user record via backend API (uses service_role key, bypasses RLS)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'admin',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Failed to create user record')
        }

        // Fetch and set the user data
        await fetchUserData(data.user)

        // Redirect to company setup
        router.push('/company-setup')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await fetchUserData(data.user)

        // Check if user has completed onboarding
        const { data: userData } = await supabase
          .from('users')
          .select('company_id, companies(onboarding_completed)')
          .eq('id', data.user.id)
          .single()

        if (!userData?.company_id) {
          router.push('/company-setup')
        } else if (!(userData.companies as any)?.onboarding_completed) {
          router.push('/company-setup')
        } else {
          router.push('/new-dashboard')
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setCompany(null)
      router.push('/login')
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  const refreshUser = async () => {
    if (supabaseUser) {
      await fetchUserData(supabaseUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        company,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
