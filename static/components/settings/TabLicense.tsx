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
import { sendMessage as feedBack, STATUS as FEEDBACK_STATUS } from "../../helpers/feedback"


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
      feedBack({
        msg: `Begin buy activate key ${buyingKey} from ${activeAccount}`,
        status: FEEDBACK_STATUS.attention
      })
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
        feedBack({
          msg: `Activation key bought ${buyingKey} from ${activeAccount}`,
          status: FEEDBACK_STATUS.success
        })
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
    feedBack({
      msg: `Open buy key ${purchaseKey}`,
      status: FEEDBACK_STATUS.attention
    })
    setIsBuyOpened(true)
  }
  
  const [ isActivateKeyBoxOpened, setIsActivateKeyBoxOpened ] = useState(false)
  const [ isKeyActivating, setIsKeyActivating ] = useState(false)
  
  const activateKey = () => {
    if (checkKey(purchaseKey)) {
      feedBack({
        msg: `Activate key ${purchaseKey}`,
        status: FEEDBACK_STATUS.attention
      })
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
                      <div>If you already have an activation key. Specify it in this field and click "Activate"</div>
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
              <div className="PurchaseKeys">
                <style jsx>
                {`
                  .PurchaseKeys {}
                  .PurchaseKeys .card {
                    margin: 10px;
                    padding: 4px;
                    border: 1px solid #FFF;
                    box-shadow: 0 0 2px 2px #4f5760;
                    background: #403f3f;
                  }
                  .PurchaseKeys .card .title {
                    font-size: 12pt;
                    font-weight: bold;
                    border-bottom: 1px solid #FFF;
                    padding: 4px;
                    text-shadow: 1px 1px black, -1px 1px black, 1px -1px black, -1px -1px black;
                  }
                  .PurchaseKeys .card .desc {
                    padding: 15px;
                    font-size: 10pt;
                  }
                  .PurchaseKeys .card .buyHolder {
                    padding: 4px;
                    border-top: 1px solid #FFF;
                    text-align: right;
                  }
                  .PurchaseKeys .card .buyHolder STRONG {
                    color: #64d31f;
                  }
                `}
                </style>
                {Object.keys(PurchaseKeys).map((key) => {
                  const isBuyed = checkLicenseKey(key, storageData)
                  return (
                    <div className="card" key={key}>
                      <div className="title">{PurchaseKeys[key].title}</div>
                      <div className="desc">{PurchaseKeys[key].desc}</div>
                      <div className="buyHolder">
                        {isBuyed ? (
                          <strong>
                            <FaIcon icon="circle-check" />
                            {` `}
                            You already got it
                          </strong>
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
                            {`Buy an activation key`}
                          </SwitchNetworkAndCall>
                        )}
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
            title={`Payment for an activation key`}
          >
            <div className="buyKeyModal">
              <style jsx>
              {`
                .buyKeyModal {
                  padding: 10px;
                }
                .buyKeyModal A {
                  display: block;
                  padding: 5px;
                  color: #abd4ff;
                  font-weight: bold;
                }
                .buyKeyModal A:hover {
                  color: #FFF;
                }
              `}
              </style>
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
                className={styles.adminButton}
              >
                <FaIcon icon="money-check-dollar" />
                {keyPriceBaseNative ? (
                  <>{`Buy for ${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol} (~$${Number(keyPriceUsdt).toFixed(2)}) `}</>
                ) : (
                  <>{`Buy for $${keyPriceUsdt} (~${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol}) `}</>
                )}
              </button>
            </div>
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