Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "制造馆标签商品"
  @baseInfo.description = "制造馆不同打标商品展示"

  @configs.ext =
    name: "组件设置"

  productTypeName = new Properties.Property @,
    name : "productTypeName"
    label : "商品标签属性类别名"
    description : "输入商品标签类别名，例如老字号商品"
    type : "text"
    useData : true
    reRender : true

  moreProductUrl = new Properties.Property @,
    name : "moreUrl"
    label : "更多跳转"
    description : "请输入更多跳转链接地址"
    type : "text"
    useData: true
    reRender: true

  colorsProperty = new Properties.Property @,
    name: "borderColor"
    label: "标题左侧border颜色"
    description: "设置标题左侧border颜色，默认#ffde8e"
    type: "text"
    useData: true

  productShowNo = new Properties.Property @,
    name : "showNo"
    label : "商品列表展示个数设置"
    description : "设置打标商品列表的展示个数，默认为10个"
    type: "text"
    useData: true

  @registerConfigProperty "ext", productTypeName , moreProductUrl , colorsProperty , productShowNo
