import type { AppProps } from "next/app"
import Head from 'next/head'
import Script from 'next/script'
import "../styles/globals.css"
import styles from "../styles/Home.module.css"
import { getStorageText, getLink } from "../helpers"
import { getStorageDesign } from "../helpers/getDesign"
import useStorage from "../storage/"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import { CHAIN_INFO } from "../helpers/constants"
import NotifyHolder from "../components/NotifyHolder"
import StorageStyles from "../components/StorageStyles"
import { useRef } from "react"
import { getAssets, getResource } from "../helpers/getAssets"
import callLotteryMethod from "../helpers/callLotteryMethod"
import checkLicenseKey from "../helpers/payment/checkLicenseKey"

let confirmWindowOnConfirm = () => {}
let confirmWindowOnCancel = () => {}
const defaultConfirmWindowLabels = {
  title: `Message`,
  message: `Confirm`,
  ok: `Ok`,
  cancel: `Cancel`,
} 

function MyApp({ Component, pageProps }: AppProps) {
  const {
    storageData,
    storageIsLoading,
    isOwner,
    setDoReloadStorage,
    setDoReloadStorageFast,
    storageTexts,
    storageDesign,
    storageMenu,
  } = useStorage()
  const router = useRouter()

  const settingsUrl = (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? 'settings' : 'settings.html'
  const routerBaseName = router.asPath.split('/').reverse()[0].split('?')[0];

  const iframeHideMenu = router.asPath.indexOf('isSettingsFrame=true') !== -1

  // CF test
  //const isSettingsPage = (routerBaseName === settingsUrl)
  const isSettingsPage = (routerBaseName == 'settings' || routerBaseName == 'settings.html')

console.log('>>> isSettingsPage', isSettingsPage, routerBaseName)
  /* Confirm window */
  const [ isConfirmWindowOpened, setIsConfirmWindowOpened ] = useState(false)
  const [ confirmWindowLabels, setConfirmWindowLabels ] = useState(defaultConfirmWindowLabels)


  const onConfirmWindowConfirm = () => {
    confirmWindowOnConfirm()
    setIsConfirmWindowOpened(false)
  }
  const onConfirmWindowCancel = () => {
    confirmWindowOnCancel()
    setIsConfirmWindowOpened(false)
  }
  const openConfirmWindow = (options = {}) => {
    const {
      onConfirm,
      onCancel,
    } = options
    confirmWindowOnConfirm = (onConfirm) ? onConfirm : () => {}
    confirmWindowOnCancel = (onCancel) ? onCancel : () => {}
    setConfirmWindowLabels({
      title: options.title || defaultConfirmWindowLabels.title,
      message: options.message || defaultConfirmWindowLabels.message,
      ok: options.okLabel || defaultConfirmWindowLabels.ok,
      cancel: options.cancelLabel || defaultConfirmWindowLabels.cancel,
    })
    setIsConfirmWindowOpened(true)
  
  }
  /* -------------- */
  const notifyHolder = new NotifyHolder({})
  const addNotify = (msg, style = `info`) => {
    notifyHolder.addItem({
      msg,
      style,
      time: getUnixTimestamp(),
      utx: getUnixTimestamp(),
    })
  }

  
  let _lsPreviewTextsMode = false
  
  const [ usedTexts, setUsedText ] = useState(storageTexts)
  const [ previewTextsUtx, setPreviewTextsUtx ] = useState(0)

  useEffect(() => {
    const _lsPreviewTextsMode = localStorage.getItem(`-nft-stake-preview-text-mode`)
    const _lsPreviewTexts = localStorage.getItem(`-nft-stake-preview-texts`)
    const _lsPreviewUtx = localStorage.getItem(`-nft-stake-preview-texts-utx`)
    setPreviewTextsUtx(_lsPreviewUtx || 0)
    if (_lsPreviewTextsMode) {
      try {
        const parsedTexts = JSON.parse(_lsPreviewTexts)
        setUsedText({
          ...storageTexts,
          ...parsedTexts
        })
      } catch (e) {}
    } else {
      setUsedText(storageTexts)
    }
  }, [ storageTexts, previewTextsUtx ])

  const getText = getStorageText(usedTexts)

  const [ usedDesign , setUsedDesign ] = useState(storageDesign)
  const [ previewDesignUtx, setPreviewDesignUtx ] = useState(0)

  useEffect(() => {
    const _updateTimer = window.setInterval(() => {
      const _lsPreviewUtx = localStorage.getItem(`-nft-stake-preview-texts-utx`)
      setPreviewTextsUtx(_lsPreviewUtx || 0)
    }, 3000)
    
    return () => {
      window.clearInterval(_updateTimer)
    }
  }, [])
  
  useEffect(() => {
    const _lsPreviewMode = localStorage.getItem(`-nft-stake-preview-mode`)
    const _lsPreviewDesign = localStorage.getItem(`-nft-stake-preview-design`)
    const _lsPreviewUtx = localStorage.getItem(`-nft-stake-preview-utx`)
    setPreviewDesignUtx(_lsPreviewUtx || 0)
    if (_lsPreviewMode) {
      try {
        const parsedDesign = JSON.parse(_lsPreviewDesign)
        setUsedDesign({
          ...storageDesign,
          ...parsedDesign
        })
      } catch (e) {}
    } else {
      setUsedDesign(storageDesign)
    }
  }, [ storageDesign, previewDesignUtx ])
  
  useEffect(() => {
    const _updateTimer = window.setInterval(() => {
      const _lsPreviewUtx = localStorage.getItem(`-nft-stake-preview-utx`)
      setPreviewDesignUtx(_lsPreviewUtx || 0)
    }, 3000)
    
    return () => {
      window.clearInterval(_updateTimer)
    }
  }, [])


  
  const _renderLoadOptions = {
    chainId: 420420,
    chainName: 'Kek-chain',
    rpc: "https://mainnet.kekchain.com/",
    etherscan: "https://mainnet-explorer.kekchain.com",
    contract: "0xE686b71eC00E0D259fc4efD0541a7AdD62f806F4",
    token: {
      symbol: "Duck Token",
      address: "0x6330e9B2C21fE22c17Be8c955b12C4e11be675db",
      decimals: "18",
      title: "XDCK",
      price: false,
      viewDecimals: 2
    },
    buyTokenLink: false,
    numbersCount: 2,
    hideServiceLink: false,
    winPercents: {
      burn: 2,
      match_1: 39.2,
      match_2: 58.8,
      match_3: 6.125,
      match_4: 12.25,
      match_5: 24.5,
      match_6: 49,
    },
    menu: false
  }
  
  const getDesign = getStorageDesign(usedDesign)
  
  const [ vendorSetting, setVendorSetting ] = useState({})
  
  
  let isVenderLoaded  = true

  const [ ballsCount, setBallsCount ] = useState(2)

  useEffect(() => {
    if (!storageIsLoading) {
      if (storageData?.chainId
        && storageData?.lotteryAddress
        && storageData?.tokenAddress
        && storageData?.tokenInfo
        && storageData?.tokenInfo?.symbol
      ) {
        callLotteryMethod({
          isCall: true,
          chainId: storageData.chainId,
          contractAddress: storageData.lotteryAddress,
          method: 'numbersCount',
          args: []
        }).then((_count) => {
          setBallsCount(_count)
          console.log('bals count', _count)
        })
        if (storageData.chainId) {
          const chainInfo = CHAIN_INFO(storageData.chainId)
          console.log('>>> storageMenu', storageMenu)
          setVendorSetting({
            chainId: storageData.chainId,
            chainName: chainInfo.chainName,
            rpc: chainInfo.rpcUrls[0],
            etherscan: chainInfo.blockExplorerUrls[0],
            contract: storageData.lotteryAddress,
            token: {
              ...storageData.tokenInfo,
              price: false,
              viewDecimals: 2
            },
            native: {
              name: chainInfo.nativeCurrency.name,
              symbol: chainInfo.nativeCurrency.symbol,
              decimals: chainInfo.nativeCurrency.decimals,
            },
            buyTokenLink: (storageData.buyTokenLink && storageData.buyTokenLink !== ``) ? storageData.buyTokenLink : false,
            numbersCount: ballsCount,
            hideServiceLink: false,
            winPercents: {
              burn: parseFloat(storageData.burn),
              ...storageData.matchRules,
            },
            hideServiceLink: checkLicenseKey(`LOTTERY_OFF_COPYRIGTH`, storageData) || checkLicenseKey(`LOTTERY_FULL_VERSION`, storageData),
            menu: storageMenu,
            logo: getDesign('logoUri', `uri`, getAssets(`logo.png`, 'mainLogo'))
          })
        }
      }
    }
  }, [storageIsLoading, ballsCount])
  
  if ((!storageIsLoading && storageData && storageData.isInstalled && storageData.isBaseConfigReady && !isSettingsPage && vendorSetting)) {
    return (
      <div>
        <Head>
          <title>{getText(`App_Title`, `App title`)}</title>
          <meta name="description" content={getText(`App_Description`, `desc`)} />
          <meta name="keywords" content={getText(`App_Keywords`, `keywords`)} />
        </Head>
        <div>
          <div id="lottery-style-holder"></div>
          <div id="root" class="alignfull"></div>
          <div id="portal-root"></div>
        </div>
        <StorageStyles getDesign={getDesign} />
        <Script>
          {`
            window._appHost = '/_MYAPP/'
            window.SO_LotteryConfig = ${JSON.stringify(vendorSetting)}
          `}
        </Script>

        <Script strategy="lazyOnload" src="/_MYAPP/loader.js"></Script>
        <Script src="/_MYAPP/vendor/2.chunk.js"></Script>
        <Script src="/_MYAPP/vendor/main.chunk.js"></Script>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>{getText(`App_Title`, `NFTStake - Stake NFT - earn ERC20`)}</title>
        <meta name="description" content={getText(`App_Description`, `NFTStake - Stake NFT - earn ERC20`)} />
        <meta name="keywords" content={getText(`App_Keywords`, `NFT, Stake, ERC20, Blockchain`)} />
        <style global>
          {`
            .svg-inline--fa {
              display: var(inline-block);
              height: 1em;
              overflow: visible;
              vertical-align: -0.125em;
            }
            svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
              overflow: visible;
              box-sizing: content-box;
            }

            .someOwnClass {
              background: red;
            }
          `}
        </style>
      </Head>
      {(storageIsLoading || (storageData === null)) ? (
        <div className={styles.loadingHolder}>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {!storageIsLoading && storageData && !storageData.isInstalled && !isSettingsPage && (
            <div className={styles.container}>
              <h2>The application needs to be installed on this domain.</h2>
              <a href={getLink(`settings`)} className={`${styles.mainButton} ${styles.autoWidth} primaryButton`}>
                Go to Install
              </a>
            </div>
          )}
          {storageData && !storageData.isBaseConfigReady && storageData.isInstalled && !isSettingsPage && (
            <div className={styles.container}>
              <h2>Application need base setup</h2>
              <a href={getLink(`settings`)} className={`${styles.mainButton} ${styles.autoWidth} primaryButton`}>
                Go to setup
              </a>
            </div>
          )}
          {((!storageIsLoading && storageData && storageData.isInstalled && storageData.isBaseConfigReady) || isSettingsPage) && (
            <>
              {!isSettingsPage && (
                <StorageStyles getDesign={getDesign} />
              )}
              <Component
                {...pageProps }
                storageData={storageData}
                storageIsLoading={storageIsLoading}
                openConfirmWindow={openConfirmWindow}
                isOwner={isOwner}
                addNotify={addNotify}
                setDoReloadStorage={setDoReloadStorage}
                setDoReloadStorageFast={setDoReloadStorageFast}
                storageTexts={storageTexts}
                storageDesign={storageDesign}
                getText={getText}
                getDesign={getDesign}
                iframeHideMenu={iframeHideMenu}
                storageMenu={storageMenu}
              />
            </>
          )}
        </>
      )}
      {notifyHolder.render()}
      {/* ---- Confirm block ---- */}
      { isConfirmWindowOpened && (
        <div className={styles.confirmWindow}>
          <div>
            <h3>{confirmWindowLabels.title}</h3>
            <span>{confirmWindowLabels.message}</span>
            <div>
              <button className={`${styles.mainButton} primaryButton`} onClick={onConfirmWindowConfirm}>
                {confirmWindowLabels.ok}
              </button>
              <button className={`${styles.mainButton} primaryButton`} onClick={onConfirmWindowCancel}>
                {confirmWindowLabels.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApp;
