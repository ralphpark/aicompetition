'use server'

import { createClient } from '@/lib/supabase/server'
import type { PointTransaction, UserTier } from '@/types/database'
import { TIER_CONFIG } from '@/types/database'

export async function getUserPoints(userId: string): Promise<{
  points: number
  tier: UserTier
  history: PointTransaction[]
} | null> {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('points, tier')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching user points:', profileError)
    return null
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (transactionsError) {
    console.error('Error fetching point transactions:', transactionsError)
    return null
  }

  return {
    points: profile.points,
    tier: profile.tier as UserTier,
    history: transactions as PointTransaction[]
  }
}

export async function addPoints(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string
) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('add_user_points', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_reference_id: referenceId || null
  })

  if (error) {
    console.error('Error adding points:', error)
    return { error: 'Failed to add points' }
  }

  return { success: true }
}

export async function handleDailyLogin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in' }
  }

  const { data, error } = await supabase.rpc('handle_daily_login', {
    p_user_id: user.id
  })

  if (error) {
    console.error('Error handling daily login:', error)
    return { error: 'Failed to process daily login' }
  }

  return { success: true, pointsAwarded: data }
}

export async function getPointsLeaderboard(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, nickname, avatar_url, points, tier, total_rewards')
    .order('points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return { leaderboard: [] }
  }

  return { leaderboard: data }
}

export async function getRewardsLeaderboard(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, nickname, avatar_url, points, tier, total_rewards')
    .gt('total_rewards', 0)
    .order('total_rewards', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching rewards leaderboard:', error)
    return { leaderboard: [] }
  }

  return { leaderboard: data }
}

export async function calculateTierFromPoints(points: number): Promise<UserTier> {
  const tiers = Object.entries(TIER_CONFIG).sort(
    ([, a], [, b]) => b.minPoints - a.minPoints
  )

  for (const [tierKey, config] of tiers) {
    if (points >= config.minPoints) {
      return tierKey as UserTier
    }
  }

  return 'bronze'
}
