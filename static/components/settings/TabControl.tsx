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
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"


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
          <div className={styles.adminSectionDescription}>
            {`This section is where the lottery rounds are managed. Start of a new round, end of the round and calculation of winning balls`}
          </div>
          {currentStage === `lottery_start` && (
            <div className={styles.subFormInfo}>
              <h3>Start new lottery round</h3>
              <div className={styles.adminSubFormDesc}>
                {`There are currently no rounds running. Start a new lottery round`}
              </div>
              <div className={styles.subForm}>
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>
                        <span>{`The date and time when the sale of tickets will be stopped and the lottery will enter the winning balls calculation mode.`}</span>
                        <span>{`The minimum round time is 5 minutes.`}</span>
                        <span>{`The maximum round time is 31 days.`}</span>
                      </div>
                    </div>
                    Round end in:
                  </label>
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
                  <SwitchNetworkAndCall
                    className={styles.adminSubButton}
                    onClick={doStartNewRound}
                    disabled={isStartNewRound}
                    chainId={storageData?.chainId}
                    action={`Start new round`}
                  >
                    {isStartNewRound ? `Starting new lottery round...` : `Start new lottery round`}
                  </SwitchNetworkAndCall>
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
                  
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>
                        <span>{`How much time is left until the end of the current round.`}</span>
                        <span>{`After this time, the sale of tickets will be terminated and the lottery will switch to the mode of calculating winning balls.`}</span>
                      </div>
                    </div>
                    Time left:
                  </label>
                  <div>
                    {!lotteryNeedClose ? (
                      <div>
                        <strong>{lotteryTimeleft}</strong>
                        <button className={styles.adminButton} onClick={doFetchLotteryStatus}>
                          <FaIcon icon="refresh" />
                          Fetch status
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.helpTooltip}>
                          <span>?</span>
                          <div>
                            <span>{`The time for the round has passed.`}</span>
                            <span>{`You need to close the lottery and move on to generating winning balls`}</span>
                          </div>
                        </div>
                        <strong>Time is over. Close Lottery round.</strong>
                      </div>
                    )}
                  </div>
                </div>
                {lotteryNeedClose && (
                  <div className={styles.infoRow}>
                    <label>
                      <div className={styles.helpTooltip}>
                        <span>?</span>
                        <div>The time for the round has passed. You need to close the lottery and move on to generating winning balls
                          <span>{`Click "Close round" to proceed to the calculation of winning balls`}</span>
                        </div>
                      </div>
                      Close Lottery round:
                    </label>
                    <div>
                      <div>
                        <SwitchNetworkAndCall
                          chainId={storageData?.chainId}
                          action={`Close round`}
                          onClick={onCloseLottery}
                          disabled={isLotteryClosing}
                          className={styles.adminButton}
                        >
                          {isLotteryClosing 
                            ? `Closing...`
                            : `Close Lottery round`
                          }
                        </SwitchNetworkAndCall>
                      </div>
                    </div>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <label>
                    <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>
                        <span>{`How many tokens are raffled off in the current round.`}</span>
                        <span>{`If you wish, you can increase the amount of tokens in the bank.`}</span>
                        <span>{`To do this, use the "Inject lotery bank funds" section below.`}</span>
                      </div>
                    </div>
                    Round bank:
                  </label>
                  <div>
                    <div>
                      <strong>{bankAmount} {storageData?.tokenInfo?.symbol}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>
                     <div className={styles.helpTooltip}>
                      <span>?</span>
                      <div>
                        <span>{`In this section, you can add tokens to the bank of the current lottery round.`}</span>
                        <span>{`The added tokens will be distributed among the winning tickets.`}</span>
                        <span>{`Unallocated tokens will be transferred to the general lottery bank and raffled off in the next rounds`}</span>
                      </div>
                    </div>
                    Inject lotery bank funds:
                  </label>
                  <div>
                    <div>
                      <input type="number" min="0" step="0.01" value={injectAmount} onChange={(e) => { setInjectAmount(e.target.value) }} />
                      <strong>{storageData?.tokenInfo?.symbol}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label></label>
                  <div>
                    <div>
                      <SwitchNetworkAndCall
                        className={styles.adminButton}
                        onClick={doInjectAmount}
                        chainId={storageData?.chainId}
                        action={`Add tokens to lottery bank`}
                        icon="add"
                      >
                        Approve and add to round bank
                      </SwitchNetworkAndCall>
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
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>
                      <span>{`A unique randomly generated string that will be used as a salt during the calculation of winning balls.`}</span>
                      <span>{`The uniqueness of this string guarantees protection against fraud by users.`}</span>
                    </div>
                  </div>
                  Uniq salt:
                </label>
                <div>
                  <div>
                    <input type="text" value={drawNumbersSalt} readOnly={true} />
                    <button className={styles.adminButton} onClick={doGenerateSalt}>
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            <div className={styles.actionsRow}>
              <SwitchNetworkAndCall
                className={styles.adminButton}
                onClick={doDrawNumbers}
                disabled={isDrawingNumbers}
                chainId={storageData?.chainId}
                action={`Calculate winning number`}
              >
                {isDrawingNumbers ? `Calculate winning numbers` : `Calculate winning numbers`}
              </SwitchNetworkAndCall>
            </div>
          </div>
          )}
        </div>
      )
    }
  }
}