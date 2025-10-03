"use client"

import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWatchlist } from '@/contexts/watchlist-context'
import { cn } from '@/lib/utils'

interface WatchlistButtonProps {
  symbol: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export function WatchlistButton({ 
  symbol, 
  variant = 'outline', 
  size = 'default',
  showText = true 
}: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, loading } = useWatchlist()
  const inWatchlist = isInWatchlist(symbol)

  const handleClick = async () => {
    if (inWatchlist) {
      console.log(`Removing ${symbol} from watchlist`)
      await removeFromWatchlist(symbol)
    } else {
      console.log(`Adding ${symbol} to watchlist`)
      await addToWatchlist(symbol)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "gap-2",
        inWatchlist && "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
      )}
    >
      <Star 
        className={cn(
          "h-4 w-4",
          inWatchlist && "fill-yellow-600"
        )}
      />
      {showText && (inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist')}
    </Button>
  )
}
