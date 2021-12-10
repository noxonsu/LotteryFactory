import { getState } from './state'


let modal

const open = () => {
  const { opts } = getState()

  const html = `
    <div class="farmfactory-overlay">
      <div class="farmfactory-modal">
        <button class="farmfactory-closeButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
            <path stroke="currentColor" stroke-width="2" d="M9 9l7 6.99L23 9l-6.99 7L23 23l-7-6.99L9 23l6.99-7L9 9z" opacity=".9"/>
          </svg>
        </button>
        <div class="farmfactory-inner">
          Please open your wallet and change network to <b>${opts.networkName}</b>.
        </div>
      </div>
    </div>
  `

  modal = document.createElement('div')

  modal.innerHTML = html

  document.body.appendChild(modal)

  modal.querySelector('.farmfactory-closeButton').addEventListener('click', close)
}

const close = () => {
  if (modal) {
    modal.remove()
    modal = null
  }
}


export default {
  open,
  close,
}
