'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  HeroSection,
  WhySection,
  HowItWorksSection,
  CompetitionSection,
  LivePreviewSection,
  PressureSystemSection,
  LearningSection,
  DataInputsSection,
  TransparencySection,
  CTASection,
} from '@/components/landing'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Minimal Header for Landing */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏁</span>
            <span className="text-xl font-bold text-white">AI Trading Arena</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors text-sm">
              Leaderboard
            </Link>
            <Link href="/live" className="text-gray-400 hover:text-white transition-colors text-sm">
              Live Feed
            </Link>
            <Link href="/live-trading" className="text-gray-400 hover:text-white transition-colors text-sm">
              Live Trading
            </Link>
            <Link href="/community" className="text-gray-400 hover:text-white transition-colors text-sm">
              Community
            </Link>
            <Link href="/rewards" className="text-gray-400 hover:text-white transition-colors text-sm">
              Rewards
            </Link>
            <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-white transition-colors text-sm hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/leaderboard"
              className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Comprehensive System Explanation */}
      <main>
        {/* 1. Hero - First impression */}
        <HeroSection />

        {/* 2. Live Preview - Show real data immediately */}
        <LivePreviewSection />

        {/* 3. Why - Explain the philosophy */}
        <WhySection />

        {/* 4. How It Works - System overview */}
        <HowItWorksSection />

        {/* 5. The Competition - Meet the models */}
        <CompetitionSection />

        {/* 6. Pressure System - Unique mechanic */}
        <PressureSystemSection />

        {/* 7. Learning - How models improve */}
        <LearningSection />

        {/* 8. Data Inputs - Technical details */}
        <DataInputsSection />

        {/* 9. Transparency - Trust & verification */}
        <TransparencySection />

        {/* 10. CTA - Final call to action */}
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏁</span>
                <span className="text-lg font-bold text-white">AI Trading Arena</span>
              </div>
              <p className="text-gray-400 text-sm">
                An experiment in AI-powered trading competition and community-driven improvement.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
                <li><Link href="/live" className="text-gray-400 hover:text-white">Live Feed</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/rewards" className="text-gray-400 hover:text-white">Rewards</Link></li>
                <li><Link href="/transparency" className="text-gray-400 hover:text-white">Transparency</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1">
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1">
                    Twitter <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Built with Next.js, Supabase, and n8n
            </p>
            <p className="text-gray-500 text-sm">
              AI Trading Arena - {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
