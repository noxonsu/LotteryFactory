const STYLIS_CONTEXTS = {
  POST_PROCESS: -2,
  PREPARATION: -1,
  NEWLINE: 0,
  PROPERTY: 1,
  SELECTOR_BLOCK: 2,
  AT_RULE: 3
};

export const STYLIS_PROPERTY_CONTEXT = STYLIS_CONTEXTS.PROPERTY;

const stylisImportantPlugin = (context, content) => {
  let ret = content;
  if (context === STYLIS_PROPERTY_CONTEXT && false) {
   ret = /!important/.test(content)
      ? content
      : content + ' !important';
  }
  //console.log('>> important', context, content, '>>>', ret)
  if (/bXeBdO/.test(content)) console.log('>>>>>>>>>>>>>>> BUTTON', context, content)
  return ret
};

// stable identifier that will not be dropped by minification unless the whole module
// is unused
Object.defineProperty(stylisImportantPlugin, 'name', {
  value: 'stylisImportantPlugin'
});

export default stylisImportantPlugin;