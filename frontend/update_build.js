const fsExtra = require('fs-extra')

fsExtra.emptyDir('../vendor_source').then(() => {
  fsExtra.copy('./build/', '../vendor_source').then(() => {
    console.log('>>> WordPress front vendor updated')
  })
})
fsExtra.emptyDir('../static/public/vendor').then(() => {
  fsExtra.copy('./build/static/js/', '../static/public/vendor').then(() => {
    console.log('>>> Static vendor updated')
    console.log('>>> NOTICE. Static version must be rebuilded')
  })
})



