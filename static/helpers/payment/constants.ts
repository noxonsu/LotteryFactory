
export const PurchaseAddress = "0xB71E59272a0B4EcBCeb222E9Ea475Cf1f11bEDa9"

export const PurchaseKeys = {
  LOTTERY_OFF_COPYRIGTH: {
    title: `LotteryFactory - Disable copyright`,
    desc: `LotteryFactory - Disables copyright of OnOut`,
    price: 0.1,
    chainId: 5, //56,
    product: `LotteryFactory`,
    include_packs: []
  },
  LOTTERY_FULL_VERSION: {
    title: `LotteryFactory - Full version`,
    desc: `LotteryFactory - Full version. Disabled copyright of OnOut. Onout commission disabled`,
    price: 1000,
    isUSDT: true,
    chainId: [5, 56],
    product: `LotteryFactory`,
    include_packs: [ `LOTTERY_OFF_COPYRIGTH` ]
  }
}