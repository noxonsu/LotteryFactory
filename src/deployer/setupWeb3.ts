import { setState, getState } from './state'


const networks = {
  mainnet: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  ropsten: 'https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  kovan: 'https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  matic_testnet: 'https://rpc-mumbai.maticvigil.com'
}

const setupWeb3 = () => new Promise((resolve, reject) => {
  const activeNetworkName = ({
    1: 'mainnet',
    3: 'ropsten',
    42: 'kovan',
    80001: 'matic_testnet'
  })[window.ethereum && window.ethereum.networkVersion]

  const network = networks[activeNetworkName]
  const web3 = new window.Web3(window.ethereum || window.Web3.givenProvider || new window.Web3.providers.HttpProvider(network))

  if (web3) {
    setState({ web3 })
    resolve()
  }
  else {
    reject()
  }
})


export default setupWeb3
