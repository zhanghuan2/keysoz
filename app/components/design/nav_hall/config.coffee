Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "展厅导航栏设置"
  @baseInfo.description = "展厅导航栏设置组件。"

  @configs.ext =
    name: "组件设置"

  idsProperty = new Properties.Property @,
    name: "ids"
    label: "展厅类目列表"
    description: "填写需要展示的前台一级类目id列表，逗号分隔，id顺序即展示顺序"
    type: "text"
    useData: true
    reRender: true

  bgColorProperty = new Properties.Property @,
    name: "bgColor"
    label: "背景颜色"
    description: "背景颜色，默认#F4F3F4"
    type: "text"
    useData: true
    reRender: true

  domainProperty = new Properties.Property @,
    name: "domain"
    label: "展厅类目显示链接"
    description: "展厅类目显示链接，默认为网超主域/search"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty "ext", idsProperty, bgColorProperty, domainProperty