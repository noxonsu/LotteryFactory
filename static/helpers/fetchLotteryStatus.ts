import contractData from "../contracts/source/artifacts/PancakeSwapLottery.json"
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const fetchLotteryStatus = (options) => {
  return new Promise(async (resolve, reject) => {
    const {
      chainId,
      contractAddress,
    } = options
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const contract = new web3.eth.Contract(contractData.abi, contractAddress)
        const owner = await contract.methods.owner().call()
        const operator = await contract.methods.operatorAddress().call()
        const treasury = await contract.methods.treasuryAddress().call()
        const currentLotteryNumber = await contract.methods.viewCurrentLotteryId().call()
        const currentLotteryInfo = await contract.methods.viewLottery(currentLotteryNumber).call()
        resolve({
          chainId,
          contractAddress,
          owner,
          operator,
          treasury,
          currentLotteryInfo,
          currentLotteryNumber
        })
      } catch (err) {
        reject(err)
      }
    }
  })
}


export default fetchLotteryStatus