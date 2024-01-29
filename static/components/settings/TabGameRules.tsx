import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import openInTab from "../openInTab"
import callLotteryMethod from "../../helpers/callLotteryMethod"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import {
  KYC_LINK,
  KYC_CONTRACTS,
  KYC_TYPE,
  KYC_WITH_ORACLE,
  KYC_ORACLE_BACKEND
} from "../../helpers/constants"
import fetchLotteryKyc from "../../helpers/fetchLotteryKyc"

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
  const [ newBuyTokenLink, setNewBuyTokenLink ] = useState(storageData.buyTokenLink)

  const onTicketPriceChange = (v) => {
    setIsTicketPriceError(false)
    try {
      v = parseFloat(v)
      if (v < 0) setIsTicketPriceError(true)
      if (v > 500000) setIsTicketPriceError(true)
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
    setIsBallsChanged(`${storageData.balls}` !== `${newCount}`)
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
            buyTokenLink: newBuyTokenLink,
          }
        })
      }
    })
  }

  /* ---- KYC ---- */
  const chainSupportKYC = KYC_CONTRACTS[storageData.chainId]
  const [ isKycLoading, setIsKycLoading ] = useState(true)
  const [ isContractWithKyc, setIsContractWithKyc ] = useState(false)
  const [ newKycEnabled, setNewKycEnabled ] = useState(0)
  const [ newKycOracle, setNewKycOracle ] = useState(``)
  const [ isSavingKycEnabled, setIsSavingKycEnabled ] = useState(false)
  const [ newKycVerifyLink, setNewKycVerifyLink ] = useState(storageData.kycVerifyLink)
  const [ isSavingKycVerifyLink, setIsSavingKycVerifyLink ] = useState(false)
  
  useEffect(() => {
    setIsKycLoading(true)
    if (storageData.lotteryAddress && storageData.chainId) {
      fetchLotteryKyc({
        chainId: storageData.chainId,
        contractAddress: storageData.lotteryAddress,
      }).then((kycStatus) => {
        if (kycStatus.support) {
          setIsContractWithKyc(true)
          setNewKycEnabled((kycStatus.enabled) ? 1 : 0)
        } else {
          setIsContractWithKyc(false)
        }
        setIsKycLoading(false)
      }).catch((err) => {
        setIsContractWithKyc(false)
        setIsKycLoading(false)
        console.log('>>> err', err)
      })
    }
  }, [storageData])
  
  const doSaveKycEnabled = () => {
    openConfirmWindow({
      title: 'Save changes to Lottery',
      message: 'Save new KYC verification rule?',
      onConfirm: () => {
        setIsSavingKycEnabled(true)
        const { activeWeb3 } = getActiveChain()
        addNotify(`Confirm transaction`)
        callLotteryMethod({
          activeWeb3,
          contractAddress: storageData.lotteryAddress,
          method: 'setKYCEnabled',
          args: [ (newKycEnabled == 1) ],
        }).then((res) => {
          setIsSavingKycEnabled(false)
          addNotify(`Changes saved`, `success`)
        }).catch((err) => {
          setIsSavingKycEnabled(false)
          addNotify(`Fail save KYC verification rule. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }
  
  const doSaveKycVerifyLink = () => {
    openConfirmWindow({
      title: `Save KYC verification settings`,
      message: `Save KYC verification settings to Storage?`,
      onConfirm: () => {
        setIsSavingKycVerifyLink(true)
        addNotify(`Saving KYC verification settings...`)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction`)
          },
          onReady: () => {
            setIsSavingKycVerifyLink(false)
            addNotify(`Changed saved`, `success`)
          },
          onError: (err) => {
            setIsSavingKycVerifyLink(false)
            addNotify(`Fail save changes. ${err.message ? err.message : ''}`, `error`)
          },
          newData: {
            kycVerifyLink: newKycVerifyLink,
            kycOracle: newKycOracle
          }
        })
      }
    })
  }
  
  const kycOracleSources = 'https://github.com/shendel/BABTKycMigrateOracle'
  /* ------------- */
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
            <h3>KYC settings</h3>
            {isKycLoading ? (
              <div className={styles.infoBlock}>
                <span>Loading KYC settings</span>
              </div>
            ) : (
              <>
                {!isContractWithKyc ? (
                  <div className={styles.warningBlock}>
                    <div>You are use old Lottery contract without support KYC verification</div>
                    <div>Deploy new version for enable it</div>
                  </div>
                ) : (
                  <>
                    {!chainSupportKYC && (
                      <div className={styles.warningBlock}>
                        <div>Selected blockchain not support KYC verification.</div>
                        <div>For more info contact <a href="https://t.me/onoutsupportbot" target="_blank">@onoutsupportbot</a></div>
                      </div>
                    )}
                    {chainSupportKYC && (
                      <>
                        <div className={styles.subForm}>
                          <div className={styles.infoRow}>
                            <label>
                              KYC Enabled:
                            </label>
                            <div>
                              <div>
                                <select value={newKycEnabled} onChange={(e) => { setNewKycEnabled(e.target.value) }}>
                                  <option value={0}>No</option>
                                  <option value={1}>Yes ({KYC_TYPE[storageData.chainId] || `Unknown`})</option>
                                </select>
                                <SwitchNetworkAndCall
                                  chainId={storageData.chainId}
                                  onClick={doSaveKycEnabled}
                                  disabled={isSavingKycEnabled}
                                  icon="save"
                                  action="Save KYC Rule"
                                  className={styles.adminButton}
                                >
                                  {isSavingKycEnabled ? `Saving...` : `Save KYC Rule`}
                                </SwitchNetworkAndCall>
                              </div>
                            </div>
                          </div>
                          <div className={styles.infoRow}>
                            <label>
                              <div className={styles.helpTooltip}>
                                <span>?</span>
                                <div>Link to KYC verification page. Leave blank for use default for selected blockchain</div>
                              </div>
                              Verify link:
                            </label>
                            <div>
                              <div>
                                <input type="text" value={newKycVerifyLink} onChange={(e) => { setNewKycVerifyLink(e.target.value) }} />
                              </div>
                              {KYC_LINK[storageData.chainId] && (
                                <span>
                                  Default link: {openInTab(KYC_LINK[storageData.chainId],KYC_LINK[storageData.chainId],KYC_LINK[storageData.chainId])}
                                </span>
                              )}
                              <div style={{flexDirection: 'row-reverse'}}>
                                <SwitchNetworkAndCall
                                  chainId={`STORAGE`}
                                  onClick={doSaveKycVerifyLink}
                                  disabled={isSavingKycVerifyLink}
                                  icon="save"
                                  action="Save"
                                  className={styles.adminButton}
                                >
                                  {isSavingKycVerifyLink ? `Saving link...` : `Save link to KYC verify page`}
                                </SwitchNetworkAndCall>
                              </div>
                            </div>
                          </div>
                        </div>
                        {KYC_WITH_ORACLE[storageData.chainId] && (
                          <div className={styles.infoRow}>
                            <label>
                              <div className={styles.helpTooltip}>
                                <span>?</span>
                                <div>Link to KYC Oracle backend</div>
                              </div>
                              Oracle API:
                            </label>
                            <div>
                              <div>
                                <input type="text" value={newKycOracle} onChange={(e) => { setNewKycOracle(e.target.value) }} />
                              </div>
                              {KYC_ORACLE_BACKEND[storageData.chainId] && (
                                <span>
                                  Default link: {openInTab(KYC_ORACLE_BACKEND[storageData.chainId],KYC_ORACLE_BACKEND[storageData.chainId],KYC_ORACLE_BACKEND[storageData.chainId])}
                                </span>
                              )}
                              <div>
                                <span>
                                  KYC Oracle sources and install instruction: {openInTab(kycOracleSources,kycOracleSources,kycOracleSources)}
                                </span>
                              </div>
                              <div style={{flexDirection: 'row-reverse'}}>
                                <SwitchNetworkAndCall
                                  chainId={`STORAGE`}
                                  onClick={doSaveKycVerifyLink}
                                  disabled={isSavingKycVerifyLink}
                                  icon="save"
                                  action="Save"
                                  className={styles.adminButton}
                                >
                                  {isSavingKycVerifyLink ? `Saving...` : `Save KYC Oracle Api`}
                                </SwitchNetworkAndCall>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <h3>Lottery rules</h3>
            <div className={styles.subForm}>
              <div className={styles.infoRow}>
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>The number of balls that will be drawn in your lottery. Number two to six</div>
                  </div>
                  Balls count:
                </label>
                <div>
                  <div>
                    <input type="number" min="2" max="6" step="1" value={newBallsCount} onChange={(e) => { onChangeBallsCount(e.target.value) }} />
                    <SwitchNetworkAndCall
                      chainId={storageData.chainId}
                      onClick={doSaveBallsCount}
                      disabled={isSaveBallsCount}
                      icon="save"
                      action="Save balls count"
                      className={styles.adminButton}
                    >
                      {isSaveBallsCount ? `Saving the number of balls in the lottery contract` : `Save the number of balls in the lottery contract`}
                    </SwitchNetworkAndCall>
                    {/*
                    {iconButton({
                      title: `Save to contract`,
                      onClick: doSaveBallsCount,
                      disabled: isSaveBallsCount,
                      icon: 'save',
                    })}
                    */}
                  </div>
                </div>
              </div>
            </div>
            <h3>Distribution of prizes %</h3>
            <div className={styles.subForm}>
              <h4>Distribute the winning percentage based on the number of matched balls</h4>
              <div className={styles.adminFieldDesc}>You can also use the "Equalize the remainder" button to distribute the remaining percentage in the desired field</div>
              {matchArray.map((match_count) => {
                return (
                  <div className={styles.infoRow} key={match_count}>
                    <label>
                      <div className={styles.helpTooltip}>
                        <span>?</span>
                        <div>The percentage of winnings from the bank when {match_count} number matches</div>
                      </div>
                      Match {match_count} ball:
                    </label>
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
                        <button className={styles.adminButton} onClick={() => { doFillUndist(match_count) }}>
                          <FaIcon icon="arrow-left" />
                          Equalize the remainder
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className={styles.infoRow}>
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>
                      {`The sum of all winning combinations is on top. This number must be equal to 100%`}
                    </div>
                  </div>
                  Sum:
                </label>
                <div>
                  <b>{newTotalSum}</b><strong>%</strong>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>
                      {`The amount of undistributed winnings from the field above. This number must be 0%`}
                    </div>
                  </div>
                  Undistributed:
                </label>
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
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>
                      <span>{`As an administrator, you have the option to set a service fee for each round of the lottery.`}</span>
                      <span>{`The service fee is transferred to your wallet address, and a portion of this fee, equal to 1/5 of the service fee, is deducted as the "onout.org" fee.`}</span>
                      <span>{`The "onout.org" fee can be removed by purchasing the premium version of the lottery service.`}</span>
                    </div>
                  </div>
                  Service fee (From 2 to 30):
                </label>
                <div>
                  <div>
                    <input type="number" min="2" max="30" value={newBurn} onChange={(e) => { setNewBurn(e.target.value) }} />
                    <strong>%</strong>
                  </div>
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
                      <strong>Price must be between 0.00000000001 and 500000</strong>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>
                  <div className={styles.helpTooltip}>
                    <span>?</span>
                    <div>
                      <span>{`Link to the service where users can buy your token to pay for tickets`}</span>
                    </div>
                  </div>
                  Buy Token link:
                </label>
                <div>
                  <div>
                    <input type="text" value={newBuyTokenLink} onChange={(e) => { setNewBuyTokenLink(e.target.value) }} />
                  </div>
                </div>
              </div>
              <div className={styles.actionsRow}>
                {isBallsChanged && (
                  <strong className={styles.hasError}>
                    Save balls count first!
                  </strong>
                )}
                <SwitchNetworkAndCall
                  chainId={`STORAGE`}
                  onClick={doSaveMatches}
                  disabled={isSaveMatches || isBallsChanged}
                  icon="save"
                  action="Save changes"
                  className={styles.adminSubButton}
                >
                  {isSaveMatches ? 'Saving...' : 'Save match rules, burn amount and ticket price'}
                </SwitchNetworkAndCall>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}