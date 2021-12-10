const toFixed = (value) => {
  if (!value) {
    return value
  }

  let newValue = Number(value).toFixed(5)

  if (newValue === '0.00000') {
    newValue = Number(value).toFixed(8)
  }

  if (newValue === '0.00000000') {
    return value
  }

  return newValue
}


export default toFixed
