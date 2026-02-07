// Gamification components barrel export

// Achievement system
export {
  AchievementBadge,
  AchievementUnlock,
  AchievementGrid,
} from './AchievementBadge'

// User level & XP
export {
  UserLevelBadge,
  UserLevelCard,
  XPGainNotification,
  LevelUpCelebration,
  LEVELS,
  XP_ACTIONS,
  getLevelForXP,
  getNextLevel,
  getXPProgress,
} from './UserLevel'

// Prediction system
export {
  PredictionCard,
  PredictionLeaderboard,
  MiniPredictionWidget,
} from './PredictionSystem'

// Streaks & Challenges
export {
  StreakDisplay,
  CheckInButton,
  WeeklyCalendar,
  DailyMissions,
} from './Streaks'

// Virtual currency
export {
  CoinBalance,
  CoinEarnedAnimation,
  ShopItemCard,
  Shop,
  DailyRewardChest,
} from './VirtualCurrency'
export type { ShopItem } from './VirtualCurrency'

// Weather widget
export { WeatherWidget } from './WeatherWidget'

// Visual effects
export {
  Confetti,
  Fireworks,
  FloatingEmojis,
  PulseRing,
  ScreenFlash,
  WinIndicator,
  useCelebration,
  useSparkleCursor,
} from './VisualEffects'

// Notifications
export {
  NotificationToast,
  NotificationContainer,
  NotificationBell,
  NotificationCenter,
  BreakingNewsBanner,
  useNotifications,
} from './Notifications'
export type { Notification, NotificationType } from './Notifications'

// Racing components
export { RacerCharacter, SpeechBubble } from '../racing/RacerCharacter'
export { LiveCommentary, generateCommentary } from '../racing/LiveCommentary'
export { CheckeredFlag, MiniChampionBadge } from '../racing/CheckeredFlag'
