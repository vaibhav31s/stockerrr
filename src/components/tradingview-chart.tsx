'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  originalSymbol?: string  // Original Yahoo Finance symbol (e.g., SBIN.NS)
  theme?: 'light' | 'dark'
  height?: number
}

export function TradingViewChart({ symbol, originalSymbol, theme = 'dark', height = 500 }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    if (!container.current) return

    // Clear previous widget
    container.current.innerHTML = ''
    widgetRef.current = null

    // Generate unique container ID based on symbol and timestamp
    const containerId = `tradingview-widget-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`
    
    // Create container div
    const widgetContainer = document.createElement('div')
    widgetContainer.id = containerId
    widgetContainer.className = 'w-full h-full'
    container.current.appendChild(widgetContainer)

    // Create script element
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        try {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: 'D',
            timezone: 'Asia/Kolkata',
            theme: theme,
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: containerId,
            studies: [
              'MASimple@tv-basicstudies',
              'RSI@tv-basicstudies',
              'MACD@tv-basicstudies'
            ],
            hide_side_toolbar: false,
            save_image: true,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            support_host: 'https://www.tradingview.com'
          })
        } catch (error) {
          console.error('TradingView widget error:', error)
        }
      }
    }

    container.current.appendChild(script)

    // Cleanup
    return () => {
      try {
        if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
          widgetRef.current.remove()
        }
      } catch (error) {
        // Silently handle cleanup errors
        console.log('TradingView widget cleanup:', error)
      }
      
      if (container.current) {
        container.current.innerHTML = ''
      }
      widgetRef.current = null
    }
  }, [symbol, theme])

  return (
    <div className="tradingview-widget-container w-full" style={{ height: `${height}px` }}>
      <div ref={container} className="w-full h-full" />
    </div>
  )
}

// Declare TradingView on window object for TypeScript
declare global {
  interface Window {
    TradingView: any
  }
}
