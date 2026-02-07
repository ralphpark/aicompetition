'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Coins, ShoppingBag, Gift, Sparkles, Check } from 'lucide-react'

// Arena Coins display
interface CoinBalanceProps {
  balance: number
  pendingBonus?: number
  size?: 'sm' | 'md' | 'lg'
}

export function CoinBalance({ balance, pendingBonus, size = 'md' }: CoinBalanceProps) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold",
      sizeClasses[size]
    )}>
      <motion.span
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        🪙
      </motion.span>
      <span>{balance.toLocaleString()}</span>
      {pendingBonus && pendingBonus > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full"
        >
          +{pendingBonus}
        </motion.span>
      )}
    </div>
  )
}

// Coin earning animation
interface CoinEarnedProps {
  amount: number
  reason: string
  onComplete?: () => void
}

export function CoinEarnedAnimation({ amount, reason, onComplete }: CoinEarnedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      onAnimationComplete={onComplete}
      className="fixed top-20 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <motion.span
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-2xl"
        >
          🪙
        </motion.span>
        <div>
          <div className="font-bold text-lg">+{amount} Coins</div>
          <div className="text-sm text-white/80">{reason}</div>
        </div>
      </div>

      {/* Floating coins */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            x: Math.random() * 100 - 50,
            y: -50 - Math.random() * 50,
          }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          className="absolute left-1/2 top-1/2 text-xl"
        >
          🪙
        </motion.span>
      ))}
    </motion.div>
  )
}

// Shop items
export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
  category: 'avatar' | 'theme' | 'badge' | 'effect'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isOwned?: boolean
  isEquipped?: boolean
}

const rarityStyles = {
  common: 'border-gray-300 bg-gray-50 dark:bg-gray-800',
  rare: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  epic: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  legendary: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
}

const rarityLabels = {
  common: { text: 'Common', color: 'text-gray-500' },
  rare: { text: 'Rare', color: 'text-blue-500' },
  epic: { text: 'Epic', color: 'text-purple-500' },
  legendary: { text: 'Legendary', color: 'text-yellow-500' },
}

interface ShopItemCardProps {
  item: ShopItem
  userBalance: number
  onPurchase: (itemId: string) => void
  onEquip?: (itemId: string) => void
}

export function ShopItemCard({ item, userBalance, onPurchase, onEquip }: ShopItemCardProps) {
  const canAfford = userBalance >= item.price
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = async () => {
    setIsPurchasing(true)
    await onPurchase(item.id)
    setIsPurchasing(false)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-xl border-2 p-4 transition-all",
        rarityStyles[item.rarity],
        item.isOwned && "ring-2 ring-green-400 ring-offset-2"
      )}
    >
      {/* Rarity label */}
      <div className={cn("text-xs font-bold mb-2", rarityLabels[item.rarity].color)}>
        {rarityLabels[item.rarity].text}
      </div>

      {/* Icon */}
      <div className="text-5xl text-center mb-3">{item.icon}</div>

      {/* Info */}
      <h4 className="font-bold text-center">{item.name}</h4>
      <p className="text-xs text-gray-500 text-center mb-3">{item.description}</p>

      {/* Price / Action */}
      {item.isOwned ? (
        <button
          onClick={() => onEquip?.(item.id)}
          className={cn(
            "w-full py-2 rounded-lg text-sm font-medium transition-all",
            item.isEquipped
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          )}
        >
          {item.isEquipped ? (
            <span className="flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> Equipped
            </span>
          ) : (
            'Equip'
          )}
        </button>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={!canAfford || isPurchasing}
          className={cn(
            "w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
            canAfford
              ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
          )}
        >
          {isPurchasing ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⏳
            </motion.span>
          ) : (
            <>
              <span>🪙</span>
              <span>{item.price.toLocaleString()}</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  )
}

// Shop grid
interface ShopProps {
  items: ShopItem[]
  userBalance: number
  onPurchase: (itemId: string) => void
  onEquip?: (itemId: string) => void
}

export function Shop({ items, userBalance, onPurchase, onEquip }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All', icon: '🛍️' },
    { id: 'avatar', label: 'Avatars', icon: '👤' },
    { id: 'theme', label: 'Themes', icon: '🎨' },
    { id: 'badge', label: 'Badges', icon: '🏅' },
    { id: 'effect', label: 'Effects', icon: '✨' },
  ]

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Arena Shop</h2>
        </div>
        <CoinBalance balance={userBalance} />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category.id
                ? "bg-purple-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            userBalance={userBalance}
            onPurchase={onPurchase}
            onEquip={onEquip}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No items in this category yet.</p>
        </div>
      )}
    </div>
  )
}

// Daily reward chest
interface DailyRewardProps {
  canClaim: boolean
  currentDay: number // 1-7
  onClaim: () => void
}

export function DailyRewardChest({ canClaim, currentDay, onClaim }: DailyRewardProps) {
  const rewards = [
    { day: 1, coins: 50, bonus: null },
    { day: 2, coins: 75, bonus: null },
    { day: 3, coins: 100, bonus: null },
    { day: 4, coins: 150, bonus: null },
    { day: 5, coins: 200, bonus: null },
    { day: 6, coins: 300, bonus: null },
    { day: 7, coins: 500, bonus: '🎁 Mystery Box' },
  ]

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5" />
        <h3 className="font-bold">Daily Rewards</h3>
      </div>

      {/* Reward track */}
      <div className="flex gap-1 mb-4">
        {rewards.map((reward, index) => {
          const isPast = index < currentDay - 1
          const isCurrent = index === currentDay - 1
          const isFuture = index > currentDay - 1

          return (
            <div
              key={reward.day}
              className={cn(
                "flex-1 h-12 rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                isPast && "bg-white/30",
                isCurrent && "bg-white text-purple-600 scale-110 shadow-lg",
                isFuture && "bg-white/10"
              )}
            >
              <span className="font-bold">Day {reward.day}</span>
              <span className="text-[10px] opacity-80">
                {reward.bonus || `🪙${reward.coins}`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Claim button */}
      <motion.button
        whileHover={canClaim ? { scale: 1.02 } : {}}
        whileTap={canClaim ? { scale: 0.98 } : {}}
        onClick={onClaim}
        disabled={!canClaim}
        className={cn(
          "w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
          canClaim
            ? "bg-white text-purple-600 hover:bg-gray-100"
            : "bg-white/20 cursor-not-allowed"
        )}
      >
        {canClaim ? (
          <>
            <Sparkles className="w-5 h-5" />
            Claim Today's Reward!
          </>
        ) : (
          'Come back tomorrow!'
        )}
      </motion.button>
    </div>
  )
}
