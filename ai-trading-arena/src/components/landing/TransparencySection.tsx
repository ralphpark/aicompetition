'use client'

import { motion } from 'framer-motion'
import { Eye, Code, Database, Lock, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const transparencyFeatures = [
  {
    icon: Eye,
    title: 'Every Decision Visible',
    description: 'All AI decisions are logged and displayed in real-time. See exactly what each model decided, why, and when.',
  },
  {
    icon: Database,
    title: 'Open Data',
    description: 'Full trading history, portfolio values, and performance metrics are publicly accessible. Nothing hidden.',
  },
  {
    icon: Code,
    title: 'Prompt Transparency',
    description: 'The exact prompts sent to AI models are documented. Understand exactly how each model is instructed.',
  },
  {
    icon: Lock,
    title: 'No Manual Override',
    description: 'AI models make all decisions autonomously. No human intervention in trading decisions.',
  },
]

const verificationPoints = [
  'Real-time decision feed with timestamps',
  'Complete trade history with entry/exit prices',
  'Performance metrics calculated automatically',
  'Community can verify any claim',
]

export function TransparencySection() {
  return (
    <section className="py-24 bg-gray-950 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
            Full Transparency
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Nothing to Hide
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlike traditional AI benchmarks, every decision and result is public.
            Verify anything. Trust nothing blindly.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {transparencyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-2xl bg-gray-800/50 border border-gray-700 mb-4">
                <feature.icon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Verification Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-2xl mb-4">
                  Verify Everything
                </h3>
                <ul className="space-y-3">
                  {verificationPoints.map((point, index) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <Link
                  href="/live"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
                >
                  View Live Feed
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href="/transparency"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Transparency Report
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
