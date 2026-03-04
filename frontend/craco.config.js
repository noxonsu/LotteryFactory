/**
 * CRACO config — adds webpack aliases so that webpack 4 (react-scripts 4)
 * can resolve @reown/appkit subpath exports (package.json "exports" field
 * is not supported by webpack 4).
 */
const path = require('path')

const appkitDist = path.resolve(__dirname, 'node_modules/@reown/appkit/dist/esm/exports')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Resolve @reown/appkit subpath exports for webpack 4
      webpackConfig.resolve = webpackConfig.resolve || {}
      webpackConfig.resolve.alias = webpackConfig.resolve.alias || {}

      Object.assign(webpackConfig.resolve.alias, {
        '@reown/appkit/react':         path.join(appkitDist, 'react.js'),
        '@reown/appkit/networks':      path.join(appkitDist, 'networks.js'),
        '@reown/appkit/core':          path.join(appkitDist, 'core.js'),
        '@reown/appkit/utils':         path.join(appkitDist, 'utils.js'),
        '@reown/appkit/constants':     path.join(appkitDist, 'constants.js'),
        '@reown/appkit/auth-provider': path.join(appkitDist, 'auth-provider.js'),
        // Main entrypoint LAST (most specific first)
        '@reown/appkit':               path.join(appkitDist, 'index.js'),
      })

      return webpackConfig
    },
  },
}
