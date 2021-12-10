type Opts = {
  onStartLoading: () => void
  onFinishLoading: () => void
  onError: (error: Error) => void
}

export type State = {
  opts: Opts
  web3: any
  account: any
}

let state: State = {
  opts: null,
  web3: null,
  account: null,
}

export const getState = (): State => state

export const setState = (newState: Partial<State>) => {
  state = {
    ...state,
    ...newState,
  }
}
