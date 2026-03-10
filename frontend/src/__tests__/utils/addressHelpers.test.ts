import { getAddress } from 'utils/addressHelpers'

describe('getAddress', () => {
  const address = {
    56: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    97: '0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe',
  }

  // Implementation reads chainId from window.SO_LotteryConfig (set to 97 in test setup)
  it(`get address for mainnet (chainId 56)`, () => {
    // SO_LotteryConfig.chainId = 97 → testnet address returned
    window.SO_LotteryConfig.chainId = 56
    const expected = address[56]
    expect(getAddress(address)).toEqual(expected)
    window.SO_LotteryConfig.chainId = 97 // restore
  })
  it(`get address for testnet (chainId 97)`, () => {
    // SO_LotteryConfig.chainId = 97 (default mock)
    const expected = address[97]
    expect(getAddress(address)).toEqual(expected)
  })
  it(`get address for any other network (chainId 31337)`, () => {
    window.SO_LotteryConfig.chainId = 31337
    // chainId 31337 not in address map → falls back to MAINNET (56)
    const expected = address[56]
    expect(getAddress(address)).toEqual(expected)
    window.SO_LotteryConfig.chainId = 97 // restore
  })
})
