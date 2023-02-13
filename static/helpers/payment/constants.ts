
export const PurchaseAddress = "0x873351e707257C28eC6fAB1ADbc850480f6e0633"

export const PurchaseKeys = {
  LOTTERY_OFF_COPYRIGTH: {
    title: `LotteryFactory - Disable copyright`,
    desc: `LotteryFactory - Disables copyright of OnOut`,
    price: 0.1,
    chainId: 56,
    product: `LotteryFactory`,
    include_packs: []
  },
  LOTTERY_FULL_VERSION: {
    title: `LotteryFactory - Full version`,
    desc: `LotteryFactory - Full version. Disabled copyright of OnOut. Onout commission disabled`,
    price: 1500,
    isUSDT: true,
    chainId: [1, 56],
    product: `LotteryFactory`,
    include_packs: [ `LOTTERY_OFF_COPYRIGTH` ]
  }
}