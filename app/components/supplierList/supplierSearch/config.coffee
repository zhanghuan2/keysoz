Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "供应商详情搜索"
  @baseInfo.description = "供应商详情搜索"

  @configs.ext =
    name: "组件设置"

  btn1Text = new Properties.Property @,
    name: "btn1Text"
    label: "按钮1文案"
    description: "按钮1文案，默认搜本店"
    type: "text"
    useData: true
    reRender: true
    set: (value)->
      if value is ""
        value = "搜本店"
      @$target.find("#search-button-local").text(value)
      @_set(value)

  btn2Text = new Properties.Property @,
    name: "btn2Text"
    label: "按钮3文案"
    description: "按钮2文案，默认搜全站"
    type: "text"
    useData: true
    reRender: true
    set: (value)->
      if value is ""
        value = "搜本店"
      @$target.find("#search-button-all").text(value)
      @_set(value)

  @registerConfigProperty "ext", btn1Text, btn2Text
