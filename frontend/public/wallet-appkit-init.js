/**
 * LotteryFactory — Reown AppKit (WalletConnect v2) initialization
 *
 * Loaded as <script type="module"> — runs after wallet-bridge-init.js.
 * Skipped entirely when window.__bridgeActive === true (MCW Apps bridge mode).
 *
 * Exposes: window.__wcModal
 * Fires:   CustomEvent "wcAccountChanged" on document (address + isConnected)
 *
 * Uses esm.sh CDN to avoid webpack 4 package.json "exports" subpath issues.
 */

// In bridge mode wallet-bridge-init.js already handles the connection.
if (!window.__bridgeActive) {
  const { createAppKit } = await import('https://esm.sh/@reown/appkit@1.8.19')
  const { EthersAdapter } = await import('https://esm.sh/@reown/appkit-adapter-ethers@1.8.19')

  // Kekchain (default lottery chain)
  // Falls back to mainnet / BSC for AppKit network selector
  const bsc = {
    id: 56,
    caipNetworkId: 'eip155:56',
    chainNamespace: 'eip155',
    name: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://bsc-dataseed.binance.org'] },
    },
    blockExplorers: {
      default: { name: 'BscScan', url: 'https://bscscan.com' },
    },
  }

  const mainnet = {
    id: 1,
    caipNetworkId: 'eip155:1',
    chainNamespace: 'eip155',
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://cloudflare-eth.com'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
  }

  let modal
  try {
    modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [bsc, mainnet],
      defaultNetwork: bsc,
      projectId: 'a23677c4af3139b4eccb52981f76ad94',
      metadata: {
        name: 'Crypto Lottery',
        description: 'On-chain Crypto Lottery',
        url: window.location.origin,
        icons: [window.location.origin + '/favicon.ico'],
      },
      features: {
        analytics: false,
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-border-radius-master': '8px',
      },
    })
  } catch (e) {
    console.warn('[AppKit] Failed to init:', e)
  }

  if (modal) {
    window.__wcModal = modal

    // Track EIP-1193 provider (set when user connects)
    modal.subscribeProviders(state => {
      window.__wcProvider = state['eip155'] || null
    })

    // Notify the app when account/connection state changes
    modal.subscribeAccount(state => {
      document.dispatchEvent(new CustomEvent('wcAccountChanged', {
        detail: {
          address: state.address || null,
          isConnected: !!state.isConnected,
        },
      }))
    })
  }
}
