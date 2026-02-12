import { useEffect } from 'react'

interface AutoDismissErrorProps {
  error: string | null
  onDismiss: () => void
  dismissDelay?: number
  variant?: 'simple' | 'box'
  className?: string
}

export function AutoDismissError({
  error,
  onDismiss,
  dismissDelay = 5000,
  variant = 'box',
  className = ''
}: AutoDismissErrorProps) {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => onDismiss(), dismissDelay)
      return () => clearTimeout(timer)
    }
  }, [error, onDismiss, dismissDelay])

  if (!error) return null

  if (variant === 'simple') {
    return (
      <p className={`text-red-400 text-sm ${className}`}>{error}</p>
    )
  }

  return (
    <div className={`p-2 bg-red-900/30 border border-red-700 rounded-lg ${className}`}>
      <strong className="text-sm text-red-400">Error:</strong>
      <span className="text-sm text-red-300 ml-2">{error}</span>
    </div>
  )
}
