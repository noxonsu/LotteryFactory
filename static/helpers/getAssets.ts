export const getAssets = (url, assetKey) => {
  return `/_MYAPP/assets/${url}`
}

export const getResource = (url, resType, assetKey) => {
  return `/_MYAPP/` + (resType ? `{resType}/` : ``) + `${url}`
}