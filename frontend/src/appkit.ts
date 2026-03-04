/**
 * wagmi v2 config for Crypto Lottery — used by WagmiProvider in Providers.tsx.
 *
 * AppKit modal is initialized separately in public/wallet-appkit-init.js via
 * <script type="module"> using esm.sh CDN (added to index.html), since
 * @reown/appkit v1.8.x uses package.json "exports" subpaths that webpack 4
 * (react-scripts 4) cannot resolve at bundle time.  The modal is available
 * as window.__wcModal once it loads.
 *
 * In bridge mode (window.__bridgeActive = true, set by wallet-bridge-init.js)
 * both AppKit and wagmi reconnect are skipped; wallet-bridge-init.js handles
 * the connection via postMessage + window.ethereum.
 *
 * Imports deliberately use the "main" field paths that webpack 4 can resolve
 * instead of package.json "exports" subpath specifiers.
 */

// @ts-ignore — @wagmi/core main field resolves to dist/esm/exports/index.js
import { createConfig, http } from '@wagmi/core'

// BSC chain — defined inline to avoid @wagmi/core/chains subpath import
const bsc = {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://bsc-rpc.publicnode.com',
        'https://1rpc.io/bnb',
        'https://bsc.drpc.org',
        'https://bsc-dataseed1.binance.org/',
      ] as const,
    },
  },
}

// Mainnet chain — also defined inline for the same reason
const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://cloudflare-eth.com'] as const },
  },
}

export const wagmiConfig = createConfig({
  chains: [mainnet as any, bsc as any],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http('https://bsc-rpc.publicnode.com'),
  },
})
