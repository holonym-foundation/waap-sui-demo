import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit'
import { keccak256 } from 'viem'
import { useState, useEffect } from 'react'
import { decompressSecp256k1PublicKey } from '@/lib/secp256k1'

// Derive EVM address from compressed secp256k1 public key (Sui format)
function deriveEvmAddress(compressedKey: Uint8Array): string {
  const uncompressed = decompressSecp256k1PublicKey(compressedKey)
  // EVM address = last 20 bytes of keccak256(uncompressed_pubkey without 0x04 prefix)
  const hex = Array.from(uncompressed)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const pubKeyWithoutPrefix = '0x' + hex.slice(2)
  const hash = keccak256(pubKeyWithoutPrefix as `0x${string}`)
  return ('0x' + hash.slice(-40)).toLowerCase()
}

export function WalletStatus() {
  const currentAccount = useCurrentAccount()
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const [evmAddress, setEvmAddress] = useState<string | null>(null)

  // Derive Ethereum address from public key
  useEffect(() => {
    if (!currentAccount?.publicKey) {
      setEvmAddress(null)
      return
    }

    const pubKeyBytes = currentAccount.publicKey
    // console.log('🔑 WalletStatus public key:')
    // console.log('   Length:', pubKeyBytes.length)
    // console.log('   First byte:', '0x' + pubKeyBytes[0].toString(16).padStart(2, '0'))
    // console.log('   Full hex:', bytesToHex(pubKeyBytes))
    
    // Public key from Sui is in format: [flag (1 byte), compressed_pubkey (33 bytes)]
    // For Secp256k1, flag is 0x01, so the compressed key starts at index 1
    let compressedKey: Uint8Array
    if (pubKeyBytes[0] === 0x01 && pubKeyBytes.length === 34) {
      compressedKey = new Uint8Array(pubKeyBytes.slice(1))
    } else if ((pubKeyBytes[0] === 0x02 || pubKeyBytes[0] === 0x03) && pubKeyBytes.length === 33) {
      compressedKey = new Uint8Array(pubKeyBytes)
    } else {
      setEvmAddress(null)
      return
    }

    // Derive EVM address synchronously
    try {
      const address = deriveEvmAddress(compressedKey)
      setEvmAddress(address)
    } catch (err) {
      console.error('Failed to derive EVM address:', err)
      setEvmAddress(null)
    }
  }, [currentAccount?.publicKey])

  if (!currentAccount) {
    return (
      <div className="text-gray-400 text-center py-4">
        Connect your wallet to see status
      </div>
    )
  }

  // Truncate address for display


  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <span className="text-gray-400">Status</span>
        <span className="text-green-400 font-medium capitalize">{connectionStatus}</span>
      </div>

      {/* Wallet Name */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <span className="text-gray-400">Wallet</span>
        <span className="text-white font-medium">{currentWallet?.name || 'Unknown'}</span>
      </div>

      {/* Chains */}
      {/* <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
        <span className="text-gray-400">Supported Chains</span>
        <span className="text-white font-medium">
          {currentAccount.chains?.join(', ') || 'sui:mainnet, sui:testnet, sui:devnet'}
        </span>
      </div> */}

      {currentWallet?.name === 'WaaP' && (
        <>
          {/* Address */}
          <div className="p-3 bg-gray-800 rounded-lg space-y-2">
            <span className="text-gray-400 block">Derived Sui Address</span>
            <code className="text-sui-blue text-xs font-mono break-all block">
              {currentAccount.address}
            </code>
            {/* <span className="text-gray-500 text-xs block">({truncatedAddress})</span> */}
          </div> 

          {/* Derived EVM Address */}
          {evmAddress && (
            <div className="p-3 bg-gray-800 rounded-lg space-y-2">
              <span className="text-gray-400 block">Derived EVM Address</span>
              <code className="text-orange-400 text-xs font-mono break-all block">
                {evmAddress}
              </code>
            </div>
          )}

          {/* Public Key (if available) */}
          {currentAccount.publicKey && (
            <div className="p-3 bg-gray-800 rounded-lg space-y-2">
              <span className="text-gray-400 block">Public Key</span>
              <code className="text-gray-300 text-xs font-mono break-all block">
                {Array.from(currentAccount.publicKey).map(b => b.toString(16).padStart(2, '0')).join('')}
              </code>
            </div>
          )}
        </>
      )}
    </div>
  )
}
