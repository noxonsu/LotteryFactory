import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import navBlock from "../components/navBlock"
import adminFormRow from "../components/adminFormRow"
import TabDesign from "../components/settings/TabDesign"
import TabMain from "../components/settings/TabMain"
import TabGameRules from "../components/settings/TabGameRules"
import TabControl from "../components/settings/TabControl"
import TabTexts from "../components/settings/TabTexts"


import useStorage from "../storage/"
import { useEffect, useState } from "react"
import {
  setupWeb3,
  switchOrAddChain,
  doConnectWithMetamask,
  isMetamaskConnected,
  getCurrentChainId,
  onBlockchainChanged,
} from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"

import { getStorageInfo } from "../storage"
import STORAGE_JSON from "../contracts/Storage.json"
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import fetchTokenInfo from "../helpers/fetchTokenInfo"
import fetchTokenBalance from "../helpers/fetchTokenBalance"

import delay from "../helpers/delay"
import { toWei, fromWei } from "../helpers/wei"
import openInTab from "../components/openInTab"
import { textsGroups } from "../helpers/textsGroups"


import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAIN_EXPLORER_LINK
} from "../helpers/constants"

const settingsTabs = {
  main: `Main settings`,
  gamerules: `Rules`,
  rounds: `Rounds`,
  texts: `Edit texts`,
  design: `Design`,
}

const debugLog = (msg) => { console.log(msg) }

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

const Settings: NextPage = (props) => {
  const {
    storageChainId,
    storageAddress
  } = getStorageInfo()

  const {
    storageData,
    storageIsLoading,
    isOwner,
    openConfirmWindow,
    addNotify,
    setDoReloadStorage,
    setDoReloadStorageFast,
    storageTexts,
    storageDesign,
  } = props

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)
  const [isWalletConecting, setIsWalletConnecting] = useState(false)

  const processError = (error, error_namespace) => {
    let metamaskError = false
    try {
      metamaskError = error.message.replace(`Internal JSON-RPC error.`,``)
      metamaskError = JSON.parse(metamaskError)
    } catch (e) {}
    const errMsg = (metamaskError && metamaskError.message) ? metamaskError.message : error.message
    
    switch (errMsg) {
      case `execution reverted: You don't own this token!`:
        console.log(`You dont own this token`)
        break;
      case `MetaMask Tx Signature: User denied transaction signature.`:
        console.log('Transaction denied')
        break;
      case `execution reverted: ERC721: invalid token ID`:
        console.log('Invalid token ID')
        break;
      default:
        console.log('Unkrnown error', error.message)
        break;
    }
  }

  const onNetworkChanged = (newActiveChainId) => {
    setActiveChainId(newActiveChainId)
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${storageChainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _storageContract = new activeWeb3.eth.Contract(STORAGE_JSON.abi, storageAddress)
        setStorageContract(_storageContract)
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    } else {
      const _isConnected = await isMetamaskConnected()
      if (_isConnected) {
        connectWithMetamask()
      }
    }
  }

  useEffect(() => {
    debugLog('on useEffect activeWeb3 initOnWeb3Ready')
    initOnWeb3Ready()
  }, [activeWeb3])


  const connectWithMetamask = async () => {
    doConnectWithMetamask({
      onBeforeConnect: () => { setIsWalletConnecting(true) },
      onSetActiveChain: setActiveChainId,
      onConnected: (cId, web3) => {
        setActiveWeb3(web3)
        onBlockchainChanged(onNetworkChanged)
        setIsWalletConnecting(false)
      },
      onError: (err) => {
        console.log(">>>> connectWithMetamask", err)
        processError(err)
        setIsWalletConnecting(false)
      },
      needChainId: storageChainId,
    })
  }
  /* ---------------------------- END WEB3 CONNECT --------- */

  const [storageContract, setStorageContract] = useState(false)
  const [isStorageSave, setIsStorageSave] = useState(false)


  const saveStorageConfig = async (options) => {
    const {
      onBegin,
      onReady,
      onError,
      newData,
    } = options

    if (isStorageSave) {
      addNotify(`Storage already saving...`, `error`)
      return
    }
    const _newStorageData = {
      ...storageData,
      ...newData,
    }
    console.log('>> save data', _newStorageData)
    const _doSave = async () => {
      if (address && storageContract) {
        addNotify(`Saving config to storage. Confirm transaction`)
        setIsStorageSave(true)
        if (onBegin) onBegin()

        const saveData = _newStorageData

        try {
          const setupTxData = await calcSendArgWithFee(
            address,
            storageContract,
            "setKeyData",
            [
              getCurrentDomain(),
              {
                owner: address,
                info: JSON.stringify(saveData)
              }
            ]
          )
          
          storageContract.methods.setKeyData(
            getCurrentDomain(),
            {
              owner: address,
              info: JSON.stringify(saveData)
            }
          ).send(setupTxData).then(() => {
            setIsStorageSave(false)
            setDoReloadStorageFast(true)
            if (onReady) onReady()
          }).catch((e) => {
            console.log('>>> error', e)
            setIsStorageSave(false)
            if (onError) onError(e)
          })
        } catch (e) {
          console.log('>>> error', e)
          setIsStorageSave(false)
          if (onError) onError(e)
        }
      } else {
        addNotify(`Fail save storage. No active wallet or contract not ready yet`, `error`)
      }
    }
    console.log('>> do save', getCurrentChainId() !== storageChainId, getCurrentChainId(), storageChainId)
    if (!getCurrentChainId(storageChainId)) {
      const storageChainInfo = CHAIN_INFO(storageChainId)
      openConfirmWindow({
        title: `Need change active chain for save main config`,
        message: `Please change network Storage chain (${storageChainInfo.chainName})`,
        onConfirm: async () => {
          addNotify(`Switching to Storage chain`)
          await switchOrAddChain(storageChainId)
          await delay(2000)
          _doSave()
        },
        okLabel: `Switch`,
      })
    } else {
      _doSave()
    }
  }

  const getActiveChain = () => {
    return {
      activeAccount: address,
      activeChainId,
      activeWeb3,
    }
  }

  let showInstallBox = (storageData && !storageData.isInstalled)

  const [isInstalledOnDomain, setIsInstalledOnDomain] = useState(!showInstallBox)
  const [isSettingUpOnDomain, setIsSettingUpOnDomain] = useState(false)
  const doSetupOnDomain = () => {
    saveStorageConfig({
      onBegin: () => {
        setIsSettingUpOnDomain(true)
        addNotify(`Confirm transaction for setup Lottery on this domain`)
      },
      onReady: async () => {
        setIsSettingUpOnDomain(false)
        setIsInstalledOnDomain(true)
        addNotify(`Lottery successfull installed on this domain. Now you can configure farm`, `success`)
        setDoReloadStorage(true)
      },
      onError: (err) => {
        setIsSettingUpOnDomain(false)
        addNotify(`Fail setup Lottery on domain`, `error`)
      },
      newData: {
        isInstalled: true,
      }
    })
  }

  const [activeTab, setActiveTab] = useState(`main`)

  /* -------------- MAIN TAB ---------------------*/
  const [ newChainId, setNewChainId ] = useState(storageData?.chainId || 0)


  useEffect(() => {
    if (storageData) {
      setNewChainId(storageData.chainId)
    }
  }, [storageData])
  const doSetChainId = (chainId) => {
    setNewChainId(chainId)
  }
  /* ----- */

  const doSaveMainConfig = () => {
    const newConfig = {
      chainId: newChainId,
    }
    saveStorageConfig({
      onBegin: () => {
        setIsSettingUpOnDomain(true)
        addNotify(`Confirm transaction for save main config`)
      },
      onReady: () => {
        setIsSettingUpOnDomain(false)
        setIsInstalledOnDomain(true)
        addNotify(`Lottery main config successfull saved`, `success`)
      },
      onError: (err) => {
        setIsSettingUpOnDomain(false)
        addNotify(`Fail save main config`, `error`)
      },
      newData: newConfig
    })
  }

  

  const renderMainTab = () => {
    return (
      <div className={styles.adminForm}>
        <div className={styles.adminFormBottom}>
          <button disabled={isStorageSave} className={`${styles.mainButton} primaryButton`} onClick={doSaveMainConfig} >
            Save changes
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------------------- */
  const renderActiveChainInfo = () => {
    const chainInfo = CHAIN_INFO(activeChainId)
    const storageChainInfo = CHAIN_INFO(storageChainId)

    return (
      <div className={styles.adminActiveChainInfo}>
        <span>
          Current active network is <b>{chainInfo?.chainName || `Unknown`} ({activeChainId})</b>
        </span>
        <span>
          Main config storage network is <b>{storageChainInfo?.chainName || `Unknown`} ({storageChainId})</b>
        </span>
      </div>
    )
  }
  /* -------------------------------------------- */
  //console.log('>>> storageData', storageData, showInstallBox, (storageData && !storageData.isInstalled), !isInstalledOnDomain)

  const getStorageData = () => {
    return storageData
  }

  const _tabSettings = {
    setDoReloadStorage,
    setDoReloadStorageFast,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageChainId,
    storageData,
    getStorageData,
    storageDesign,
    storageTexts,
  }

  const tabMain = new TabMain(_tabSettings)
  const tabGameRules = new TabGameRules(_tabSettings)
  const tabControl = new TabControl(_tabSettings)
  const tabTexts = new TabTexts(_tabSettings)
  const tabDesign = new TabDesign(_tabSettings)
    
  if (isInstalledOnDomain) showInstallBox = false
  return (
    <div className={styles.container}>
      {navBlock(`settings`, true)}
      <h1 className={styles.h1}>Settings</h1>
      {storageData !== null && (
        <>
          {(showInstallBox) ? (
            <>
              <h2>Application need setup on this domain</h2>
              {!address ? (
                <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
                  {isWalletConecting ? `Connecting` : `Connect Wallet`}
                </button>
              ) : (
                <>
                  {renderActiveChainInfo()}
                  <button disabled={isSettingUpOnDomain} className={`${styles.mainButton} ${styles.autoWidth} primaryButton`} onClick={doSetupOnDomain}>
                    {isSettingUpOnDomain ? `Setup on domain...` : `Setup Lottery on this domain`}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {!address ? (
                <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
                  {isWalletConecting ? `Connecting` : `Connect Wallet`}
                </button>
              ) : (
                <>
                  {isOwner ? (
                    <>
                      {renderActiveChainInfo()}
                      <ul className={styles.settingsTabsNav}>
                        {Object.keys(settingsTabs).map((tabKey) => {
                          return (
                            <li onClick={() => { setActiveTab(tabKey) }} key={tabKey} className={(tabKey === activeTab) ? styles.activeTab : ``}>
                              {settingsTabs[tabKey]}
                            </li>
                          )
                        })}
                      </ul>
                      <hr className={`${styles.divider} ${styles.spacerTop}`} />
                      {/* -------------------------------------------------*/ }
                      {activeTab === `main` && tabMain.render()}
                      {activeTab === `gamerules` && tabGameRules.render()}
                      {activeTab === `rounds` && tabControl.render()}
                      {activeTab === `texts` && tabTexts.render()}
                      {activeTab === `design` && tabDesign.render()}
                    </>
                  ) : (
                    <h2>Access denied</h2>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Settings;
