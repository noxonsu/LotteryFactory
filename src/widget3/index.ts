import wrongNetworkModal from './wrongNetworkModal'
import infoModal from './infoModal'
import widget from './widget'
import events from './events'
import createContracts from './createContracts'
import { setState, getState } from './state'


let provider: any
let web3Modal: any

const fetchAccountData = async () => {
  const { opts, web3 } = getState()

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId()

  // Load chain information over an HTTP API
  // https://github.com/ethereum-lists/chains/tree/master/_data/chains
  const chainData = window.evmChains.getChain(chainId)

  console.log('network name:', chainData.name)

  wrongNetworkModal.close()

  if (chainData.name.toLowerCase() !== opts.networkName.toLowerCase()) {
    wrongNetworkModal.open()
    return
  }

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts()

  // MetaMask does not give you all accounts, only the selected account
  console.log('accounts:', accounts)

  const account = accounts[0]

  setState({ account })

  if (!account) {
    // TODO disconnect - added on 2/19/21 by pavelivanov
    disconnect()
    return
  }

  console.log('selected account:', account)

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address)

    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/

    const ethBalance = web3.utils.fromWei(balance, 'ether')
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4)

    console.log('address:', address)
    console.log('balance:', humanFriendlyBalance)
  })

  // Because rendering account does its own RPC communication
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers)

  // Display fully loaded UI for wallet data
  console.log('connection finalized')

  events.dispatch('connect')
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
const refreshAccountData = async () => {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  // document.querySelector('#connected').style.display = 'none'
  // document.querySelector('#prepare').style.display = 'block'

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  // document.querySelector('#btn-connect').setAttribute('disabled', 'disabled')
  await fetchAccountData()
  // document.querySelector('#btn-connect').removeAttribute('disabled')
}

const connect = async () => {
  try {
    provider = await web3Modal.connect()

    if (!window.Web3) {
      infoModal.open('Web3 required')
      return
    }

    const web3: any = new window.Web3(provider)

    setState({ web3 })

    const contracts = await createContracts()

    setState({ contracts })

    console.log(888)

    provider.on('accountsChanged', (accounts) => {
      console.log('account changed', accounts)
      fetchAccountData()
    })

    provider.on('chainChanged', (chainId) => {
      console.log('chain changed', chainId)
      fetchAccountData()
    })

    provider.on('networkChanged', (networkId) => {
      console.log('network changed', networkId)
      fetchAccountData()
    })

    await refreshAccountData()
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

  await web3Modal.clearCachedProvider()

  setState({ account: null })

  console.log('finalize disconnect')
}

type Opts = {
  widgetOptions: any
  providerOptions: any
}

const init = async (opts: Opts) => {
  const { networkName, farmAddress, rewardsAddress, stakingAddress } = opts?.widgetOptions || {}

  if (!networkName || !farmAddress || !rewardsAddress || !stakingAddress) {
    infoModal.open('Check farmFactory.init({ widgetOptions }). Required options: networkName, farmAddress, rewardsAddress, stakingAddress.')
    return
  }

  setState({ opts: opts.widgetOptions })

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if (location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    infoModal.open('FarmFactory widget requires HTTPS connection.')
    // document.querySelector('#btn-connect').setAttribute('disabled', 'disabled')
    // return
  }

  widget.injectHtml()

  web3Modal = new window.Web3Modal.default({
    cacheProvider: true, // optional
    providerOptions: opts.providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  })

  // @ts-ignore
  window.web3Modal = web3Modal

  web3Modal.on('connect', async (proxy) => {
    console.log('web3Modal connected')
  })

  web3Modal.on('disconnect', async () => {
    console.log('web3Modal disconnected')
  })

  // Subscribe to chainId change
  web3Modal.on('error', (err) => {
    console.log('web3Modal error:', err)
  })

  if (web3Modal.providerController.cachedProvider) {
    connect()
  }
  else {
    document.getElementById('connect').addEventListener('click', connect)
  }

  document.getElementById('disconnect').addEventListener('click', disconnect)
}

const farmFactory = {
  init,
}


export default farmFactory
