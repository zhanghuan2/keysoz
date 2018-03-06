Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "推荐品牌"
  @baseInfo.description = "推荐品牌"

  @configs.ext =
    name: "组件设置"

  navPropertySet = (value)->
    navTitles = []
    value = value.split("\n")
    $.each value, (i, d)->
      titlesCache = {}
      d = d.split(" ")
      titlesCache.brandName = d[0]
      titlesCache.brandId = d[1]
      navTitles.push titlesCache
    navTitles

  inputChange = new Properties.Property @,
    name: "navTitles"
    label: "设置品牌种类和品牌id"
    description: "按这种形式填写:品牌种类+ 空格 +品牌id(中间用空格,每一种品牌换行,id用英文逗号如1,2,3,4..)"
    type: "textarea"
    useData: true
    reRender: true
    get: ->
      data = @_get()
      titles = []
      if data is undefined
        data = []
      $.each data, (i, d)->
        titles[i] = d.brandName + " " + d.brandId
      titles = titles.join("\n")
    set: (value) ->
      value = value.trim()
      navTitles = []
      navTitles = navPropertySet(value)
      @_set navTitles

  idsKinds = new Properties.Property @,
    name: "brandIds"
    label: "全部的商品品牌"
    description: "最多输入16个商品,超出部分将忽略"
    type: "text"
    useData: true
    reRender: true
    set:(value)->
      if value isnt ""
        value = value.split(",")
      if value.length > 16
        Essage.show
          message: "最多支持 16 个商品，超出部分将被忽略"
          status: "warning"
        , 2000
        value = value[...16]
      @_set value


  @registerConfigProperty "ext", idsKinds, inputChange

