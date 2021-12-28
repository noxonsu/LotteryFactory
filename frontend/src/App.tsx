import React, { lazy } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import useEagerConnect from 'hooks/useEagerConnect'
import useUserAgent from 'hooks/useUserAgent'
import useScrollOnRouteChange from 'hooks/useScrollOnRouteChange'
import { usePollBlockNumber } from 'state/block/hooks'
import { usePollCoreFarmData } from 'state/farms/hooks'
import { useFetchProfile } from 'state/profile/hooks'
import { DatePickerPortal } from 'components/DatePicker'
import GlobalStyle from './style/Global'
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import PageLoader from './components/Loader/PageLoader'
import history from './routerHistory'
import { ToastListener } from './contexts/ToastsContext'
import { StyleSheetManager } from 'styled-components'

import { useInactiveListener } from './hooks/useInactiveListener'

// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page
const Lottery = lazy(() => import('./views/Lottery'))
const NotFound = lazy(() => import('./views/NotFound'))

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {

  usePollBlockNumber()
  useEagerConnect()
  useFetchProfile()
  usePollCoreFarmData()
  useScrollOnRouteChange()
  useUserAgent()
  useInactiveListener()

  //  stylisPlugins={[stylisImportantPlugin]}
  return (
    <StyleSheetManager disableCSSOMInjection={true} target={document.getElementById('lottery-style-holder')}>
      <Router history={history}>
        <GlobalStyle />
        <SuspenseWithChunkError fallback={<PageLoader />}>
          <Switch>
            <Route path="/">
              <Lottery />
            </Route>
            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </SuspenseWithChunkError>
        <ToastListener />
        <DatePickerPortal />
      </Router>
    </StyleSheetManager>
  )
}

export default React.memo(App)
