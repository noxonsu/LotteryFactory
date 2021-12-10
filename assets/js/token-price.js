/**
 * Admin Scripts
 */
(function(){
	"use strict";

  const delay = (delayMs) => new Promise((resolve) => {
    setTimeout(() => { resolve() }, delayMs)
  })

  const fetchPricesQuery = []
  document.querySelectorAll('[data-farm-container="price"]').forEach((container) => {
    const farmId = container.dataset.farmId
    const tokenAddress = container.dataset.token
    const network = container.dataset.network
    const apiKey = container.dataset.apiKey

    fetchPricesQuery.push({
      container,
      farmId,
      tokenAddress,
      network,
      apiKey
    })
  })

  const runQuery = async () => {
    const currentStep = fetchPricesQuery.shift()
    const answer = await fetch(`https://deep-index.moralis.io/api/v2/erc20/${currentStep.tokenAddress}/price?chain=${currentStep.network}`, {
      headers: {
        'x-api-key': currentStep.apiKey
      }
    })
    const priceInfo = await answer.json()
    currentStep.container.innerHTML = `${priceInfo.usdPrice} USD`
    await delay(1000)
    if (fetchPricesQuery.length) runQuery()
  }
  if (fetchPricesQuery.length) runQuery()
})();
