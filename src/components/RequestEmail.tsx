import { useCurrentAccount } from '@mysten/dapp-kit'
import { useState } from 'react'
import { useWaaPSuiWallet } from '../hooks/useWaaPSuiWallet'
import { AutoDismissError } from './AutoDismissError'

export function RequestEmail() {
  const currentAccount = useCurrentAccount()
  const { requestEmail, isAvailable } = useWaaPSuiWallet()
  
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleRequestEmail = async () => {
    setError(null)
    setEmail(null)
    setIsPending(true)

    try {
      const result = await requestEmail()
      setEmail(result)
    } catch (err) {
      console.error('Request email error:', err)
      setError(err instanceof Error ? err.message : 'Failed to request email')
    } finally {
      setIsPending(false)
    }
  }

  const handleClear = () => {
    setEmail(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Request the user's email address. This requires user consent.
      </p>

      <button
        onClick={handleRequestEmail}
        disabled={!currentAccount || !isAvailable || isPending}
        className="w-full px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                   disabled:cursor-not-allowed text-white font-medium rounded-xl 
                   transition-colors duration-200"
      >
        {isPending ? 'Requesting...' : 'Request Email'}
      </button>

      <AutoDismissError error={error} onDismiss={() => setError(null)} />

      {email && (
        <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-xl space-y-3">
          <h3 className="text-green-400 font-semibold">✓ Email Retrieved!</h3>
          
          <div>
            <strong className="text-gray-300">Email:</strong>
            <code className="block mt-1 text-sm text-gray-200 bg-black/30 p-2 rounded">
              {email}
            </code>
          </div>
          
          <button 
            onClick={handleClear} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
