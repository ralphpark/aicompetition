import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LeaderboardEntry, AIDecision } from '@/types/database'

interface User {
  id: string
  email?: string
  name?: string
  avatar_url?: string
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean

  // Leaderboard state
  leaderboard: LeaderboardEntry[]
  isLeaderboardLoading: boolean
  lastLeaderboardUpdate: string | null

  // Decisions state
  recentDecisions: AIDecision[]
  isDecisionsLoading: boolean
  selectedModelId: string | null

  // UI state
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notificationsEnabled: boolean

  // Filters
  filters: {
    modelProvider: string | null
    action: string | null
    timeRange: '1h' | '24h' | '7d' | '30d' | 'all'
  }

  // Actions - User
  setUser: (user: User | null) => void
  logout: () => void

  // Actions - Leaderboard
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
  setLeaderboardLoading: (loading: boolean) => void

  // Actions - Decisions
  setRecentDecisions: (decisions: AIDecision[]) => void
  addDecision: (decision: AIDecision) => void
  setDecisionsLoading: (loading: boolean) => void
  setSelectedModelId: (modelId: string | null) => void

  // Actions - UI
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setNotificationsEnabled: (enabled: boolean) => void

  // Actions - Filters
  setFilter: <K extends keyof AppState['filters']>(
    key: K,
    value: AppState['filters'][K]
  ) => void
  resetFilters: () => void
}

const initialFilters = {
  modelProvider: null,
  action: null,
  timeRange: '24h' as const,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      leaderboard: [],
      isLeaderboardLoading: true,
      lastLeaderboardUpdate: null,

      recentDecisions: [],
      isDecisionsLoading: true,
      selectedModelId: null,

      theme: 'system',
      sidebarOpen: true,
      notificationsEnabled: true,

      filters: initialFilters,

      // User actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false
      }),

      // Leaderboard actions
      setLeaderboard: (leaderboard) => set({
        leaderboard,
        lastLeaderboardUpdate: new Date().toISOString(),
      }),

      setLeaderboardLoading: (isLeaderboardLoading) => set({ isLeaderboardLoading }),

      // Decisions actions
      setRecentDecisions: (recentDecisions) => set({ recentDecisions }),

      addDecision: (decision) => set((state) => ({
        recentDecisions: [decision, ...state.recentDecisions].slice(0, 100),
      })),

      setDecisionsLoading: (isDecisionsLoading) => set({ isDecisionsLoading }),

      setSelectedModelId: (selectedModelId) => set({ selectedModelId }),

      // UI actions
      setTheme: (theme) => set({ theme }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      // Filter actions
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),

      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'pnl-grand-prix-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        notificationsEnabled: state.notificationsEnabled,
        filters: state.filters,
      }),
    }
  )
)

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useLeaderboard = () => useAppStore((state) => state.leaderboard)
export const useRecentDecisions = () => useAppStore((state) => state.recentDecisions)
export const useTheme = () => useAppStore((state) => state.theme)
export const useFilters = () => useAppStore((state) => state.filters)
