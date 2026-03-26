/**
 * CRACO config — webpack 5 (react-scripts 5) compatibility fixes:
 * 1. fullySpecified: false — allows ESM modules (@tanstack/react-query v5,
 *    viem, wagmi) to omit file extensions in imports
 * 2. @reown/appkit aliases — resolve subpath exports explicitly
 */
const path = require('path')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix: ESM modules (@tanstack/react-query v5, viem, wagmi) use strict
      // ESM with "exports" field — webpack 5 requires fullySpecified: false
      // so imports like 'react/jsx-runtime' resolve without explicit .js extension
      webpackConfig.module = webpackConfig.module || {}
      webpackConfig.module.rules = [
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
        },
        ...(webpackConfig.module.rules || []),
      ]

      // Fix: bignumber.js v9 exports field doesn't expose ./bignumber subpath
      // Some old packages (e.g. @pancakeswap/sdk) import bignumber.js/bignumber directly
      webpackConfig.resolve = webpackConfig.resolve || {}
      webpackConfig.resolve.alias = webpackConfig.resolve.alias || {}
      webpackConfig.resolve.alias['bignumber.js/bignumber'] = require.resolve('bignumber.js')

      // Remove ModuleScopePlugin so alias resolution from node_modules works
      webpackConfig.resolve.plugins = (webpackConfig.resolve.plugins || []).filter(
        (p) => p.constructor && p.constructor.name !== 'ModuleScopePlugin'
      )

      // Fix: webpack 5 strict mode treats named exports from default-only modules as errors
      // Old packages like @pancakeswap/sdk import named exports from JSON/CJS modules
      webpackConfig.module = webpackConfig.module || {}
      webpackConfig.module.parser = webpackConfig.module.parser || {}
      webpackConfig.module.parser.javascript = webpackConfig.module.parser.javascript || {}
      webpackConfig.module.parser.javascript.importExportsPresence = 'warn'

      return webpackConfig
    },
  },
}
