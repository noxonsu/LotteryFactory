import getConfig from "next/config";
  
const devDomains = [
  'localhost',
  'localhost.nftstake',
  'nftstakedemo.localhost',
  'shendel.github.io',
  'localhost.lottery',
  'lottery.local',
  'localhost.feo.crimea'
]

const isProd = () => {
  const { publicRuntimeConfig } = getConfig()
  if (typeof window === 'undefined') return ''
  const curDomain = window.location.hostname || document.location.host || ''
  // CF Pages - Use dev
  if (curDomain.substr(-10,10) == '.pages.dev') return false
  if (publicRuntimeConfig && publicRuntimeConfig.IS_PROD &&  publicRuntimeConfig.IS_PROD == 'true') return true
  return devDomains.indexOf(curDomain) === -1
}


export default isProd