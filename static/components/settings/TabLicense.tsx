import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import AdminPopupWindow from "../AdminPopupWindow"
import { CHAIN_INFO } from "../../helpers/constants"
import { getPrice } from "../../helpers/payment/currency"
import { send } from "../../helpers/payment/transaction"
import { PurchaseAddress, PurchaseKeys } from "../../helpers/payment/constants"
import checkLicenseKey from "../../helpers/payment/checkLicenseKey"
import generateKey from "../../helpers/payment/generateKey"


export default function TabLicense(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
    getStorageData,
  } = options
  
  const { activeChainId } = getActiveChain()
  const activeChainInfo = CHAIN_INFO(activeChainId)
  
  const [ purchaseKey, setPurchaseKey ] = useState("")


  const [ isBuyOpened, setIsBuyOpened ] = useState(false)
  const [ keyPriceUsdt, setKeyPriceUsdt ] = useState(0)
  const [ keyPriceNative, setKeyPriceNative ] = useState(0)
  const [ keyPriceBaseNative, setKeyPriceBaseNative ] = useState(false)
  const [ buyingKey, setBuyingKey ] = useState(``)
  
  const [ isBuying, setIsBuying ] = useState(false)
  const [ error, setError ] = useState(false)
  
  const onBuy = async () => {
    const { activeWeb3, activeAccount } = getActiveChain()
    addNotify(`Begin purchase... Confirm transaction`)
    setIsBuying(true)
    try {
      const confirmedTx = await send({
        provider: activeWeb3,
        from: activeAccount,
        to: PurchaseAddress,
        amount: keyPriceNative,
        onHash: (txHash) => {
          addNotify(`Pay TX ${txHash}`, `success`)
        }
      })
      if (confirmedTx?.status) {
        addNotify(`Successfull purchesed`, `success`)
        setIsBuying(false)
        setIsBuyOpened(false)
        const key = generateKey(buyingKey, activeAccount)
        setPurchaseKey(key)
        setIsActivateKeyBoxOpened(true)
        addNotify(`Your key ${key}. Save it`, `success`)
      }
    } catch (err) {
      addNotify(`Fail purchase. ${(err.message) ? err.message : ''}`, `error`)
      setIsBuying(false)
      setError(err.message)
    }
  }
  
  const openBuyModal = async (purchaseKey) => {
    setBuyingKey(purchaseKey)
    const keyInfo = PurchaseKeys[purchaseKey]
    const { symbol } = activeChainInfo.nativeCurrency
      
    const assetUSDPrice = await getPrice({
      symbol,
      vsCurrency: `USD`,
    })
    if (keyInfo.isUSDT) {
      setKeyPriceUsdt(keyInfo.price)
      setKeyPriceNative(keyInfo.price / assetUSDPrice)
      setKeyPriceBaseNative(false)
    } else {
      setKeyPriceNative(keyInfo.price)
      setKeyPriceUsdt(keyInfo.price * assetUSDPrice)
      setKeyPriceBaseNative(true)
    }
    
    setIsBuyOpened(true)
  }
  
  const [ isActivateKeyBoxOpened, setIsActivateKeyBoxOpened ] = useState(false)
  const [ isKeyActivating, setIsKeyActivating ] = useState(false)
  
  const activateKey = () => {
    if (checkKey(purchaseKey)) {
      openConfirmWindow({
        title: `Activating license key`,
        message: `Activate license key?`,
        onConfirm: () => {
          setIsKeyActivating(true)
          saveStorageConfig({
            onBegin: () => {
              addNotify(`Confirm transaction`)
            },
            onReady: () => {
              setIsKeyActivating(false)
              addNotify(`Key activated`, `success`)
              setIsActivateKeyBoxOpened(false)
              setPurchaseKey(``)
            },
            onError: (err) => {
              setIsKeyActivating(false)
              addNotify(`Fail activate key. ${err.message ? err.message : ''}`, `error`)
            },
            newData: {
              licenseKeys: [
                ...storageData?.licenseKeys,
                purchaseKey
              ]
            }
          })
        }
      })
    } else {
      addNotify(`You entered an invalid activation key`, `error`)
    }
  }

  const checkKey = (key) => {
    const { activeAccount } = getActiveChain()
    const matchedKeys = Object.keys(PurchaseKeys).filter((key) => {
      return (generateKey(key, activeAccount) == purchaseKey) 
    })
    return matchedKeys.length > 0
  }
  
  return {
    render: () => {
      return (
        <>
          <div className={styles.adminForm}>
            <div className={styles.subFormInfo}>
              <h3>Activating an existing purchase key</h3>
              <div className={styles.subForm}>
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>...</div>
                    </div>
                    Purchase key:
                  </label>
                  <div>
                    <div>
                      <input type="text" value={purchaseKey} onChange={(e) => { setPurchaseKey(e.target.value) }} />
                    </div>
                  </div>
                </div>
                <div className={styles.actionsRow}>
                  <SwitchNetworkAndCall
                    chainId={`STORAGE`}
                    onClick={activateKey}
                    disabled={isKeyActivating}
                    icon="receipt"
                    action="Active key"
                    className={styles.adminButton}
                  >
                    {isKeyActivating ? `Key activation...` : `Activate key`}
                  </SwitchNetworkAndCall>
                </div>
              </div>
            </div>
            <div className={styles.subFormInfo}>
              <h3>Purchasing a product activation key</h3>
              <div className={styles.subForm}>
                {Object.keys(PurchaseKeys).map((key) => {
                  const isBuyed = checkLicenseKey(key, storageData)
                  return (
                    <div className={styles.infoRow} key={key}>
                      <div>
                        <h5>{PurchaseKeys[key].title}</h5>
                        <div>{PurchaseKeys[key].desc}</div>
                        <div>
                          {isBuyed ? (
                            <strong>You already got it</strong>
                          ) : (
                            <SwitchNetworkAndCall
                              chainId={PurchaseKeys[key].chainId}
                              onClick={() => {
                                openBuyModal(key)
                              }}
                              disabled={false}
                              icon="money-check-dollar"
                              action="Buy"
                              className={styles.adminButton}
                            >
                              {`Buy`}
                            </SwitchNetworkAndCall>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <AdminPopupWindow
            isOpened={isBuyOpened}
            hasClose={true}
            onClose={() => { setIsBuyOpened(false) }}
            title={`Purchase`}
          >
            <>
              <p>You can use this links to buy crypto with a bank card:</p>
              <a
                className="link paymentLink"
                href={`https://changelly.com/buy/${activeChainInfo.nativeCurrency.symbol}`}
                target="_blank"
                rel="noreferrer"
              >
                Buy {activeChainInfo.nativeCurrency.symbol} on Changelly
              </a>
              <a
                className="link paymentLink"
                href={`https://www.binance.com/en/buy-${activeChainInfo.nativeCurrency.binancePurchaseKey || activeChainInfo.nativeCurrency.symbol}`}
                target="_blank"
                rel="noreferrer"
              >
                Buy {activeChainInfo.nativeCurrency.symbol} on Binance
              </a>

              <p className="notice">The price may vary slightly</p>

              {true && (
                <>
                  <p className="warning">
                    Do not leave this page until successful payment. If you have any problems with the payment, please
                    contact us.
                  </p>
                </>
              )}
              {error && <p className="error">Error: {error}</p>}

              <button
                disabled={isBuying}
                onClick={onBuy}
              >
                {keyPriceBaseNative ? (
                  <>{`Buy for ${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol} (~$${Number(keyPriceUsdt).toFixed(2)}) `}</>
                ) : (
                  <>{`Buy for $${keyPriceUsdt} (~${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol}) `}</>
                )}
              </button>
            </>
          </AdminPopupWindow>
          <AdminPopupWindow
            isOpened={isActivateKeyBoxOpened}
            title={`Key activation`}
          >
            <>
              <div className="activateKeyBox">
                <style jsx>
                {`
                  .activateKeyBox {
                    text-align: center;
                    padding: 10px;
                  }
                  .activateKeyBox STRONG {
                    display: block;
                    padding: 10px;
                    margin: 10px;
                    border: 1px solid #262936;
                    box-shadow: inset 0 0 7px 1px black;
                    color: #000;
                    background: #FFF;
                  }
                `}
                </style>
                <span>You have successfully made a payment. Now you need to save your activation key</span>
                <strong>{purchaseKey}</strong>
                <SwitchNetworkAndCall
                    chainId={`STORAGE`}
                    onClick={activateKey}
                    disabled={isKeyActivating}
                    icon="receipt"
                    action="Active key"
                    className={styles.adminButton}
                  >
                  {isKeyActivating ? `Key activation...` : `Activate key`}
                </SwitchNetworkAndCall>
              </div>
            </>
          </AdminPopupWindow>
        </>
      )
    },
  }
}