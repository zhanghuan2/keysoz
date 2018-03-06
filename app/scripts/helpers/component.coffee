hasModule = require("pokeball/helpers/commonjs").hasModule

initializeByDom = (dom) ->
  $el = $(dom)
  path_base = $el.data("comp-path") + "/view"
  path_extend = $el.data("comp-path") + "/extend"
  if hasModule path_extend
    path = path_extend
  else if hasModule path_base
    path = path_base
  else
    return
  Component = class extends require(path)
    constructor: ->
      @$el = $el
      super (selector) -> $el.find(selector)
  $el.data "compInstance", new Component()

initialize = ($root) ->
  $comps = if $root then $root.find(".js-comp") else $(".js-comp")
  $comps.each ->
    try
      initializeByDom $(@)
    catch e
      e

module.exports =
  initialize: initialize
  initializeByDom: initializeByDom
