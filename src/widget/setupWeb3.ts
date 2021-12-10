import { createContracts } from './contracts'
import { setState, getState } from './state'
import events from './events'


const setupWeb3 = async () => {
  const { account } = getState()

  if (!account) {
    return
  }

  const web3 = new window.Web3(window.Web3.givenProvider || window.ethereum)
  const contracts = await createContracts(web3)
  const stakingTokenName = await contracts.staking.methods.symbol().call()
  const stakingDecimals = await contracts.staking.methods.decimals().call()
  const rewardsTokenName = await contracts.rewards.methods.symbol().call()
  const rewardsDecimals = await contracts.rewards.methods.decimals().call()

  setState({
    web3,
    contracts,
    stakingTokenName,
    stakingDecimals,
    rewardsTokenName,
    rewardsDecimals,
  })

  events.dispatch('setup web3')
}


export default setupWeb3
