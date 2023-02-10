import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import fetchLotteryStatus from "../../helpers/fetchLotteryStatus"

export default function TabLotteryBank(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
    getStorageData,
  } = options
  
  const [ isBankWithdraw, setIsBankWithdraw ] = useState(false)
  const doBankWithdraw = () => {
  }
  
  useEffect(() => {
    if (storageData.chainId && storageData.lotteryAddress) {
      addNotify(`Fetching lottery status`)
      fetchLotteryStatus({
        chainId: storageData.chainId,
        contractAddress: storageData.lotteryAddress,
      }).then((lotteryStatus) => {
        console.log('>>> BANK Lottery status', lotteryStatus)
      })
    }
  }, [ storageData ])
  return {
    render: () => {
      return (
        <>
          <div className={styles.adminForm}>
            <div className={styles.adminSectionDescription}>
              {`In this section, you can pick up the lottery pot. The bank can be withdrawn 31 days after the last round closes`}
            </div>
            <div className={styles.subFormInfo}>
              <h3>Lottery bank info</h3>
              <div className={styles.subForm}>
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>{`Date when the last round was closed`}</div>
                    </div>
                    Last round ends in:
                  </label>
                  <div>
                    Time
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>{`How much time has passed since the last round closed`}</div>
                    </div>
                    Time left:
                  </label>
                  <div>
                    Time
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>{`How much is in the lottery bank now`}</div>
                    </div>
                    Lottery bank:
                  </label>
                  <div>
                    000 WENUS
                  </div>
                </div>
                <div className={styles.actionsRow}>
                  <SwitchNetworkAndCall
                    chainId={storageData.chainId}
                    onClick={doBankWithdraw}
                    disabled={isBankWithdraw}
                    icon="money-bill-transfer"
                    action="Withdraw bank"
                    className={styles.adminButton}
                  >
                    {isBankWithdraw ? `Withdrawing lottery bank` : `Withdraw lottery bank`}
                  </SwitchNetworkAndCall>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    },
  }
}