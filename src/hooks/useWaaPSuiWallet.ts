import { getWaaPSuiWallet } from '../providers/Providers'

/**
 * Hook to access the WaaP Sui wallet instance with additional methods.
 * 
 * This hook provides access to WaaP-specific methods like requestEmail
 * that are not part of the standard Sui Wallet interface.
 */
export function useWaaPSuiWallet() {
  const waapWallet = getWaaPSuiWallet()
  
  return {
    /**
     * Request the user's email address.
     * Opens a consent UI for the user to approve sharing their email.
     */
    requestEmail: async (): Promise<string> => {
      const wallet = getWaaPSuiWallet()
      if (!wallet) {
        throw new Error('WaaP wallet not initialized')
      }
      
      return wallet.requestEmail()
    },
    
    /** Whether the WaaP wallet is available */
    isAvailable: !!waapWallet
  }
}
