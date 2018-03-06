Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "供应商详情"
  @baseInfo.description = "供应商详情"

  @configs.ext =
    name: "组件设置"

  heightProperty = new Properties.Property @,
    name: "height"
    label: "组件高度"
    description: "为组件设置高度以适应图片大小"
    type: "text"
    default: "400"
    useData: true
    reRender: true
    set: (value)->
      if (value < 400) or value is ""
        value = 400
      @$target.find(".detail-box").css("height", value)
      @_set(value)

  @registerConfigProperty "ext", heightProperty
