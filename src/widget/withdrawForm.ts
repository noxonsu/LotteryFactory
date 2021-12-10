import events from './events'
import { getState } from './state'
import infoModal from './infoModal'
import constants from './constants'
import loader from './loader'
import toFixed from './toFixed'
import formatAmount from './formatAmount'


const html = `
  <div class="farmfactory-form farmfactory-withdraw">
    <div class="farmfactory-title" id="${constants.ids.withdrawForm.title}"></div>
    <input class="farmfactory-input" id="${constants.ids.withdrawForm.input}" type="number" value="" />
    <div class="farmfactory-row">
      <button class="farmfactory-button" id="${constants.ids.withdrawForm.cancelButton}">Cancel</button>
      <button class="farmfactory-button" id="${constants.ids.withdrawForm.withdrawButton}">Withdraw</button>
    </div>
  </div>
`


let isLoading = false

const withdraw = async () => {
  const { contracts, account, stakingDecimals } = getState()

  if (isLoading) {
    return
  }

  if (!contracts.farm) {
    infoModal.open('Farm contract is not connected')
    return
  }

  const input = document.getElementById(constants.ids.withdrawForm.input) as HTMLInputElement
  const cancelButton = document.getElementById(constants.ids.withdrawForm.cancelButton)
  const withdrawButton = document.getElementById(constants.ids.withdrawForm.withdrawButton)

  const amount = Number(input.value)

  if (amount > 0) {
    try {
      isLoading = true

      cancelButton.classList.add('disabled')
      withdrawButton.innerHTML = `Withdraw ${loader()}`

      // const value = web3.utils.toWei(String(amount))
      const value = formatAmount(amount, stakingDecimals)

      const res = await contracts.farm.methods.withdraw(value).send({ from: account })

      if (res.status) {
        infoModal.open('Transaction confirmed!')
      }

      hide()
      events.dispatch('withdraw success')
    }
    catch (err) {
      console.error(err)

      if (err.code == 'INVALID_ARGUMENT') {
        infoModal.open('Placeholder cannot be empty')
      }
      else {
        infoModal.open(err.message)
      }
    }
    finally {
      isLoading = false

      cancelButton.classList.remove('disabled')
      withdrawButton.innerHTML = 'Withdraw'
    }
  }
}

const addListeners = () => {
  const cancelButton = document.getElementById(constants.ids.withdrawForm.cancelButton)
  const withdrawButton = document.getElementById(constants.ids.withdrawForm.withdrawButton)

  cancelButton.addEventListener('click', () => {
    if (!cancelButton.classList.contains('disabled')) {
      hide()
    }
  })

  withdrawButton.addEventListener('click', () => {
    withdraw()
  })
}

const show = async () => {
  const { contracts, account, stakingTokenName, stakingDecimals } = getState()

  const root = document.getElementById(constants.ids.widget.root)
  const title = document.getElementById(constants.ids.withdrawForm.title)

  root.classList.add('farmfactory-withdraw-visible')

  title.innerHTML = `Balance: ${loader(true)}`

  const balance = await contracts.farm.methods.balanceOf(account).call()

  title.innerHTML = `Balance: <b>${toFixed(Number(balance) / Math.pow(10, stakingDecimals))} ${stakingTokenName}</b>`
}

const hide = () => {
  document.getElementById(constants.ids.widget.root).classList.remove('farmfactory-withdraw-visible')
}


export default {
  html,
  addListeners,
  show,
  hide,
}
