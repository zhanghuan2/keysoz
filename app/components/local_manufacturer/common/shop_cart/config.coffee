Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "制造馆购物车"
  @baseInfo.description = "购物车"

  @configs.ext =
    name: "组件设置"

  defaultLink = new Properties.Property @,
    name: "defaultLink"
    label: "跳转链接"
    description: "跳转链接"
    type: "text"
    useData: true
    reRender: true

  queryCountUrl = new Properties.Property @,
    name: "queryCountUrl"
    label: "查询链接"
    description: "购物车商品数量查询链接"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", defaultLink, queryCountUrl
