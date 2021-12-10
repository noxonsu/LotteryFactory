import { getState } from './state'


let isLoading

const deposit = async (amount: string | number) => {
  const { web3, contracts, account, stakingDecimals } = getState()

  if (isLoading) {
    return
  }


  if (amount > 0) {
    try {
      isLoading = true

      cancelButton.classList.add('disabled')
      depositButton.innerHTML = `Deposit ${loader()}`

      // const value = web3.utils.toWei(String(amount))
      const value = formatAmount(amount, stakingDecimals)

      const res = await contracts.farm.methods.stake(value).send({ from: account })

      if (res.status) {
        infoModal.open('Transaction confirmed!')
      }

      hide()
      events.dispatch('deposit success')
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
      depositButton.innerHTML = 'Deposit'
    }
  }
}

const withdraw = (amount) => {

}

const createFarmFactory = (opts) => {

  return {
    deposit,
    withdraw,
  }
}


export default createFarmFactory
