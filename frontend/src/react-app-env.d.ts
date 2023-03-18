/// <reference types="react-scripts" />

interface Window {
  ethereum?: {
    isMetaMask?: true
    request?: (...args: any[]) => Promise<void>
  }
  BinanceChain?: {
    bnbSign?: (address: string, message: string) => Promise<{ publicKey: string; signature: string }>
  }
  SO_LotteryConfig?: {
    chainId?: number
    rpc?: string
    contract?: string
    token?: {
      symbol?: string
      address?: string
      decimals?: number
      viewDecimals?: number
      title?: string
      price?: number | false
    }
    buyTokenLink?: string
    numbersCount?: number
    hideServiceLink?: boolean
    winPercents?: {
      burn?: number
      match_1?: number
      match_2?: number
      match_3?: number
      match_4?: number
      match_5?: number
      match_6?: number
    }
    etherscan?: string
    menu?: any | false
    logo?: any
  }
}

type SerializedBigNumber = string
