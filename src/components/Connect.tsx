import { useCurrentAccount, useDisconnectWallet, useConnectWallet, useWallets, ConnectButton } from '@mysten/dapp-kit'
import { useState } from 'react'
import { AutoDismissError } from './AutoDismissError'

export function Connect() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectWallet()
  const { mutate: connect, isPending: isConnecting } = useConnectWallet()
  const wallets = useWallets()
  const [error, setError] = useState<string | null>(null)


  // Find WaaP wallet
  const waapWallet = wallets.find((w) => w.name === 'WaaP')

  const handleConnect = () => {
    setError(null)
    
    if (!waapWallet) {
      setError('WaaP wallet not found. Please wait for initialization.')
      return
    }

    connect(
      { wallet: waapWallet },
      {
        onSuccess: () => {
          console.log('Connected successfully')
          setError(null)
        },
        onError: (err) => {
          console.error('Connect error:', err)
          setError(err.message || 'Failed to connect')
        },
      }
    )
  }

  const handleDisconnect = () => {
    setError(null)
    disconnect(undefined, {
      onSuccess: () => {
        console.log('Disconnected successfully')
      },
      onError: (err) => {
        console.error('Disconnect error:', err)
        setError(err.message || 'Failed to disconnect')
      },
    })
  }

  if (currentAccount) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-medium">Connected</span>
        </div>
        
        <div className="flex gap-3">
          <ConnectButton />
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 
                      disabled:cursor-not-allowed text-white font-medium rounded-xl 
                      transition-colors duration-200"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>

        <AutoDismissError error={error} onDismiss={() => setError(null)} variant="simple" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-gray-500 rounded-full" />
        <span className="text-gray-400 font-medium">Not Connected</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-400">
          Available wallets: {wallets.length > 0 ? wallets.map((w) => w.name).join(', ') : 'Loading...'}
        </p>
      </div>

      <div className="flex gap-3">
        <ConnectButton />
        
        <button
          onClick={handleConnect}
          disabled={isConnecting || !waapWallet}
          className="flex-1 px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isConnecting ? 'Connecting...' : !waapWallet ? 'Initializing...' : 'Connect with WaaP'}
        </button>
      </div>

      <AutoDismissError error={error} onDismiss={() => setError(null)} variant="simple" />
    </div>
  )
}
