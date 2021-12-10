import { Modal } from './modals'
import { getState } from './state'
import infoModal from './infoModal'
import events from './events'
import { formatAmount, toFixed } from './helpers'


const withdrawModal = new Modal({
  title: 'Withdraw',
  content: `
    <div class="ff-text-field-container">
      <div class="ff-text-field-label">Available to withdraw:</div>
      <input class="ff-text-field" type="text" value="" placeholder="0.0" />
    </div>
    <div class="ff-modal-buttons">
      <button class="ff-button" type="button">Withdraw</button>
    </div>
  `,
  onOpen({ contracts, stakingDecimals, stakingTokenSymbol }) {
    const { opts: { networkName }, account } = getState()

    let isLoading = false

    const balanceNode = this.elems.root.querySelector('.ff-text-field-label')
    const textField = this.elems.root.querySelector('.ff-text-field')
    const buttonContainer = this.elems.root.querySelector('.ff-modal-buttons')
    const submitButton = this.elems.root.querySelector('.ff-button')

    contracts.farm.methods.balanceOf(account).call()
      .then((balance) => {
        const value = toFixed(Number(balance) / Math.pow(10, stakingDecimals))

        balanceNode.innerHTML = `Available to withdraw: <b>${value} ${stakingTokenSymbol}</b>`
      })

    submitButton.addEventListener('click', async () => {
      if (isLoading) {
        return
      }

      const amount = Number(textField.value)

      if (amount > 0) {
        isLoading = true
        submitButton.disabled = true
        submitButton.innerHTML = '<div class="ff-loader"></div>'

        const value = formatAmount(amount, stakingDecimals)

        contracts.farm.methods.withdraw(value).send({ from: account })
          .on('transactionHash', (hash) => {
            const trxNode = document.createElement('div')
            trxNode.classList.add('ff-transaction-link')
            trxNode.innerHTML = `Pending transaction: <a href="https://${networkName.toLowerCase()}.etherscan.io/tx/${hash}" target="_blank">${hash}</a>`

            this.elems.content.insertBefore(trxNode, buttonContainer)
          })
          .on('error', (err) => {
            console.error(err)

            infoModal.open({
              title: 'Transaction failed',
              message: 'Something went wrong. Try again later.'
            })
          })
          .then(() => {
            events.dispatch('withdraw success')

            infoModal.open({
              title: 'Transaction successful',
              message: 'The tokens were credited to your account.'
            })
          })
      }
    })
  },
})


export default withdrawModal
