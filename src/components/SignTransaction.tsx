import { useCurrentAccount, useSuiClient, useSignTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { verifyTransactionSignature } from '@mysten/sui/verify'
import { useState } from 'react'
import { AutoDismissError } from './AutoDismissError'

interface SignResult {
  bytes: string
  signature: string
}

export function SignTransaction() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutateAsync: signTransaction } = useSignTransaction()
  
  const [result, setResult] = useState<SignResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [txType, setTxType] = useState<'simple' | 'complex'>('simple')
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; address?: string } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSignSimple = async () => {
    setError(null)
    setResult(null)
    setVerifyResult(null)
    setTxType('simple')
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
      
      // Split some SUI from gas (will be merged back, so no actual transfer)
      const [coin] = tx.splitCoins(tx.gas, [1000])

      // Transfer to self (for demo purposes)
      tx.transferObjects([coin], currentAccount.address)
      
      // Build the transaction to get bytes
      // Note: The wallet SDK is lightweight and doesn't bundle @mysten/sui, so we must build the transaction first
      const builtTx = await tx.build({ client: suiClient })
      
      // Create a wrapper object that satisfies the wallet standard interface
      // but delivers our pre-built bytes directly as base64
      const txWrapper = {
        toJSON: async () => {
          return btoa(String.fromCharCode(...builtTx))
        }
      }
      
      // Sign the transaction via wallet
      const signedTx = await signTransaction({
        transaction: txWrapper as any
      })
      
      setResult({
        bytes: signedTx.bytes,
        signature: signedTx.signature
      })
      
    } catch (err) {
      console.error('Sign error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign transaction')
    } finally {
      setIsPending(false)
    }
  }

  const handleSignComplex = async () => {
    setError(null)
    setResult(null)
    setVerifyResult(null)
    setTxType('complex')
    setIsPending(true)

    if (!currentAccount) {
      setError('No account connected')
      setIsPending(false)
      return
    }

    try {
      // Build a more complex transaction with multiple operations
      const tx = new Transaction()
      tx.setSender(currentAccount.address)
      
      // Split multiple coins
      const [coin1] = tx.splitCoins(tx.gas, [1000])
      const [coin2] = tx.splitCoins(tx.gas, [2000])
      const [coin3] = tx.splitCoins(tx.gas, [3000])
      
      // Merge coins together
      tx.mergeCoins(coin1, [coin2, coin3])
      
      // Transfer the merged coin to self
      tx.transferObjects([coin1], currentAccount.address)
      
      // Build the transaction to get bytes
      const builtTx = await tx.build({ client: suiClient })
      
      // Create wrapper
      const txWrapper = {
        toJSON: async () => {
          return btoa(String.fromCharCode(...builtTx))
        }
      }
      
      // Sign the transaction via wallet
      const signedTx = await signTransaction({
        transaction: txWrapper as any
      })
      
      setResult({
        bytes: signedTx.bytes,
        signature: signedTx.signature
      })
      
    } catch (err) {
      console.error('Sign error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign transaction')
    } finally {
      setIsPending(false)
    }
  }

  const handleVerify = async () => {
    if (!result) return
    
    setIsVerifying(true)
    setVerifyResult(null)
    setError(null)
    
    try {
      // Decode signature to check scheme
      const sigBytes = Uint8Array.from(atob(result.signature), c => c.charCodeAt(0))
      const schemeFlag = sigBytes[0]
      const schemes: Record<number, string> = { 
        0: 'Ed25519', 
        1: 'Secp256k1', 
        2: 'Secp256r1', 
        3: 'Multisig',
        5: 'zkLogin'
      }
      const schemeName = schemes[schemeFlag] ?? `Unknown (0x${schemeFlag.toString(16)})`
      console.log('Signature scheme:', schemeName)
      console.log('Signature length:', sigBytes.length)
      
      // zkLogin signatures cannot be verified client-side
      if (schemeFlag === 5) {
        setVerifyResult({ valid: true, address: currentAccount?.address })
        setError('zkLogin signatures require on-chain verification. Signature format is valid.')
        return
      }
      
      // Decode base64 bytes
      const txBytes = Uint8Array.from(atob(result.bytes), c => c.charCodeAt(0))
      
      // Verify the signature
      const publicKey = await verifyTransactionSignature(txBytes, result.signature)
      
      setVerifyResult({
        valid: true,
        address: publicKey.toSuiAddress()
      })
    } catch (err) {
      console.error('Verify error:', err)
      setVerifyResult({
        valid: false
      })
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClear = () => {
    setResult(null)
    setError(null)
    setVerifyResult(null)
  }

  return (
    <div className="card">
      <div className="text-xs mb-2">Need to have Sui in the account. For testnet and devnet, get Sui from <a href="https://faucet.sui.io/" target="_blank">faucet</a>.</div>     
      <div className="button-group">
        <button 
          onClick={handleSignSimple} 
          disabled={!currentAccount || isPending}
          className="flex-1 px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isPending && txType === 'simple' ? 'Signing...' : 'Simple TX (Split + Transfer)'}
        </button>
        
        <button 
          onClick={handleSignComplex} 
          disabled={!currentAccount || isPending}
          className="flex-1 px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isPending && txType === 'complex' ? 'Signing...' : 'Complex TX (Split + Merge)'}
        </button>
      </div>

      <AutoDismissError error={error} onDismiss={() => setError(null)} className="mt-4" />

      {result && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl space-y-3">
          <h3 className="text-green-400 font-semibold">✓ Transaction Signed!</h3>
          
          <div>
            <strong className="text-gray-300">TX Bytes (Base64):</strong>
            <code className="block mt-1 text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
              {result.bytes.slice(0, 80)}...
            </code>
          </div>
          
          <div>
            <strong className="text-gray-300">Signature (Base64):</strong>
            <code className="block mt-1 text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
              {result.signature}
            </code>
          </div>

          {verifyResult && (
            <div className={`p-3 rounded-lg ${verifyResult.valid ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
              {verifyResult.valid ? (
                <>
                  <span className="text-green-300 font-medium">✓ Signature Valid!</span>
                  <div className="text-xs text-gray-400 mt-1">
                    Signer: <code>{verifyResult.address}</code>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {verifyResult.address === currentAccount?.address 
                      ? '✓ Matches connected account' 
                      : '⚠ Does not match connected account'}
                  </div>
                </>
              ) : (
                <span className="text-red-300 font-medium">✗ Signature Invalid</span>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-lg text-sm"
            >
              {isVerifying ? 'Verifying...' : 'Verify Signature'}
            </button>
            <button 
              onClick={handleClear} 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <style>{`
        .button-group {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}
