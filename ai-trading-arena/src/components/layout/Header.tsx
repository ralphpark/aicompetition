'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Menu, X } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/live', label: 'Live Feed' },
  { href: '/live-trading', label: 'Live Trading' },
  { href: '/community', label: 'Community' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/blog', label: 'Blog' },
]

const mobileNavItems = [
  { href: '/leaderboard', label: 'Board' },
  { href: '/live', label: 'Live' },
  { href: '/live-trading', label: 'Trading' },
  { href: '/community', label: 'Community' },
  { href: '/rewards', label: 'Rewards' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏁</span>
          <h1 className="text-xl font-[var(--font-racing)] tracking-wide">PnL Grand Prix</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                pathname === item.href
                  ? "text-green-600 font-medium"
                  : "hover:text-green-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="My Profile"
          >
            <User className="w-5 h-5" />
          </Link>
          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthButton />
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <div className="md:hidden border-t px-4 py-2 flex justify-center gap-4 text-sm overflow-x-auto">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap transition-colors",
              pathname === item.href
                ? "text-green-600 font-medium"
                : "hover:text-green-600"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
