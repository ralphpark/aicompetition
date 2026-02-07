export interface ModelCharacter {
  id: string
  name: string
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'Mistral' | 'Groq' | 'OpenRouter'
  emoji: string
  color: string
  bgColor: string
  personality: string
  catchphrase: string
}

export const MODEL_CHARACTERS: ModelCharacter[] = [
  {
    id: 'baa5ab29-8ec4-408c-b730-045b178716ae',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    emoji: '🤖',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    personality: 'The Pioneer',
    catchphrase: 'Data speaks truth'
  },
  {
    id: 'f9f44ebd-58c8-46d3-bd51-81c38c12b21e',
    name: 'Claude-Sonnet',
    provider: 'Anthropic',
    emoji: '🎭',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    personality: 'The Analyst',
    catchphrase: 'Risk first, always'
  },
  {
    id: '731ab77e-d89b-4afa-86d6-b4d6fa007099',
    name: 'Gemini-3.0-Pro',
    provider: 'Google',
    emoji: '🔮',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    personality: 'The Visionary',
    catchphrase: 'I see the future'
  },
  {
    id: '90ffba43-37cf-446f-b24d-c3a5074d69a1',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    emoji: '🔍',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500',
    personality: 'The Detective',
    catchphrase: 'Truth lies deep'
  },
  {
    id: 'c88ff3a5-9431-46ab-bc55-6a96787d9a61',
    name: 'Mistral',
    provider: 'Mistral',
    emoji: '🌬️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    personality: 'The Wind',
    catchphrase: 'Swift and precise'
  },
  {
    id: '375a9474-ef42-4037-a161-cf2f458edf2d',
    name: 'GROK-4.1',
    provider: 'OpenRouter',
    emoji: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    personality: 'The Maverick',
    catchphrase: 'Break the rules'
  },
  {
    id: '14a535ce-2198-4bd6-b6d9-12c6a65d48c9',
    name: 'Kimi-k2',
    provider: 'Groq',
    emoji: '🐉',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    personality: 'The Dragon',
    catchphrase: 'Rising power'
  },
  {
    id: '3e4d75e3-b71a-42fd-ab24-657af640404f',
    name: 'Qwen3-32B',
    provider: 'Groq',
    emoji: '🏯',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    personality: 'The Scholar',
    catchphrase: 'Wisdom prevails'
  },
  {
    id: 'c7567aec-23ba-4342-a2c1-69855dd2eff6',
    name: 'MiMo-V2',
    provider: 'OpenRouter',
    emoji: '🎯',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
    personality: 'The Precision',
    catchphrase: 'One shot, one kill'
  }
]

export function getModelCharacter(modelId: string): ModelCharacter | undefined {
  return MODEL_CHARACTERS.find(m => m.id === modelId)
}

export function getModelByName(name: string): ModelCharacter | undefined {
  return MODEL_CHARACTERS.find(m => m.name === name)
}

export const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': 'bg-emerald-500',
  'Anthropic': 'bg-orange-500',
  'Google': 'bg-purple-500',
  'DeepSeek': 'bg-cyan-500',
  'Mistral': 'bg-blue-500',
  'Groq': 'bg-red-500',
  'OpenRouter': 'bg-yellow-500',
}
