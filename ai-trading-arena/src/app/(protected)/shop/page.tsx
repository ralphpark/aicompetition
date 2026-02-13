'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shop,
  CoinBalance,
  CoinEarnedAnimation,
  useCelebration,
  useNotifications,
} from '@/components/gamification'
import type { ShopItem } from '@/components/gamification'
import { ShoppingBag, Gift, Sparkles } from 'lucide-react'

// Demo shop items
const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  {
    id: 'avatar-rocket',
    name: 'Rocket Trader',
    description: 'To the moon!',
    price: 500,
    icon: '🚀',
    category: 'avatar',
    rarity: 'common',
  },
  {
    id: 'avatar-diamond',
    name: 'Diamond Hands',
    description: 'HODL forever',
    price: 1000,
    icon: '💎',
    category: 'avatar',
    rarity: 'rare',
  },
  {
    id: 'avatar-whale',
    name: 'Crypto Whale',
    description: 'Big moves only',
    price: 2500,
    icon: '🐋',
    category: 'avatar',
    rarity: 'epic',
  },
  {
    id: 'avatar-crown',
    name: 'Arena King',
    description: 'Rule the arena',
    price: 5000,
    icon: '👑',
    category: 'avatar',
    rarity: 'legendary',
  },

  // Themes
  {
    id: 'theme-neon',
    name: 'Neon Nights',
    description: 'Cyberpunk vibes',
    price: 800,
    icon: '🌃',
    category: 'theme',
    rarity: 'rare',
  },
  {
    id: 'theme-ocean',
    name: 'Deep Ocean',
    description: 'Calm blue waters',
    price: 600,
    icon: '🌊',
    category: 'theme',
    rarity: 'common',
  },
  {
    id: 'theme-galaxy',
    name: 'Galaxy Explorer',
    description: 'Among the stars',
    price: 1500,
    icon: '🌌',
    category: 'theme',
    rarity: 'epic',
  },

  // Badges
  {
    id: 'badge-fire',
    name: 'On Fire',
    description: 'Show your hot streak',
    price: 300,
    icon: '🔥',
    category: 'badge',
    rarity: 'common',
  },
  {
    id: 'badge-star',
    name: 'Rising Star',
    description: 'Climbing the ranks',
    price: 500,
    icon: '⭐',
    category: 'badge',
    rarity: 'rare',
  },
  {
    id: 'badge-trophy',
    name: 'Champion',
    description: 'Prediction champion',
    price: 2000,
    icon: '🏆',
    category: 'badge',
    rarity: 'epic',
  },

  // Effects
  {
    id: 'effect-confetti',
    name: 'Confetti Burst',
    description: 'Celebrate in style',
    price: 400,
    icon: '🎊',
    category: 'effect',
    rarity: 'common',
  },
  {
    id: 'effect-sparkle',
    name: 'Sparkle Trail',
    description: 'Leave sparkles behind',
    price: 1200,
    icon: '✨',
    category: 'effect',
    rarity: 'rare',
  },
  {
    id: 'effect-rainbow',
    name: 'Rainbow Aura',
    description: 'Colorful presence',
    price: 3000,
    icon: '🌈',
    category: 'effect',
    rarity: 'legendary',
  },
]

export default function ShopPage() {
  const [userBalance, setUserBalance] = useState(3500)
  const [ownedItems, setOwnedItems] = useState<string[]>(['avatar-rocket', 'badge-fire'])
  const [equippedItems, setEquippedItems] = useState<string[]>(['avatar-rocket'])
  const [showCoinAnimation, setShowCoinAnimation] = useState<{
    amount: number
    reason: string
  } | null>(null)

  const { celebrate, CelebrationComponent } = useCelebration()
  const { addNotification, NotificationComponent } = useNotifications()

  const handlePurchase = (itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item || userBalance < item.price) return

    setUserBalance(prev => prev - item.price)
    setOwnedItems(prev => [...prev, itemId])

    celebrate({ type: 'confetti' })
    addNotification({
      type: 'system',
      title: 'Purchase Complete!',
      message: `You bought ${item.name} for ${item.price} coins!`,
      icon: item.icon,
    })
  }

  const handleEquip = (itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return

    // Unequip other items of same category
    setEquippedItems(prev => {
      const filtered = prev.filter(id => {
        const existingItem = SHOP_ITEMS.find(i => i.id === id)
        return existingItem?.category !== item.category
      })
      return [...filtered, itemId]
    })

    addNotification({
      type: 'system',
      title: 'Item Equipped!',
      message: `${item.name} is now active!`,
      icon: item.icon,
    })
  }

  const itemsWithOwnership = SHOP_ITEMS.map(item => ({
    ...item,
    isOwned: ownedItems.includes(item.id),
    isEquipped: equippedItems.includes(item.id),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <Header />
      <CelebrationComponent />
      <NotificationComponent />

      {showCoinAnimation && (
        <CoinEarnedAnimation
          amount={showCoinAnimation.amount}
          reason={showCoinAnimation.reason}
          onComplete={() => setShowCoinAnimation(null)}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
              Arena Shop
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Spend your hard-earned coins on cosmetics and effects
            </p>
          </div>
          <CoinBalance balance={userBalance} size="lg" />
        </div>

        {/* Earn more coins banner */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Gift className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Need more coins?</h3>
                  <p className="text-white/80">
                    Earn coins through daily check-ins, missions, and predictions!
                  </p>
                </div>
              </div>
              <a
                href="/profile"
                className="px-6 py-2 bg-white text-orange-500 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                View Missions
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Your Collection Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Your Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {ownedItems.map(itemId => {
                const item = SHOP_ITEMS.find(i => i.id === itemId)
                if (!item) return null
                const isEquipped = equippedItems.includes(itemId)

                return (
                  <div
                    key={itemId}
                    className={`p-3 rounded-lg border-2 ${
                      isEquipped
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="text-xs mt-1">{item.name}</div>
                    {isEquipped && (
                      <div className="text-xs text-green-600 font-medium">Equipped</div>
                    )}
                  </div>
                )
              })}
              {ownedItems.length === 0 && (
                <p className="text-gray-500">No items yet. Start shopping!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop */}
        <Shop
          items={itemsWithOwnership}
          userBalance={userBalance}
          onPurchase={handlePurchase}
          onEquip={handleEquip}
        />
      </main>
    </div>
  )
}
