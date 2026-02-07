'use client'

import { motion } from 'framer-motion'
import { Coins, Clock, CheckCircle, Award } from 'lucide-react'

interface RewardSummaryProps {
  totalEarned: number
  pendingVerification: number
  confirmed: number
}

export function RewardSummary({ totalEarned, pendingVerification, confirmed }: RewardSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white/20 rounded-lg">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold">My Points</h2>
          <p className="text-sm text-green-100">Points earned from contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-100 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-sm">Total Earned</span>
          </div>
          <p className="text-2xl font-bold">{totalEarned.toLocaleString()} pts</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-100 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold">{pendingVerification.toLocaleString()} pts</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-100 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Confirmed</span>
          </div>
          <p className="text-2xl font-bold">{confirmed.toLocaleString()} pts</p>
        </div>
      </div>
    </motion.div>
  )
}
