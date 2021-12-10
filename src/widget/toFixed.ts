const toFixed = (value) => {
  if (!value) {
    return value
  }

  if (/^\d+$/.test(value)) {
    return value
  }

  let newValue = Number(value).toFixed(5)

  if (/0\.00000/.test(newValue)) {
    newValue = Number(value).toFixed(8)
  }

  if (/0\.0000000/.test(newValue)) {
    return value
  }

  return newValue
}


export default toFixed
