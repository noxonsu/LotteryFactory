export type State = {
  opts: {
    networkName: string
    wallet: {
      providerOptions: Record<string, Record<string, any>>
    }
  }
  web3: any
  account: any
}

let state: State = {
  opts: null,
  web3: null,
  account: null,
}

export const getState = () => state

export const setState = (newState: Partial<State>) => {
  state = {
    ...state,
    ...newState,
  }
}
