import { Providers } from './providers/Providers'
import { Connect } from './components/Connect'
import { WalletStatus } from './components/WalletStatus'
import { ChainSwitcher } from './components/ChainSwitcher'
import { SignMessage } from './components/SignMessage'
import { SignTransaction } from './components/SignTransaction'
import { SignAndExecuteTransaction } from './components/SignAndExecuteTransaction'
import { LegacyMethods } from './components/LegacyMethods'
import { RequestEmail } from './components/RequestEmail'

function App() {
  return (
    <Providers>
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-sui-blue">
              Sui Demo
            </h1>
            <p className="text-gray-400">
              WaaP Wallet Integration with @mysten/dapp-kit
            </p>
          </div>

          {/* Connect Section */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              1. Connect Wallet
            </h2>
            <Connect />
          </section>

          {/* Wallet Status */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              2. Wallet Status
            </h2>
            <WalletStatus />
          </section>

          {/* Network Switching */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
             <h2 className="text-xl font-semibold mb-4 text-white">
              3. Network Switching
            </h2>
            <ChainSwitcher />
          </section>

          {/* Sign Message */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              4. Sign Personal Message
            </h2>
            <SignMessage />
          </section>

          {/* Sign Transaction */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              5. Sign Transaction
            </h2>
            <SignTransaction />
          </section>

          {/* Sign & Execute Transaction */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              6. Sign & Execute Transaction
            </h2>
            <SignAndExecuteTransaction />
          </section>

          {/* Legacy Methods */}
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              7. Legacy Methods (TransactionBlock)
            </h2>
            <LegacyMethods />
          </section>

          
          <section className="bg-sui-dark rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Other WaaP Methods
            </h2>
            {/* Request Email */}
            <h3 className="text-md mb-2">Request Email</h3>
            <RequestEmail />
          </section>

          {/* Info Footer */}
          {/* <footer className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
            <p>
              This demo showcases the WaaP for Sui.
            </p>
            <p className="mt-2">
              Features: Connect • Disconnect • Sign Message • Sign Transaction
            </p>
          </footer> */}
        </div>
      </main>
    </Providers>
  )
}

export default App
