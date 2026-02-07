'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3,
  FileText,
  Target,
  BookOpen,
  Settings,
  Layers
} from 'lucide-react'

export type CategoryType = 'all' | 'market_data' | 'trading_rules' | 'pressure' | 'learning' | 'system'

interface CategoryFilterProps {
  activeCategory: CategoryType
  onCategoryChange: (category: CategoryType) => void
}

const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Layers className="w-4 h-4" /> },
  { id: 'market_data', label: 'Market Data', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'trading_rules', label: 'Trading Rules', icon: <FileText className="w-4 h-4" /> },
  { id: 'pressure', label: 'Pressure', icon: <Target className="w-4 h-4" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'system', label: 'System', icon: <Settings className="w-4 h-4" /> },
]

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeCategory === category.id
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          )}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  )
}
