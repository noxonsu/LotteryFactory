import web3Modal from './web3modal'
import { injectModalsRoot } from './modals'
import Widget from './widget'
import { setState } from './state'
import type { State } from './state'


const init = async (opts: State['opts']) => {
  if (!opts) {
    throw new Error('options required')
  }

  // https://ethereum.stackexchange.com/a/62217/620
  if (location.protocol !== 'https:') {
    throw new Error('FarmFactory requires HTTPS connection')
  }

  setState({ opts })
  injectModalsRoot()
  web3Modal.init()
}

const farmFactory = {
  init,
  Widget,
}


export default farmFactory
