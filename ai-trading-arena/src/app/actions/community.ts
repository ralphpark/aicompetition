'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Suggestion {
  id: string
  user_id: string
  model_id: string | null
  decision_id: string | null
  content: string
  upvotes: number
  downvotes: number
  is_implemented: boolean
  implemented_at: string | null
  operator_reply: string | null
  created_at: string
  user_name?: string
  model_name?: string
}

export async function getSuggestions(implemented?: boolean): Promise<Suggestion[]> {
  const supabase = await createClient()

  let query = supabase
    .from('community_suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  if (implemented !== undefined) {
    query = query.eq('is_implemented', implemented)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching suggestions:', error)
    return []
  }

  return data || []
}

export async function submitSuggestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in to submit suggestions' }
  }

  const content = formData.get('content') as string
  const modelId = formData.get('model_id') as string | null
  const decisionId = formData.get('decision_id') as string | null

  if (!content || content.trim().length < 10) {
    return { error: 'Suggestion must be at least 10 characters' }
  }

  const { data, error } = await supabase.from('community_suggestions').insert({
    user_id: user.id,
    model_id: modelId || null,
    decision_id: decisionId || null,
    content: content.trim(),
    upvotes: 0,
    downvotes: 0,
    is_implemented: false
  }).select().single()

  if (error) {
    console.error('Error submitting suggestion:', error)
    return { error: 'Failed to submit suggestion' }
  }

  // Points are automatically awarded by DB trigger (on_community_suggestion_insert)

  revalidatePath('/community')
  return { success: true }
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
    // Update existing vote
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      await supabase
        .from('suggestion_votes')
        .delete()
        .eq('id', existingVote.id)
    } else {
      // Change vote
      await supabase
        .from('suggestion_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
    }
  } else {
    // Insert new vote
    // Points are automatically awarded by DB trigger (on_suggestion_vote_change)
    await supabase.from('suggestion_votes').insert({
      suggestion_id: suggestionId,
      user_id: user.id,
      vote_type: voteType
    })
  }

  // Recalculate vote counts
  const { data: votes } = await supabase
    .from('suggestion_votes')
    .select('vote_type')
    .eq('suggestion_id', suggestionId)

  const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0
  const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0

  await supabase
    .from('community_suggestions')
    .update({ upvotes, downvotes })
    .eq('id', suggestionId)

  revalidatePath('/community')
  return { success: true, upvotes, downvotes }
}
