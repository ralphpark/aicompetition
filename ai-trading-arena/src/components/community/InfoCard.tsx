'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InfoItem {
  icon?: string
  label: string
  description?: string
  highlight?: boolean
}

interface InfoCardProps {
  icon: ReactNode
  title: string
  items: InfoItem[]
  expandedItems?: InfoItem[]
  footer?: ReactNode
  category: string
  className?: string
}

export function InfoCard({ icon, title, items, expandedItems, footer, category, className }: InfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasMore = expandedItems && expandedItems.length > 0

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden",
        className
      )}
      data-category={category}
    >
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          {icon}
          {title}
        </h3>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 text-sm",
                item.highlight && "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 -mx-2"
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <div className="flex-1">
                <span className={cn(
                  "font-medium text-gray-900 dark:text-white",
                  item.highlight && "text-blue-600 dark:text-blue-400"
                )}>
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {': '}{item.description}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isExpanded && expandedItems?.map((item, index) => (
            <div
              key={`expanded-${index}`}
              className="flex items-start gap-2 text-sm"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                {item.description && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {': '}{item.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                +{expandedItems.length} more indicators
              </>
            )}
          </button>
        )}

        {footer && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
