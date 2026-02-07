'use client'

import { motion } from 'framer-motion'
import { Code, ChevronRight } from 'lucide-react'

interface PromptCardProps {
  section: string
  content: string
  name?: string
  onSuggest?: () => void
}

const sectionConfig: Record<string, { icon: string; color: string; label: string }> = {
  // DB categories
  system: { icon: '⚙️', color: 'border-blue-500/30 bg-blue-500/5', label: 'System Prompt' },
  model: { icon: '🤖', color: 'border-purple-500/30 bg-purple-500/5', label: 'Model Config' },
  pressure: { icon: '🎯', color: 'border-red-500/30 bg-red-500/5', label: 'Rank Pressure' },
  rules: { icon: '📋', color: 'border-green-500/30 bg-green-500/5', label: 'Trading Rules' },
  trend: { icon: '📈', color: 'border-amber-500/30 bg-amber-500/5', label: 'Trend Analysis' },
  passivity: { icon: '⚠️', color: 'border-orange-500/30 bg-orange-500/5', label: 'Anti-Passivity' },
  competition: { icon: '🏆', color: 'border-pink-500/30 bg-pink-500/5', label: 'Competition' },
  // Legacy sections
  market_analysis: { icon: '📊', color: 'border-blue-500/30 bg-blue-500/5', label: 'Market Analysis' },
  risk_management: { icon: '🛡️', color: 'border-emerald-500/30 bg-emerald-500/5', label: 'Risk Management' },
  psychology_pressure: { icon: '🧠', color: 'border-purple-500/30 bg-purple-500/5', label: 'Psychology' },
  learning_feedback: { icon: '📚', color: 'border-amber-500/30 bg-amber-500/5', label: 'Learning' },
  signal_integration: { icon: '📡', color: 'border-cyan-500/30 bg-cyan-500/5', label: 'Signals' },
  model_specific: { icon: '🎯', color: 'border-pink-500/30 bg-pink-500/5', label: 'Model Specific' },
}

const defaultConfig = { icon: '📄', color: 'border-gray-500/30 bg-gray-500/5', label: 'Prompt' }

export function PromptCard({ section, content, name, onSuggest }: PromptCardProps) {
  const config = sectionConfig[section] || defaultConfig

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`border rounded-xl p-4 ${config.color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name || config.label}
            </h3>
            <span className="text-xs text-gray-500">{config.label}</span>
          </div>
        </div>
        {onSuggest && (
          <button
            onClick={onSuggest}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Suggest Improvement
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto max-h-48 overflow-y-auto">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Code className="w-4 h-4" />
        <span>Active prompt from database</span>
      </div>
    </motion.div>
  )
}
