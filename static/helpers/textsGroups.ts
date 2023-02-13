export const textsGroups = [
  {
    title: `Main options`,
    items: [
      {
        code: `App_Title`,
        desc: `Application title`,
        value: `App title`,
      },
      {
        code: `App_Description`,
        desc: `Application desctiption`,
        value: `App desc`,
      },
      {
        code: `App_Keywords`,
        desc: `Application keywords`,
        value: `App keywords`,
      }
    ]
  },
]

const prepareTextsGroups = () => {
  const _ret = {}
  Object.keys(textsGroups).forEach((k) => {
    Object.keys(textsGroups[k].items).forEach((kk) => {
      const _item = textsGroups[k].items[kk]
      _ret[_item.code] = _item
    })
  })
  
  return _ret;
}

export const TEXTS_GROUPS_ITEMS = prepareTextsGroups()
