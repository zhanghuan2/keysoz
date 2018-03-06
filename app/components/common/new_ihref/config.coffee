Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "模块链接组件"
  @baseInfo.description = "页面跳转链接"

  @configs.ext =
    name: "组件设置"
  @configs.ext2 =
    name: "额外链接设置"

  defaultColorProperty = new Properties.Property @,
    name: "color"
    label: "默认颜色"
    description: "正常显示的颜色"
    type: "text"
    useData: true
    reRender: true

  hrefProperty = new Properties.Property @,
    name: "href1"
    label: "链接地址"
    description: "疫苗点击跳转的链接地址"
    type: "text"
    useData: true
    reRender: true

  vaccineNoPermissionHref = new Properties.Property @,
    name: "vaccineNoPermissionHref"
    label: "未授权跳转链接"
    description: "疫苗未授权点击跳转的链接地址"
    type: "text"
    useData: true
    reRender: true

  href2Property = new Properties.Property @,
    name: "href2"
    label: "链接地址"
    description: "大宗跳转的链接地址"
    type: "text"
    useData: true
    reRender: true

  blocktradeNoPermissionHref = new Properties.Property @,
    name: "blocktradeNoPermissionHref"
    label: "未授权跳转链接"
    description: "大宗未授权点击跳转的链接地址"
    type: "text"
    useData: true
    reRender: true

  currentTabName = new Properties.Property @,
    name: "currentTabName"
    label: "Tab名称"
    description: "当前展示tab名称"
    type: "text"
    useData: true
    reRender: true

  appCodeProperty = new Properties.Property @,
    name: "appCode"
    label: "appCode"
    description: "appCode"
    type: "text"
    useData: true
    reRender: true

  showDistrictCodeProperty = new Properties.Property @,
    name: "showDistrictCode"
    label: "显示区划"
    description: "根据区划显示链接"
    type: "text"
    useData: true
    reRender: true

  extraSiteCount = new Properties.Property @,
    name: "extraSiteCount"
    label: "链接数量"
    description: "特许商品馆数量"
    type: "text"
    useData: true
    reRender: true
    default: "0"
    set: (value)->
      value = 0 if value < 0
      @_set(value)

  siteProperties = _.map (_.range extraSiteCount.get()), (i) =>
    [
      new Properties.Property @,
        name: "siteName#{i+1}"
        label: "第#{i+1}个站点名称"
        description: "特许商品馆第#{i+1}个站点名称"
        type: "text"
        useData: true
        set: (value)->
          @_set(value)
          sitesProperty.set()
    ,
      new Properties.Property @,
        name: "siteUrl#{i+1}"
        label: "第#{i+1}个站点的链接"
        description: "第#{i+1}个站点的跳转链接"
        type: "text"
        useData: true
        set: (value)->
          @_set(value)
          sitesProperty.set()
    ]

  sitesProperty = new Properties.Property @,
    name: "extraSites"
    type: "text"
    useData: true
    reRender: true
    set: ->
      value = []
      $.each siteProperties, (i, el) ->
        value.push
          siteName: el[0].get()
          siteUrl: el[1].get()
      @_set(value)

  @registerConfigProperty "ext", defaultColorProperty ,showDistrictCodeProperty,hrefProperty,appCodeProperty,href2Property, vaccineNoPermissionHref, blocktradeNoPermissionHref, currentTabName
  @registerConfigProperty "ext2", extraSiteCount
  @registerConfigProperty.apply @, ["ext2"].concat(_.flatten siteProperties)