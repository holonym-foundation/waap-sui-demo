/**
 * Secp256k1 helpers for Sui/EVM key decompression.
 * Sui and Ethereum both require secp256k1 for signatures and address derivation;
 * the curve is protocol-mandated, not an arbitrary choice.
 */
// DevSkim: ignore Hard-coded Elliptic Curve - secp256k1 required by Sui/EVM protocol (see https://docs.sui.io/concepts/cryptography/transaction-auth)
import * as secp from '@noble/secp256k1'

/**
 * Decompress a compressed secp256k1 public key to uncompressed form (65 bytes, 0x04-prefixed).
 * Used to derive EVM address from Sui Secp256k1 public key.
 */
export function decompressSecp256k1PublicKey(compressedKey: Uint8Array): Uint8Array {
  const compressedHex = Array.from(compressedKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const point = secp.Point.fromHex(compressedHex)
  const uncompressedHex = point.toHex(false)
  const bytes = new Uint8Array(uncompressedHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(uncompressedHex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
