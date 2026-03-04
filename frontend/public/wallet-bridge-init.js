/**
 * LotteryFactory — MCW Apps Wallet Bridge auto-connect
 *
 * Activates ONLY when:
 *   1. URL contains ?walletBridge=swaponline
 *   2. Page is opened inside an iframe (window.parent !== window)
 *
 * Loads bridge client from swaponline.github.io, waits for handshake,
 * sets window.ethereum to the bridge provider so web3.js picks it up automatically.
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  if (params.get('walletBridge') !== 'swaponline' || window.parent === window) {
    return;
  }

  window.__bridgeActive = true;
  console.log('[LotteryFactory] Bridge mode: loading MCW bridge client');

  var BRIDGE_CLIENT_URL = 'https://swaponline.github.io/wallet-apps-bridge-client.js';

  function onBridgeLoaded() {
    if (!window.ethereum || !window.ethereum.isSwapWalletAppsBridge) {
      console.warn('[LotteryFactory Bridge] Provider not set after script load');
      window.__bridgeActive = false;
      return;
    }

    // Notify app when accounts change (connect / disconnect / switch)
    window.ethereum.on('accountsChanged', function (accounts) {
      document.dispatchEvent(new CustomEvent('wcAccountChanged', {
        detail: {
          address: accounts && accounts.length > 0 ? accounts[0] : null,
          isConnected: !!(accounts && accounts.length > 0),
        },
      }));
    });

    // Race-condition fix: fire immediately if already connected
    var preloaded = window.ethereum.selectedAddress;
    if (preloaded) {
      document.dispatchEvent(new CustomEvent('wcAccountChanged', {
        detail: { address: preloaded, isConnected: true },
      }));
    }

    console.log('[LotteryFactory Bridge] Bridge client ready, waiting for wallet handshake...');
  }

  var script = document.createElement('script');
  script.src = BRIDGE_CLIENT_URL;
  script.onload = onBridgeLoaded;
  script.onerror = function () {
    console.error('[LotteryFactory Bridge] Failed to load bridge client:', BRIDGE_CLIENT_URL);
    window.__bridgeActive = false;
  };
  document.head.appendChild(script);
})();
