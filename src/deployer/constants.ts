export const accountUnlockedStorageKey = 'ff-deploy-account-unlocked'

export const CURRENCIES = {
  BNB: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18
  },
  ETH: {
    name: "Ether",
    symbol: 'ETH',
    decimals: 18
  },
  MATIC: {
    name: "Polygon",
    symbol: 'MATIC',
    decimals: 18
  },
  ARBETH: {
    name: "Ether (Arbitrum One)",
    symbol: 'ETH',
    decimals: 18
  },
  XDAI: {
    name: "xDai",
    symbol: 'xDAI',
    decimals: 18
  },
}

export const AVAILABLE_NETWORKS_INFO = [
  {
    slug: 'bsc_testnet',
    chainName: 'Binance Smart Chain - Testnet',
    chainId: '0x61',
    networkVersion: 97,
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.BNB
  },
  {
    slug: 'matic_testnet',
    chainName: 'Polygon - Testnet (mumbai)',
    chainId: '0x13881',
    networkVersion: 80001,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.MATIC
  },
  {
    slug: 'eth_rinkeby',
    chainName: 'Ethereum - Testnet (Rinkeby)',
    chainId: '0x4',
    networkVersion: 4,
    rpcUrls: ['https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.ETH
  },
  {
    slug: 'arbeth_testnet',
    chainName: 'Arbitrum - Testnet (Rinkeby)',
    chainId: '0x66EEB',
    networkVersion: 421611,
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.ARBETH
  },
  {
    slug: 'xdai_testnet',
    chainName: 'xDai - Testnet (Sokol)',
    chainId: '0x4d',
    networkVersion: 77,
    rpcUrls: ['https://sokol.poa.network'],
    blockExplorerUrls: ['https://blockscout.com/poa/sokol'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.XDAI
  },
];
