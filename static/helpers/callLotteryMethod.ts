import contractData from "../contracts/source/artifacts/PancakeSwapLottery.json"
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callLotteryMethod = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      chainId,
      contractAddress,
      method,
      args,
      isCall,
      weiAmount
    } = options
    if (isCall) {
      const chainInfo = CHAIN_INFO(chainId)
      if (chainInfo) {
        try {
          const web3 = new Web3(chainInfo.rpcUrls[0])

          const contract = new web3.eth.Contract(contractData.abi, contractAddress)
          contract.methods[method](...args).call().then((answer) => {
            resolve(answer)
          }).catch((err) => {
            reject(err)
          })
        } catch (err) {
          reject(err)
        }
      }
    } else {
      const onTrx = options.onTrx || (() => {})
      const onSuccess = options.onSuccess || (() => {})
      const onError = options.onError || (() => {})
      const onFinally = options.onFinally || (() => {})

      activeWeb3.eth.getAccounts().then(async (accounts) => {
        if (accounts.length>0) {
          const activeWallet = accounts[0]
          const contract = new activeWeb3.eth.Contract(contractData.abi, contractAddress)

          const sendArgs = await calcSendArgWithFee(
            activeWallet,
            contract,
            method,
            args || [],
            weiAmount
          )

          contract.methods[method](...(args || []))
            .send(sendArgs)
            .on('transactionHash', (hash) => {
              console.log('transaction hash:', hash)
              onTrx(hash)
            })
            .on('error', (error) => {
              console.log('transaction error:', error)
              onError(error)
              reject(error)
            })
            .on('receipt', (receipt) => {
              console.log('transaction receipt:', receipt)
              onSuccess(receipt)
            })
            .then((res) => {
              resolve(res)
              onFinally(res)
            })
        } else {
          reject('NO_ACTIVE_ACCOUNT')
        }
      }).catch((err) => {
        console.log('>>> callLotteryMethod', err)
        reject(err)
      })
    }
  })
        
}


export default callLotteryMethod