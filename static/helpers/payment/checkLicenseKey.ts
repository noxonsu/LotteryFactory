import generateKey from "./generateKey"

export default function checkLicenseKey(purchaseKey, storageData) {
  const validKey = generateKey(purchaseKey, storageData.owner)
  return storageData.licenseKeys.indexOf(validKey) !== -1
}