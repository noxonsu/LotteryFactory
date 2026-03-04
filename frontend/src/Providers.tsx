import React from 'react'
import { ModalProvider, light, dark } from '@pancakeswap/uikit'
import { Web3ReactProvider } from '@web3-react/core'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { useThemeManager } from 'state/user/hooks'
import { getLibrary } from 'utils/web3React'
import { LanguageProvider } from 'contexts/Localization'
import { RefreshContextProvider } from 'contexts/RefreshContext'
import { ToastsProvider } from 'contexts/ToastsContext'
import store from 'state'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './appkit'

// Skip AppKit init in bridge mode (MCW iframe): appkit.ts was already imported
// above (side-effect: createAppKit + reconnect), but WagmiProvider still wraps
// the tree so wagmi hooks are available in both bridge mode and standalone mode.

const queryClient = new QueryClient()

const ThemeProviderWrapper = (props) => {
  const [isDark] = useThemeManager()
  return <ThemeProvider theme={isDark ? dark : light} {...props} />
}

const Providers: React.FC = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Provider store={store}>
            <ToastsProvider>
              <HelmetProvider>
                <ThemeProviderWrapper>
                  <LanguageProvider>
                    <RefreshContextProvider>
                      <ModalProvider>{children}</ModalProvider>
                    </RefreshContextProvider>
                  </LanguageProvider>
                </ThemeProviderWrapper>
              </HelmetProvider>
            </ToastsProvider>
          </Provider>
        </Web3ReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers
