import getConfig from "next/config";

export function getCurrentDomain() {
  const { publicRuntimeConfig } = getConfig()
  if (publicRuntimeConfig && publicRuntimeConfig.DEV_DOMAIN) return publicRuntimeConfig.DEV_DOMAIN

  return window.location.hostname || document.location.host || ''
}