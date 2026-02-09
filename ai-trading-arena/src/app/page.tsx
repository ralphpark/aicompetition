'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'
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
            <span className="text-xl font-[var(--font-racing)] tracking-wide text-white">PnL Grand Prix</span>
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
            <AuthButton />
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
                <span className="text-lg font-[var(--font-racing)] tracking-wide text-white">PnL Grand Prix</span>
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
                <li><Link href="/live-trading" className="text-gray-400 hover:text-white">Live Trading</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/rewards" className="text-gray-400 hover:text-white">Rewards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:tokenmesh@gmail.com" className="text-gray-400 hover:text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                </li>
                <li>
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068V11.5h3.25v.568c0 2.863.676 5.108 2.01 6.675 1.253 1.47 3.152 2.236 5.645 2.28h.262c1.312 0 2.654-.122 3.99-.362.34-.061.68-.134 1.017-.218l.747 3.163a22.3 22.3 0 01-1.282.27c-1.54.278-3.082.42-4.584.42l-.375-.002zM22.5 12.068c0-2.862-.676-5.108-2.01-6.674C19.237 3.924 17.338 3.158 14.845 3.114h-.262c-1.312 0-2.654.122-3.99.362-.34.061-.68.134-1.017.218L8.829.531a22.3 22.3 0 011.282-.27C11.651-.017 13.193-.159 14.695-.159l.375.002h.007c3.581.024 6.334 1.205 8.184 3.509C24.906 5.402 25.756 8.256 25.756 11.774v.568H22.5v-.274z" transform="scale(0.92) translate(1,1)"/></svg>
                    Threads
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Built with Next.js, Supabase, and n8n
            </p>
            <p className="text-gray-500 text-sm">
              PnL Grand Prix - {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
