import React from 'react'
import { useLocation } from 'react-router'
import { Menu as UikitMenu } from '@pancakeswap/uikit'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'
import PhishingWarningBanner from 'components/PhishingWarningBanner'
import useTheme from 'hooks/useTheme'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { usePhishingBannerManager } from 'state/user/hooks'
import config from './config/config'
import UserMenu from './UserMenu'
import GlobalSettings from './GlobalSettings'
import { getActiveMenuItem, getActiveSubMenuItem } from './utils'
import { footerLinks } from './config/footerConfig'
import styled from 'styled-components'

const MenuHolder = styled.div`
  display: flex;
  border-bottom: 2px solid #CCCCCC;
  justify-content: space-between;
  padding: 5px;
  padding-top: 5px;
  padding-bottom: 2px;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  background: #FFF;
  z-index: 10;
`

const NavHolder = styled.div`
  display: flex;
  vertical-align: middle;
  line-height: 36px;
`

const NavItem = styled.a`
  font-size: 14pt;
  color: #000000;
  padding-left: 10px;
  padding-right: 10px;
  :hover {
    color: #0c4183;
  }
`

const Logo = styled.a`
  text-decoration: none;
  height: 40px;
  img {
    display: block;
    width: auto;
    height: 40px;
  }
`

const Menu = (props) => {
  const { isDark, toggleTheme } = useTheme()
  const cakePriceUsd = usePriceCakeBusd()
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useLocation()
  const [showPhishingWarningBanner] = usePhishingBannerManager()

  const activeMenuItem = getActiveMenuItem({ menuConfig: config(t), pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

  const pageMenu = window?.SO_LotteryConfig?.menu
  const logoUrl = window?.SO_LotteryConfig?.logo
  
  return (
    <MenuHolder className={`mainMenu`}>
      <NavHolder>
        <Logo href="/">
          <img src={logoUrl} />
        </Logo>
        {pageMenu && (
          <nav>
            {pageMenu.map((menuItem) => {
              return (
                <NavItem href={menuItem.link} target={menuItem.blank ? `_blank` : `_self`}>{menuItem.title}</NavItem>
              )
            })}
          </nav>
        )}
      </NavHolder>
      <UserMenu />
    </MenuHolder>
  )
  
  return (
    <UikitMenu
      userMenu={<UserMenu />}
      globalMenu={<GlobalSettings />}
      banner={false}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={currentLanguage.code}
      langs={languageList}
      setLang={setLanguage}
      cakePriceUsd={cakePriceUsd.toNumber()}
      links={[]}
      footerLinks={[]}
      activeItem={activeMenuItem?.href}
      activeSubItem={activeSubMenuItem?.href}
      buyCakeLabel={t('Buy CAKE')}
      {...props}
    />
  )
}

export default Menu
