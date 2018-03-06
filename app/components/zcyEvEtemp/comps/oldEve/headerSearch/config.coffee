Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "搜索栏热词"
  @baseInfo.description = "搜索栏热词推荐组件。"

  @configs.ext =
    name: "组件设置"

  widthProperty = new Properties.Property @,
    name: "width"
    label: "组件宽度"
    description: "搜索框宽度，不能小于350"
    type: "text"
    default: "530"
    useData: true
    reRender: true
    set: (value) ->
      @_set(if parseInt(value) > 350 then value else 350)

  @registerConfigProperty "ext", widthProperty
