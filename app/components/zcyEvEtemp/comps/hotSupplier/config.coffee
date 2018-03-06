Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "权限判断"
  @baseInfo.description = "权限判断"

  @configs.ext =
    name: "组件设置"

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

  supplierTitle = new Properties.Property @,
    name: "supplierName"
    label: "供应商楼层名称"
    description: "供应商楼层名称"
    type: "text"
    useData: true
    reRender: true

  supplierMore = new Properties.Property @,
    name: "supplierMore"
    label: "更多链接"
    description: "供应商更多链接"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", topIdProperty ,supplierBlack,supplierTitle,supplierMore
