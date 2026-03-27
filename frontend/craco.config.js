/**
 * CRACO config — webpack 5 (react-scripts 5) compatibility fixes:
 * 1. fullySpecified: false — allows ESM modules (@tanstack/react-query v5,
 *    viem, wagmi) to omit file extensions in imports
 */

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

      // Fix: allow the specific bignumber.js file in the ModuleScopePlugin allowlist
      // instead of removing the plugin entirely (which would allow importing ANY file outside src/)
      const moduleScopePlugin = (webpackConfig.resolve.plugins || []).find(
        (p) => p.constructor && p.constructor.name === 'ModuleScopePlugin'
      )
      if (moduleScopePlugin && moduleScopePlugin.allowedFiles) {
        moduleScopePlugin.allowedFiles.add(require.resolve('bignumber.js'))
      }

      // Fix: wagmi ESM dist files (e.g. hooks/useConnections.js) statically import
      // useSyncExternalStore from 'react'. React 17 doesn't export this symbol, so webpack 5
      // strict mode fails the build. Note: webpack 5 only supports importExportsPresence
      // globally (not per-rule), so we must set it here for the entire compilation.
      // Risk: other modules that import non-existent named exports will warn instead of error.
      // Mitigation: source code named imports from JSON are fixed to use default imports.
      webpackConfig.module.parser = webpackConfig.module.parser || {}
      webpackConfig.module.parser.javascript = webpackConfig.module.parser.javascript || {}
      webpackConfig.module.parser.javascript.importExportsPresence = 'warn'

      return webpackConfig
    },
  },
}
