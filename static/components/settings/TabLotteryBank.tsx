import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import fetchLotteryStatus from "../../helpers/fetchLotteryStatus"
import fetchTokenBalance from "../../helpers/fetchTokenBalance"
import { getDateDiffText } from "../../helpers/getDateDiffText"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"

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
  
  const [ endTime, setEndTime ] = useState(0)
  const [ lotteryStatus, setLotteryStatus ] = useState(0)
  const [ balanceInfo, setBalanceInfo ] = useState(false)
  const [ timeLeft, setTimeLeft ] = useState(0)
  const [ doFetchStatus, setDoFetchStatus ] = useState(true)
  
  const doBankWithdraw = () => {
    openConfirmWindow({
      title: `Withdraw Lottery bank`,
      message: `Do you really want to withdraw the entire bank from the lottery contract?`,
      onConfirm: () => {
        setIsBankWithdraw(true)
        const { activeWeb3 } = getActiveChain()
        callLotteryMethod({
          activeWeb3,
          contractAddress: storageData.lotteryAddress,
          method: 'withdrawBank',
          args: [
            balanceInfo.wei
          ],
        }).then((res) => {
          setIsBankWithdraw(false)
          setDoFetchStatus(true)
          addNotify(`Lottery bank withdrawed`, `success`)
        }).catch((err) => {
          setIsBankWithdraw(false)
          addNotify(`Fail withdraw lottery bank. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }
  
  useEffect(() => {
    if (storageData.chainId && storageData.lotteryAddress && storageData.tokenAddress && doFetchStatus) {
      addNotify(`Fetching lottery status`)
      fetchLotteryStatus({
        chainId: storageData.chainId,
        contractAddress: storageData.lotteryAddress,
      }).then((lotteryStatus) => {
        const { currentLotteryInfo } = lotteryStatus
        console.log('>>> lotteryStatus', lotteryStatus)
        setEndTime(currentLotteryInfo.endTime)
        setLotteryStatus(currentLotteryInfo.status)
        setTimeLeft(Number(currentLotteryInfo.endTime) + 31 * 24 * 60 * 60 - getUnixTimestamp())
        // fetch bank
        fetchTokenBalance(storageData.lotteryAddress, storageData.tokenAddress, storageData.chainId).then((balanceInfo) => {
          setBalanceInfo(balanceInfo)
          setDoFetchStatus(false)
        })
      })
    }
  }, [ storageData ])
  return {
    render: () => {
      return (
        <>
          <div className={styles.adminForm}>
            <div className={styles.adminSectionDescription}>
              {`As an administrator, you have the option to withdraw unclaimed funds from the bank after two months have passed since the last round of the lottery. However, please be aware that a portion of the withdrawal, equal to 1/5 of the total amount, will be deducted as the OnOut fee. If you wish to avoid this fee, you can purchase the premium version of the lottery service.`}
            </div>
            <div className={styles.subFormInfo}>
              <h3>Lottery bank info</h3>
              {(storageData.tokenInfo && storageData.chainId && storageData.lotteryAddress && storageData.tokenInfo.symbol && balanceInfo) ? (
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
                      <strong>{new Date(Number(endTime) * 1000).toString()}</strong>
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
                      {(timeLeft > 0) ? (
                        <strong>{getDateDiffText(getUnixTimestamp(), Number(endTime) + 31 * 24 * 60 * 60)}</strong>
                      ) : (
                        <strong>{`Freeze time is up. You can take the bank`}</strong>
                      )}
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
                      <div>
                        <span>{balanceInfo.normalized}</span><strong>{storageData.tokenInfo.symbol}</strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsRow}>
                    <SwitchNetworkAndCall
                      chainId={storageData.chainId}
                      onClick={doBankWithdraw}
                      disabled={isBankWithdraw || (timeLeft > 0) || (lotteryStatus != "3")}
                      icon="money-bill-transfer"
                      action="Withdraw bank"
                      className={styles.adminButton}
                    >
                      {isBankWithdraw ? `Withdrawing lottery bank` : `Withdraw lottery bank`}
                    </SwitchNetworkAndCall>
                  </div>
                </div>
              ) : (
                <div>Fetching info...</div>
              )}
            </div>
          </div>
        </>
      )
    },
  }
}