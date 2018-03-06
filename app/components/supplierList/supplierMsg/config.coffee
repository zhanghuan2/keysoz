Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "header供应商信息"
  @baseInfo.description = "header供应商信息"

  @configs.ext =
    name: "组件设置"

  paddingProperty = new Properties.Property @,
    name: "padding"
    label: "组件内间距"
    description: "为组件设置内间距"
    type: "text"
    default: "0"
    useData: true
    reRender: true
    set: (value)->
      if value is ""
        value = 0
      @$target.find(".supplierMsg").css("padding", value)
      @_set(value)

  @registerConfigProperty "ext", paddingProperty
