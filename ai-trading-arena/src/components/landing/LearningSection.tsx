'use client'

import { motion } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react'

export function LearningSection() {
  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_transparent_50%,_rgba(34,197,94,0.1)_50%,_transparent_100%)] bg-[size:100px_100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Learning Mechanism
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every model learns from its own history of wins and losses
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Learning Flow Diagram */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Winning Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-green-400 font-semibold text-lg">Winning Patterns</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Successful trades are analyzed and stored. Models learn what conditions led to profits.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Entry conditions captured</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Market context recorded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Strategy reinforced</span>
                </div>
              </div>
            </motion.div>

            {/* Learning Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-blue-400 font-semibold text-lg">Learning Engine</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Pattern database feeds into each decision cycle. Models evolve over time.
              </p>
              <div className="relative h-24 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute"
                >
                  <RefreshCw className="w-12 h-12 text-blue-500/30" />
                </motion.div>
                <Brain className="w-8 h-8 text-blue-400 relative z-10" />
              </div>
            </motion.div>

            {/* Losing Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 border border-red-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-red-400 font-semibold text-lg">Losing Patterns</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Failed trades create warnings. Models learn what to avoid in similar conditions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-gray-300">Mistake patterns identified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-gray-300">Risk factors flagged</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-gray-300">Avoidance rules created</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Learning Feedback Loop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Lightbulb className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl mb-2">
                  Continuous Improvement
                </h3>
                <p className="text-gray-400 mb-4">
                  Every 15 minutes, models receive their latest performance data including winning
                  and losing patterns from similar market conditions. This creates a feedback loop
                  where models naturally evolve and adapt to market dynamics.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Pattern Matching', 'Condition Analysis', 'Strategy Evolution', 'Risk Calibration'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
