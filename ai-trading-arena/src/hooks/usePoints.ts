'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PointTransaction, UserTier } from '@/types/database'
import { TIER_CONFIG } from '@/types/database'

interface UsePointsReturn {
  points: number
  tier: UserTier
  history: PointTransaction[]
  isLoading: boolean
  error: Error | null
  addPoints: (amount: number, reason: string, referenceId?: string) => Promise<void>
  refetch: () => Promise<void>
  getNextTier: () => { tier: UserTier; pointsNeeded: number } | null
}

export function usePoints(userId?: string): UsePointsReturn {
  const [points, setPoints] = useState(0)
  const [tier, setTier] = useState<UserTier>('bronze')
  const [history, setHistory] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const calculateTier = (totalPoints: number): UserTier => {
    const tiers = Object.entries(TIER_CONFIG).sort(
      ([, a], [, b]) => b.minPoints - a.minPoints
    )
    for (const [tierKey, config] of tiers) {
      if (totalPoints >= config.minPoints) {
        return tierKey as UserTier
      }
    }
    return 'bronze'
  }

  const fetchPoints = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Fetch user profile for points and tier
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('points, tier')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profile) {
        setPoints(profile.points)
        setTier(profile.tier as UserTier)
      }

      // Fetch point transactions history
      const { data: transactions, error: transactionsError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsError) throw transactionsError
      setHistory(transactions as PointTransaction[])

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch points'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const addPoints = useCallback(async (amount: number, reason: string, referenceId?: string) => {
    if (!userId) return

    const supabase = createClient()

    // Use the add_user_points function from migration
    const { error: addError } = await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_reference_id: referenceId || null
    })

    if (addError) throw addError

    // Refetch to get updated values
    await fetchPoints()
  }, [userId, fetchPoints])

  const getNextTier = useCallback((): { tier: UserTier; pointsNeeded: number } | null => {
    const tiers = Object.entries(TIER_CONFIG).sort(
      ([, a], [, b]) => a.minPoints - b.minPoints
    )

    for (const [tierKey, config] of tiers) {
      if (config.minPoints > points) {
        return {
          tier: tierKey as UserTier,
          pointsNeeded: config.minPoints - points
        }
      }
    }

    return null // Already at max tier
  }, [points])

  useEffect(() => {
    fetchPoints()

    if (!userId) return

    const supabase = createClient()

    // Subscribe to point transaction changes
    const channel = supabase
      .channel(`points-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'point_transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchPoints()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchPoints])

  return {
    points,
    tier,
    history,
    isLoading,
    error,
    addPoints,
    refetch: fetchPoints,
    getNextTier
  }
}
