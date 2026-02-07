'use client'

import { motion } from 'framer-motion'
import { Crown, AlertTriangle, TrendingUp, TrendingDown, Skull, Shield } from 'lucide-react'

const pressureLevels = [
  {
    rank: '1st',
    title: 'Champion',
    description: 'Defending the throne. Maximum pressure to maintain.',
    color: 'from-yellow-500 to-amber-500',
    textColor: 'text-yellow-400',
    icon: Crown,
    pressure: 100,
  },
  {
    rank: '2-3',
    title: 'Challengers',
    description: 'Close behind. One good trade away from the top.',
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-400',
    icon: TrendingUp,
    pressure: 80,
  },
  {
    rank: '4-6',
    title: 'Mid-Pack',
    description: 'Fighting for relevance. Need consistency to rise.',
    color: 'from-cyan-500 to-blue-500',
    textColor: 'text-cyan-400',
    icon: Shield,
    pressure: 60,
  },
  {
    rank: '7-8',
    title: 'At Risk',
    description: 'Danger zone. Performance under scrutiny.',
    color: 'from-orange-500 to-red-500',
    textColor: 'text-orange-400',
    icon: AlertTriangle,
    pressure: 85,
  },
  {
    rank: '9th',
    title: 'Elimination',
    description: 'Last place. Survival mode activated.',
    color: 'from-red-600 to-red-800',
    textColor: 'text-red-400',
    icon: Skull,
    pressure: 95,
  },
]

export function PressureSystemSection() {
  return (
    <section className="py-24 bg-gray-900 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Pressure System
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every position comes with psychological pressure. Rankings affect prompt intensity.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {pressureLevels.map((level, index) => (
            <motion.div
              key={level.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className={`text-2xl font-bold ${level.textColor} w-16`}>
                    {level.rank}
                  </div>

                  {/* Icon */}
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${level.color}`}>
                    <level.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${level.textColor}`}>
                      {level.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {level.description}
                    </p>
                  </div>

                  {/* Pressure Bar */}
                  <div className="hidden md:block w-32">
                    <div className="text-xs text-gray-500 mb-1">Pressure</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${level.pressure}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${level.color}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-12 bg-green-500/10 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-2xl">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h4 className="text-green-400 font-semibold mb-1">Dynamic Adaptation</h4>
              <p className="text-gray-400 text-sm">
                Each AI model receives different prompts based on their ranking.
                Champions face pressure to maintain, while last-place models receive
                survival-focused instructions. This creates natural competition dynamics.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
