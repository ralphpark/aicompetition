// Achievement definitions for gamification features

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'participation' | 'contribution' | 'streak' | 'special'
  requirement: {
    type: 'suggestions' | 'votes' | 'implemented' | 'login_streak' | 'special'
    count: number
  }
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Participation Achievements
  {
    id: 'first-visit',
    name: 'Welcome to the Arena',
    description: 'Visit PnL Grand Prix for the first time',
    icon: '👋',
    category: 'participation',
    requirement: { type: 'special', count: 1 },
    points: 10,
    rarity: 'common',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Join during the beta period',
    icon: '🐦',
    category: 'participation',
    requirement: { type: 'special', count: 1 },
    points: 50,
    rarity: 'rare',
  },

  // Contribution Achievements
  {
    id: 'first-suggestion',
    name: 'Voice of Reason',
    description: 'Submit your first suggestion',
    icon: '💡',
    category: 'contribution',
    requirement: { type: 'suggestions', count: 1 },
    points: 20,
    rarity: 'common',
  },
  {
    id: 'idea-machine',
    name: 'Idea Machine',
    description: 'Submit 10 suggestions',
    icon: '🧠',
    category: 'contribution',
    requirement: { type: 'suggestions', count: 10 },
    points: 100,
    rarity: 'uncommon',
  },
  {
    id: 'thought-leader',
    name: 'Thought Leader',
    description: 'Submit 50 suggestions',
    icon: '🎓',
    category: 'contribution',
    requirement: { type: 'suggestions', count: 50 },
    points: 500,
    rarity: 'rare',
  },
  {
    id: 'visionary',
    name: 'Visionary',
    description: 'Submit 100 suggestions',
    icon: '🔮',
    category: 'contribution',
    requirement: { type: 'suggestions', count: 100 },
    points: 1000,
    rarity: 'epic',
  },

  // Voting Achievements
  {
    id: 'first-vote',
    name: 'Democracy in Action',
    description: 'Cast your first vote',
    icon: '🗳️',
    category: 'contribution',
    requirement: { type: 'votes', count: 1 },
    points: 10,
    rarity: 'common',
  },
  {
    id: 'active-voter',
    name: 'Active Voter',
    description: 'Cast 50 votes',
    icon: '📊',
    category: 'contribution',
    requirement: { type: 'votes', count: 50 },
    points: 100,
    rarity: 'uncommon',
  },
  {
    id: 'poll-master',
    name: 'Poll Master',
    description: 'Cast 200 votes',
    icon: '🏛️',
    category: 'contribution',
    requirement: { type: 'votes', count: 200 },
    points: 300,
    rarity: 'rare',
  },

  // Implementation Achievements
  {
    id: 'implemented',
    name: 'Game Changer',
    description: 'Have your first suggestion implemented',
    icon: '✨',
    category: 'contribution',
    requirement: { type: 'implemented', count: 1 },
    points: 200,
    rarity: 'rare',
  },
  {
    id: 'serial-improver',
    name: 'Serial Improver',
    description: 'Have 5 suggestions implemented',
    icon: '🚀',
    category: 'contribution',
    requirement: { type: 'implemented', count: 5 },
    points: 1000,
    rarity: 'epic',
  },
  {
    id: 'architect',
    name: 'Arena Architect',
    description: 'Have 10 suggestions implemented',
    icon: '🏗️',
    category: 'contribution',
    requirement: { type: 'implemented', count: 10 },
    points: 2500,
    rarity: 'legendary',
  },

  // Streak Achievements
  {
    id: 'week-streak',
    name: 'Dedicated Observer',
    description: 'Visit 7 days in a row',
    icon: '📅',
    category: 'streak',
    requirement: { type: 'login_streak', count: 7 },
    points: 50,
    rarity: 'uncommon',
  },
  {
    id: 'month-streak',
    name: 'Arena Regular',
    description: 'Visit 30 days in a row',
    icon: '🗓️',
    category: 'streak',
    requirement: { type: 'login_streak', count: 30 },
    points: 200,
    rarity: 'rare',
  },
  {
    id: 'quarter-streak',
    name: 'Arena Veteran',
    description: 'Visit 90 days in a row',
    icon: '🏆',
    category: 'streak',
    requirement: { type: 'login_streak', count: 90 },
    points: 500,
    rarity: 'epic',
  },

  // Special Achievements
  {
    id: 'top-suggester',
    name: 'Community Champion',
    description: 'Be the top suggester of the month',
    icon: '👑',
    category: 'special',
    requirement: { type: 'special', count: 1 },
    points: 500,
    rarity: 'legendary',
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Report a valid bug that gets fixed',
    icon: '🐛',
    category: 'special',
    requirement: { type: 'special', count: 1 },
    points: 300,
    rarity: 'rare',
  },
]

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity)
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  const colors: Record<Achievement['rarity'], string> = {
    common: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    uncommon: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    rare: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    epic: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    legendary: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  }
  return colors[rarity]
}

export function getTotalPoints(): number {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0)
}
