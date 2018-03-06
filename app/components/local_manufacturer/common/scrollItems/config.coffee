Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "制造馆商品滚动楼层"
  @baseInfo.description = "制造馆商品滚动楼层"

  @configs.ext =
    name: "组件设置"

  floorNameProperty = new Properties.Property @,
    name: "floorName"
    label: "楼层名"
    description: "输入楼层名"
    type: "text"
    useData: true
    reRender: true

  floorIconProperty = new Properties.Property @,
    name: "floorIcon"
    label: "楼层图标"
    description: "输入楼层图标的样式名"
    type: "text"
    useData: true
    reRender: true


  iconColorProperty = new Properties.Property @,
    name: "iconColor"
    label: "图标颜色"
    description: "图标的显示颜色"
    type: "text"
    useData: true
    reRender: true

  itemIdsProperty = new Properties.Property @,
    name: "itemIds"
    label: "商品ID"
    description: "请输入6个商品ID，以英文逗号分隔，如1,2,3,4"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", floorNameProperty, floorIconProperty,  iconColorProperty, itemIdsProperty