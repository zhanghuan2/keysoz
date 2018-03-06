Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "轮播组件"
  @baseInfo.description = "轮播组件"

  @configs.ext =
    name: "组件设置"

  heightProprety = new Properties.Property @,
    name: "height"
    label: "组件高度"
    desc: "图片高度和组件高度一致"
    type: "text"
    useData: true
    reRender: true

  sizeProperty = new Properties.Property @,
    name: "size"
    label: "轮播数量"
    description: "轮播图片数量"
    type: "text"
    useData: true
    reRender: true
    default: "1"
    set: (value)->
      value = 1 if value < 1
      @_set(value)

  imageProperties = _.map (_.range sizeProperty.get()), (i) =>
    [
      new Properties.ImageProperty @,
        name: "image#{i+1}"
        label: "第#{i+1}张"
        description: "轮播中的第#{i+1}张图片"
        type: "button"
        useData: true
        reRender: true
        options:
          "url": "<i class=\"fa fa-picture-o\"></i>&nbsp;"
        setCallback: (url) ->
          unless url
            Essage.show
              message: "图片组件不能将图片设置为空"
              status: "warning"
            , 2000
            return
          @$target.find(".login-desc").css("background-image", "url(#{url})")
          imagesProperty.set()
    ,
      new Properties.Property @,
        name: "link#{i+1}"
        label: "第#{i+1}张的链接"
        description: "轮播中的第#{i+1}张图片的跳转链接"
        type: "text"
        useData: true
        class: "small"
        set: (value)->
          @_set(value)
          imagesProperty.set()
    ]

  imagesProperty = new Properties.Property @,
    name: "images"
    type: "text"
    useData: true
    reRender: true
    set: ->
      value = []
      $.each imageProperties, (i, el) ->
        value.push
          image: el[0].get()
          link: el[1].get()
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

  @registerConfigProperty "ext", heightProprety, lengthProperty, typeProperty, autoProperty, sizeProperty, timeProperty
  @registerConfigProperty.apply @, ["ext"].concat(_.flatten imageProperties)
