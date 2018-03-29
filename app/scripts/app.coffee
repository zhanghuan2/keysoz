window.Router = require("router")
window.Router.initialize()
window.Utils = require("tool")

module.exports = ->
  initializeId = setInterval(() =>
    Pokeball = require "pokeball"

    if Pokeball
      require "helpers/numbers"
      require "extras/ajax"
      require "extras/handlebars"
      require "extras/input_amount"
      require "helpers/profile"
      require "helpers/selectric"
      require "extras/zcyDistrict"
      require "extras/zcyAddress"
      require "extras/jquery.zcySticky"
      require "helpers/frontHandlebars"
      require("helpers/component").initialize()

      $("img[data-original]").lazyload
        effect: "fadeIn"
      ZCY.setPath("comps/");
#      ZCY.setType("sync");w
      # support IE8,9 input placeholder
#      $('input, textarea').placeholder()

      clearInterval(initializeId)
  , 10)


