import { setState } from './state'
import constants from './constants'
import setupWeb3 from './setupWeb3'
import infoModal from './infoModal'
import loader from './loader'


let isLoading = false

const html = `
  <div class="farmfactory-overlay">
    <div class="farmfactory-modal">
      <button class="farmfactory-closeButton" id="${constants.ids.connectModal.closeButton}">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
          <path stroke="currentColor" stroke-width="2" d="M9 9l7 6.99L23 9l-6.99 7L23 23l-7-6.99L9 23l6.99-7L9 9z" opacity=".9"/>
        </svg>
      </button>
      <div class="farmfactory-inner">
        <img class="farmfactory-svgLogo" src="https://metamask.io/images/mm-logo.svg" alt="Metamask" />
      </div>
      <div class="farmfactory-footer">
        <button class="farmfactory-button yellow" id="${constants.ids.connectModal.connectButton}">Connect</button>
        <button class="farmfactory-button gray" id="${constants.ids.connectModal.cancelButton}">Cancel</button>
      </div>
    </div>
  </div>
`

const connectMetamask = async () => {
  if (isLoading) {
    return
  }

  const cancelButton = document.getElementById(constants.ids.connectModal.cancelButton)
  const connectButton = document.getElementById(constants.ids.connectModal.connectButton)

  try {
    isLoading = true

    cancelButton.classList.add('disabled')
    connectButton.innerHTML = `Connect ${loader()}`

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    setState({ account: accounts[0] })

    localStorage.setItem('ff-account-unlocked', 'true')

    await window.ethereum.enable()
    await setupWeb3()

    close()
  }
  catch (err) {
    console.error(err)
    infoModal.open(err.message)
  }
  finally {
    isLoading = false

    cancelButton.classList.remove('disabled')
    connectButton.innerHTML = 'Connect'
  }
}

const open = () => {
  document.getElementById(constants.ids.modalsRoot).innerHTML = html

  const connectButton = document.getElementById(constants.ids.connectModal.connectButton)
  const cancelButton = document.getElementById(constants.ids.connectModal.cancelButton)
  const closeButton = document.getElementById(constants.ids.connectModal.closeButton)

  connectButton.addEventListener('click', connectMetamask)
  cancelButton.addEventListener('click', close)
  closeButton.addEventListener('click', close)
}

const close = () => {
  document.getElementById(constants.ids.modalsRoot).innerHTML = ''
}


export default {
  open,
  close,
}
