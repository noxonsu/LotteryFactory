jest.setTimeout(20000)

// Mock window.SO_LotteryConfig for tests (normally injected via index.html)
window.SO_LotteryConfig = {
  chainId: 97,
  chainName: 'BSC Testnet',
  rpc: 'https://bsc-testnet-rpc.publicnode.com',
  etherscan: 'https://testnet.bscscan.com',
  contract: '0xa4729b743579d46de8edfece6e1fa2ff2f2fb631',
  token: {
    symbol: 'WEENUS',
    address: '0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b',
    decimals: 18,
    title: 'WEENUS',
    price: false,
    viewDecimals: 4,
  },
  buyTokenLink: false,
  numbersCount: 6,
  hideServiceLink: false,
  winPercents: {
    burn: 2,
    match_1: 1.25,
    match_2: 3.75,
    match_3: 7.5,
    match_4: 12.5,
    match_5: 25,
    match_6: 50,
  },
  menu: [],
  logo: '',
}
