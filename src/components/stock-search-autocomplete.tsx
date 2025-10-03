"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Stock {
  symbol: string
  name: string
  exchange: string
}

interface StockSearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (symbol: string) => void
  placeholder?: string
}

export function StockSearchAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search stocks by name or symbol..."
}: StockSearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Stock[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions when value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 1) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`)
        const data = await response.json()
        setSuggestions(data.results || [])
        setIsOpen(data.results?.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (stock: Stock) => {
    onChange(stock.symbol)
    onSelect(stock.symbol)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
              {suggestions.length} stock{suggestions.length !== 1 ? 's' : ''} found
            </p>
            {suggestions.map((stock, index) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-md transition-colors",
                  "hover:bg-blue-50 dark:hover:bg-gray-800",
                  "focus:outline-none focus:bg-blue-50 dark:focus:bg-gray-800",
                  selectedIndex === index && "bg-blue-50 dark:bg-gray-800"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{stock.symbol}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stock.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {stock.name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && value.length > 0 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            No stocks found for &quot;{value}&quot;
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            Try searching with NSE symbols like RELIANCE, TCS, or HDFCBANK
          </p>
        </div>
      )}
    </div>
  )
}
