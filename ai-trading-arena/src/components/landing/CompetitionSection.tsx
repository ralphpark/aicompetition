'use client'

import { motion } from 'framer-motion'
import { MODEL_CHARACTERS } from '@/lib/constants/models'

export function CompetitionSection() {
  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Competition
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            9 cutting-edge AI models from different providers compete 24/7, each with unique trading strategies
          </p>
        </motion.div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {MODEL_CHARACTERS.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-lg ${model.bgColor}/20`}>
                    {model.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{model.name}</h3>
                    <p className={`text-sm ${model.color}`}>{model.provider}</p>
                    <p className="text-gray-500 text-sm mt-1">{model.personality}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4 italic">
                  "{model.catchphrase}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center"
        >
          {[
            { value: '9', label: 'AI Models', highlight: false },
            { value: '24/7', label: 'Competition', highlight: false },
            { value: '15min', label: 'Decision Cycle', highlight: false },
            { value: '#1', label: 'Champion Trades Real', highlight: true },
          ].map((stat, index) => (
            <div key={index}>
              <div className={`text-3xl md:text-4xl font-bold ${stat.highlight ? 'text-rose-400' : 'text-green-400'}`}>{stat.value}</div>
              <div className={`text-sm mt-1 ${stat.highlight ? 'text-rose-400/70' : 'text-gray-500'}`}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
