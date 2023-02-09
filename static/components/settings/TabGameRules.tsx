import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"


export default function TabGameRules(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
    getStorageData,
  } = options

  const [ newTotalSum, setNewTotalSum ] = useState(0)
  const [ newUndist, setNewUndist ] = useState(0)
  const [ newBallsCount, setNewBallsCount ] = useState(0)
  const [ isBallsChanged, setIsBallsChanged ] = useState(false)
  const [ newTicketPrice, setNewTicketPrice ] = useState(storageData.ticketPrice)
  const [ isTicketPriceError, setIsTicketPriceError ] = useState(false)
  const [ isTicketPriceChanged, setIsTicketPriceChanged ] = useState(false)

  const onTicketPriceChange = (v) => {
    setIsTicketPriceError(false)
    try {
      v = parseFloat(v)
      if (v < 0) setIsTicketPriceError(true)
      if (v > 50) setIsTicketPriceError(true)
    } catch (e) {
      setIsTicketPriceError(true)
    }
    setNewTicketPrice(v)
    setIsTicketPriceChanged(storageData.ticketPrice !== v)
  }

  useEffect(() => {
    if (storageData.lotteryAddress && storageData.chainId) {
      callLotteryMethod({
        isCall: true,
        chainId: storageData.chainId,
        contractAddress: storageData.lotteryAddress,
        method: 'numbersCount',
        args: []
      }).then((_count) => {
        onChangeBallsCount(_count)
      })
    }
  }, [storageData])
  
  const [ newMatchRules, setNewMatchRules ] = useState(storageData.matchRules || {
    match_1: 39.2,
    match_2: 58.8,
    match_3: 6.125,
    match_4: 12.25,
    match_5: 24.5,
    match_6: 49,
  })
  const [ matchArray, setMatchArray ] = useState([1,2,3,4,5,6])
  const [ isSaveBallsCount, setIsSaveBallsCount ] = useState(false)
  const [ isSaveMatches, setIsSaveMatches ] = useState(false)

  const [ newBurn, setNewBurn ] = useState(storageData.burn)

  const onChangeBallsCount = (newCount) => {
    if (newCount<2) newCount = 2
    if (newCount>6) newCount = 6
    setNewBallsCount(newCount)
    //setIsBallsChanged(storageData.balls !== newCount)
    setMatchArray((prev) => {
      return [1,2,3,4,5,6].filter((matchCount) => matchCount <= parseInt(newCount) )
    })
  }

  const doRecalcSum = () => {
    let _totalSum = 0
    for(let match_count = 1; match_count <= 6; match_count++) {
      if (match_count <= newBallsCount) _totalSum = _totalSum + newMatchRules[`match_${match_count}`]
    }
    setNewTotalSum(_totalSum)
    setNewUndist(100 - _totalSum)
  }

  useEffect(() => {
    doRecalcSum()
  }, [newBallsCount, newMatchRules ])

  const doFillUndist = (ballsCount) => {
    setNewMatchRules((prev) => {
      return {
        ...prev,
        [`match_${ballsCount}`]: prev[`match_${ballsCount}`] + newUndist,
      }
    })
  }

  
  const doSaveBallsCount = () => {
    openConfirmWindow({
      title: 'Save changes to Lottery',
      message: 'Save new count of balls?',
      onConfirm: () => {
        setIsSaveBallsCount(true)
        const { activeWeb3 } = getActiveChain()
        addNotify(`Confirm transaction`)
        callLotteryMethod({
          activeWeb3,
          contractAddress: storageData.lotteryAddress,
          method: 'setNumbersCount',
          args: [ newBallsCount ],
        }).then((res) => {
          setIsSaveBallsCount(false)
          setIsBallsChanged(false)
          addNotify(`Changes saved`, `success`)
        }).catch((err) => {
          setIsSaveBallsCount(false)
          addNotify(`Fail save balls count. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }

  const doSaveMatches = () => {
    openConfirmWindow({
      title: `Save match rules`,
      message: `Save winning balls match rules, burn amount and ticket price to storage config?`,
      onConfirm: () => {
        setIsSaveMatches(true)
        addNotify(`Saving winning rules...`)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction`)
          },
          onReady: () => {
            setIsSaveMatches(false)
            addNotify(`Changed saved`, `success`)
          },
          onError: (err) => {
            setIsSaveMatches(false)
            addNotify(`Fail save changes. ${err.message ? err.message : ''}`, `error`)
          },
          newData: {
            matchRules: newMatchRules,
            burn: newBurn,
            balls: newBallsCount,
            ticketPrice: newTicketPrice,
          }
        })
      }
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
          <div className={styles.subFormInfo}>
            <h3>Lottery rules</h3>
            <div className={styles.subForm}>
              <div className={styles.infoRow}>
                <label>Balls count:</label>
                <div>
                  <div>
                    <input type="number" min="2" max="6" step="1" value={newBallsCount} onChange={(e) => { onChangeBallsCount(e.target.value) }} />
                    {iconButton({
                      title: `Save to contract`,
                      onClick: doSaveBallsCount,
                      disabled: isSaveBallsCount,
                      icon: 'save',
                    })}
                  </div>
                </div>
              </div>
            </div>
            <h3>Distribution of prizes %</h3>
            <div className={styles.subForm}>
              <h4>Distribute the winning percentage based on the number of matched balls</h4>
              {matchArray.map((match_count) => {
                return (
                  <div className={styles.infoRow} key={match_count}>
                    <label>Match {match_count} ball:</label>
                    <div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newMatchRules[`match_${match_count}`]}
                          onChange={(e) => {
                            let count = 0
                            try {
                              count = parseFloat(e.target.value)
                            } catch (e) { count = 0 }
                            if (count<0) count = 0
                            if (count>100) count = 100

                            setNewMatchRules((prev) => {
                              return {
                                ...prev,
                                [`match_${match_count}`]: count,
                              }
                            })
                          }}
                        />
                        <strong>%</strong>
                        <a className={styles.buttonWithIcon} onClick={() => { doFillUndist(match_count) }}>
                          <FaIcon icon="arrow-left" />
                          Equalize the remainder
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className={styles.infoRow}>
                <label>Burn (From 2 to 30):</label>
                <div>
                  <div>
                    <input type="number" min="2" max="30" value={newBurn} onChange={(e) => { setNewBurn(e.target.value) }} />
                    <strong>%</strong>
                  </div>
                  <div>How many percents of the band in a round will be burned</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Sum:</label>
                <div>
                  <b>{newTotalSum}</b><strong>%</strong>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Undistributed:</label>
                <div>
                  {(newUndist) !== 0 ? (
                    <>
                      <b className={styles.hasError}>
                        {newUndist} %
                      </b>
                    </>
                  ) : (
                    <>
                      <b>{newUndist}</b><strong>%</strong>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Ticket price:</label>
                <div>
                  <div>
                    <input type="number" step="0.1" min="0" value={newTicketPrice} onChange={(e) => { onTicketPriceChange(e.target.value) }} />
                    <strong>{storageData?.tokenInfo?.symbol}</strong>
                  </div>
                  {isTicketPriceError && (
                    <div className={styles.hasError}>
                      <strong>Price must be between 0.00000000001 and 50</strong>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.actionsRow}>
                {isBallsChanged && (
                  <strong className={styles.hasError}>
                    Save balls count first!
                  </strong>
                )}
                {/*disabled={isTicketPriceError || newUndist !== 0 || isSaveMatches || isBallsChanged || isTicketPriceChanged} */}
                <button
                  disabled={isSaveMatches}
                  onClick={doSaveMatches}
                >
                  {isSaveMatches ? 'Saving...' : 'Save match rules, burn amount and ticket price'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}