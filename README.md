# WaaP Sui Demo App

A standalone Vite + React demo app showcasing WaaP SDK `@human.tech/waap-sdk` integration via `@mysten/dapp-kit`.

Docs: [docs.waap.xyz](https://docs.waap.xyz/)

## Features

- **Connect/Disconnect**: Connect to the WaaP Sui wallet using dapp-kit
- **Wallet Status**: View connected account details (address, chains, public key)
- **Sign Personal Message**: Sign messages using the Sui Wallet Standard

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
git clone <this-repo>
cd waap-sui-demo
pnpm install
```

### Development

```bash
pnpm dev
```

Open the app at **`http://127.0.0.1:3100`**.

Note: the dev server is intentionally bound to `127.0.0.1` to match the WaaP iframe origin (see `vite.config.ts`). Using `localhost` may not work depending on your WaaP configuration.

### Build & Preview

```bash
pnpm build
pnpm preview
```

## Architecture

This demo app uses:

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui** - Sui TypeScript SDK
- **@human.tech/waap-sdk** - WaaP Sui wallet SDK
- **TailwindCSS** - Styling
- **React Query** - State management

### Key Files

```
src/
├── main.tsx            # Entry point
├── App.tsx             # Main app component
├── index.css           # Global styles
├── components/
│   ├── ConnectButton.tsx   # Wallet connect/disconnect
│   ├── WalletStatus.tsx    # Account details display
│   └── SignMessage.tsx     # Personal message signing
└── providers/
    └── Providers.tsx   # dapp-kit + WaaP setup
```

## Usage Example

```typescript
import { initWaapSui } from '@human.tech/waap-sdk'

// Initialize the wallet
const wallet = initWaaPSui({
  useStaging: false,
  config: {
    allowedSocials: ['google', 'twitter'],
    authenticationMethods: ['email', 'social'],
    styles: { darkMode: false },
  },
  referralCode: 'waap-sui-demo',
})

// Connect
const { accounts } = await wallet.connect()

// Sign a message
const result = await wallet.signPersonalMessage({
  message: new TextEncoder().encode('Hello, Sui!'),
  account: accounts[0],
})

console.log(result.signature) // Base64 encoded signature
```

## Sui Signature Format

The WaaP wallet produces Sui-compatible signatures in the following format:

- **Total size**: 98 bytes
- **Format**: `[flag (1 byte)] + [r, s (64 bytes)] + [compressed_public_key (33 bytes)]`
- **Flag**: `0x01` for Secp256k1
- **Normalization**: S-value is BIP-62 compliant (low-s)
- **Encoding**: Base64
