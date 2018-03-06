Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "制造馆知名企业"
  @baseInfo.description = "知名企业设置组件。"

  @configs.ext =
    name: "组件设置"
  @configs.ext2 =
    name: "供应商背景图设置"


  floorNameProperty = new Properties.Property @,
    name: "floorName"
    label: "楼层名"
    description: "输入楼层名"
    type: "text"
    useData: true
    reRender: true

  floorIconProperty = new Properties.Property @,
    name: "floorIcon"
    label: "楼层图标"
    description: "输入楼层图标的样式名"
    type: "text"
    useData: true
    reRender: true

  idsProperty = new Properties.Property @,
    name: "ids"
    label: "展示企业ID"
    description: "填写5个需要展示的企业id，逗号分隔，id顺序即展示顺序"
    type: "text"
    useData: true
    reRender: true

  props = []
  _.times 5, (i) =>
    index = i + 1
    props.push new Properties.ImageProperty @,
      name: "image#{index}"
      label: "图片#{index}"
      description: "为第#{index}个企业选择背景图片"
      useData: false
      reRender: true
      options:
        "url": "<i class=\"fa fa-picture-o\"></i>"
      setCallback: (url) ->
        setImage(url, "image" , i)
      get: ->
        dataProperty.get()[i] && dataProperty.get()[i]["image"]

  setImage = (v, k, i) ->
    x = _.clone(dataProperty.get())
    x[i] = x[i] || {}
    x[i][k] = v
    dataProperty.set(x)

  dataProperty = new Properties.Property @,
    name: "images"
    type: "text"
    default: []
    reRender: true
    useDate: true


  @registerConfigProperty.apply @, ["ext", floorNameProperty, floorIconProperty, idsProperty]
  @registerConfigProperty.apply @, ["ext2"].concat(props)