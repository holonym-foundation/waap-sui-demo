import { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { registerWallet } from '@mysten/wallet-standard'
import { initWaaPSui } from '@human.tech/waap-sdk'
import type { WaaPSuiWalletInterface } from '@human.tech/waap-sdk'

// Import dapp-kit styles
import '@mysten/dapp-kit/dist/index.css'

// Create network config for Sui
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
})

// Create a query client
const queryClient = new QueryClient()

// Module-level singleton for the WaaP wallet instance
let walletInstance: WaaPSuiWalletInterface | null = null

/**
 * Get the WaaP Sui wallet instance directly.
 * This provides access to WaaP-specific methods like requestEmail.
 * 
 * @returns The WaaP Sui wallet instance, or null if not yet initialized
 */
export function getWaaPSuiWallet(): WaaPSuiWalletInterface | null {
  return walletInstance
}

interface ProvidersProps {
  children: ReactNode
}

// Check if iframe exists and has valid contentWindow
const isIframeValid = () => {
  const iframe = document.getElementById('waap-wallet-iframe') as HTMLIFrameElement | null
  return iframe && iframe.contentWindow
}

export function Providers({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // If wallet already initialized and iframe is valid, we're ready
    if (walletInstance && isIframeValid()) {
      setIsReady(true)
      return
    }

    try {
      // Clean up any stale iframe from previous HMR cycles
      const existingContainer = document.getElementById('waap-wallet-iframe-container')
      if (existingContainer) {
        existingContainer.remove()
        walletInstance = null
      }
      
      const wallet = initWaaPSui({
        useStaging: false,
        config: {
          allowedSocials: ['google', 'twitter'],
          authenticationMethods: ['email', 'social'],
          styles: { darkMode: false },
        },
        referralCode: 'waap-sui-demo',
      })
      
      walletInstance = wallet
      
      // Register with the Wallet Standard registry
      registerWallet(wallet as any)
    } catch (error) {
      console.error('[WaaP] Failed to initialize wallet:', error)
    }

    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sui-darker">
        <div className="text-gray-400">Initializing wallet...</div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider 
          autoConnect={true}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
