let Properties = require("eevee/config/properties")

module.exports = function () {

  this.baseInfo.name = "精选品牌"
  this.baseInfo.description = "教育科研馆-精选品牌"

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

  let brandIdsProperty = new Properties.Property(this, {
    name: "brandList",
    label: "品牌ID",
    description: "请输入要展示的品牌ID(6个)，用“,”分割",
    type: "text",
    useData: true,
    reRender: true
  })


  return this.registerConfigProperty("ext", floorNameProperty, brandIdsProperty)
}