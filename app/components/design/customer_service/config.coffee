Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "智能客服"
  @baseInfo.description = "智能客服设置"

  @configs.ext =
    name: "组件设置"

  imageProperty = new Properties.ImageProperty @,
    name: "imageSrc"
    label: "客服图片"
    description: "客服图片"
    type: "button"
    useData: true
  
  imageHoverProperty = new Properties.ImageProperty @,
    name: "imageHoverSrc"
    label: "客服切换图片"
    description: "鼠标放在上面的图片"
    type: "button"
    useData: true
    
  itemProperty = new Properties.Property @,
    name: "tntInstId"
    label: "客服账号"
    description: "设置客服账号，如KMQNW3CN&scene=SCE00000041"
    type: "text"
    useData: true

  @registerConfigProperty "ext", imageProperty, imageHoverProperty, itemProperty

