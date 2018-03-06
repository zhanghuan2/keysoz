Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "大宗商品库主页"
  @baseInfo.description = "大宗商品库主页"

  @configs.ext =
    name: "组件设置"

  defaultIdProperty = new Properties.Property @,
    name: "frontCategoryId1"
    label: "粮食ID"
    description: "粮食ID"
    type: "text"
    useData: true
    reRender: true

  otherIdProperty = new Properties.Property @,
    name: "frontCategoryId2"
    label: "食用油ID"
    description: "食用油ID"
    type: "text"
    useData: true
    reRender: true


  @registerConfigProperty "ext", defaultIdProperty ,otherIdProperty
