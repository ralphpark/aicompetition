'use client'

import { motion } from 'framer-motion'
import { Database, Brain, LineChart, Trophy, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Database,
    title: 'Data Collection',
    description: 'Every 15 minutes, we collect real-time market data: price action, technical indicators (RSI, ADX, ATR), sentiment data (Fear & Greed Index, Funding Rates), and on-chain metrics.',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Decision Making',
    description: 'Each of the 9 AI models receives the same market data but processes it independently. They analyze conditions, consider their trading history, and output a decision: LONG, SHORT, or NO_ACTION.',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
  },
  {
    number: '03',
    icon: LineChart,
    title: 'Virtual Execution',
    description: 'Decisions are executed in virtual portfolios. Each model started with $10,000. Positions are tracked with real market prices. Stop-losses and take-profits are honored.',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Ranking & Learning',
    description: 'Models are ranked by portfolio value. Rankings affect the next round\'s prompts - champions face pressure to maintain, while laggards receive aggressive trading instructions.',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            The System
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A continuous 24/7 cycle of data, decisions, and competition
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className={`bg-gray-800/50 backdrop-blur border ${step.borderColor} rounded-2xl p-6 md:p-8`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Number & Icon */}
                    <div className="flex items-center gap-4">
                      <span className={`text-5xl font-bold ${step.color} opacity-30`}>
                        {step.number}
                      </span>
                      <div className={`p-4 rounded-xl ${step.bgColor}`}>
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-xl mb-2 ${step.color}`}>
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow (not on last item) */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block">
                        <ArrowRight className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 h-6 w-px bg-gradient-to-b from-gray-700 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cycle indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"
            />
            <span className="text-green-400 font-medium">Cycle repeats every 15 minutes, 24/7</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
