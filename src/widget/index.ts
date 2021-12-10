import widget from './widget'
import wrongNetworkModal from './wrongNetworkModal'
import connectModal from './connectModal'
import infoModal from './infoModal'
import setupWeb3 from './setupWeb3'
import constants from './constants'
import { setState, getState } from './state'
import type { State } from './state'
import timer from './timer'


const accountUnlockedStorageKey = 'ff-account-unlocked'

const appendModalsHtml = () => {
  const modalsNode = document.createElement('div')
  const infoModalNode = document.createElement('div')

  modalsNode.setAttribute('id', constants.ids.modalsRoot)
  infoModalNode.setAttribute('id', constants.ids.infoModalRoot)

  document.body.appendChild(modalsNode)
  document.body.appendChild(infoModalNode)
}

const connectWeb3 = async () => {
  await setupWeb3()
  timer.init()
}

const initMetamask = async () => {
  const { opts } = getState()

  const activeNetwork = ({
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    42: 'kovan',
    56: 'bsc',
    97: 'bsc_test',
    100: 'xdai',
    1313161554: 'aurora'
  })[window.ethereum.networkVersion]

  if (!activeNetwork || opts.networkName.toLowerCase() !== activeNetwork.toLowerCase()) {
    wrongNetworkModal.open()
    return
  }

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
    widget.showError(`
      <div class="install-metamask">
        <img src="https://swaponline.github.io/images/metamask_45038d.svg" /><br />
        Please install MetaMask
      </div>
    `)

    return
  }

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.ethereum.networkVersion) {
        clearInterval(interval)
        initMetamask()
        window.ethereum.on('networkChanged', initMetamask)
        resolve()
      }
    }, 500)
  })
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script')

  script.onload = resolve
  script.onerror = reject
  script.src = src

  document.head.appendChild(script)
})

const init = async (opts: State['opts']) => {
  const { networkName, farmAddress, rewardsAddress, stakingAddress } = opts

  setState({ opts })
  appendModalsHtml()

  if (!networkName || !farmAddress || !rewardsAddress || !stakingAddress) {
    infoModal.open('Check farmFactory.init(options). Required options: networkName, farmAddress, rewardsAddress, stakingAddress.')
    return
  }

  const widgetRoot = document.getElementById(constants.ids.widgetRoot)

  if (!widgetRoot) {
    // infoModal.open('Template variable not found! Please use {farmfactory-widget-root}.')
    return
  }

  widget.injectHtml()
  timer.injectHtml()

  await connectMetamask()
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/bignumber.js/8.0.2/bignumber.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/web3/1.3.1/web3.min.js'),
  ])
  await connectWeb3()
}

const farmFactory = {
  init,
}


export default farmFactory
