Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "制造馆供应商列表搜索"
  @baseInfo.description = "制造馆供应商列表搜索"

  @configs.ext =
    name: "组件设置"

  widthProperty = new Properties.Property @,
    name: "width"
    label: "组件宽度"
    description: "搜索框宽度，不能小于208"
    type: "text"
    default: "208"
    useData: true
    reRender: true
    set: (value) ->
      @_set(if parseInt(value) > 208 then value else 208)

  fcIdsProperty = new Properties.Property @,
    name: "fcid"
    label: "特定类目"
    description: "针对类目查询，该类目id会添加作为查询参数，多个逗号分隔"
    type: "text"
    useData: true
    reRender: true

  searchBtnProperty = new Properties.Property @,
    name: "searchBtn"
    label: "搜索按钮名"
    description: "搜索按钮名称，默认为搜索"
    type: "text"
    useData: true
    reRender: true




  @registerConfigProperty "ext", widthProperty,  fcIdsProperty, searchBtnProperty
