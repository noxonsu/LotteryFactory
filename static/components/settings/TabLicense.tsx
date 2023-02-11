import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import crypto from "crypto"
import AdminPopupWindow from "../AdminPopupWindow"
import { CHAIN_INFO } from "../../helpers/constants"
import { getPrice } from "../../helpers/payment/currency"

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

  const PurchaseKeys = {
    LOTTERY_OFF_COPYRIGTH: {
      title: `LotteryFactory - Disable copyright`,
      desc: `LotteryFactory - Disables copyright of OnOut`,
      price: 0.1,
      chainId: 5, //56,
      product: `LotteryFactory`,
      include_packs: []
    },
    LOTTERY_FULL_VERSION: {
      title: `LotteryFactory - Full version`,
      desc: `LotteryFactory - Full version. Disabled copyright of OnOut. Onout commission disabled`,
      price: 1000,
      isUSDT: true,
      chainId: [5, 56],
      product: `LotteryFactory`,
      include_packs: [ `LOTTERY_OFF_COPYRIGTH` ]
    }
  }
  
  const generateKey = (PurchaseKey) => {
    const { activeAccount } = getActiveChain()
    const hash = crypto
      .createHash('md5')
      .update(`${activeAccount}-${PurchaseKey}`)
      .digest("hex")
      .toUpperCase()
    const key = `${hash.slice(0,8)}-${hash.slice(8,16)}-${hash.slice(16,24)}-${hash.slice(24)}`
    console.log(hash, key)
  }

  const [ isBuyOpened, setIsBuyOpened ] = useState(false)
  const [ keyPriceUsdt, setKeyPriceUsdt ] = useState(0)
  const [ keyPriceNative, setKeyPriceNative ] = useState(0)
  const [ keyPriceBaseNative, setKeyPriceBaseNative ] = useState(false)
  
  const openBuyModal = async (purchaseKey) => {
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
      
      console.log('>>> assetUSDPrice', assetUSDPrice)
    }
    
    setIsBuyOpened(true)
  }

  const checkKey = (key) => {
    
  }
  
  const error = `ERROR`
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
                    onClick={() => {}}
                    disabled={false}
                    icon="receipt"
                    action="Active key"
                    className={styles.adminButton}
                  >
                    {`Active key`}
                  </SwitchNetworkAndCall>
                </div>
              </div>
            </div>
            <div className={styles.subFormInfo}>
              <h3>Purchasing a product activation key</h3>
              <div className={styles.subForm}>
                {Object.keys(PurchaseKeys).map((key) => {
                  return (
                    <div className={styles.infoRow} key={key}>
                      <div>
                        <h5>{PurchaseKeys[key].title}</h5>
                        <div>{PurchaseKeys[key].desc}</div>
                        <div>
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
              >
                {keyPriceBaseNative ? (
                  <>{`Buy for ${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol} (~$${Number(keyPriceUsdt).toFixed(2)}) `}</>
                ) : (
                  <>{`Buy for $${keyPriceUsdt} (~${keyPriceNative} ${activeChainInfo.nativeCurrency.symbol}) `}</>
                )}
              </button>
            </>
          </AdminPopupWindow>
        </>
      )
    },
  }
}