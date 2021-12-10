import constants from './constants'
import { createContract } from './contracts'
import { getState } from './state'


let interval

const init = async () => {
  let { opts, contracts } = getState()

  const root = document.getElementById(constants.ids.timerRoot)

  if (!root) {
    return
  }

  if (!contracts) {
    const web3 = new Web3(constants.networks[opts.networkName])
    const farm = await createContract('farm', web3)

    contracts = {
      farm,
    }
  }

  let farmingFinishDate

  try {
    farmingFinishDate = await contracts.farm.methods.periodFinish().call()
  }
  catch (err) {
    console.error(err)
    return
  }

  const finishDate = Number(farmingFinishDate.toString())

  if (finishDate - Date.now() / 1000 > 0) {
    if (interval) {
      clearInterval(interval)
    }

    interval = setInterval(() => {
      let delta = Math.floor((finishDate * 1000 - Date.now()) / 1000)

      const days = Math.floor(delta / 86400)

      delta -= days * 86400

      const hours = Math.floor(delta / 3600) % 24

      delta -= hours * 3600

      const minutes = Math.floor(delta / 60) % 60

      delta -= minutes * 60

      const seconds = delta % 60
      const timeLeft = `${days < 10 ? `0${days}` : days}:${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`

      root.innerText = timeLeft
    }, 1000)
  }
  else {
    root.innerText = opts.timesUpMessage || 'Farming not started yet'
  }
}

const injectHtml = () => {
  const root = document.getElementById(constants.ids.timerRoot)

  if (root) {
    root.innerText = '--:--:--:--'
  }
}


export default {
  injectHtml,
  init,
}
