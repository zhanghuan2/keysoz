module.exports = ->
  initializeId = setInterval(() =>
    Pokeball = require "pokeball"

    if Pokeball
      require "helpers/numbers"
      require "extras/ajax"
      require "extras/handlebars"
      require "extras/input_amount"
      require "extras/uploadFile"
      require "extras/uploadFileBox"
      require "extras/uploadImage"
      require "helpers/profile"
      require "helpers/selectric"
      require "extras/zcyDistrict"
      require "extras/zcyAddress"
      require "extras/jquery.zcySticky"
      require "extras/wc-spin"
      require("helpers/component").initialize()

      $("img[data-original]").lazyload
        effect: "fadeIn"

      # support IE8,9 input placeholder
      $('input, textarea').placeholder()

      clearInterval(initializeId)
  , 10)


