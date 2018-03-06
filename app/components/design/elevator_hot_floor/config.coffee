Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "水平楼层商品"
  @baseInfo.description = "水平排布楼层商品"

  @configs.ext =
    name: "组件设置"

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

  heightProprety = new Properties.Property @,
    name: "height"
    label: "组件高度"
    desc: "图片高度和组件高度一致"
    type: "text"
    useData: true
    reRender: true

  sizeProperty = new Properties.Property @,
    name: "total"
    label: "轮播数量"
    description: "轮播图片数量"
    type: "text"
    useData: true
    reRender: true
    default: "1"
    set: (value)->
      value = 1 if value < 1
      @_set(value)

  lengthProperty = new Properties.Property @,
    name: "length"
    label: "一屏的图片数量"
    description: "每屏显示的图片数量"
    type: "text"
    useData: true
    reRender: true
    default: "1"
    set: (value)->
      value = 1 if value < 1
      @_set(value)
      widthProperty.set(100 / value) if value isnt 1

  widthProperty = new Properties.Property @,
    name: "width"
    label: "图片的宽度"
    description: "图片的宽度"
    type: "hidden"
    useData: true
    reRender: true

  typeProperty = new Properties.Property @,
    name: "type"
    label: "每次轮播的数量"
    description: "每次轮播的图片数量"
    type: "radio"
    options:
      "1": "单屏"
      "0": "单张图片"
    default: "1"
    useData: true

  autoProperty = new Properties.Property @,
    name: "auto"
    label: "是否自动"
    description: "是否自动轮播"
    type: "radio"
    options:
      "true": "是"
      "false": "否"
    default: "false"
    useData: true

  timeProperty = new Properties.Property @,
    name: "time"
    label: "时间间隔"
    description: "轮播时间间隔"
    type: "text"
    useData: true
    default: "3000"
  
  iconColorProperty = new Properties.Property @,
    name: "iconColor"
    label: "图标颜色"
    description: "图标的显示颜色"
    type: "text"
    useData: true
    reRender: true

  itemIdsProperty = new Properties.Property @,
    name: "itemIds"
    label: "商品ID"
    description: "请输入6个商品ID，以英文逗号分隔，如1,2,3,4"
    type: "text"
    useData: true
    reRender: true
    get: ->
      value = @_get()

    set: (value)->
      value = $.trim(value)
      value = value.split(",")
      @_set _.map value, Number

  @registerConfigProperty "ext", floorNameProperty, floorIconProperty, heightProprety, lengthProperty, typeProperty, autoProperty, sizeProperty, timeProperty, iconColorProperty, itemIdsProperty