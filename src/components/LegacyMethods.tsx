import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'
import { AutoDismissError } from './AutoDismissError'

interface ExecResult {
  digest?: string
  bytes?: string
  signature?: string
}

export function LegacyMethods() {
  const currentAccount = useCurrentAccount()
  const { currentWallet } = useCurrentWallet()
  
  const [result, setResult] = useState<ExecResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [activeMethod, setActiveMethod] = useState<string | null>(null)

  // Explicitly check for legacy features
  const hasLegacySign = currentWallet?.features && 'sui:signTransactionBlock' in currentWallet.features
  const hasLegacyExecute = currentWallet?.features && 'sui:signAndExecuteTransactionBlock' in currentWallet.features

  const buildTransactionBlock = async () => {
    // Build a simple SUI transfer transaction
    const tx = new Transaction()
    tx.setSender(currentAccount!.address)
    
    // Split some SUI from gas
    const [coin] = tx.splitCoins(tx.gas, [100])

    // Transfer to self 
    tx.transferObjects([coin], currentAccount!.address)
    
    // Return transaction object directly for legacy input (SDK should now build it)
    return tx
  }

  const handleLegacySignTransactionBlock = async () => {
    setError(null)
    setResult(null)
    setIsPending(true)
    setActiveMethod('signTransactionBlock')

    if (!currentAccount || !hasLegacySign) {
      setError('Feature not supported or no account')
      setIsPending(false)
      return
    }

    try {
      const tx = await buildTransactionBlock()
      
      const feature = currentWallet.features['sui:signTransactionBlock'] as any
      const response = await feature.signTransactionBlock({
        transactionBlock: tx, // Pass Transaction object directly
        account: currentAccount,
        chain: 'sui:testnet'
      })

      console.log('Legacy Sign Response:', response)
      setResult({
        bytes: response.bytes,
        signature: response.signature
      })
    } catch (err: any) {
      console.error('Legacy Sign Error:', err)
      setError(err instanceof Error ? err.message : 'Legacy sign failed')
    } finally {
      setIsPending(false)
      setActiveMethod(null)
    }
  }

  const handleLegacySignAndExecuteTransactionBlock = async () => {
    setError(null)
    setResult(null)
    setIsPending(true)
    setActiveMethod('signAndExecuteTransactionBlock')

    if (!currentAccount || !hasLegacyExecute) {
      setError('Feature not supported or no account')
      setIsPending(false)
      return
    }

    try {
        const tx = await buildTransactionBlock()
      
        const feature = currentWallet.features['sui:signAndExecuteTransactionBlock'] as any
        const response = await feature.signAndExecuteTransactionBlock({
            transactionBlock: tx, // Pass Transaction object directly
            account: currentAccount,
            chain: 'sui:testnet',
            options: {
                showEffects: true
            }
        })

        console.log('Legacy Execute Response:', response)
        setResult({
            digest: response.digest
        })

    } catch (err: any) {
      console.error('Legacy Execute Error:', err)
      setError(err instanceof Error ? err.message : 'Legacy execute failed')
    } finally {
      setIsPending(false)
      setActiveMethod(null)
    }
  }

  const handleClear = () => {
    setResult(null)
    setError(null)
  }

  if (!currentAccount) {
     return <div className="text-gray-500 italic">Connect wallet to test legacy methods</div>
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legacy Sign */}
        <div>
           <div className="mb-2 flex justify-between">
              <span className="text-gray-300 text-sm font-semibold">sui:signTransactionBlock</span>
              {hasLegacySign ? 
                <span className="text-green-400 text-xs bg-green-900/30 px-2 rounded">✓</span> : 
                <span className="text-red-400 text-xs bg-red-900/30 px-2 rounded">✗</span>
              }
           </div>
           <button 
              onClick={handleLegacySignTransactionBlock} 
              disabled={!hasLegacySign || isPending}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50
                         text-white text-sm font-medium rounded-lg transition-colors"
           >
             {isPending && activeMethod === 'signTransactionBlock' ? 'Signing...' : 'Test Legacy Sign'}
           </button>
        </div>

        {/* Legacy Sign & Execute */}
        <div>
           <div className="mb-2 flex justify-between">
              <span className="text-gray-300 text-sm font-semibold">sui:signAndExecuteTransactionBlock</span>
              {hasLegacyExecute ? 
                <span className="text-green-400 text-xs bg-green-900/30 px-2 rounded">✓</span> : 
                <span className="text-red-400 text-xs bg-red-900/30 px-2 rounded">✗</span>
              }
           </div>
           <button 
              onClick={handleLegacySignAndExecuteTransactionBlock} 
              disabled={!hasLegacyExecute || isPending}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50
                         text-white text-sm font-medium rounded-lg transition-colors"
           >
             {isPending && activeMethod === 'signAndExecuteTransactionBlock' ? 'Executing...' : 'Test Legacy Execute'}
           </button>
        </div>
      </div>

      <AutoDismissError error={error} onDismiss={() => setError(null)} />

      {result && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl space-y-3">
          <h3 className="text-green-400 font-semibold mb-2">✓ Legacy Method Success</h3>
          
          {result.digest && (
             <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Digest</span>
                <code className="block text-xs text-white bg-black/30 p-2 rounded break-all">{result.digest}</code>
                <a 
                  href={`https://suiscan.xyz/tx/${result.digest}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sui-blue hover:underline text-xs"
                >
                  View on Explorer
                </a>
             </div>
          )}

          {result.signature && (
             <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Signature</span>
                <code className="block text-xs text-white bg-black/30 p-2 rounded break-all">{result.signature}</code>
             </div>
          )}

          <button onClick={handleClear} className="w-full py-2 mt-2 text-xs text-gray-400 hover:text-white">
            Clear Result
          </button>
        </div>
      )}
    </div>
  )
}
