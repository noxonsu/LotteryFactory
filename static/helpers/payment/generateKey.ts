import crypto from "crypto"

const generateKey = (PurchaseKey, owner) => {
  const hash = crypto
    .createHash('md5')
    .update(`${owner}-${PurchaseKey}`)
    .digest("hex")
    .toUpperCase()
  const key = `${hash.slice(0,8)}-${hash.slice(8,16)}-${hash.slice(16,24)}-${hash.slice(24)}`
  return key
}

export default generateKey