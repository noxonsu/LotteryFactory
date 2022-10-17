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
  FTM: {
    name: "FTM",
    symbol: 'FTM',
    decimals: 18
  },
  CRO: {
    name: "Cronos",
    symbol: 'CRO',
    decimals: 18
  },
  TCRO: {
    name: "Test Cronos",
    symbol: 'TCRO',
    decimals: 18
  },
  ETHW: {
    name: "EthereumPoW",
    symbol: 'ETHW',
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
    slug: 'bsc_mainnet',
    chainName: 'Binance Smart Chain',
    chainId: '0x38',
    networkVersion: 56,
    rpcUrls: ['https://bscrpc.com/'],
    blockExplorerUrls: ['https://bscscan.com'],
    isTestnet: false,
    nativeCurrency: CURRENCIES.BNB
  },
  {
    slug: 'matic_testnet',
    chainName: 'Polygon - Testnet (mumbai)',
    chainId: '0x13881',
    networkVersion: 80001,
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.MATIC
  },
  {
    slug: 'matic_mainnet',
    chainName: 'Polygon',
    chainId: '0x89',
    networkVersion: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    isTestnet: false,
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
    slug: 'eth_mainnet',
    chainName: 'Ethereum',
    chainId: '0x1',
    networkVersion: 1,
    rpcUrls: ['https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'],
    blockExplorerUrls: ['https://etherscan.io'],
    isTestnet: false,
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
    slug: 'arbeth_mainnet',
    chainName: 'Arbitrum',
    chainId: '0xA4B1',
    networkVersion: 42161,
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://explorer.arbitrum.io'],
    isTestnet: false,
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
  {
    slug: 'xdai_mainnet',
    chainName: 'Gnosis (xDai)',
    chainId: '0x64',
    networkVersion: 100,
    rpcUrls: ['https://rpc.gnosischain.com'],
    blockExplorerUrls: ['https://blockscout.com/xdai/mainnet'],
    isTestnet: false,
    nativeCurrency: CURRENCIES.XDAI
  },
  {
    slug: 'fantom_testnet',
    chainName: 'Fantom testnet',
    chainId: '0xfa2',
    networkVersion: 4002,
    rpcUrls: ['https://rpc.testnet.fantom.network/'],
    blockExplorerUrls: ['https://testnet.ftmscan.com'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.FTM
  },
  {
    slug: 'fantom_mainnet',
    chainName: 'Fantom',
    chainId: '0xfa',
    networkVersion: 250,
    rpcUrls: ['https://rpc.ftm.tools/'],
    blockExplorerUrls: ['https://ftmscan.com'],
    isTestnet: false,
    nativeCurrency: CURRENCIES.FTM
  },
  {
    slug: 'cronos_testnet',
    chainName: 'Cronos Testnet',
    chainId: '0x152',
    networkVersion: 338,
    rpcUrls: ['https://cronos-testnet-3.crypto.org:8545/'],
    blockExplorerUrls: ['https://testnet.cronoscan.com'],
    isTestnet: true,
    nativeCurrency: CURRENCIES.TCRO
  },
  {
    slug: 'cronos_mainnet',
    chainName: 'Cronos Mainnet',
    chainId: '0x19',
    networkVersion: 25,
    rpcUrls: ['https://mmf-rpc.xstaking.sg/'],
    blockExplorerUrls: ['https://cronoscan.com'],
    isTestnet: false,
    nativeCurrency: CURRENCIES.CRO
  },
  {
    slug: 'ethw_mainnet',
    chainName: 'ETHW-mainnet',
    chainId: '0x2711',
    networkVersion: 10001,
    rpcUrls: ['https://mainnet.ethereumpow.org/'],
    blockExplorerUrls: ['https://www.oklink.com/en/ethw'],
    isTestnet: false,
    nativeCurrency: CURRENCIES.ETHW
  },
];