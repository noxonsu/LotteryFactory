import events from './events'
import { getState } from './state'
import infoModal from './infoModal'
import web3modal from './web3modal'
import depositModal from './depositModal'
import withdrawModal from './withdrawModal'
import { createContracts, toFixed } from './helpers'


const getHtml = ({ withAPY, withAPR, apyLabel = 'APY', aprLabel = 'APR' }) => `
  <div class="ff-widget-headline">
    <div class="ff-widget-token-icons">
      <div class="ff-widget-token-icon">
        <span class="ff-skeleton"></span>
      </div>
      <div class="ff-widget-token-icon">
        <span class="ff-skeleton"></span>
      </div>
    </div>
    <div class="ff-title-and-timer">
      <div class="ff-widget-title">
        <span class="ff-skeleton"></span>
      </div>
      <div class="ff-widget-timer">--:--:--:--</div>
    </div>
  </div>
  <div class="ff-widget-section ff-widget-stats">
    ${!withAPY ? '' : `
      <div class="ff-widget-row2">
        <div class="ff-widget-label">${apyLabel}:</div>
        <div class="ff-widget-value ff-widget-apy">
          <span class="ff-skeleton"></span>
        </div>
      </div>
    `}
    ${!withAPR ? '' : `
      <div class="ff-widget-row2">
        <div class="ff-widget-label">${aprLabel}:</div>
        <div class="ff-widget-value ff-widget-apr">
          <span class="ff-skeleton"></span>
        </div>
      </div>
    `}  
    <div class="ff-widget-row2">
      <div class="ff-widget-label">Deposit:</div>
      <div class="ff-widget-value ff-widget-deposit-token-name">
        <span class="ff-skeleton"></span>
      </div>
    </div>  
    <div class="ff-widget-row2">
      <div class="ff-widget-label">Earn:</div>
      <div class="ff-widget-value ff-widget-earn-token-name">
        <span class="ff-skeleton"></span>
      </div>
    </div>  
  </div>
  <div class="ff-widget-section ff-widget-earn-section ff-hidden">
    <div class="ff-widget-section-title">
      <b class="ff-rewards-token-name">
        <span class="ff-skeleton"></span>
      </b> Earned
    </div>
    <div class="ff-widget-row">
      <div class="ff-widget-value ff-widget-earned-amount">
        <span class="ff-skeleton"></span>
      </div>
      <div>
        <button class="ff-button ff-widget-harvest-button" type="button" disabled>Harvest</button>
      </div>
    </div>
  </div>
  <div class="ff-widget-section ff-widget-stake-section ff-hidden">
    <div class="ff-widget-section-title">
      <b class="ff-staking-token-name">
        <span class="ff-skeleton"></span>
      </b> Staked
    </div>
    <div class="ff-widget-row">
      <div class="ff-widget-value ff-widget-staked-amount">
        <span class="ff-skeleton"></span>
      </div>
      <div>
        <button class="ff-button ff-widget-deposit-button" type="button" disabled>Deposit</button>
        <button class="ff-button ff-widget-withdraw-button" type="button" disabled>Withdraw</button>
      </div>
    </div>
  </div>
  <div class="ff-widget-footer">
    <button class="ff-button ff-widget-unlock-button" type="button">Unlock wallet</button>
    <button class="ff-button ff-widget-approve-button ff-hidden" type="button">Approve contract</button>
  </div>
`

const getTokenIcon = (opt: Opts['stakingTokenIcon'], symbol: string): string => {
  let icon: string

  if (opt) {
    if (typeof opt === 'function') {
      icon = opt(symbol)
    }
    else {
      icon = opt
    }
  }

  return icon
}

type GetTokenIconsValues = {
  stakingTokenSymbol: string
  rewardsTokenSymbol: string
}

const getTokenIcons = (opts: Opts, values: GetTokenIconsValues) => {
  const { stakingTokenSymbol, rewardsTokenSymbol } = values

  const stakingIcon = getTokenIcon(opts.stakingTokenIcon, stakingTokenSymbol)
  const rewardsIcon = getTokenIcon(opts.rewardsTokenIcon, rewardsTokenSymbol)

  if (stakingIcon || rewardsIcon) {
    return {
      staking: stakingIcon,
      rewards: rewardsIcon,
    }
  }

  return null
}

type Opts = {
  selector: string
  farmAddress: string
  stakingAddress: string
  rewardsAddress: string
  stakingTokenIcon?: string | ((symbol: string) => string)
  rewardsTokenIcon?: string | ((symbol: string) => string)
  title?: string | ((stakingSymbol: string, rewardsSymbol: string) => string)
  apy?: number | (() => Promise<number>)
  apr?: number | (() => Promise<number>)
  apyLabel?: string
  aprLabel?: string
  detailsLink?: string | ((stakingSymbol: string, rewardsSymbol: string) => string)
  detailsClick?: (stakingSymbol: string, rewardsSymbol: string) => void
}

class Widget {

  opts: Opts

  elems: {
    root: HTMLDivElement
    tokenIcons: HTMLDivElement
    title: HTMLDivElement
    timer: HTMLDivElement
    rewardsTokenSymbol: HTMLDivElement
    stakingTokenSymbol: HTMLDivElement
    apyValue: HTMLDivElement
    aprValue: HTMLDivElement
    depositTokenName: HTMLDivElement
    earnTokenName: HTMLDivElement
    earnedAmount: HTMLDivElement
    stakedAmount: HTMLDivElement
    earnSection: HTMLDivElement
    stakeSection: HTMLDivElement
    unlockButton: HTMLButtonElement
    approveButton: HTMLButtonElement
    depositButton: HTMLButtonElement
    withdrawButton: HTMLButtonElement
    harvestButton: HTMLButtonElement
  }

  readContracts: {
    farm: any
    staking: any
    rewards: any
  }

  contracts: {
    farm: any
    staking: any
    rewards: any
  }

  state: {
    stakingTokenSymbol: any
    stakingDecimals: any
    rewardsTokenSymbol: any
    rewardsDecimals: any
  }

  constructor(opts: Opts) {
    this.opts = opts
    this.elems = {} as any
    this.state = {} as any

    const { farmAddress, rewardsAddress, stakingAddress } = opts

    if (!farmAddress || !rewardsAddress || !stakingAddress) {
      throw new Error('Widget requires "farmAddress", "rewardsAddress", "stakingAddress" options')
    }

    this.injectHtml(opts)
    this.initCommon()
    events.subscribe('account connected', this.init)
  }

  injectHtml(opts) {
    const root = document.getElementById(opts.selector) as HTMLDivElement

    root.classList.add('ff-widget')

    // Html

    root.innerHTML = getHtml({
      withAPY: Boolean(this.opts.apy),
      withAPR: Boolean(this.opts.apr),
      apyLabel: this.opts.apyLabel,
      aprLabel: this.opts.aprLabel,
    })

    // Queries

    const tokenIcons          = root.querySelector('.ff-widget-token-icons') as HTMLDivElement
    const title               = root.querySelector('.ff-widget-title') as HTMLDivElement
    const timer               = root.querySelector('.ff-widget-timer') as HTMLDivElement
    const rewardsTokenSymbol  = root.querySelector('.ff-rewards-token-name') as HTMLDivElement
    const stakingTokenSymbol  = root.querySelector('.ff-staking-token-name') as HTMLDivElement
    const apyValue            = root.querySelector('.ff-widget-apy') as HTMLDivElement
    const aprValue            = root.querySelector('.ff-widget-apr') as HTMLDivElement
    const depositTokenName    = root.querySelector('.ff-widget-deposit-token-name') as HTMLDivElement
    const earnTokenName       = root.querySelector('.ff-widget-earn-token-name') as HTMLDivElement
    const earnSection         = root.querySelector('.ff-widget-earn-section') as HTMLDivElement
    const stakeSection        = root.querySelector('.ff-widget-stake-section') as HTMLDivElement
    const earnedAmount        = root.querySelector('.ff-widget-earned-amount') as HTMLDivElement
    const stakedAmount        = root.querySelector('.ff-widget-staked-amount') as HTMLDivElement
    const unlockButton        = root.querySelector('.ff-widget-unlock-button') as HTMLButtonElement
    const approveButton       = root.querySelector('.ff-widget-approve-button') as HTMLButtonElement
    const depositButton       = root.querySelector('.ff-widget-deposit-button') as HTMLButtonElement
    const withdrawButton      = root.querySelector('.ff-widget-withdraw-button') as HTMLButtonElement
    const harvestButton       = root.querySelector('.ff-widget-harvest-button') as HTMLButtonElement

    this.elems = {
      root,
      tokenIcons,
      title,
      timer,
      rewardsTokenSymbol,
      stakingTokenSymbol,
      apyValue,
      aprValue,
      depositTokenName,
      earnTokenName,
      earnSection,
      stakeSection,
      earnedAmount,
      stakedAmount,
      unlockButton,
      approveButton,
      depositButton,
      withdrawButton,
      harvestButton
    }

    unlockButton.addEventListener('click', () => {
      web3modal.connect()
    })

    this.createButton(approveButton, async () => {
      const { web3, account } = getState()

      const spender = opts.farmAddress
      const value = web3.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

      try {
        await this.contracts.staking.methods.approve(spender, value).send({ from: account })
        this.handleApproved()
      }
      catch (err) {
        console.error(err)
        infoModal.open(err.message)
      }
    })
  }

  createButton = (button, callback) => {
    const text = button.innerHTML
    let isLoading = false

    button.addEventListener('click', async () => {
      if (isLoading) {
        return
      }

      isLoading = true
      button.disabled = true
      button.innerHTML = '<div class="ff-loader"></div>'

      await callback()

      button.disabled = false
      button.innerHTML = text
    })
  }

  handleApproved = () => {
    this.elems.approveButton.classList.add('ff-hidden')
    this.elems.earnSection.classList.remove('ff-hidden')
    this.elems.stakeSection.classList.remove('ff-hidden')

    this.elems.depositButton.addEventListener('click', () => {
      depositModal.open({
        contracts: this.contracts,
        stakingDecimals: this.state.stakingDecimals,
        stakingTokenSymbol: this.state.stakingTokenSymbol,
      })
    })

    this.elems.withdrawButton.addEventListener('click', () => {
      withdrawModal.open({
        contracts: this.contracts,
        stakingDecimals: this.state.stakingDecimals,
        stakingTokenSymbol: this.state.stakingTokenSymbol,
      })
    })

    this.createButton(this.elems.harvestButton, async () => {
      const { opts: { networkName }, account } = getState()

      return this.contracts.farm.methods.getReward().send({ from: account })
        .on('transactionHash', (hash) => {
          console.log('Harvest trx:', `https://${networkName.toLowerCase()}.etherscan.io/tx/${hash}`)
        })
        .on('error', (err) => {
          console.error(err)

          infoModal.open({
            title: 'Transaction failed',
            message: 'Something went wrong. Try again later.'
          })
        })
        .then(() => {
          events.dispatch('harvest success')

          infoModal.open({
            title: 'Transaction successful',
            message: 'The tokens were credited to the contract.'
          })
        })
    })
  }

  initCommon = async () => {
    const { farmAddress, rewardsAddress, stakingAddress } = this.opts
    const { opts: { networkName } } = getState()

    const networks = {
      mainnet: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      ropsten: 'https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      kovan: 'https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      matic: 'https://betav2.matic.network',
      matic_test: 'https://betav2.matic.network',
      // https://docs.binance.org/smart-chain/developer/create-wallet.html
      bsc: 'https://bsc-dataseed1.binance.org:443',
      bsc_test: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      xdai: 'https://rpc.xdaichain.com',
      aurora: 'https://mainnet.aurora.dev'
    }

    const network = networks[networkName.toLowerCase()]

    const web3 = new window.Web3(window.Web3.givenProvider || window.ethereum || network)

    this.readContracts = await createContracts(web3, {
      farmAddress,
      rewardsAddress,
      stakingAddress,
    })

    const [
      stakingTokenSymbol,
      stakingDecimals,
      rewardsTokenSymbol,
      rewardsDecimals,
    ] = await Promise.all([
      this.readContracts.staking.methods.symbol().call(),
      this.readContracts.staking.methods.decimals().call(),
      this.readContracts.rewards.methods.symbol().call(),
      this.readContracts.rewards.methods.decimals().call(),
    ])

    this.state.stakingTokenSymbol = stakingTokenSymbol
    this.state.rewardsTokenSymbol = rewardsTokenSymbol

    this.state.stakingDecimals = stakingDecimals
    this.state.rewardsDecimals = rewardsDecimals

    this.elems.rewardsTokenSymbol.innerHTML = rewardsTokenSymbol
    this.elems.stakingTokenSymbol.innerHTML = stakingTokenSymbol

    // Title

    if (typeof this.opts.title === 'function') {
      this.elems.title.innerHTML = this.opts.title(stakingTokenSymbol, rewardsTokenSymbol)
    }
    else if (typeof this.opts.title === 'string') {
      this.elems.title.innerHTML = this.opts.title
    }
    else {
      this.elems.title.innerHTML = `${rewardsTokenSymbol}-${stakingTokenSymbol}`
    }

    // Tokens

    const tokenIcons = getTokenIcons(this.opts, {
      stakingTokenSymbol,
      rewardsTokenSymbol,
    })

    if (tokenIcons) {
      this.elems.tokenIcons.innerHTML = `
        ${tokenIcons.rewards ? `<img class="ff-widget-token-icon" src="${tokenIcons.rewards}" />` : ''}
        ${tokenIcons.staking ? `<img class="ff-widget-token-icon" src="${tokenIcons.staking}" />` : ''}
      `
    }
    else {
      this.elems.tokenIcons.innerHTML = ''
    }

    // APY

    if (this.elems.apyValue) {
      if (typeof this.opts.apy === 'function') {
        this.opts.apy()
          .then((value) => {
            this.elems.apyValue.innerHTML = `${value}%`
          })
      }
      else {
        this.elems.apyValue.innerHTML = `${this.opts.apy}%`
      }
    }

    // APR

    if (this.elems.aprValue) {
      if (typeof this.opts.apr === 'function') {
        this.opts.apr()
          .then((value) => {
            this.elems.aprValue.innerHTML = `${value}`
          })
      }
      else {
        this.elems.aprValue.innerHTML = `${this.opts.apr}`
      }
    }

    // Details

    if (this.opts.detailsLink) {
      let href

      if (typeof this.opts.detailsLink === 'function') {
        href = this.opts.detailsLink(stakingTokenSymbol, rewardsTokenSymbol)
      }
      else {
        href = this.opts.detailsLink
      }

      const details = document.createElement('a')
      details.classList.add('ff-widget-details')
      details.innerText = 'Details'
      details.href = href

      this.elems.root.appendChild(details)
    }
    else if (this.opts.detailsClick) {
      const details = document.createElement('div')

      details.classList.add('ff-widget-details')
      details.innerText = 'Details'
      details.onclick = () => {
        this.opts.detailsClick(stakingTokenSymbol, rewardsTokenSymbol)
      }

      this.elems.root.appendChild(details)
    }

    // Other

    this.elems.depositTokenName.innerHTML = stakingTokenSymbol
    this.elems.earnTokenName.innerHTML = rewardsTokenSymbol

    this.initTimer()
  }

  init = async () => {
    const { farmAddress, rewardsAddress, stakingAddress } = this.opts
    const { web3 } = getState()

    this.elems.unlockButton.classList.add('ff-hidden')

    this.contracts = createContracts(web3, {
      farmAddress,
      rewardsAddress,
      stakingAddress,
    })

    this.updateValues()

    events.subscribe('harvest success', this.updateValues)
    events.subscribe('deposit success', this.updateValues)
    events.subscribe('withdraw success', this.updateValues)
  }

  initTimer = async () => {
    let farmingFinishDate

    try {
      farmingFinishDate = await this.readContracts.farm.methods.periodFinish().call()
    }
    catch (err) {
      console.error(err)
      return
    }

    const finishDate = Number(farmingFinishDate.toString())

    if (finishDate - Date.now() / 1000 > 0) {
      setInterval(() => {
        let delta = Math.floor((finishDate * 1000 - Date.now()) / 1000)

        const days = Math.floor(delta / 86400)

        delta -= days * 86400

        const hours = Math.floor(delta / 3600) % 24

        delta -= hours * 3600

        const minutes = Math.floor(delta / 60) % 60

        delta -= minutes * 60

        const seconds = delta % 60
        const timeLeft = `${days < 10 ? `0${days}` : days}:${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`

        this.elems.timer.innerHTML = timeLeft
      }, 1000)
    }
    else {
      this.elems.timer.innerHTML = 'Farming not started yet'
    }
  }

  updateValues = async () => {
    const { account } = getState()

    const [
      farmingBalance,
      earnedTokens,
      allowance,
    ] = await Promise.all([
      this.readContracts.farm.methods.balanceOf(account).call(),
      this.readContracts.farm.methods.earned(account).call(),
      this.readContracts.staking.methods.allowance(account, this.opts.farmAddress).call(),
    ])

    if (Number(allowance) === 0) {
      this.elems.approveButton.classList.remove('ff-hidden')
    }
    else {
      this.handleApproved()
    }

    const { stakingDecimals, rewardsDecimals } = this.state

    this.elems.earnedAmount.innerText = toFixed(earnedTokens / Math.pow(10, rewardsDecimals))
    this.elems.stakedAmount.innerText = toFixed(farmingBalance / Math.pow(10, stakingDecimals))

    if (earnedTokens > 0) {
      this.elems.harvestButton.disabled = false
    }

    if (farmingBalance > 0) {
      this.elems.withdrawButton.disabled = false
    }

    this.elems.depositButton.disabled = false
  }
}


export default Widget
