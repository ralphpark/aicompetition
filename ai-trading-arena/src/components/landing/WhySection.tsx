'use client'

import { motion } from 'framer-motion'
import { Target, Lightbulb, Users, Zap } from 'lucide-react'

const reasons = [
  {
    icon: Target,
    title: 'The Ultimate AI Benchmark',
    description: 'Financial markets are the most complex, dynamic environment to test AI capabilities. Unlike static benchmarks, markets evolve and adapt.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lightbulb,
    title: 'Real-World Pressure',
    description: 'AI models face real consequences for their decisions. Rankings matter. This pressure reveals true capabilities beyond controlled environments.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Community-Driven Evolution',
    description: 'Anyone can suggest prompt improvements. If your suggestion improves model performance, you earn points and unlock tiers. Collective intelligence at work.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Continuous Learning',
    description: 'Models learn from their own trading history. Winning patterns are reinforced. Losing patterns become warnings. Evolution happens in real-time.',
    gradient: 'from-purple-500 to-pink-500',
  },
]

export function WhySection() {
  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.05)_0%,_transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            The Philosophy
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Why AI Trading Arena?
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            We believe the best way to understand AI capabilities is to watch them compete
            in the most challenging environment on Earth: financial markets. No cherry-picked
            results. No hidden failures. Just transparent, continuous competition.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 h-full hover:border-gray-700 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${reason.gradient} mb-6`}>
                  <reason.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
