import { useCurrentWallet, useSuiClientContext } from '@mysten/dapp-kit'
import { useState, useCallback } from 'react'

export type SuiChain = 'sui:mainnet' | 'sui:testnet' | 'sui:devnet' | 'sui:localnet'

export function useNetworkSwitching() {
  const { currentWallet } = useCurrentWallet()
  const ctx = useSuiClientContext()
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = currentWallet?.features && 'sui:switchChain' in currentWallet.features

  const switchNetwork = useCallback(async (chain: SuiChain) => {
    if (!currentWallet || !isSupported) {
      setError('Network switching is not supported by this wallet')
      return
    }

    setIsSwitching(true)
    setError(null)

    try {
      const switchChainFeature = currentWallet.features['sui:switchChain'] as any
      await switchChainFeature.switchChain({ chain })
      
      // Also update the dapp-kit context if possible, though usually it reacts to events
      // For now we trust the wallet event listener to propagate or the user to see the change
      // dependent on how dapp-kit is configured.
      // But we can try to switch the client network in dapp-kit too:
      const networkName = chain.split(':')[1]
      if (ctx.networks[networkName]) {
        ctx.selectNetwork(networkName)
      }
      
    } catch (err: any) {
      console.error('Failed to switch network:', err)
      setError(err.message || 'Failed to switch network')
    } finally {
      setIsSwitching(false)
    }
  }, [currentWallet, isSupported, ctx])

  return {
    isSupported,
    switchNetwork,
    isSwitching,
    error,
    currentNetwork: ctx.network
  }
}
