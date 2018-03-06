Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "制造馆标签企业"
  @baseInfo.description = "制造馆不同打标企业展示"

  @configs.ext =
    name: "组件设置"

  companyTypeName = new Properties.Property @,
    name : "productTypeName"
    label : "企业属性类别名"
    description : "输入企业类别名，例如老字号企业"
    type : "text"
    useData : true
    reRender : true

  moreCompanyUrl = new Properties.Property @,
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

  companyShowNo = new Properties.Property @,
    name : "showNo"
    label : "企业列表展示个数设置"
    description : "设置打标企业列表的展示个数，默认为6个"
    type: "text"
    useData: true

  @registerConfigProperty "ext",companyTypeName , moreCompanyUrl , colorsProperty , companyShowNo
