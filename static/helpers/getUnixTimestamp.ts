export const getUnixTimestamp = (timestamp = false) => {
  return Math.floor((new Date().getTime()) / 1000)
}