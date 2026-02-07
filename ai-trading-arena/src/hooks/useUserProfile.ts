'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserTier } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface UseUserProfileReturn {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    const supabase = createClient()

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (profileData) {
          setProfile(profileData as UserProfile)
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: authUser.id,
            nickname: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Anonymous',
            avatar_url: authUser.user_metadata?.avatar_url || null,
            avatar_items: {},
            points: 0,
            tier: 'bronze' as UserTier,
            total_rewards: 0,
            pending_rewards: 0,
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single()

          if (createError) throw createError
          setProfile(createdProfile as UserProfile)
        }
      } else {
        setProfile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError
    setProfile(data as UserProfile)
  }, [user])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    fetchProfile()

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return {
    user,
    profile,
    isLoading,
    error,
    updateProfile,
    signOut,
    refetch: fetchProfile
  }
}
