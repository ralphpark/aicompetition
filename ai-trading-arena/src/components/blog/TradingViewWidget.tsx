'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  interval?: string
  theme?: 'light' | 'dark'
  style?: string
  locale?: string
  height?: number
  className?: string
}

export function TradingViewWidget({
  symbol = 'BINANCE:BTCUSDT',
  interval = '240',
  theme = 'dark',
  style = '1',
  locale = 'en',
  height = 400,
  className = '',
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Build the embed URL
    const params = new URLSearchParams({
      symbol,
      interval,
      theme,
      style,
      locale,
      toolbar_bg: theme === 'dark' ? '#1f2937' : '#f9fafb',
      enable_publishing: 'false',
      hide_top_toolbar: 'false',
      hide_legend: 'false',
      save_image: 'false',
      container_id: 'tradingview_widget',
    })

    const embedUrl = `https://s.tradingview.com/widgetembed/?${params.toString()}`

    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.src = embedUrl
    iframe.style.width = '100%'
    iframe.style.height = `${height}px`
    iframe.style.border = 'none'
    iframe.style.borderRadius = '8px'
    iframe.allowFullscreen = true
    iframe.loading = 'lazy'

    // Clear and append
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframe)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, interval, theme, style, locale, height])

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: height }}
    >
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    </div>
  )
}

// Preset configurations for common use cases
export const CHART_PRESETS = {
  btcUsdt4h: {
    symbol: 'BINANCE:BTCUSDT',
    interval: '240',
  },
  btcUsdt1d: {
    symbol: 'BINANCE:BTCUSDT',
    interval: 'D',
  },
  btcUsdt1w: {
    symbol: 'BINANCE:BTCUSDT',
    interval: 'W',
  },
  ethUsdt4h: {
    symbol: 'BINANCE:ETHUSDT',
    interval: '240',
  },
} as const
