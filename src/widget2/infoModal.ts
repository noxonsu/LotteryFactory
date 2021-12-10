import { Modal } from './modals'


const errorModal = new Modal({
  onOpen({ message } = {}) {
    const contentNode = this.elems.root.querySelector('.ff-modal-content')

    contentNode.innerHTML = message || 'Something went wrong'
  },
})


export default errorModal
