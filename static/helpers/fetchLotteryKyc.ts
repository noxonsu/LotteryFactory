import contractData from "../contracts/source/artifacts/PancakeSwapLotteryKYC.json"
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const fetchLotteryKyc = (options) => {
  return new Promise(async (resolve, reject) => {
    const {
      chainId,
      contractAddress,
    } = options
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const _resolveNotSupport = () => {
          resolve({
            chainId,
            contractAddress,
            support: false
          })
        }
        const contract = new web3.eth.Contract(contractData.abi, contractAddress)
        try {
          const existKyc = await contract.methods.existKyc().call()
          if (existKyc) {
            const enabled = await contract.methods.KYCEnabled().call()
            resolve({
              chainId,
              contractAddress,
              support: true,
              enabled,
            })
          } else {
            _resolveNotSupport()
          }
        } catch (err) {
        console.log('>>> err', err)
          _resolveNotSupport()
        }
      } catch (err) {
        reject(err)
      }
    }
  })
}


export default fetchLotteryKyc