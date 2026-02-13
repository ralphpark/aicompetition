import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MODEL_CHARACTERS } from '@/lib/constants/models'
import { ArrowLeft, MessageSquare, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const model = MODEL_CHARACTERS.find(m => m.id === id)

  return {
    title: model ? `${model.name} Prompt History - PnL Grand Prix` : 'Prompt History - PnL Grand Prix',
    description: model ? `View the AI prompts and reasoning for ${model.name}'s trading decisions` : 'AI prompt history',
  }
}

export default async function ModelPromptsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const model = MODEL_CHARACTERS.find(m => m.id === id)
  if (!model) {
    notFound()
  }

  // Fetch decisions with reasoning
  const { data: decisions } = await supabase
    .from('ai_decisions')
    .select('*')
    .eq('model_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  const getActionColor = (action: string) => {
    if (action.includes('LONG')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (action.includes('SHORT')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LONG')) return <TrendingUp className="w-4 h-4" />
    if (action.includes('SHORT')) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/models/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {model.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">{model.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{model.name} Prompt History</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Full transparency into AI decision-making process
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
              About AI Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Each AI model receives the same market data and a standardized prompt asking for
              trading recommendations. The model's response includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Action:</strong> Whether to open/close a position or hold</li>
              <li><strong>Confidence:</strong> How confident the AI is in its decision (0-100%)</li>
              <li><strong>Reasoning:</strong> The AI's explanation for its decision</li>
              <li><strong>Price Targets:</strong> Entry, stop-loss, and take-profit levels</li>
            </ul>
          </CardContent>
        </Card>

        {/* Decisions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Decision History</h2>

          {decisions && decisions.length > 0 ? (
            decisions.map((decision) => (
              <Card key={decision.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(decision.action)}>
                        <span className="flex items-center gap-1">
                          {getActionIcon(decision.action)}
                          {decision.action}
                        </span>
                      </Badge>
                      <span className="font-mono text-sm">{decision.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(decision.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium">{decision.confidence}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          decision.confidence >= 70 ? 'bg-green-500' :
                          decision.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${decision.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Price Targets */}
                  {decision.action !== 'NO_ACTION' && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Entry Price</div>
                        <div className="font-mono font-medium">
                          ${Number(decision.entry_price).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
                        <div className="font-mono font-medium text-red-600">
                          ${Number(decision.stop_loss).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Take Profit</div>
                        <div className="font-mono font-medium text-green-600">
                          ${Number(decision.take_profit).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Reasoning:
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg whitespace-pre-wrap">
                      {decision.reasoning || 'No reasoning provided'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No decisions recorded yet.</p>
                <p className="text-sm mt-2">Decisions will appear here as the AI makes trading choices.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
