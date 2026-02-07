'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submitSuggestion } from '@/app/actions/community'
import { useState, useTransition } from 'react'
import { Send, Lightbulb, Info } from 'lucide-react'
import { MODEL_CHARACTERS } from '@/lib/constants/models'
import { SECTION_LABELS, type SuggestionSection } from '@/types/database'

interface SuggestionFormProps {
  isLoggedIn: boolean
  modelId?: string
  decisionId?: string
  defaultSection?: SuggestionSection
}

const sectionDescriptions: Record<SuggestionSection, string> = {
  market_analysis: 'How the AI analyzes market data, indicators, and trends',
  risk_management: 'Stop-loss, take-profit, position sizing strategies',
  psychology_pressure: 'Competition pressure, ranking-based behavior',
  learning_feedback: 'How the AI learns from past wins and losses',
  signal_integration: 'External signals, on-chain data, sentiment analysis',
  model_specific: 'Suggestions for a specific AI model only',
}

export function SuggestionForm({ isLoggedIn, modelId, decisionId, defaultSection }: SuggestionFormProps) {
  const [content, setContent] = useState('')
  const [expectedEffect, setExpectedEffect] = useState('')
  const [section, setSection] = useState<SuggestionSection>(defaultSection || 'market_analysis')
  const [selectedModel, setSelectedModel] = useState<string | null>(modelId || null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!isLoggedIn) {
      setError('Please sign in to submit suggestions')
      return
    }

    if (content.length < 20) {
      setError('Suggestion must be at least 20 characters')
      return
    }

    const formData = new FormData()
    formData.set('content', content)
    formData.set('section', section)
    if (expectedEffect) formData.set('expected_effect', expectedEffect)
    if (selectedModel) formData.set('model_id', selectedModel)
    if (decisionId) formData.set('decision_id', decisionId)

    startTransition(async () => {
      const result = await submitSuggestion(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setContent('')
        setExpectedEffect('')
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Suggest Prompt Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <div className="text-center py-6">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">
              Sign in to submit suggestions and earn points
            </p>
            <p className="text-xs text-gray-400">
              Approved suggestions earn you points and unlock tiers!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prompt Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SuggestionSection)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
              >
                {(Object.keys(SECTION_LABELS) as SuggestionSection[]).map((key) => (
                  <option key={key} value={key}>
                    {SECTION_LABELS[key]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {sectionDescriptions[section]}
              </p>
            </div>

            {/* Model Select (optional) */}
            {section === 'model_specific' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Model (Optional)
                </label>
                <select
                  value={selectedModel || ''}
                  onChange={(e) => setSelectedModel(e.target.value || null)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">All Models</option>
                  {MODEL_CHARACTERS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.emoji} {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Suggestion
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your improvement idea in detail. What should be added, changed, or removed from the prompt?"
                className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                disabled={isPending}
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{content.length}/1000 characters</span>
                <span>Min 20 characters</span>
              </div>
            </div>

            {/* Expected Effect */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Expected Effect (Optional)
              </label>
              <textarea
                value={expectedEffect}
                onChange={(e) => setExpectedEffect(e.target.value)}
                placeholder="What improvement do you expect from this change? E.g., 'Should reduce false signals in sideways markets'"
                className="w-full p-3 border rounded-lg resize-none h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                disabled={isPending}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Submit your suggestion (+10 points)</li>
                  <li>Community votes on suggestions</li>
                  <li>Top suggestions are reviewed by Claude AI</li>
                  <li>Approved suggestions get applied (+100 points)</li>
                  <li>Earn bonus points based on performance improvement!</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={isPending || content.length < 20}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isPending ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                Suggestion submitted successfully! +10 points
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
