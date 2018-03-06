let Properties = require("eevee/config/properties")

module.exports = function () {

  this.baseInfo.name = "商品楼层"
  this.baseInfo.description = "教育科研馆商品楼层"

  this.configs.ext = {
    name: "组件设置"
  }

  let floorNameProperty = new Properties.Property(this, {
    name: "floorName",
    label: "楼层名",
    description: "输入楼层名",
    type: "text",
    useData: true,
    reRender: true
  })

  let floorKeyWordsProperty = new Properties.Property(this, {
    name: "keyWords",
    label: "展示关键词",
    description: "输入关键词，用英文逗号分隔",
    type: "text",
    useData: true,
    reRender: true,
    set: function (value) {
      value = $.trim(value)
      value = value.split(",")
      return this._set(value)
    }
  })

  let mainImageProperty = new Properties.ImageProperty(this, {
    name: "mainImg",
    label: "左侧主图",
    description: "配置左侧主图",
    type: "button",
    useData: true,
    reRender: true,
    options: {
      "url": "<i class=\"fa fa-picture-o\"></i>&nbsp;"
    }
  })

  let mainUrlProperty = new Properties.Property(this, {
    name: "mainUrl",
    label: "主图跳转",
    description: "输入主图跳转链接地址",
    type: "text",
    reRender: true,
    useData: true
  })


  let categoryIdProperty = new Properties.Property(this, {
    name: "frontCategoryId",
    label: "前台类目ID",
    description: "请输入要展示的商品前台类目ID",
    type: "text",
    useData: true,
    reRender: true
  })

  let itemIdsProperty = new Properties.Property(this, {
    name: "itemWhiteList",
    label: "展示商品ID",
    description: "请输入要展示的商品ID(8个，逗号分隔)",
    type: "text",
    useData: true,
    reRender: true
  })

  return this.registerConfigProperty("ext", floorNameProperty, floorKeyWordsProperty, mainImageProperty, mainUrlProperty, categoryIdProperty, itemIdsProperty)
}