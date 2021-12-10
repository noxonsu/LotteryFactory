import events from './events'
import { getState } from './state'
import infoModal from './infoModal'
import constants from './constants'
import loader from './loader'
import toFixed from './toFixed'
import formatAmount from './formatAmount'


const html = `
  
`


let isLoading = false

const deposit = async () => {

}

const addListeners = () => {
  const cancelButton = document.getElementById(constants.ids.depositForm.cancelButton)
  const depositButton = document.getElementById(constants.ids.depositForm.depositButton)

  cancelButton.addEventListener('click', () => {
    if (!cancelButton.classList.contains('disabled')) {
      hide()
    }
  })

  depositButton.addEventListener('click', () => {
    deposit()
  })
}

const show = async () => {
  const { contracts, account, stakingTokenName, stakingDecimals } = getState()

  const root = document.getElementById(constants.ids.widget.root)
  const title = document.getElementById(constants.ids.depositForm.title)

  root.classList.add('farmfactory-deposit-visible')

  title.innerHTML = `Balance: ${loader(true)}`

  const balance = await contracts.staking.methods.balanceOf(account).call()

  title.innerHTML = `Balance: <b>${toFixed(Number(balance) / Math.pow(10, stakingDecimals))} ${stakingTokenName}</b>`
}

const hide = () => {
  document.getElementById(constants.ids.widget.root).classList.remove('farmfactory-deposit-visible')
}


export default {
  html,
  addListeners,
  show,
  hide,
}
