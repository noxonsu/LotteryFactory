import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import fetchLotteryStatus from "../../helpers/fetchLotteryStatus"
import { getDateDiffText } from "../../helpers/getDateDiffText"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"
import fetchTokenAllowance from "../../helpers/fetchTokenAllowance"
import approveToken from "../../helpers/approveToken"
import BigNumber from "bignumber.js"
import { toWei, fromWei } from "../../helpers/wei"
import sha256 from 'js-sha256'


const genSalt = () => {
  const result           = ''
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for ( var i = 0; i < 128; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export default function TabControl(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
    getStorageData,
  } = options

  const [ newDateEnd, setNewDateEnd ] = useState(false)
  const [ newTimeEnd, setNewTimeEnd ] = useState(false)
  const [ newRoundLength, setNewRoundLength ] = useState(false)
  const [ lotteryStatus, setLotteryStatus ] = useState(false)
  const [ currentRound, setCurrentRound ] = useState(false)

  const [ currentStage, setCurrentStage ] = useState(``)
  const [ bankAmount, setBankAmount ] = useState(0)
  const [ lotteryStart, setLotteryStart ] = useState(false)
  const [ lotteryEnd, setLotteryEnd ] = useState(false)
  const [ lotteryTimeleft, setLotteryTimeleft ] = useState(false)
  const [ lotteryNeedClose, setLotteryNeedClose ] = useState(false)

  useEffect(() => {
    if (newDateEnd && newTimeEnd) {
      const endUtx = (new Date(`${newDateEnd} ${newTimeEnd}`).getTime()) / 1000
      const _length = getDateDiffText(getUnixTimestamp(), endUtx)
      setNewRoundLength(_length)
    }
  }, [newDateEnd, newTimeEnd])

  const doFetchLotteryStatus = () => {
    
    if (storageData.chainId && storageData.lotteryAddress) {
      addNotify(`Fetching lottery status`)
      fetchLotteryStatus({
        chainId: storageData.chainId,
        contractAddress: storageData.lotteryAddress,
      }).then((lotteryStatus) => {
        addNotify(`Lottery status fetched`, `success`)
        setLotteryStatus(lotteryStatus)
        setCurrentRound(lotteryStatus.currentLotteryInfo)

      })
    }
  }

  useEffect(() => {
    // bank
    setLotteryNeedClose(false)
    const _bank = new BigNumber(currentRound.amountCollectedInCake)
      .div(new BigNumber(10).pow(storageData.tokenInfo.decimals))
      .toNumber()
    setBankAmount(_bank)

    setLotteryStart(new Date(parseInt( currentRound.startTime, 10) * 1000).toString())
    setLotteryEnd(new Date(parseInt( currentRound.endTime, 10) * 1000).toString())
    setLotteryTimeleft(getDateDiffText(getUnixTimestamp(),  parseInt( currentRound.endTime, 10) + 1 * 60))

    if (currentRound.status === "1"
      && (parseInt(currentRound.endTime, 10) - getUnixTimestamp() < 0)
    ) {
      setCurrentStage(`lottery_round`)
      setLotteryNeedClose(true)
    } else {
      if ((lotteryStatus.currentLotteryNumber !== "1") && (currentRound.status === "1")) {
        setCurrentStage(`lottery_round`)
      } else if (currentRound.status === "2") {
        setCurrentStage(`lottery_draw`)
      } else if (currentRound.status === "3") {
        setCurrentStage(`lottery_start`)
      }
    }
  }, [currentRound])

  useEffect(() => {
    doFetchLotteryStatus()
  }, [storageData])
  

  const [ isStartNewRound, setIsStartNewRound ] = useState(false)
  const doStartNewRound = () => {
    if (storageData?.tokenInfo?.decimals === undefined) {
      return addNotify(`Fail. No information about token. Fetch them first and return`, `error`)
    }
    if (!storageData?.ticketPrice) {
      return addNotify(`Fail. Ticket price not setted.`, `error`)
    }
    if (!storageData?.burn) {
      return addNotify(`Fail. Burn amount not setted`, `error`)
    }
    if (!newDateEnd || !newTimeEnd) {
      return addNotify(`Fail. Enter date of lottery round end`, `error`)
    }
    openConfirmWindow({
      title: `New round`,
      message: `Start new lottery round?`,
      onConfirm: () => {
        const ticketPrice = new BigNumber(storageData.ticketPrice).multipliedBy(
          10 ** storageData.tokenInfo.decimals
        ).toFixed()
        const treasuryFee = parseInt(storageData.burn * 100, 10)
        const winningPercents = [1,2,3,4,5,6].map((match_count) => {
          if (match_count <= storageData.balls) {
            return parseInt(
              parseFloat(
                storageData.matchRules[`match_${match_count}`]
              ) * 100,
              10
            )
          } else {
            return 0
          }
        })
        const lotteryEnd = new Date(`${newDateEnd} ${newTimeEnd}`).getTime() / 1000

        addNotify(`Starting new lottery round...`)
        setIsStartNewRound(true)
        const { activeWeb3 } = getActiveChain()
        callLotteryMethod({
          activeWeb3,
          contractAddress: storageData.lotteryAddress,
          method: 'startLottery',
          args: [
            lotteryEnd,
            ticketPrice,
            2000,
            winningPercents,
            treasuryFee,
          ],
        }).then((res) => {
          setIsStartNewRound(false)
          doFetchLotteryStatus()
          addNotify(`New lottery round started`, `success`)
        }).catch((err) => {
          setIsStartNewRound(false)
          addNotify(`Fail start new lottery round. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }

  const [ injectAmount, setInjectAmount ] = useState(0)
  const [ isInjectAmount, setIsInjectAmount ] = useState(false)

  const doInjectAmount = () => {
    openConfirmWindow({
      title: `Inject lotery bank amount`,
      message: `Add ${injectAmount} ${storageData?.tokenInfo.symbol} to the pot of the lottery round?`,
      onConfirm: () => {
        setIsInjectAmount(true)
        const weiAmount = toWei(injectAmount)
        const chainInfo = getActiveChain()
        addNotify(`Inject bank. Check allovance`)
        fetchTokenAllowance({
          ownerAddress: chainInfo.activeAccount,
          tokenAddress: storageData?.tokenAddress,
          chainId: storageData?.chainId,
          approveFor: storageData?.lotteryAddress
        }).then((allowance) => {
          const _doInject = () => {
            addNotify(`Injecting round bank. Confirm transaction`)
            callLotteryMethod({
              activeWeb3: chainInfo.activeWeb3,
              contractAddress: storageData.lotteryAddress,
              method: 'injectFunds',
              args: [
                lotteryStatus.currentLotteryNumber,
                weiAmount
              ],
            }).then((res) => {
              setIsInjectAmount(false)
              doFetchLotteryStatus()
              addNotify(`The bank or round was replenished`, `success`)
            }).catch((err) => {
              setIsInjectAmount(false)
              addNotify(`Fail inject funds. ${err.message ? err.message : ''}`, `error`)
            })
          }
          if (new BigNumber(`${weiAmount}`).isGreaterThan(allowance)) {
            addNotify(`Inject bank. Need approve`)
            approveToken({
              activeWeb3: chainInfo.activeWeb3,
              chainId: storageData?.chainId,
              tokenAddress: storageData?.tokenAddress,
              approveFor: storageData?.lotteryAddress,
              weiAmount,
            }).then((isApproved) => {
              _doInject()
            }).catch((err) => {
              setIsInjectAmount(false)
              addNotify(`Fail approve for inject round bank. ${err.message ? err.message : ''}`, `error`)
            })
          } else {
            _doInject()
          }
        }).catch((err) => {
          setIsInjectAmount(false)
          addNotify(`Fail inject round bank. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }

  const [ isLotteryClosing, setIsLotteryClosing ] = useState(false)
  const onCloseLottery = () => {
    const chainInfo = getActiveChain()
    setIsLotteryClosing(true)
    addNotify(`Closing lottery round. Confirm transaction`)
    callLotteryMethod({
      activeWeb3: chainInfo.activeWeb3,
      contractAddress: storageData.lotteryAddress,
      method: 'closeLottery',
      args: [
        lotteryStatus.currentLotteryNumber,
      ],
    }).then((res) => {
      setIsLotteryClosing(false)
      doFetchLotteryStatus()
      addNotify(`Lottery round was closed`, `success`)
    }).catch((err) => {
      setIsLotteryClosing(false)
      addNotify(`Fail close lottery round. ${err.message ? err.message : ''}`, `error`)
    })
  }

  const [ drawNumbersSalt, setDrawNumbersSalt ] = useState(genSalt())
  const doGenerateSalt = () => {
    setDrawNumbersSalt(genSalt())
  }
  
  const [ isDrawingNumbers, setIsDrawingNumber ] = useState(false)
  
  const doDrawNumbers = () => {
    const lotteryRandSalt = genSalt()
    const calcedHash = sha256(`${lotteryRandSalt}${drawNumbersSalt}`)
    setIsDrawingNumber(true)
    addNotify(`Drawing winning numbers. Confirm transaction`)
    
    const chainInfo = getActiveChain()
    callLotteryMethod({
      activeWeb3: chainInfo.activeWeb3,
      contractAddress: storageData.lotteryAddress,
      method: 'drawFinalNumberAndMakeLotteryClaimable',
      args: [
        lotteryStatus.currentLotteryNumber,
        `0x${calcedHash}`,
        true
      ],
    }).then((res) => {
      setIsDrawingNumber(false)
      doFetchLotteryStatus()
      addNotify(`Winning numbers drawed!`, `success`)
    }).catch((err) => {
      setIsDrawingNumber(false)
      addNotify(`Fail draw winning numbers. ${err.message ? err.message : ''}`, `error`)
    })
  }

  return {
    render: () => {
      if (!storageData.lotteryAddress) {
        return (
          <div className={styles.errorBlock}>
            <span>Section not accessible</span>
            <span>Deploy and save the lottery contract first</span>
          </div>
        )
      }
      return (
        <div className={styles.adminForm}>
          {currentStage === `lottery_start` && (
            <div className={styles.subFormInfo}>
              <h3>Start new lottery round</h3>
              <div className={styles.subForm}>
                <div className={styles.infoRow}>
                  <label>Round end in:</label>
                  <div>
                    <div>
                      <input type="date" value={newDateEnd} onChange={(e) => { setNewDateEnd(e.target.value) }} />
                      <input type="time" value={newTimeEnd} onChange={(e) => { setNewTimeEnd(e.target.value) }} />
                      <strong>(min 5 minutes, max 31 days)</strong>
                    </div>
                    {newRoundLength && (
                      <div>
                        <strong>Round length is {newRoundLength}</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.actionsRow}>
                  <button disabled={isStartNewRound} onClick={doStartNewRound}>
                    {isStartNewRound ? `Starting new lottery round...` : `Start new round`}
                  </button>
                </div>
              </div>
            </div>
          )}
          {currentStage === `lottery_round` && (
            <div className={styles.subFormInfo}>
              <h3>Lottery round is running now</h3>
              <div className={styles.subForm}>
                <div className={styles.infoRow}>
                  <label>Round started:</label>
                  <div>
                    <div>
                      <strong>{lotteryStart}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Round ends:</label>
                  <div>
                    <div>
                      <strong>{lotteryEnd}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Time left:</label>
                  <div>
                    {!lotteryNeedClose ? (
                      <div>
                        <strong>{lotteryTimeleft}</strong>
                        <a className={styles.buttonWithIcon} onClick={doFetchLotteryStatus}>
                          <FaIcon icon="refresh" />
                          Fetch status
                        </a>
                      </div>
                    ) : (
                      <div>
                        <a className={styles.buttonWithIcon} onClick={onCloseLottery}>
                          {isLotteryClosing 
                            ? `Closing...`
                            : `Time is over. Click to close the round and proceed to calculating the winning combination`
                          }
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Round bank:</label>
                  <div>
                    <div>
                      <strong>{bankAmount} {storageData?.tokenInfo?.symbol}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Inject funds:</label>
                  <div>
                    <div>
                      <input type="number" min="0" step="0.01" value={injectAmount} onChange={(e) => { setInjectAmount(e.target.value) }} />
                      <strong>{storageData?.tokenInfo?.symbol}</strong>
                      <a className={styles.buttonWithIcon} onClick={doInjectAmount}>
                        <FaIcon icon="add" />
                        Approve and add to round bank
                      </a>
                    </div>
                    <div>
                      <strong>You can add some amount of tokens to bank of current lottery round</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStage === `lottery_draw` && (
            <div className={styles.subFormInfo}>
              <h3>The lottery round is over. You need to calculate the winning combination</h3>
              <div className={styles.infoRow}>
                <label>Uniq salt:</label>
                <div>
                  <div>
                    <input type="text" value={drawNumbersSalt} readOnly={true} />
                    <a className={styles.buttonWithIcon} onClick={doGenerateSalt}>
                      Generate rand
                    </a>
                  </div>
                </div>
              </div>
            <div className={styles.actionsRow}>
              <button disabled={isDrawingNumbers} onClick={doDrawNumbers}>
                {isDrawingNumbers ? `Calculate winning numbers` : `Calculate winning numbers`}
              </button>
            </div>
          </div>
          )}
        </div>
      )
    }
  }
}