Properties2 = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "商品主搜"
  @baseInfo.description = "商品主搜"

  @configs.ext =
    name: "组件设置"

  marginRightProperty = new Properties.Property @,
    name: "marginRight"
    label: "商品右边距"
    description: "设置商品右边距"
    type: "text"
    default: "15"
    useData: true
    reRender: true

  showShopProperty = new Properties.Property @,
    name: "showShop"
    label: "是否显示店铺"
    description: "设置是否显示店铺"
    type: "radio"
    options:
      "1": "显示"
      "0": "不显示"
    default: "1"
    useData: true
    reRender: true

  @registerConfigProperty "ext", marginRightProperty, showShopProperty
