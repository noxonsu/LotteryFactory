import json from '../../contracts/Lottery.json'
import formatAmount from './formatAmount'
import { injectModalsRoot } from './modals'
import infoModal from './infoModal'
import connectModal from './connectModal'
import { accountUnlockedStorageKey } from './constants'
import { getState, setState } from './state'
import setupWeb3 from './setupWeb3'
import TokenAbi from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import sha256 from 'js-sha256'

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script')

  script.onload = resolve
  script.onerror = reject
  script.src = src

  document.head.appendChild(script)
})

type Params = {
  tokenAddress: string
  onTrx: (trxHash: string) => void
  onSuccess: (address: string) => void
  onError: (error: Error | string) => void
  onFinally: () => void
}


const genSalt = () => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for ( var i = 0; i < 128; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const deploy = async (params: Params) => {
  const { abi, bytecode } = json
  const { tokenAddress } = params
  const { web3 } = getState()

  const onTrx = params.onTrx || (() => {})
  const onSuccess = params.onSuccess || (() => {})
  const onError = params.onError || (() => {})
  const onFinally = params.onFinally || (() => {})

  if (!tokenAddress) {
    onError('All fields should be filled: tokenAddress.')
    return
  }

  let contract
  let accounts

  try {
    contract = new web3.eth.Contract(abi)
    accounts = await window.ethereum.request({ method: 'eth_accounts' })
  }
  catch (err) {
    onError(err)
    return
  }

  if (!accounts || !accounts[0]) {
    onError('Wallet account is undefined.')
    return
  }

  contract.deploy({
    data: '0x' + bytecode,
    arguments: [ tokenAddress ],
  })
    .send({
      from: accounts[0],
      gas: 5000000,
    })
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
}

const handleError = (err) => {
  const { opts } = getState()

  if (typeof opts.onError === 'function') {
    opts.onError(err)
  }
}

const initMetamask = async () => {
  const isAccountUnlocked = localStorage.getItem(accountUnlockedStorageKey) === 'true'

  if (isAccountUnlocked) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })

      if (!accounts[0]) {
        localStorage.removeItem(accountUnlockedStorageKey)
        connectModal.open()
      }
      else {
        setState({ account: accounts[0] })

        await setupWeb3()

        const { opts } = getState()

        if (typeof opts.onFinishLoading === 'function') {
          opts.onFinishLoading()
        }
      }
    }
    catch (err) {
      console.error(err)
      localStorage.removeItem(accountUnlockedStorageKey)
      connectModal.open()
    }
  }
  else {
    connectModal.open()
  }
}

const connectMetamask = async () => {
  if (!window.ethereum) {
    infoModal.open({
      message: `
        <div class="install-metamask">
          <img src="https://swaponline.github.io/images/metamask_45038d.svg" /><br />
          Please install MetaMask
        </div>
      `,
    })

    return Promise.reject()
  }

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (window.ethereum.networkVersion) {
        clearInterval(interval)
        await initMetamask()
        window.ethereum.on('networkChanged', initMetamask)
        resolve()
      }
    }, 500)
  })
}

const startLottery = (params) => {
  return new Promise((resolve, reject) => {
    waitMetamask(async () => {
      const { abi } = json
      const {
        lotteryContract,
        lotteryEnd,
        ticketPrice,
        treasuryFee,
      } = params

      const { web3 } = getState()

      let contract
      let accounts

      try {
        contract = new web3.eth.Contract(abi, lotteryContract)
        accounts = await window.ethereum.request({ method: 'eth_accounts' })
      } catch (err) {
        reject(err)
        return
      }

      if (!accounts || !accounts[0]) {
        reject('Wallet account is undefined.')
        return
      }

      const txArguments = {
        from: accounts[0],
        gas: '0'
      }

      const methodArgs = [
        lotteryEnd,
        ticketPrice,
        2000,
        [ 250, 375, 625, 1250, 2500, 5000 ],
        treasuryFee,
      ]

      const gasAmountCalculated = await contract.methods
        .startLottery(...methodArgs)
        .estimateGas(txArguments)

      const gasAmounWithPercentForSuccess = new BigNumber(
        new BigNumber(gasAmountCalculated)
          .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
          .toFixed(0)
      ).toString(16)

      txArguments.gas = '0x' + gasAmounWithPercentForSuccess

      contract.methods
      .startLottery(...methodArgs)
        .send(txArguments)
        .on('transactionHash', (hash) => {
          console.log('transaction hash:', hash)
          // resolve(hash)
        })
        .on('error', (error) => {
          console.log('transaction error:', error)

        })
        .on('receipt', (receipt) => {
          console.log('transaction receipt:', receipt)
          resolve(true)
        })
        .then(() => {
          console.log('alll ready')
        })
    })
  })
}

const closeLottery = (lotteryContract) => {
  return new Promise((resolve, reject) => {
    waitMetamask(async () => {
      const { abi } = json

      const { web3 } = getState()

      let contract
      let accounts

      try {
        contract = new web3.eth.Contract(abi, lotteryContract)
        accounts = await window.ethereum.request({ method: 'eth_accounts' })
      } catch (err) {
        reject(err)
        return
      }

      if (!accounts || !accounts[0]) {
        reject('Wallet account is undefined.')
        return
      }

      const txArguments = {
        from: accounts[0],
        gas: '0'
      }

      // get current lottery ids
      const lotteryId = await contract.methods.viewCurrentLotteryId().call()

      const gasAmountCalculated = await contract.methods
        .closeLottery(lotteryId)
        .estimateGas(txArguments)

      const gasAmounWithPercentForSuccess = new BigNumber(
        new BigNumber(gasAmountCalculated)
          .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
          .toFixed(0)
      ).toString(16)

      txArguments.gas = '0x' + gasAmounWithPercentForSuccess

      contract.methods.closeLottery(lotteryId)
        .send(txArguments)
        .on('transactionHash', (hash) => {
          console.log('transaction hash:', hash)

        })
        .on('error', (error) => {
          console.log('transaction error:', error)

        })
        .on('receipt', (receipt) => {
          console.log('transaction receipt:', receipt)

        })
        .then(() => {
          console.log('alll ready')
          resolve(true)
        })
    })
  })
}

const drawNumbers = (lotteryContract, userSalt) => {
  return new Promise((resolve, reject) => {
    waitMetamask(async () => {
      const { abi } = json

      const { web3 } = getState()

      let contract
      let accounts

      try {
        contract = new web3.eth.Contract(abi, lotteryContract)
        accounts = await window.ethereum.request({ method: 'eth_accounts' })
      } catch (err) {
        reject(err)
        return
      }

      if (!accounts || !accounts[0]) {
        reject('Wallet account is undefined.')
        return
      }

      const txArguments = {
        from: accounts[0],
        gas: '0'
      }

      const lotteryRandSalt = genSalt()
      // @ts-ignore
      const calcedHash = sha256(lotteryRandSalt + userSalt)
      // get current lottery ids
      const lotteryId = await contract.methods.viewCurrentLotteryId().call()


      const gasAmountCalculated = await contract.methods
        .drawFinalNumberAndMakeLotteryClaimable(lotteryId, '0x' + calcedHash, true)
        .estimateGas(txArguments)

      const gasAmounWithPercentForSuccess = new BigNumber(
        new BigNumber(gasAmountCalculated)
          .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
          .toFixed(0)
      ).toString(16)

      txArguments.gas = '0x' + gasAmounWithPercentForSuccess

      contract.methods
        .drawFinalNumberAndMakeLotteryClaimable(lotteryId, '0x' + calcedHash, true)
        .send(txArguments)
        .on('transactionHash', (hash) => {
          console.log('transaction hash:', hash)

        })
        .on('error', (error) => {
          console.log('transaction error:', error)

        })
        .on('receipt', (receipt) => {
          console.log('transaction receipt:', receipt)

        })
        .then(() => {
          console.log('alll ready')
          resolve(true)
        })
    })
  })
}

const fetchLotteryInfo = (lotteryAddress: string) => {
  return new Promise((resolve, reject) => {
    const {
      web3: checkWeb3,
      account: checkAccount
    } = getState()

    const fetchCallback = async () => {
      const {
        web3,
        account
      } = getState()

      try {
        const lottery = new web3.eth.Contract(json.abi, lotteryAddress, {
          from: account,
        })
// @ts-ignore
window.lotteryContract = lottery
        const owner = await lottery.methods.owner().call()
        const operator = await lottery.methods.operatorAddress().call()
        const treasury = await lottery.methods.treasuryAddress().call()
        const currentLotteryNumber = await lottery.methods.viewCurrentLotteryId().call()
        const currentLotteryInfo = await lottery.methods.viewLottery(currentLotteryNumber).call()
        const tokenAddress = await lottery.methods.cakeToken().call()
        if (tokenAddress) {
          const tokenInfo = await fetchTokenInfo(tokenAddress)
          resolve({
            contract: lotteryAddress,
            owner: owner,
            operator: operator,
            treasury: treasury,
            currentLotteryNumber: currentLotteryNumber,
            currentLotteryInfo: currentLotteryInfo,
            token: tokenInfo
          })
        } else {
          reject()
        }
      } catch (e) { reject() }
    }
    if (!checkWeb3) {
      connectMetamask().then(() => {
        fetchCallback()
      })
    } else {
      fetchCallback()
    }
  })
}

const waitMetamask = (callback) => {
  const {
    web3: checkWeb3,
    account: checkAccount
  } = getState()

  if (!checkWeb3) {
    console.log(' not connected')
    connectMetamask().then(() => {
      console.log('connected')
      callback()
    })
  } else {
    console.log('connected - call')
    callback()
  }
}
const fetchTokenInfo = (tokenAddress: string) => {
  return new Promise((resolve, reject) => {
    const {
      web3: checkWeb3,
      account: checkAccount
    } = getState()

    const fetchCallback = async () => {
      const {
        web3,
        account
      } = getState()

      try {
        const tokenContract = new web3.eth.Contract(TokenAbi, tokenAddress, {
          from: account,
        })
        const name = await tokenContract.methods.name().call()
        const symbol = await tokenContract.methods.symbol().call()
        const decimals = await tokenContract.methods.decimals().call()
        resolve({
          tokenAddress,
          name,
          symbol,
          decimals
        })
      } catch (e) { reject() }
    }
    if (!checkWeb3) {
      connectMetamask().then(() => {
        fetchCallback()
      })
    } else {
      fetchCallback()
    }
  })
}

const init = async (opts) => {
  setState({ opts })

  if (typeof opts.onStartLoading === 'function') {
    opts.onStartLoading()
  }

  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/web3/1.3.1/web3.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/bignumber.js/8.0.2/bignumber.min.js'),
    ])

    injectModalsRoot()

    // await connectMetamask()
    if (typeof opts.onFinishLoading === 'function') {
      opts.onFinishLoading()
    }
  }
  catch (err) {
    handleError(err)
  }
}


export default {
  init,
  deploy,
  startLottery,
  closeLottery,
  drawNumbers,
  fetchTokenInfo,
  fetchLotteryInfo,
}
