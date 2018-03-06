Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "制造馆供应商列表"
  @baseInfo.description = "制造馆供应商列表"

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
      @$target.find(".floor-body").css("padding", value)
      @_set(value)


  topIdProperty = new Properties.Property @,
    name: "whiteList"
    label: "供应商白名单"
    description: "供应商白名单"
    type: "text"
    useData: true
    reRender: true

  supplierBlack = new Properties.Property @,
    name: "blackList"
    label: "供应商黑名单"
    description: "供应商黑名单"
    type: "text"
    useData: true
    reRender: true


  @registerConfigProperty "ext", paddingProperty, topIdProperty ,supplierBlack
