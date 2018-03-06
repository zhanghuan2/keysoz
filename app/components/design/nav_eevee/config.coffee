Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "疫苗导航栏设置"
  @baseInfo.description = "疫苗导航栏设置组件。"

  @configs.ext =
    name: "组件设置"

  idsProperty = new Properties.Property @,
    name: "ids"
    label: "疫苗类目列表"
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



  @registerConfigProperty "ext", idsProperty, bgColorProperty