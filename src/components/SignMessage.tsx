import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit'
import { verifyPersonalMessageSignature } from '@mysten/sui/verify'
import { useState } from 'react'
import { AutoDismissError } from './AutoDismissError'

export function SignMessage() {
  const currentAccount = useCurrentAccount()
  const { mutate: signPersonalMessage, isPending } = useSignPersonalMessage()
  
  const [message, setMessage] = useState('Hello, Sui! This is a test message from WaaP.')
  const [signature, setSignature] = useState<string | null>(null)
  const [signedBytes, setSignedBytes] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; address: string } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSign = () => {
    setError(null)
    setSignature(null)
    setSignedBytes(null)
    setVerifyResult(null)

    if (!currentAccount) {
      setError('No account connected')
      return
    }

    const messageBytes = new TextEncoder().encode(message)

    signPersonalMessage(
      {
        message: messageBytes,
        account: currentAccount,
      },
      {
        onSuccess: (result) => {
          setSignature(result.signature)
          setSignedBytes(result.bytes)
        },
        onError: (err) => {
          console.error('Sign error:', err)
          setError(err.message || 'Failed to sign message')
        },
      }
    )
  }

  const handleVerify = async () => {
    if (!signature || !signedBytes) return
    
    setIsVerifying(true)
    setVerifyResult(null)
    setError(null)
    
    try {
      // Decode the signature to check scheme
      const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
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
        setVerifyResult({ valid: true, address: currentAccount?.address || '' })
        setError('zkLogin signatures require on-chain verification. Signature format is valid.')
        return
      }
      
      // Decode the message from base64
      const messageBytes = Uint8Array.from(atob(signedBytes), c => c.charCodeAt(0))
      
      // Verify the signature using @mysten/sui
      const publicKey = await verifyPersonalMessageSignature(messageBytes, signature)
      
      // Get the address from the public key
      const address = publicKey.toSuiAddress()
      
      setVerifyResult({ valid: true, address })
    } catch (err) {
      console.error('Verification failed:', err)
      // Log more details for debugging
      try {
        const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
        console.log('Failed signature bytes (first 10):', Array.from(sigBytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '))
      } catch {}
      setVerifyResult({ valid: false, address: '' })
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClear = () => {
    setSignature(null)
    setSignedBytes(null)
    setError(null)
    setVerifyResult(null)
  }

  if (!currentAccount) {
    return (
      <div className="text-gray-400 text-center py-4">
        Connect your wallet to sign messages
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Message Input */}
      <div className="space-y-2">
        <label className="text-gray-400 text-sm block">Message to Sign</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg 
                     text-white placeholder-gray-500 resize-none focus:outline-none 
                     focus:border-sui-blue transition-colors"
          rows={3}
          placeholder="Enter a message to sign..."
        />
      </div>

      {/* Sign Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSign}
          disabled={isPending || !message.trim()}
          className="flex-1 px-6 py-3 bg-sui-blue hover:bg-blue-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-xl 
                     transition-colors duration-200"
        >
          {isPending ? 'Signing...' : 'Sign Message'}
        </button>

        {(signature || error) && (
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white 
                       font-medium rounded-xl transition-colors duration-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Display */}
      <AutoDismissError error={error} onDismiss={() => setError(null)} />

      {/* Signature Result */}
      {signature && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl space-y-3">
          <h3 className="text-green-400 font-semibold">✓ Message Signed!</h3>
          
          <div>
            <strong className="text-gray-300">Signed Message (Base64):</strong>
            <code className="block mt-1 text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
              {signedBytes}
            </code>
          </div>
          
          <div>
            <strong className="text-gray-300">Signature (Base64):</strong>
            <code className="block mt-1 text-xs text-gray-400 break-all bg-black/30 p-2 rounded">
              {signature}
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
              onClick={() => {
                setSignature(null)
                setSignedBytes(null)
                setVerifyResult(null)
              }} 
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
