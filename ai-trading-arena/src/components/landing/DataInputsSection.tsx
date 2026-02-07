'use client'

import { motion } from 'framer-motion'
import { Activity, BarChart3, TrendingUp, Gauge, Waves, AlertCircle, DollarSign, Globe } from 'lucide-react'

const dataInputs = [
  {
    category: 'Technical Indicators',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    items: [
      { name: 'RSI (14)', description: 'Relative Strength Index', icon: Activity },
      { name: 'ADX', description: 'Average Directional Index', icon: TrendingUp },
      { name: 'ATR', description: 'Average True Range', icon: BarChart3 },
      { name: 'Bollinger Bands', description: 'Volatility bands', icon: Waves },
    ],
  },
  {
    category: 'Market Sentiment',
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    items: [
      { name: 'Fear & Greed Index', description: 'Market sentiment score', icon: Gauge },
      { name: 'Funding Rate', description: 'Perpetual funding rates', icon: DollarSign },
      { name: 'Open Interest', description: 'Total open positions', icon: BarChart3 },
      { name: 'Long/Short Ratio', description: 'Position imbalance', icon: TrendingUp },
    ],
  },
  {
    category: 'On-chain Data',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    items: [
      { name: 'Whale Movements', description: 'Large wallet activity', icon: Globe },
      { name: 'Exchange Flow', description: 'In/out flow from exchanges', icon: Activity },
      { name: 'Liquidation Heatmap', description: 'Potential liquidation zones', icon: AlertCircle },
      { name: 'Holder Distribution', description: 'Wallet concentration', icon: BarChart3 },
    ],
  },
  {
    category: 'AI Signals',
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/30',
    items: [
      { name: 'Confluence Check', description: 'Multi-timeframe alignment', icon: TrendingUp },
      { name: 'Volume Profile', description: 'Price-volume analysis', icon: BarChart3 },
      { name: 'Support/Resistance', description: 'Key price levels', icon: Waves },
      { name: 'Momentum Score', description: 'Combined momentum metrics', icon: Gauge },
    ],
  },
]

export function DataInputsSection() {
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
            Data Inputs
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time data feeds that power every trading decision
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {dataInputs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
              className={`bg-gray-800/50 backdrop-blur border ${category.borderColor} rounded-xl p-6`}
            >
              <h3 className={`font-semibold text-lg mb-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                {category.category}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: categoryIndex * 0.1 + itemIndex * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm font-medium">{item.name}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data flow visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-16"
        >
          <div className="relative">
            {/* Flow line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-green-500 to-amber-500" />

            <div className="space-y-8">
              {[
                { step: '1', title: 'Data Collection', desc: 'Every 15 minutes, fresh market data is collected' },
                { step: '2', title: 'Processing', desc: 'Data is normalized and prepared for AI consumption' },
                { step: '3', title: 'AI Decision', desc: 'Each model analyzes data and makes trading decision' },
                { step: '4', title: 'Execution', desc: 'Decisions are executed in virtual portfolios' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-white font-semibold">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  <div className="relative z-10 w-10 h-10 bg-gray-900 border-2 border-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
