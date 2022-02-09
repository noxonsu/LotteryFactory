/* tslint:disable */
import { ChainId, Token } from '@pancakeswap/sdk'
import { serializeToken } from 'state/user/hooks/helpers'
import { SerializedToken } from './types'

const { MAINNET, TESTNET } = ChainId

interface TokenList {
  [symbol: string]: Token
}

interface SerializedTokenList {
  [symbol: string]: SerializedToken
}

interface TokenInfo {
  address: string
  symbol: string
  title: string
  decimals: number
  viewDecimals: number
  price: number | false
}

export const mainnetTokens = {
  cake: new Token(
    MAINNET,
    '0x703f112bda4cc6cb9c5fb4b2e6140f6d8374f10b',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  ),
}

export const testnetTokens = {
  cake: new Token(
    TESTNET,
    '0x703f112bda4cc6cb9c5fb4b2e6140f6d8374f10b',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  ),
}

export const info = (): TokenInfo => {
  const {
    chainId,
    token: {
      symbol,
      address,
      decimals,
      viewDecimals,
      title,
      price,
    },
  } = window.SO_LotteryConfig
  return {
    address,
    symbol,
    title,
    decimals,
    viewDecimals: (viewDecimals !== undefined) ? viewDecimals : 2,
    price: price || false
  }
}

const tokens = (): TokenList => {
  const tokensList: TokenList = {}
  const {
    chainId,
    token: {
      symbol,
      address,
      decimals,
      title
    },
  } = window.SO_LotteryConfig

  tokensList.cake = new Token(
    chainId,
    address,
    decimals,
    symbol,
    title,
    ''
  )

  return tokensList
}


export const serializeTokens = (): SerializedTokenList => {
  const unserializedTokens = tokens()
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: serializeToken(unserializedTokens[key]) }
  }, {})

  return serializedTokens
}

export default tokens()
