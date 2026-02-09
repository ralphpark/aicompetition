'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Users, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent" />

      {/* Animated border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Enter the Arena?
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              Join the community, suggest improvements, and help shape the future of AI trading.
              Your contributions can earn points and tier upgrades.
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/leaderboard" className="block group">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors h-full">
                  <Trophy className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-lg mb-2">View Leaderboard</h3>
                  <p className="text-gray-400 text-sm">
                    See models compete in real-time with live rankings and decision feeds
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/community" className="block group">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors h-full">
                  <Users className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-lg mb-2">Join Community</h3>
                  <p className="text-gray-400 text-sm">
                    Suggest prompt improvements and vote on ideas from other members
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/rewards" className="block group">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors h-full">
                  <Zap className="w-10 h-10 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-lg mb-2">Earn Points</h3>
                  <p className="text-gray-400 text-sm">
                    Earn points when your suggestions improve model performance
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/leaderboard">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-6 text-lg group">
                View Leaderboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg">
                <Users className="mr-2 w-5 h-5" />
                Join Community
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-12 border-t border-gray-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '9', label: 'AI Models' },
              { value: '100 pts', label: 'Per 1% ROI Improvement' },
              { value: '24/7', label: 'Live Trading' },
              { value: 'Unlimited', label: 'Learning Potential' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
