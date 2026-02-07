'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PromptSuggestion, SuggestionStatus, SuggestionSection } from '@/types/database'

interface UseSuggestionsOptions {
  status?: SuggestionStatus
  section?: SuggestionSection
  modelId?: number
  userId?: string
  limit?: number
}

interface UseSuggestionsReturn {
  suggestions: PromptSuggestion[]
  isLoading: boolean
  error: Error | null
  createSuggestion: (data: CreateSuggestionData) => Promise<PromptSuggestion>
  voteSuggestion: (suggestionId: string, voteType: 'up' | 'down') => Promise<void>
  hasVoted: (suggestionId: string) => boolean
  refetch: () => Promise<void>
}

interface CreateSuggestionData {
  modelId?: number
  section: SuggestionSection
  content: string
  expectedEffect?: string
}

export function useSuggestions(options: UseSuggestionsOptions = {}): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { status, section, modelId, userId, limit = 50 } = options

  const fetchSuggestions = useCallback(async () => {
    const supabase = createClient()

    try {
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
        .limit(limit)

      if (status) {
        query = query.eq('status', status)
      }

      if (section) {
        query = query.eq('section', section)
      }

      if (modelId) {
        query = query.eq('model_id', modelId)
      }

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setSuggestions(data as PromptSuggestion[])

      // Fetch user votes
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: votes } = await supabase
          .from('suggestion_votes')
          .select('suggestion_id')
          .eq('user_id', user.id)

        if (votes) {
          setUserVotes(new Set(votes.map(v => v.suggestion_id)))
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suggestions'))
    } finally {
      setIsLoading(false)
    }
  }, [status, section, modelId, userId, limit])

  const createSuggestion = useCallback(async (data: CreateSuggestionData): Promise<PromptSuggestion> => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be logged in to create suggestions')

    const { data: suggestion, error: createError } = await supabase
      .from('community_suggestions')
      .insert({
        user_id: user.id,
        model_id: data.modelId || null,
        section: data.section,
        content: data.content,
        expected_effect: data.expectedEffect || null,
      })
      .select()
      .single()

    if (createError) throw createError

    // Award points for creating suggestion
    await supabase.rpc('add_user_points', {
      p_user_id: user.id,
      p_amount: 10,
      p_reason: 'suggestion_created',
      p_reference_id: suggestion.id
    })

    await fetchSuggestions()
    return suggestion as PromptSuggestion
  }, [fetchSuggestions])

  const voteSuggestion = useCallback(async (suggestionId: string, voteType: 'up' | 'down') => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be logged in to vote')

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('suggestion_votes')
      .select('*')
      .eq('suggestion_id', suggestionId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same type
        await supabase
          .from('suggestion_votes')
          .delete()
          .eq('id', existingVote.id)

        setUserVotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(suggestionId)
          return newSet
        })
      } else {
        // Change vote type
        await supabase
          .from('suggestion_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
      }
    } else {
      // Create new vote
      await supabase
        .from('suggestion_votes')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          vote_type: voteType
        })

      setUserVotes(prev => new Set([...prev, suggestionId]))
    }

    // Update suggestion upvotes count is handled by database trigger
    await fetchSuggestions()
  }, [fetchSuggestions])

  const hasVoted = useCallback((suggestionId: string): boolean => {
    return userVotes.has(suggestionId)
  }, [userVotes])

  useEffect(() => {
    fetchSuggestions()

    const supabase = createClient()

    // Subscribe to suggestion changes
    const channel = supabase
      .channel('suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_suggestions'
        },
        () => {
          fetchSuggestions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSuggestions])

  return {
    suggestions,
    isLoading,
    error,
    createSuggestion,
    voteSuggestion,
    hasVoted,
    refetch: fetchSuggestions
  }
}
