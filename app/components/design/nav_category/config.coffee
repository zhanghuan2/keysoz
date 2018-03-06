Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "导航栏设置"
  @baseInfo.description = "导航栏设置组件。"

  @configs.ext =
    name: "组件设置"

  navPropertySet = (value)->
    navTitles = []
    value = value.split("\n")
    $.each value, (i, d)->
      titlesCache = {}
      d = d.split(/\s+/)
      titlesCache.name = d[0]
      titlesCache.href = d[1]
      navTitles.push titlesCache
    navTitles

  idsProperty = new Properties.Property @,
    name: "ids"
    label: "展示类目列表"
    description: "填写需要展示的前台一级类目id列表，逗号分隔，id顺序即展示顺序"
    type: "text"
    useData: true
    reRender: true

  currentProperty = new Properties.Property @,
    name: "current"
    label: "当前编辑类目位置"
    description: "填写当前需要编辑的类目位置，如第一个为 1"
    useData: false
    type: "text"
    set: (value)->
      @_set(value)
      $categoryLi = @$target.find(".category-li:eq(#{value-1})")
      if value <= 0 or $categoryLi.length is 0
        imageProperty.hide()
        @$target.find(".home-channel").addClass("disappear")
        return
      @$target.find(".home-channel").removeClass("disappear")
      @$target.find(".expand-panel").addClass("disappear")
      $categoryLi.find(".expand-panel").removeClass("disappear")
      img = $categoryLi.find(".category-background").attr("src")
      imageProperty.show().mset(img)

  imageProperty = new Properties.ImageProperty @,
    hide: true
    name: "backgroundImage"
    label: "背景图片"
    description: "类目背景图片"
    type: "button"
    useData: false
    options:
      "url": "<i class=\"fa fa-picture-o\"></i>"
    setCallback: (url) ->
      unless url
        Essage.show
          message: "图片组件不能将图片设置为空"
          status: "warning"
        , 2000
        return
      categoryIndex = currentProperty.get()
      @$target.find(".category-li:eq(#{categoryIndex-1})").find(".category-background").attr("src", url)
      dataProperty.set()

  dataProperty = new Properties.Property @,
    name: "data"
    type: "text"
    useData: true
    set: ->
      value = _.map @$target.find(".category-li"), (i) ->
        id = $(i).data("id")
        index = $(i).index() + 1
        background = $(i).find(".category-background").attr("src")
        {id, index, background}
      @_set(value)

  @registerConfigProperty.apply @, ["ext", idsProperty, currentProperty, imageProperty]
