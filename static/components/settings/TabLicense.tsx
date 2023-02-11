import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import crypto from "crypto"


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
      currency: `USDT`,
      chainId: 5,
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
  const checkKey = (key) => {
    
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
                              generateKey(key)
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
        </>
      )
    },
  }
}