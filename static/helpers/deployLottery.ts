import contractData from "../contracts/source/artifacts/PancakeSwapLottery.json"
import contractDataKYC from "../contracts/source/artifacts/PancakeSwapLotteryKYC.json"

import {
  ZERO_ADDRESS,
  KYC_CONTRACTS,
} from "./constants"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const deployLottery = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      tokenAddress,
      feeOn,
      kycOn,
      kycContract,
    } = options
    console.log('>>> options', options)
    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then((accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        activeWeb3.eth.getChainId().then(async (chainId) => {
          const contract = new activeWeb3.eth.Contract(contractDataKYC.abi)

          const _kycContract = (KYC_CONTRACTS[chainId]) ? kycContract : ZERO_ADDRESS
          const kycEnabled = (_kycContract !== ZERO_ADDRESS) && kycOn

          const txArguments = {
            from: activeWallet,
            gas: '0'
          }

          const _arguments = [
            tokenAddress,
            (feeOn) ? true: false,// FEE ENABLED
            _kycContract,
            kycEnabled,
          ]
console.log('>>> deploy args', _arguments)
          const gasAmountCalculated = await contract.deploy({
            arguments: _arguments,
            data: contractDataKYC.data.bytecode.object
          }).estimateGas(txArguments)

          const gasAmounWithPercentForSuccess = new BigNumber(
            new BigNumber(gasAmountCalculated)
              .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
              .toFixed(0)
          ).toString(16)

          txArguments.gas = '0x' + gasAmounWithPercentForSuccess
          const gasPrice = await activeWeb3.eth.getGasPrice()
          txArguments.gasPrice = `0x` + new BigNumber(gasPrice).toString(16)
          
          contract.deploy({
            data: '0x' + contractDataKYC.data.bytecode.object,
            arguments: _arguments,
          })
            .send(txArguments)
            .on('transactionHash', (hash) => {
              console.log('transaction hash:', hash)
              onTrx(hash)
            })
            .on('error', (error) => {
              console.log('transaction error:', error)
              onError(error)
            })
            .on('receipt', (receipt) => {
              console.log('transaction receipt:', receipt)
              onSuccess(receipt.contractAddress)
            })
            .then(() => {
              onFinally()
            })
          }).catch((err) => {
            console.log('>>> deployLottery', err)
            reject(err)
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> deployLottery', err)
      reject(err)
    })
  })
}

export default deployLottery