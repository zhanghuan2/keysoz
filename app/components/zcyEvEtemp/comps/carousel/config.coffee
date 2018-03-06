Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "轮播组件"
  @baseInfo.description = "图片轮播及推广"

  @configs.ext =
    name: "组件设置"
  @configs.ext2 =
    name: "组件设置"

  indicatorProperty = new Properties.Property @,
    name: "isIndicator"
    label: "图片序列"
    description: "是否有图片序列"
    type: "radio"
    options:
      "1": "&nbsp;有"
      "0": "&nbsp;无"
    default: "0"
    useData: true
    reRender: true

  typeProperty = new Properties.Property @,
    name: "type"
    label: "序列类型"
    description: "为图片序列选择样式"
    type: "radio"
    options:
      "auto" : "默认"
      "round" : "圆形"
      "square" : "方形"
      "round-rt": "右上角圆形"
      "square-lb": "左下角方形"
    default: "auto"
    useData: true
    reRender: true
    init: ->
      @hide() if indicatorProperty.get() is "0"

  controlProperty = new Properties.Property @,
    name: "isControl"
    label: "左右滑动"
    description: "是否添加左右滑动"
    type: "radio"
    options:
      "1": "&nbsp;有"
      "0": "&nbsp;无"
    default: "0"
    useData: true
    reRender: true

  superProperty = new Properties.Property @,
    name: "isSuper"
    label: "横向全屏"
    description: "是否横向全屏，横向全屏下无左右滑动"
    type: "radio"
    options:
      "1": "&nbsp;是"
      "0": "&nbsp;无"
    default: "0"
    useData: true
    reRender: true

  heightProperty = new Properties.Property @,
    name: "height"
    label: "组件高度"
    description: "为组件设置高度以适应图片大小"
    type: "text"
    default: "100"
    useData: true
    reRender: true
    set: (value)->
      if (value < 100) or value is ""
        value = 100
      @$target.find(".carousel").css("height", value)
      @_set(value)

  colorsProperty = new Properties.Property @,
    name: "colors"
    label: "banner颜色列表"
    description: "设置banner切换颜色，多个以逗号分隔，如#ccc,#fff"
    type: "text"
    useData: true

  rowSizeProperty = new Properties.Property @,
    name: "rowSize"
    label: "banner行层级差"
    description: "当前组件与需要切换颜色的容器的行层级差"
    type: "text"
    useData: true

  imageCountProperty = new Properties.Property @,
    name: "imageCount"
    label: "轮播屏数"
    description: "设置轮播组件的屏数，最大 10 屏"
    type: "text"
    useData: true
    default: "5"
    set: (value) ->
      value = 1 if value < 1
      value = 10 if value > 10
      @_set(value)
      defaultData = []
      originalData = dataProperty.get().slice(0, parseInt(value))
      _.times parseInt(value), ->
        defaultData.push({})
      dataProperty.set(_.extend defaultData, originalData)

  injectImageProperty = new Properties.Property @,
    name: "imageInject"
    label: "设置轮播组件的内容顺序"
    description: "以空格分隔, 填写屏数与需要被插入的位置"
    type: "text"
    useData: false
    reRender: true
    set: (value) ->
      if not /^\d+\s+\d+$/.test(value)
        Essage.show
          message: "请填写正确的格式"
          status: "warning"
        , 2000
      else
        data = value.split(/\s+/)
        injectImage(data[0], data[1])

  intervalProperty = new Properties.Property @,
    name: "interval"
    label: "设置轮播的间隔时长"
    description: "以毫秒为单位, 默认 3000, 即 3 秒"
    type: "text"
    default: "3000"
    useData: true
    reRender: true
    set: (value) ->
      value = 1000 if value < 1000
      value = 10000 if value > 10000
      @_set(value)

  props = []
  _.times imageCountProperty.get(), (i) =>
    index = i + 1
    props.push new Properties.ImageProperty @,
      name: "image#{index}"
      label: "图片#{index}"
      description: "为第#{index}屏选择图片"
      useData: false
      reRender: true
      options:
        "url": "<i class=\"fa fa-picture-o\"></i>"
      setCallback: (url) ->
        setImage(url, "image" , i)
      get: ->
        dataProperty.get()[i] && dataProperty.get()[i]["image"]

    props.push new Properties.Property @,
      name: "href#{index}"
      label: "链接#{index}"
      description: "为图片#{index}设置超链接"
      type: "text"
      class: "small"
      reRender: true
      useData: false
      set: (value) ->
        @_set(value)
        setImage(value, "href" , i)
      get: ->
        dataProperty.get()[i] && dataProperty.get()[i]["href"]

  setImage = (v, k, i) ->
    x = _.clone(dataProperty.get())
    x[i] = x[i] || {}
    x[i][k] = v
    dataProperty.set(x)

  injectImage = (f, t) ->
    x = dataProperty.get()
    (i = x[f-1]) and delete x[f-1]
    x.splice(t-1, 0, i)
    dataProperty.set _.compact(x)

  dataProperty = new Properties.Property @,
    name: "images"
    type: "text"
    default: []
    reRender: true
    useDate: true

  @registerConfigProperty "ext", colorsProperty, rowSizeProperty, heightProperty, superProperty, indicatorProperty, typeProperty, controlProperty, imageCountProperty, injectImageProperty, intervalProperty
  @registerConfigProperty.apply @, ["ext2"].concat(props)
