Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "电梯模块楼层标题"
  @baseInfo.description = "电梯模块的楼层标题"

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
    description: "输入楼层图标的样式名，没有则不填"
    type: "text"
    useData: true
    reRender: true

  iconColorProperty = new Properties.Property @,
    name: "iconColor"
    label: "图标颜色"
    description: "图标的显示颜色，没有图标则不填"
    type: "text"
    useData: true
    reRender: true

  fontSizeProperty = new Properties.Property @,
    name: "fontSize"
    label: "字号"
    description: "字体大小，需填写单位，默认24px"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", floorNameProperty, floorIconProperty, iconColorProperty, fontSizeProperty