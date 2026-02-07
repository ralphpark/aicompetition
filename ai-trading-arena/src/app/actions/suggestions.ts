'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SuggestionSection, SuggestionStatus, PromptSuggestion } from '@/types/database'
import { POINT_VALUES } from '@/types/database'

async function checkIsAdmin(): Promise<{ isAdmin: boolean; userId: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false, userId: null }
  const { data } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return { isAdmin: data?.is_admin === true, userId: user.id }
}

export async function getIsAdmin(): Promise<boolean> {
  const { isAdmin } = await checkIsAdmin()
  return isAdmin
}

export interface CreateSuggestionInput {
  modelId?: number
  section: SuggestionSection
  content: string
  expectedEffect?: string
}

export async function createSuggestion(input: CreateSuggestionInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in to submit suggestions' }
  }

  if (!input.content || input.content.trim().length < 20) {
    return { error: 'Suggestion must be at least 20 characters' }
  }

  const { data, error } = await supabase
    .from('community_suggestions')
    .insert({
      user_id: user.id,
      model_id: input.modelId || null,
      section: input.section,
      content: input.content.trim(),
      expected_effect: input.expectedEffect?.trim() || null,
      upvotes: 0,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting suggestion:', error)
    return { error: 'Failed to submit suggestion' }
  }

  // Points are awarded automatically by DB trigger (on_community_suggestion_insert)
  // Do NOT call add_user_points here to avoid double-awarding

  revalidatePath('/community')
  return { success: true, suggestion: data }
}

export async function getSuggestions(options?: {
  status?: SuggestionStatus
  section?: SuggestionSection
  modelId?: number
  userId?: string
  limit?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('community_suggestions')
    .select(`
      *,
      user_profiles:user_id (
        nickname,
        avatar_url,
        tier
      ),
      ai_models:model_id (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50)

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.section) {
    query = query.eq('section', options.section)
  }

  if (options?.modelId) {
    query = query.eq('model_id', options.modelId)
  }

  if (options?.userId) {
    query = query.eq('user_id', options.userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching suggestions:', error)
    return { suggestions: [], error: error.message }
  }

  return { suggestions: data as PromptSuggestion[] }
}

export async function voteSuggestion(suggestionId: string, voteType: 'up' | 'down') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in to vote' }
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('suggestion_votes')
    .select('*')
    .eq('suggestion_id', suggestionId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      await supabase
        .from('suggestion_votes')
        .delete()
        .eq('id', existingVote.id)
    } else {
      // Change vote type
      await supabase
        .from('suggestion_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
    }
  } else {
    // Insert new vote
    // Points are awarded automatically by DB trigger (update_community_suggestion_votes)
    // Do NOT call add_user_points here to avoid double-awarding
    await supabase.from('suggestion_votes').insert({
      suggestion_id: suggestionId,
      user_id: user.id,
      vote_type: voteType
    })
  }

  // Update suggestion upvotes count (trigger handles this, but we can also do it manually)
  const { data: votes } = await supabase
    .from('suggestion_votes')
    .select('vote_type')
    .eq('suggestion_id', suggestionId)

  const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0

  await supabase
    .from('community_suggestions')
    .update({ upvotes })
    .eq('id', suggestionId)

  revalidatePath('/community')
  return { success: true, upvotes }
}

export async function getUserVotes(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('suggestion_votes')
    .select('suggestion_id')
    .eq('user_id', user.id)

  return data?.map(v => v.suggestion_id) || []
}

export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus,
  operatorReply?: string
) {
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) {
    return { error: 'Admin access required' }
  }

  const supabase = await createClient()

  const updateData: {
    status: SuggestionStatus
    operator_reply?: string
    is_implemented?: boolean
    implemented_at?: string
  } = { status }

  if (operatorReply) {
    updateData.operator_reply = operatorReply
  }

  if (status === 'approved') {
    // Get suggestion to award points to owner
    const { data: suggestion } = await supabase
      .from('community_suggestions')
      .select('user_id')
      .eq('id', suggestionId)
      .single()

    if (suggestion) {
      // Award 50 points for approval (was 100)
      await supabase.rpc('add_user_points', {
        p_user_id: suggestion.user_id,
        p_amount: POINT_VALUES.SUGGESTION_APPROVED,
        p_reason: 'suggestion_approved',
        p_reference_id: suggestionId
      })
    }
  }

  if (status === 'applied') {
    updateData.is_implemented = true
    updateData.implemented_at = new Date().toISOString()

    // Get suggestion to award points to owner for production application
    const { data: suggestion } = await supabase
      .from('community_suggestions')
      .select('user_id')
      .eq('id', suggestionId)
      .single()

    if (suggestion) {
      // Award 100 points for being applied to production
      await supabase.rpc('add_user_points', {
        p_user_id: suggestion.user_id,
        p_amount: POINT_VALUES.SUGGESTION_APPLIED,
        p_reason: 'suggestion_applied',
        p_reference_id: suggestionId
      })
    }
  }

  const { error } = await supabase
    .from('community_suggestions')
    .update(updateData)
    .eq('id', suggestionId)

  if (error) {
    console.error('Error updating suggestion status:', error)
    return { error: 'Failed to update suggestion status' }
  }

  revalidatePath('/community')
  return { success: true }
}

/**
 * Mark a suggestion as applied to production
 * This is called after an approved suggestion is actually applied
 * Awards 100 points to the suggestion author
 * Also records ROI baseline in suggestion_performance for later measurement
 */
export async function markSuggestionApplied(suggestionId: string) {
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) {
    return { error: 'Admin access required' }
  }

  const supabase = await createClient()

  // Get current status and model_id
  const { data: suggestion, error: fetchError } = await supabase
    .from('community_suggestions')
    .select('user_id, status, model_id')
    .eq('id', suggestionId)
    .single()

  if (fetchError || !suggestion) {
    return { error: 'Suggestion not found' }
  }

  if (suggestion.status !== 'approved') {
    return { error: 'Suggestion must be approved before applying' }
  }

  // Update status to applied
  const { error: updateError } = await supabase
    .from('community_suggestions')
    .update({
      status: 'applied',
      is_implemented: true,
      implemented_at: new Date().toISOString()
    })
    .eq('id', suggestionId)

  if (updateError) {
    console.error('Error marking suggestion as applied:', updateError)
    return { error: 'Failed to mark suggestion as applied' }
  }

  // Award 100 points for being applied to production
  await supabase.rpc('add_user_points', {
    p_user_id: suggestion.user_id,
    p_amount: POINT_VALUES.SUGGESTION_APPLIED,
    p_reason: 'suggestion_applied',
    p_reference_id: suggestionId
  })

  // Record ROI baseline in suggestion_performance for later measurement
  if (suggestion.model_id) {
    const { data: portfolio } = await supabase
      .from('virtual_portfolios')
      .select('current_balance, initial_balance, total_trades, winning_trades')
      .eq('model_id', suggestion.model_id)
      .maybeSingle()

    if (portfolio) {
      const roi = ((portfolio.current_balance - portfolio.initial_balance) / portfolio.initial_balance) * 100
      const winRate = portfolio.total_trades > 0
        ? (portfolio.winning_trades / portfolio.total_trades) * 100
        : 0

      await supabase.from('suggestion_performance').insert({
        suggestion_id: suggestionId,
        model_id: suggestion.model_id,
        roi_before: roi,
        win_rate_before: winRate,
        trades_before: portfolio.total_trades,
        status: 'measuring'
      })
    }
  }

  revalidatePath('/community')
  return { success: true }
}

/**
 * Measure the ROI performance of an applied suggestion
 * Admin-only: records current ROI and calculates improvement
 * Awards bonus points if improvement > 0
 */
export async function measureSuggestionPerformance(performanceId: string) {
  const { isAdmin } = await checkIsAdmin()
  if (!isAdmin) {
    return { error: 'Admin access required' }
  }

  const supabase = await createClient()

  // Get performance record
  const { data: perf, error: perfError } = await supabase
    .from('suggestion_performance')
    .select('id, suggestion_id, model_id, status, trades_before')
    .eq('id', performanceId)
    .single()

  if (perfError || !perf) {
    return { error: 'Performance record not found' }
  }

  if (perf.status === 'completed') {
    return { error: 'Already measured' }
  }

  if (!perf.model_id) {
    return { error: 'No model associated with this suggestion' }
  }

  // Get current portfolio stats
  const { data: portfolio } = await supabase
    .from('virtual_portfolios')
    .select('current_balance, initial_balance, total_trades, winning_trades')
    .eq('model_id', perf.model_id)
    .maybeSingle()

  if (!portfolio) {
    return { error: 'Portfolio not found for this model' }
  }

  const roi = ((portfolio.current_balance - portfolio.initial_balance) / portfolio.initial_balance) * 100
  const winRate = portfolio.total_trades > 0
    ? (portfolio.winning_trades / portfolio.total_trades) * 100
    : 0

  const tradesAfter = portfolio.total_trades
  const newTrades = tradesAfter - (perf.trades_before || 0)

  // Determine status based on trade count
  const status = newTrades < 3 ? 'insufficient_data' : 'completed'

  // Update performance record (improvement_pct is auto-calculated by GENERATED column)
  const { error: updateError } = await supabase
    .from('suggestion_performance')
    .update({
      roi_after: roi,
      win_rate_after: winRate,
      trades_after: tradesAfter,
      status,
      measurement_end: new Date().toISOString()
    })
    .eq('id', performanceId)

  if (updateError) {
    console.error('Error updating performance:', updateError)
    return { error: 'Failed to update performance record' }
  }

  // If completed with positive improvement, award bonus points
  let pointsAwarded = 0
  if (status === 'completed') {
    // Re-fetch to get the generated improvement_pct
    const { data: updated } = await supabase
      .from('suggestion_performance')
      .select('improvement_pct')
      .eq('id', performanceId)
      .single()

    if (updated && updated.improvement_pct > 0) {
      const result = await supabase.rpc('award_roi_improvement_points', {
        p_performance_id: performanceId
      })

      if (result.data && result.data.length > 0) {
        pointsAwarded = result.data[0].points_awarded
      }
    }
  }

  revalidatePath('/community')
  revalidatePath('/rewards')
  revalidatePath('/hall-of-fame')

  return {
    success: true,
    status,
    roiAfter: roi,
    winRateAfter: winRate,
    newTrades,
    pointsAwarded
  }
}

/**
 * Award ROI improvement points to a suggestion author
 * Called when performance data shows positive improvement
 */
export async function awardRoiImprovementPoints(performanceId: string) {
  const supabase = await createClient()

  // Call the database function that handles the logic
  const { data, error } = await supabase
    .rpc('award_roi_improvement_points', { p_performance_id: performanceId })

  if (error) {
    console.error('Error awarding ROI improvement points:', error)
    return { error: 'Failed to award ROI improvement points' }
  }

  if (data && data.length > 0) {
    const result = data[0]
    revalidatePath('/community')
    revalidatePath('/rewards')
    revalidatePath('/hall-of-fame')
    return {
      success: true,
      userId: result.user_id,
      improvementPct: result.improvement_pct,
      pointsAwarded: result.points_awarded
    }
  }

  return { success: false, pointsAwarded: 0 }
}
