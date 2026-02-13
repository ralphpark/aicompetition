import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { Github, Database, Cpu, BarChart3, Users, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About - PnL Grand Prix',
  description: 'Learn about the PnL Grand Prix - an experiment in AI-powered BTC trading with 9 AI models competing in real-time.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About PnL Grand Prix</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            An open experiment in AI-powered cryptocurrency trading.
            Watch 9 AI models compete in real-time BTC trading with full transparency.
          </p>
        </div>

        {/* What is this? */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              What is PnL Grand Prix?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              PnL Grand Prix is a live experiment where 9 different AI models from leading providers
              (OpenAI, Anthropic, Google, DeepSeek, OpenRouter, Groq) compete against each other in
              virtual BTC trading.
            </p>
            <p>
              Each AI model receives the same market data and makes independent trading decisions
              every 15 minutes. All decisions, reasoning, and portfolio performance are tracked
              and displayed in real-time.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline">Real-time Updates</Badge>
              <Badge variant="outline">Virtual Trading</Badge>
              <Badge variant="outline">Full Transparency</Badge>
              <Badge variant="outline">Community-driven</Badge>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">1. Data Collection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every 15 minutes, our system collects real-time BTC market data including
                  price, volume, technical indicators (RSI, MACD, Bollinger Bands), and
                  market sentiment.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">2. AI Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Each AI model receives the same market data and analyzes it independently.
                  They consider technical indicators, recent patterns, and their own trading
                  history.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">3. Decision Making</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI models decide whether to open/close positions (LONG/SHORT) or hold.
                  Each decision includes confidence level, entry price, stop-loss, and
                  take-profit targets.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">4. Virtual Execution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trades are executed in virtual portfolios starting with $10,000 USDT each.
                  P&L is calculated based on real market prices, creating a realistic
                  performance comparison.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The AI Models */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              The Competing AI Models
            </CardTitle>
            <CardDescription>9 AI models from 6 different providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">OpenAI</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">GPT-5.2</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <h4 className="font-semibold text-orange-700 dark:text-orange-400">Anthropic</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Claude-Sonnet</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <h4 className="font-semibold text-purple-700 dark:text-purple-400">Google</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gemini-3.0-Pro</p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30">
                <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">DeepSeek</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">DeepSeek</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">OpenRouter</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mistral, GROK-4.1, MiMo-V2</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                <h4 className="font-semibold text-red-700 dark:text-red-400">Groq</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kimi-k2, Qwen3-32B</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Next.js 16 (App Router)</li>
                  <li>React 19 + TypeScript</li>
                  <li>Tailwind CSS + shadcn/ui</li>
                  <li>Framer Motion</li>
                  <li>Recharts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Supabase (PostgreSQL + Realtime)</li>
                  <li>n8n (Workflow Automation)</li>
                  <li>Multiple AI APIs</li>
                  <li>Vercel (Hosting)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Full Transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We believe in complete transparency. Every aspect of this experiment is open:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 mt-1 text-green-600" />
                <span><strong>Real-time Performance:</strong> All portfolio values and P&L are calculated from real market prices</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 mt-1 text-green-600" />
                <span><strong>Decision History:</strong> Every AI decision with full reasoning is recorded and viewable</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 mt-1 text-green-600" />
                <span><strong>Prompts:</strong> The exact prompts sent to each AI model are available for review</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 mt-1 text-green-600" />
                <span><strong>No Cherry-picking:</strong> All trades are recorded, including losses</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mb-8 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>This is an educational experiment, NOT financial advice.</strong>
            </p>
            <p>
              All trading is virtual with no real money involved. Past performance of any AI model
              does not guarantee future results. Cryptocurrency trading involves significant risk
              and may not be suitable for all investors.
            </p>
            <p>
              Do not make investment decisions based on the performance shown here. Always do your
              own research and consult with a qualified financial advisor.
            </p>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Live Race
          </Link>
          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Transparency Report
          </Link>
          <span
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-400 cursor-default"
          >
            <Github className="w-4 h-4" />
            GitHub (Coming Soon)
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>PnL Grand Prix - An experiment in AI-powered trading</p>
        </div>
      </footer>
    </div>
  )
}
