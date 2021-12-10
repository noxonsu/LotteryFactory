import { setState } from './state'
import events from './events'
import infoModal from './infoModal'


const init = (provider: any) => {
  if (!window.Web3) {
    infoModal.open({ message: 'Web3 is required' })
    return
  }

  const web3: any = new window.Web3(provider)

  setState({ web3 })
  console.log('web3 initialized')
  events.dispatch('web3 init')
}


export default {
  init,
}
