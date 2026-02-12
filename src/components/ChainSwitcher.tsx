import { useNetworkSwitching, SuiChain } from '../hooks/useNetworkSwitching'

const CHAINS: { id: SuiChain; label: string }[] = [
  { id: 'sui:mainnet', label: 'Mainnet' },
  { id: 'sui:testnet', label: 'Testnet' },
  { id: 'sui:devnet', label: 'Devnet' },
]

export function ChainSwitcher() {
  const { isSupported, switchNetwork, isSwitching, error, currentNetwork } = useNetworkSwitching()

  if (!isSupported) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <span className="text-gray-400">Current Network</span>
        <span className="text-blue-400 font-medium capitalize">{currentNetwork}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CHAINS.map((chain) => {
            const networkName = chain.id.split(':')[1]
            const isActive = currentNetwork === networkName
            
            return (
            <button
                key={chain.id}
                onClick={() => switchNetwork(chain.id)}
                disabled={isActive || isSwitching}
                className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                    ? 'bg-sui-blue text-white cursor-default' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }
                ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {chain.label}
            </button>
            )
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
