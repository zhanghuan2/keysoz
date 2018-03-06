properties = require "extras/properties"

Handlebars.wrapTemplate = (template)->
  (options) ->
    options = options || {}
    options.properties = properties
    Handlebars.templates["#{template}"](options)

Handlebars.wrapPartial = (template)->
  (options) ->
    options = options || {}
    options.properties = properties
    Handlebars.partials["#{template}"](options)
