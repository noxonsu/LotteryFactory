import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"

import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'


const useStateColor = useStateUri

export default function TabDesign(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageDesign,
  } = options

  const _lsPreviewMode = localStorage.getItem(`-lotery-preview-mode`)
  let _lsPreviewDesign = localStorage.getItem(`-lotery-preview-design`)
  try {
    _lsPreviewDesign = JSON.parse(_lsPreviewDesign)
    _lsPreviewDesign = {
      ...defaultDesign,
      ..._lsPreviewDesign,
    }
  } catch (e) {
    _lsPreviewDesign = defaultDesign
  }

  const [ isPreviewMode, setIsPreviewMode ] = useState(_lsPreviewMode !== null)

  const initialDesign = {
    ...defaultDesign,
    ...storageDesign,
  }

  console.log('initialDesign', initialDesign)
  const [ designValues, setDesignValues ] = useState(_lsPreviewMode ? _lsPreviewDesign : initialDesign)
  const [ isSaveDesign, setIsSaveDesign ] = useState(false)

  console.log('>>> designValues', designValues)
  const renderColor = (options) => {
    const {
      title,
      target,
      defValue,
    } = options

    const onChange = (newColor) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: newColor.hex,
        }
      })
    }

    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <InputColor
              initialValue={designValues[target] ? designValues[target] : defValue}
              onChange={onChange}
              placement="right"
            />
          </div>
        </span>
      </div>
    )
  }

  const renderUri = (options) => {
    const {
      title,
      target,
      placeholder,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              placeholder={placeholder}
              type="text" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            {iconButton({
              title: `Open in new tab`,
              href: designValues[target],
              target: `_blank`
            })}
          </div>
        </span>
      </div>
    )
  }

  const renderNumber = (options) => {
    const {
      title,
      target,
      unit,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              type="number" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            <strong>{unit}</strong>
          </div>
        </span>
      </div>
    )
  }

  const onPreviewDesign = () => {
    openConfirmWindow({
      title: `Switch to preview mode`,
      message: `Switch to preview mode? You can look changes before save`,
      onConfirm: () => {
        addNotify(`Preview mode on. Go to site for check it`, `success`)
        localStorage.setItem(`-nft-stake-preview-mode`, true)
        localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
        setIsPreviewMode(true)
      }
    })
  }

  const offPreviewDesign = () => {
    addNotify(`Preview mode turn off`, `success`)
    localStorage.removeItem(`-nft-stake-preview-mode`)
    localStorage.removeItem(`-nft-stake-preview-design`)
    setIsPreviewMode(false)
  }
  useEffect(() => {
    if (isPreviewMode) {
      localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
      localStorage.setItem(`-nft-stake-preview-utx`, getUnixTimestamp())
    }
  }, [designValues])

  const doSaveDesign = () => {
    const newDesign = designValues
    const newConfig = {
      design: newDesign
    }
    saveStorageConfig({
      onBegin: () => {
        addNotify(`Confirm transaction for save changed texts`)
      },
      onReady: () => {
        addNotify(`Texts successfull saved`, `success`)
      },
      onError: (err) => {
        addNotify(`Fail save texts`, `error`)
      },
      newData: newConfig
    })
  }

  const [ openedTabs, setOpenedTabs ] = useState({})

  const toggleTab = (tab) => {
    setOpenedTabs((prev) => {
      return {
        ...prev,
        [`${tab}`]: (prev[tab]) ? !prev[tab] : true,
      }
    })
  }

  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
            {toggleGroup({
              title: 'Base color',
              isOpened: openedTabs?.baseColors,
              onToggle: () => { toggleTab('baseColors') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Background color', target: 'backgroundColor' })}
                    {renderColor({ title: 'Text color', target: 'baseTextColor' })}
                    {renderColor({ title: 'Secondary', target: 'baseSecondaryColor', defValue: '#7645D9' })}
                    {renderColor({ title: 'Subtitle color', target: 'baseSubTitleColor', defValue: '#452A7A' })}
                  </div>
                </div>
              )
            })}
            {toggleGroup({
              title: 'Header settings',
              isOpened: openedTabs?.headerSection,
              onToggle: () => { toggleTab('headerSection') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Section title color', target: 'headerTitleColor' })}
                    {renderColor({ title: 'Background color 1', target: 'headerBgColor1', defValue: '#7645D9' })}
                    {renderColor({ title: 'Background color 2', target: 'headerBgColor2', defValue: '#452A7A' })}
                  </div>
                </div>
              )
            })}
            {toggleGroup({
              title: 'Buy tickets section',
              isOpened: openedTabs?.buyTicketsSection,
              onToggle: () => { toggleTab('buyTicketsSection') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Section title color', target: 'buyTicketTitleColor' })}
                    {renderColor({ title: 'Background color 1', target: 'buyTicketBgColor1', defValue: '#7645D9' })}
                    {renderColor({ title: 'Background color 2', target: 'buyTicketBgColor2', defValue: '#5121B1' })}
                  </div>
                </div>
              )
            })}
            {toggleGroup({
              title: 'Price section',
              isOpened: openedTabs?.priceSection,
              onToggle: () => { toggleTab('priceSection') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Section title color', target: 'priceSectionTitleColor', })}
                    {renderColor({ title: 'Background color 1', target: 'priceSectionBgColor1', defValue: '#313D5C' })}
                    {renderColor({ title: 'Background color 2', target: 'priceSectionBgColor2', defValue: '#3D2A54' })}
                  </div>
                </div>
              )
            })}
            {toggleGroup({
              title: 'Rounds history section',
              isOpened: openedTabs?.roundsHistory,
              onToggle: () => { toggleTab('roundsHistory') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Section title color', target: 'roundsHistoryTitleColor' })}
                    {renderColor({ title: 'Background color 1', target: 'roundsHistoryBgColor1', defValue: '#CBD7EF' })}
                    {renderColor({ title: 'Background color 2', target: 'roundsHistoryBgColor2', defValue: '#9A9FD0' })}
                  </div>
                </div>
              )
            })}
            {toggleGroup({
              title: 'How to play settings',
              isOpened: openedTabs?.howToPlay,
              onToggle: () => { toggleTab('howToPlay') },
              content: (
                <div className={styles.subFormInfo}>
                  <div className={styles.subForm}>
                    {renderColor({ title: 'Section title', target: 'howToPlayTitleColor'  })}
                    {renderColor({ title: 'Background color', target: 'howToPlayBgColor', defValue: '#ffffff' })}
                  </div>
                </div>
              )
            })}

            <div className={styles.actionsRowMain}>
              {isPreviewMode ? (
                <>
                  <button onClick={offPreviewDesign}>
                    Turn off preview mode
                  </button>
                </>
              ) : (
                <button onClick={onPreviewDesign}>
                  Turn on preview mode
                </button>
              )}
              <button onClick={doSaveDesign}>
                Save changes
              </button>
            </div>
        </div>
      )
    }
  }
}