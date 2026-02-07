'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X, Bell, TrendingUp, TrendingDown, Trophy, Zap, Gift, Users } from 'lucide-react'

// Notification types
export type NotificationType =
  | 'trade'
  | 'overtake'
  | 'milestone'
  | 'achievement'
  | 'xp'
  | 'coins'
  | 'prediction'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  timestamp: Date
  isRead?: boolean
  action?: {
    label: string
    href: string
  }
}

// Single notification toast
interface NotificationToastProps {
  notification: Notification
  onDismiss: (id: string) => void
  autoDismiss?: boolean
  duration?: number
}

export function NotificationToast({
  notification,
  onDismiss,
  autoDismiss = true,
  duration = 5000,
}: NotificationToastProps) {
  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => onDismiss(notification.id), duration)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, duration, notification.id, onDismiss])

  const typeStyles: Record<NotificationType, { bg: string; icon: React.ReactNode }> = {
    trade: {
      bg: 'bg-blue-500',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    overtake: {
      bg: 'bg-green-500',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    milestone: {
      bg: 'bg-purple-500',
      icon: <Trophy className="w-5 h-5" />,
    },
    achievement: {
      bg: 'bg-yellow-500',
      icon: <Trophy className="w-5 h-5" />,
    },
    xp: {
      bg: 'bg-indigo-500',
      icon: <Zap className="w-5 h-5" />,
    },
    coins: {
      bg: 'bg-orange-500',
      icon: <span className="text-lg">🪙</span>,
    },
    prediction: {
      bg: 'bg-pink-500',
      icon: <span className="text-lg">🎯</span>,
    },
    system: {
      bg: 'bg-gray-500',
      icon: <Bell className="w-5 h-5" />,
    },
  }

  const style = typeStyles[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex">
        {/* Icon */}
        <div className={cn("p-4 flex items-center justify-center text-white", style.bg)}>
          {notification.icon ? (
            <span className="text-2xl">{notification.icon}</span>
          ) : (
            style.icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-sm">{notification.title}</h4>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          {notification.action && (
            <a
              href={notification.action.href}
              className="text-sm text-blue-500 hover:underline mt-2 inline-block"
            >
              {notification.action.label} →
            </a>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {autoDismiss && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={cn("h-1", style.bg)}
        />
      )}
    </motion.div>
  )
}

// Notification container
interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function NotificationContainer({
  notifications,
  onDismiss,
  position = 'top-right',
}: NotificationContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div className={cn("fixed z-50 space-y-2", positionClasses[position])}>
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Notification hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    NotificationComponent: () => (
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    ),
  }
}

// Notification bell with badge
interface NotificationBellProps {
  unreadCount: number
  onClick: () => void
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  )
}

// Notification center panel
interface NotificationCenterProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onMarkAllRead: () => void
  onClose: () => void
  isOpen: boolean
}

export function NotificationCenter({
  notifications,
  onDismiss,
  onMarkAllRead,
  onClose,
  isOpen,
}: NotificationCenterProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <h2 className="font-bold text-lg">Notifications</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onMarkAllRead}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl">
                          {notification.icon || '🔔'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-gray-500 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onDismiss(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Breaking news banner
interface BreakingNewsBannerProps {
  message: string
  type?: 'info' | 'success' | 'warning'
  onDismiss?: () => void
}

export function BreakingNewsBanner({ message, type = 'info', onDismiss }: BreakingNewsBannerProps) {
  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 text-white py-2 px-4",
        typeStyles[type]
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Breaking
          </span>
          <span className="text-sm">{message}</span>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="hover:bg-white/20 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
