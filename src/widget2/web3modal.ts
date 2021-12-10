import { getState, setState } from './state'
import infoModal from './infoModal'
import events from './events'
import web3 from './web3'


let instance: any
let provider: any

const fetchAccountData = async () => {
  const { opts, web3 } = getState()

  const chainId = await web3.eth.getChainId()

  const activeNetwork = ({
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    42: 'kovan',
    56: 'bsc',
    97: 'bsc_test',
    137: 'matic',
    80001: 'matic_test',
    1313161554: 'aurora',
    100: 'xdai'
  })[chainId]

  if (!activeNetwork || activeNetwork.toLowerCase() !== opts.networkName.toLowerCase()) {
    infoModal.open({
      title: 'Error',
      message: `We've detected that you need to switch your wallet's network from <b>${activeNetwork}</b> to <b>${opts.networkName}</b> network.`
    })

    return
  }

  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]

  setState({ account })

  if (!account) {
    disconnect()
  }
  else {
    console.log('account connected:', account)
    events.dispatch('account connected')
  }
}

const connect = async () => {
  try {
    const provider = await instance.connect()

    web3.init(provider)

    provider.on('accountsChanged', (accounts) => {
      console.log('provider account changed', accounts)
      fetchAccountData()
    })

    provider.on('chainChanged', (chainId) => {
      console.log('provider chain changed', chainId)
      fetchAccountData()
    })

    provider.on('networkChanged', (networkId) => {
      console.log('provider network changed', networkId)
      fetchAccountData()
    })

    await fetchAccountData()
  }
  catch(err) {
    console.error(err)
  }
}

const disconnect = async () => {
  console.log('Killing the wallet connection', provider)

  // TODO: Which providers have close method?
  if (provider.close) {
    await provider.close()

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    provider = null
  }

  await instance.clearCachedProvider()

  setState({ account: null })

  console.log('finalize disconnect')
}

const init = (): any => {
  const { opts } = getState()

  instance = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions: opts.wallet?.providerOptions || {},
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera
  })

  // @ts-ignore
  window.web3ModalInstance = instance

  instance.on('connect', async (proxy) => {
    console.log('web3modal initialized')
  })

  instance.on('disconnect', async () => {
    console.log('web3modal disconnected')
  })

  // Subscribe to chainId change
  instance.on('error', (err) => {
    console.log('web3modal error:', err)
  })

  if (instance.cachedProvider) {
    // connect()
  }
}


export default {
  init,
  connect,
  disconnect,
}
