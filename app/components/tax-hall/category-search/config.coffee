Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "国税商品主搜首页导航栏"
  @baseInfo.description = "国税商品主搜首页导航栏"
  
  @configs.ext =
    name: "组件设置"

  idsProperty = new Properties.Property @,
    name: "ids"
    label: "展示类目列表"
    description: "填写需要展示的前台一级类目id列表，逗号分隔，id顺序即展示顺序"
    type: "text"
    useData: true
    reRender: true

  @registerConfigProperty.apply @, ["ext", idsProperty]


