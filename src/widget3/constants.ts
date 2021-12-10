export default {
  networks: {
    mainnet: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    ropsten: 'https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
    kovan: 'https://kovan.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  },
  ids: {
    timerRoot: 'farmfactory-timer-root',
    widgetRoot: 'farmfactory-widget-root',
    modalsRoot: 'farmfactory-modals-root',
    infoModalRoot: 'farmfactory-info-modal-root',
    widget: {
      root: 'farmfactory-widget-root',
      earned: 'farmfactory-widget-earned',
      staked: 'farmfactory-widget-staked',
      lpsButtons: 'farmfactory-widget-lps-buttons',
      harvestButton: 'farmfactory-widget-harvest-button',
      approveButton: 'farmfactory-widget-approve-button',
      depositButton: 'farmfactory-widget-deposit-button',
      withdrawButton: 'farmfactory-widget-withdraw-button',
    },
    depositForm: {
      title: 'farmfactory-deposit-title',
      input: 'farmfactory-deposit-input',
      cancelButton: 'farmfactory-deposit-cancel-button',
      depositButton: 'farmfactory-deposit-deposit-button',
    },
    withdrawForm: {
      title: 'farmfactory-withdraw-title',
      input: 'farmfactory-withdraw-input',
      cancelButton: 'farmfactory-withdraw-cancel-button',
      withdrawButton: 'farmfactory-withdraw-deposit-button',
    },
    infoModal: {
      closeButton: 'farmfactory-info-modal-close-button',
      cancelButton: 'farmfactory-info-modal-cancel-button',
    },
    wrongNetworkModal: {
      closeButton: 'farmfactory-wrong-network-modal-close-button',
    },
  }
}
