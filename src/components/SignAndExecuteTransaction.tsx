import { useCurrentAccount, useCurrentWallet, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'
import { AutoDismissError } from './AutoDismissError'

interface ExecResult {
  digest: string
  effects?: any
}

export function SignAndExecuteTransaction() {
  const currentAccount = useCurrentAccount()
  const { currentWallet } = useCurrentWallet()
  const suiClient = useSuiClient()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  
  const [result, setResult] = useState<ExecResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSignAndExecute = async () => {
    setError(null)
    setResult(null)
    setIsPending(true)

    if (!currentAccount) {
      setError('No account connected')
      setIsPending(false)
      return
    }

    try {
      // Build a simple SUI transfer transaction
      const tx = new Transaction()
      tx.setSender(currentAccount.address)
      
      // Split some SUI from gas
      const [coin] = tx.splitCoins(tx.gas, [1000])

      // Transfer to self (for demo purposes)
      tx.transferObjects([coin], currentAccount.address)
      
      // Build the transaction manually to get bytes, as Waap SDK requires bytes
      const builtTx = await tx.build({ client: suiClient })

      // Create a wrapper object that satisfies the wallet standard interface
      // but delivers our pre-built bytes directly as base64
      const txWrapper = {
        toJSON: async () => {
          return btoa(String.fromCharCode(...builtTx))
        }
      }

      const response = await signAndExecuteTransaction({
        transaction: txWrapper as any,
        chain: 'sui:testnet',
      })
      
      console.log('Execution response:', response)

      setResult({
        digest: response.digest,
        effects: response.effects
      })
      
    } catch (err: any) {
      console.error('Sign & Execute error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign and execute transaction')
    } finally {
      setIsPending(false)
    }
  }

  const handleSignAndExecuteDirectly = async () => {
    setError(null)
    setResult(null)
    setIsPending(true)

    if (!currentAccount || !currentWallet) {
      setError('No account or wallet connected')
      setIsPending(false)
      return
    }

    try {
      // Build a simple SUI transfer transaction
      const tx = new Transaction()
      tx.setSender(currentAccount.address)
      const [coin] = tx.splitCoins(tx.gas, [1000])
      tx.transferObjects([coin], currentAccount.address)
      
      const builtTx = await tx.build({ client: suiClient })

      // Call the feature directly on the wallet object to ensure the full delegation flow
      const feature = currentWallet.features['sui:signAndExecuteTransaction'] as any
      if (!feature) {
        throw new Error('Wallet does not support sui:signAndExecuteTransaction feature')
      }

      const response = await feature.signAndExecuteTransaction({
        transaction: builtTx,
        account: currentAccount,
        chain: 'sui:testnet',
      })
      
      console.log('Direct execution response:', response)

      setResult({
        digest: response.digest,
        effects: response.effects
      })
      
    } catch (err: any) {
      console.error('Direct Sign & Execute error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign and execute transaction directly')
    } finally {
      setIsPending(false)
    }
  }

  const handleClear = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="card">
      <div className="text-xs mb-2">Need to have Sui in the account. For testnet and devnet, get Sui from <a href="https://faucet.sui.io/" target="_blank">faucet</a>.</div>     
      <div className="button-group flex flex-col gap-2">
        <button 
          onClick={handleSignAndExecute} 
          disabled={!currentAccount || isPending}
          className="w-full px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isPending ? 'Processing...' : 'Sign & Execute (via dapp-kit hook)'}
        </button>
        <button 
          onClick={handleSignAndExecuteDirectly} 
          disabled={!currentAccount || !currentWallet || isPending}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isPending ? 'Processing...' : 'Sign & Execute (Direct Feature Call)'}
        </button>
      </div>

      <AutoDismissError error={error} onDismiss={() => setError(null)} className="mt-4" />

      {result && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl space-y-3">
          <h3 className="text-green-400 font-semibold">✓ Transaction Executed!</h3>
          
          <div>
            <strong className="text-gray-300">Digest:</strong>
            <code className="block mt-1 text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
              {result.digest}
            </code>
          </div>
          
          <div className="flex gap-2">
            <a 
              href={`https://suiscan.xyz/testnet/tx/${result.digest}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm inline-block"
            >
              View Explorer
            </a>
            <button 
              onClick={handleClear} 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
