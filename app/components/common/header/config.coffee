Properties = require "eevee/config/properties"
module.exports = ->
  @baseInfo.name = "搜索栏热词"
  @baseInfo.description = "搜索栏热词推荐组件。"

  @configs.ext =
    name: "组件设置"

  widthProperty = new Properties.Property @,
    name: "width"
    label: "组件宽度"
    description: "搜索框宽度，不能小于350"
    type: "text"
    default: "530"
    useData: true
    reRender: true
    set: (value) ->
      @_set(if parseInt(value) > 350 then value else 350)

  hotWordProperty = new Properties.Property @,
    name: "hotwords"
    label: "热词"
    description: "可输入多个热词 中间用空格分隔 最多可输入7个"
    type: "text"
    useData: true
    reRender: true
    get: ->
      data = @_get()
      if data is undefined then "" else data.join(" ")
    set: (value) ->
      value = value.trim()
      if value is ""
        @_set undefined
      else
        hotwords = value.split(/\s+/)
        if hotwords.length > 7
          Essage.show
            message: "最多支持 7 个热词，超出部分将被忽略"
            status: "warning"
          , 2000
          hotwords = hotwords[...7]
      @_set hotwords

  positionProperty = new Properties.Property @,
    name: "position"
    label: "热词位置"
    description: "为热词选择展示位置"
    type: "radio"
    options:
      "up": "搜索框上面"
      "down": "搜索框下面"
    default: "down"
    useData: true
    reRender: true

  fcIdsProperty = new Properties.Property @,
    name: "fcid"
    label: "特定类目"
    description: "针对类目查询，该类目id会添加作为查询参数，多个逗号分隔"
    type: "text"
    useData: true
    reRender: true

  searchBtnProperty = new Properties.Property @,
    name: "searchBtn"
    label: "搜索按钮名"
    description: "搜索按钮名称，默认为搜索"
    type: "text"
    useData: true
    reRender: true

  actionProperty = new Properties.Property @,
    name: "action"
    label: "搜索跳转链接"
    description: "点击搜索按钮跳转链接地址，默认/search"
    type: "text"
    useData: true
    reRender: true

  ifshowSupplierProperty = new Properties.Property @,
    name: "ifshowSupplier"
    label: "是否显示供应商选项"
    description: "是否显示供应商选项"
    type: "radio"
    options:
      "true": "显示"
      "false": "隐藏"
    default: "true"
    useData: true
    reRender: true
  @registerConfigProperty "ext", hotWordProperty, widthProperty, positionProperty, fcIdsProperty, searchBtnProperty, actionProperty,ifshowSupplierProperty
