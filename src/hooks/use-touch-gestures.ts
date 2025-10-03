"use client"

import { useEffect, useRef, useCallback } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onPinch?: (scale: number) => void
  minSwipeDistance?: number
  maxSwipeTime?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onPinch,
    minSwipeDistance = 50,
    maxSwipeTime = 300
  } = options

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    const start = touchStartRef.current
    const end = touchEndRef.current

    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const deltaTime = end.time - start.time

    // Check if it's a swipe (not too slow)
    if (deltaTime <= maxSwipeTime) {
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Determine if it's a horizontal or vertical swipe
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (absDeltaX >= minSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (absDeltaY >= minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }
    } else {
      // Check if it's a tap (very small movement)
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (absDeltaX < 10 && absDeltaY < 10) {
        onTap?.()
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, minSwipeDistance, maxSwipeTime])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Handle pinch gestures
    if (e.touches.length === 2 && onPinch && elementRef.current) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      // Store initial distance for pinch calculation
      if (!elementRef.current.dataset.initialDistance) {
        elementRef.current.dataset.initialDistance = currentDistance.toString()
      } else {
        const initialDistance = parseFloat(elementRef.current.dataset.initialDistance)
        const scale = currentDistance / initialDistance
        onPinch(scale)
      }
    }
  }, [onPinch])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove])

  return elementRef
}

// Hook for swipeable chart navigation
export function useSwipeableCharts(chartViews: string[], currentView: string, onViewChange: (view: string) => void) {
  const getNextView = useCallback((direction: 'left' | 'right') => {
    const currentIndex = chartViews.indexOf(currentView)
    if (currentIndex === -1) return currentView

    if (direction === 'left') {
      return chartViews[(currentIndex + 1) % chartViews.length]
    } else {
      return chartViews[(currentIndex - 1 + chartViews.length) % chartViews.length]
    }
  }, [chartViews, currentView])

  const swipeHandlers = {
    onSwipeLeft: () => {
      const nextView = getNextView('left')
      onViewChange(nextView)
    },
    onSwipeRight: () => {
      const nextView = getNextView('right')
      onViewChange(nextView)
    },
  }

  return swipeHandlers
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => void, threshold: number = 80) {
  const elementRef = useRef<HTMLElement>(null)
  const startYRef = useRef<number>(0)
  const isPullingRef = useRef<boolean>(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    isPullingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startYRef.current

    if (deltaY > 0 && window.scrollY === 0) {
      // Only allow pull when at top of page
      isPullingRef.current = true
      e.preventDefault()

      const element = elementRef.current
      if (element) {
        const pullDistance = Math.min(deltaY * 0.5, threshold)
        element.style.transform = `translateY(${pullDistance}px)`
      }
    }
  }, [threshold])

  const handleTouchEnd = useCallback(() => {
    const element = elementRef.current
    if (element && isPullingRef.current) {
      const transform = element.style.transform
      const pullDistance = transform ? parseFloat(transform.match(/translateY\((.*)px\)/)?.[1] || '0') : 0

      if (pullDistance >= threshold) {
        onRefresh()
      }

      // Reset transform
      element.style.transform = ''
    }
    isPullingRef.current = false
  }, [onRefresh, threshold])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return elementRef
}