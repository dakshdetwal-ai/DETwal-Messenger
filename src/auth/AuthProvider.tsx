import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Profile = {
  id: string
  username: string
  display_name: string
  role: 'owner' | 'admin' | 'member'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  avatar_url: string | null
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<Profile | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, status, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Profile lookup failed:', error.message)
      setProfile(null)
      return null
    }

    setProfile(data as Profile | null)
    return data as Profile | null
  }

  async function refreshProfile() {
    if (!session?.user) return null
    return loadProfile(session.user.id)
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      if (error) console.error(error.message)
      setSession(data.session)
      if (data.session?.user) await loadProfile(data.session.user.id)
      if (active) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession?.user) {
        setProfile(null)
        setLoading(false)
        return
      }
      // Defer the profile request until after the auth callback has completed.
      window.setTimeout(() => {
        if (active) void loadProfile(nextSession.user.id).finally(() => setLoading(false))
      }, 0)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading, refreshProfile }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}