let Properties = require("eevee/config/properties")

module.exports = function () {

  this.baseInfo.name = "入驻采购单位"
  this.baseInfo.description = "教育科研馆-入驻采购单位"

  this.configs.ext = {
    name: "组件设置"
  }
  this.configs.ext2 ={
    name: "采购单位设置"
  }
  
  let floorNameProperty = new Properties.Property(this, {
    name: "floorName",
    label: "楼层名",
    description: "输入楼层名",
    type: "text",
    useData: true,
    reRender: true
  })

  let purchaseOrgCountProperty = new Properties.Property(this, {
    name: "purchaseOrgCount",
    label: "采购单位数量",
    description: "请输入要展示的采购单位数量（正整数）",
    type: "text",
    default: 0,
    useData: true,
    reRender: true,
    set: function (value){
      this._set(value)
      let defaultData = [],
        originalData = dataProperty.get().slice(0, parseInt(value))
      _.times(parseInt(value), function() {
        defaultData.push({})
        dataProperty.set(_.extend(defaultData, originalData))
      })
    }
  }) 

  let setImage =  (v, k, i) => {
    let x = _.clone(dataProperty.get())
    x[i] = x[i] || {}
    x[i][k] = v
    dataProperty.set(x)
  }

  let props = []
  _.times(purchaseOrgCountProperty.get(), (i) => {
    let index = i + 1
    props.push(new Properties.ImageProperty(this, {
      name: `采购单位${index}的logo`,
      label: `采购单位${index}的logo`,
      description: `为第${index}个采购单位选择logo`,
      useData: false,
      reRender: true,
      options: {
        "url": () => {
          if (dataProperty.get()[i]) {
            return `<img src="${dataProperty.get()[i]['image']}" style="width:22px;height:22px;">`
          }
          return "<i class=\"fa fa-picture-o\"></i>"
        }
      },
      setCallback: function(url){
        setImage(url, "image" , i)
      },
      get: function() {
        if (dataProperty.get()[i]) {
          return dataProperty.get()[i]["image"]
        }
        return null
      }
    }))
    props.push(new Properties.Property(this, {
      name: `采购单位${index}的ID`,
      label: `采购单位${index}的ID`,
      description: `第${index}个采购单位的ID`,
      type: "text",
      class: "small",
      useData: false,
      reRender: true,
      set: function(value){
        this._set(value)
        setImage(value, "id" , i)
      },
      get: function() {
        if (dataProperty.get()[i]) {
          return dataProperty.get()[i]["id"]
        }
        return null
      }
    }))
    props.push(new Properties.Property(this, {
      name: `采购单位${index}的名称`,
      label: `采购单位${index}的名称`,
      description: `第${index}个采购单位的名称`,
      type: "text",
      class: "small",
      useData: false,
      reRender: true,
      set: function(value){
        this._set(value)
        setImage(value, "name" , i)
      },
      get: function() {
        if (dataProperty.get()[i]) {
          return dataProperty.get()[i]["name"]
        }
        return null
      }
    }))
  })
 
  let dataProperty = new Properties.Property(this, {
    name: "purchaseOrgs",
    type: "text",
    default: [],
    reRender: true,
    useDate: true
  })
    
  this.registerConfigProperty("ext", floorNameProperty, purchaseOrgCountProperty)
  this.registerConfigProperty.apply(this, ["ext2"].concat(props))
}