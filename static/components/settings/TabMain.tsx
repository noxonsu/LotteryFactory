import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"
import fetchTokenInfo from "../../helpers/fetchTokenInfo"
import deployLottery from "../../helpers/deployLottery"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import FaIcon from "../FaIcon"

import adminFormRow from "../adminFormRow"

import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'
import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAIN_EXPLORER_LINK
} from "../../helpers/constants"
import checkLicenseKey from "../../helpers/payment/checkLicenseKey"

const CHAINS_LIST = (() => {
  const ret = Object.keys(AVAILABLE_NETWORKS_INFO).map((k) => {
    return {
      id: AVAILABLE_NETWORKS_INFO[k].networkVersion,
      title: AVAILABLE_NETWORKS_INFO[k].chainName,
    }
  })
  ret.unshift({
    id: 0,
    title: `Select Blockchain`,
  })
  return ret
})()

export default function TabMain(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
  } = options

  const [ newChainId, setNewChainId ] = useState(storageData?.chainId)
  const [ newLotteryContract, setNewLotteryContract ] = useState(storageData?.lotteryAddress)
  const [ newLotteryTokenAddress, setNewLotteryTokenAddress ] = useState(storageData?.tokenAddress)

  const [ isLotteryContractFetching, setIsLotteryContractFetching ] = useState(false)
  const [ isLotteryContractFetched, setIsLotteryContractFetched ] = useState(false)

  const [ isLotteryContractDeploying, setIsLotteryContractDeploying ] = useState(false)

  const [ isLotteryDeployOpened, setIsLotteryDeployOpened ] = useState(false)
  
  const [ newTokenInfo, setNewTokenInfo ] = useState(storageData?.tokenInfo)
  const [ isTokenFetching, setIsTokenFetching ] = useState(false)
  const [ isTokenFetched, setIsTokenFetched ] = useState(storageData.tokenInfo.address !== undefined)
  const [ isSaveToStorage, setIsSaveToStorage ] = useState(false)

  
  const doSaveToStorage = () => {
    openConfirmWindow({
      title: `Save to storage`,
      message: `Save changes to storage config?`,
      onConfirm: () => {
        setIsSaveToStorage(true)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction`)
          },
          onReady: () => {
            setIsSaveToStorage(false)
            addNotify(`Changed saved`, `success`)
          },
          onError: (err) => {
            setIsSaveToStorage(false)
            addNotify(`Fail save changes. ${err.message ? err.message : ''}`, `error`)
          },
          newData: {
            chainId: newChainId,
            tokenAddress: newLotteryTokenAddress,
            lotteryAddress: newLotteryContract,
            tokenInfo: newTokenInfo,
          }
        })
      }
    })
  }
  
  const doFetchTokenInfo = () => {
    if (newChainId) {
      setIsTokenFetched(false)
      setIsTokenFetching(false)
      setNewTokenInfo({})
      addNotify(`Fetching token info`)
      fetchTokenInfo(newLotteryTokenAddress, newChainId).then((_tokenInfo) => {
        setIsTokenFetching(false)
        setNewTokenInfo(_tokenInfo)
        setIsTokenFetched(true)
        addNotify(`Token info fetched`, `success`)
      }).catch((err) => {
        addNotify(`Fail fetch token info. ${err.message ? err.message : ''}`, `error`)
        setIsTokenFetching(false)
      })
    } else {
      addNotify(`Fail fetch. Select work chain first`, `error`)
    }
  }
  const doFetchLotteryInfo = () => {
  }

  const cancelDeploy = () => {
    setIsLotteryDeployOpened(false)
  }
  const openDeployLottery = () => {
    setIsLotteryDeployOpened(true)
  }

  const [ isLotteryDeploying, setIsLotteryDeploying ] = useState(false)
  
  const doDeployLotteryContract = () => {
    if (!newChainId) return addNotify(`Fail. Select work chain first`, `error`)
    if (!isTokenFetched) return addNotify(`Fail. Fetch token info first`, `error`)
    const {
      activeChainId,
      activeWeb3,
    } = getActiveChain()
    
    const activeChainInfo = CHAIN_INFO(activeChainId)
    if (newChainId
      && isTokenFetched
      && newLotteryTokenAddress
    ) {
      openConfirmWindow({
        title: `Deploying Lottery contract`,
        message: `Deploy Lottery contract at ${activeChainInfo.chainName} (${activeChainId})?`,
        onConfirm: () => {
          setIsLotteryContractDeploying(true)
          addNotify(`Deploying lottery. Confrirm transaction`)
          
          deployLottery({
            activeWeb3,
            tokenAddress: newLotteryTokenAddress,
            feeOn: !checkLicenseKey(`LOTTERY_FULL_VERSION`, storageData),
            onTrx: (hash) => {
              addNotify(`Lottery contract deploy TX ${hash}...`, `success`)
            },
            onSuccess: (newContractAddress) => {
              try {
                addNotify(`Lottery contract deployed. Now save settings`, `success`)
                setNewLotteryContract(newContractAddress)
                setIsLotteryContractDeploying(false)
                setIsLotteryDeployOpened(false)
              } catch (err) {
                console.log('>>> onSuccess error', err)
              }
            },
            onError: (err) => {
              addNotify(`Fail deploy Lottery contract. ${(err.message ? err.message : '')}`, `error`)
              setIsLotteryContractDeploying(false)
              console.log(err)
            }
          }).catch((err) => {
            setIsLotteryContractDeploying(false)
            addNotify(`Fail deploy Lottery contract. ${err.message ? err.message : ''}`, `error`)
          })
        }
      })
    }
  }

  return {
    render: () => {
      return (
        <>
          <div className={styles.adminForm}>
            <div className={styles.adminSectionDescription}>
              {`Main settings. The blockchain in which the lottery will work is indicated here, the token for buying tickets is indicated and the lottery contract is deployed`}
            </div>
            {adminFormRow({
              label: `Work blockchain ID`,
              type: `list`,
              desc: `Your lottery will run on this blockchain`,
              values: CHAINS_LIST,
              value: newChainId,
              onChange: setNewChainId
            })}
            {!isLotteryDeployOpened ? (
              <>
                {adminFormRow({
                  label: `Lottery contract`,
                  type: `address`,
                  value: newLotteryContract,
                  desc: `Set up the lottery contract by clicking the 'Deploy new' button, if this is your first time setting it up`,
                  onChange: setNewLotteryContract,
                  placeholder: `Enter address of lottery contract`,
                  buttons: (
                    <>
                      <button className={`${styles.adminSubButton}`} disabled={isLotteryContractFetching || isLotteryContractDeploying} onClick={doFetchLotteryInfo}>
                        {isLotteryContractFetching ? `Fetching info` : `Fetch Lottery contract info`}
                      </button>
                      <button className={`${styles.adminSubButton}`} disabled={isLotteryContractFetching || isLotteryContractDeploying} onClick={openDeployLottery}>
                        Deploy new Lottery contract
                      </button>
                    </>
                  )
                })}
                {isTokenFetched && newTokenInfo && newTokenInfo.address && (
                  <div className={styles.subFormInfo}>
                    <h3>Token for which users buy tickets</h3>
                    <div className={styles.subForm}>
                      <div className={styles.infoRow}>
                        <label>Address:</label>
                        <span>
                          <b>{newTokenInfo.address}</b>
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <label>Symbol:</label>
                        <span>
                          <b>{newTokenInfo.symbol}</b>
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <label>Name:</label>
                        <span>
                          <b>{newTokenInfo.name}</b>
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <label>Decimals:</label>
                        <span>
                          <b>{newTokenInfo.decimals}</b>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.subFormInfo}>
                  <h3>Deploy new Lottery contract options</h3>
                  <div className={styles.subForm}>
                    {adminFormRow({
                      label: `Lottery token`,
                      type: `address`,
                      desc: `This token will be used to purchase tickets and as a reward in your lottery`,
                      value: newLotteryTokenAddress,
                      onChange: setNewLotteryTokenAddress,
                      placeholder: `Ender address of lottery ERC20 token`,
                      buttons: (
                        <SwitchNetworkAndCall chainId={newChainId} className={styles.adminSubButton} disabled={isTokenFetching} onClick={doFetchTokenInfo} action={`Fetch token info`} >
                          {isTokenFetching ? `Fetching` : `Fetch token info`}
                        </SwitchNetworkAndCall>
                      )
                    })}
                    {isTokenFetched && newTokenInfo && newTokenInfo.address && (
                      <div className={styles.infoTable}>
                        <h3>Token info</h3>
                        <div className={styles.infoRow}>
                          <label>Symbol:</label>
                          <span>
                            <b>{newTokenInfo.symbol}</b>
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <label>Name:</label>
                          <span>
                            <b>{newTokenInfo.name}</b>
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <label>Decimals:</label>
                          <span>
                            <b>{newTokenInfo.decimals}</b>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.actionsRow}>
                    <SwitchNetworkAndCall chainId={newChainId} className={styles.adminSubButton} disabled={isLotteryContractDeploying} onClick={doDeployLotteryContract} action={`Deploy lottery contract`} >
                      {isLotteryContractDeploying ? `Deploying` : `Deploy Lottery contract`}
                    </SwitchNetworkAndCall>
                    <button className={`${styles.adminSubButton} ${styles.isCancel}`} disabled={isLotteryContractDeploying} onClick={cancelDeploy}>
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className={styles.actionsRowMain}>
              <SwitchNetworkAndCall chainId={`STORAGE`} icon="save" className={styles.adminMainButton} disabled={isSaveToStorage} onClick={doSaveToStorage} action={`Save changes`} >
                {isSaveToStorage ? `Saving...` : `Save to storage config`}
              </SwitchNetworkAndCall>
            </div>
          </div>
        </>
      )
    },
  }
}