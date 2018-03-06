Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "权限判断"
  @baseInfo.description = "权限判断"

  @configs.ext =
    name: "组件设置"

  showShopProperty = new Properties.Property @,
    name: "IFright"
    label: "是否需要权限"
    description: "是否需要权限"
    type: "radio"
    options:
      "1": "需要"
      "0": "不需要"
    default: "1"
    useData: true
    reRender: true

  topIdProperty = new Properties.Property @,
    name: "right_type"
    label: "权限类型"
    description: "权限类型"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", showShopProperty, topIdProperty
