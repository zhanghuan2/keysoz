import Modal from "pokeball/components/modal"
let addStockTemplates = Handlebars.templates["seller/stock_manage/templates/add-stock"]

class ListManage {

  constructor($) {
    this.$jsStock = ".js-stock"
    this.$jsCancelStock = ".js-cancel-stock"
    this.$jsCancelAddStock = ".js-cancle-add-stock"
    this.jsInRealStock = ".js-in-real-stock"
    this.jsOutRealStock = ".js-out-real-stock"
    this.isNumber = true
    this.bindEvent()
  }

  bindEvent() {
    
    $(document).on("click",this.$jsStock, (evt)=>this.inOutStock(evt))
    $(document).on("click",this.$jsCancelStock, (evt)=>this.cancelStock(evt))
    $(document).on("click", this.$jsCancelAddStock,(evt)=>this.cancelAddStock(evt))
    $(document).on("click", this.jsInRealStock,(evt)=>this.stockChange(evt,0))
    $(document).on("click", this.jsOutRealStock,(evt)=>this.stockChange(evt,1))
  }

  cancelStock(evt) {
    let thisDl = $(evt.currentTarget).closest(".operating-list")
    let thisButton = thisDl.find(".js-in-out-stock")
    thisDl.find(".js-in-out-stock-input").addClass("hide")
    thisDl.find("a").removeClass("hide")
    if (thisButton.hasClass("js-in-real-stock")) {
      thisButton.removeClass("js-in-real-stock")
    }
    if (thisButton.hasClass("js-out-real-stock")) {
      thisButton.removeClass("js-out-real-stock")
    }
  }

  inOutStock(evt) {
    let thisDl = $(evt.currentTarget).closest(".operating-list")
    thisDl.find(".js-in-out-stock-input").removeClass("hide")
    thisDl.find("a").addClass("hide")
    thisDl.find('.js-in-out-stock').removeClass('disabled')
    if($(evt.currentTarget).hasClass("js-in-stock")) {
      thisDl.find(".js-in-out-stock").addClass("js-in-real-stock")
    }
    if($(evt.currentTarget).hasClass("js-out-stock")) {
      thisDl.find(".js-in-out-stock").addClass("js-out-real-stock")
    }
  }

  cancelAddStock(evt) {
    $(evt.currentTarget).closest(".js-add-stock-tr").addClass("hide")
  }

  //入库出库通用$.ajax
  stockChange(evt,type) {
    let skuId = $(evt.currentTarget).closest("tr").data("sku-id"),
        warehouseCode = $(evt.currentTarget).closest("tr").data("warehouse-code"),
        quantity = $(evt.currentTarget).siblings(".js-change-quantity").val()
    this.stockChangeImpl(evt,type,quantity,skuId,warehouseCode)
  }

  stockChangeImpl(evt,type,quantity,skuId,warehouseCode) {
    let message,
        quantityNew,
        quantityAllNew,
        quantityDl = $(evt.currentTarget).closest("tr").find(".js-save-quantity"),
        unit = $(evt.currentTarget).closest("tr").data("unit"),
        quantityAllDl = $(evt.currentTarget).closest('.js-second-level-tr').find('.all-sku-quantity'),
        thisDl = $(evt.currentTarget).closest(".js-in-out-stock-input"),
        quantityOld = parseInt(quantityDl.text()),
        quantityAllOld = parseInt(quantityAllDl.text()),
        quantityChange = parseInt(thisDl.find(".js-change-quantity").val()),
        data = `type=${type}&quantity=${quantity}&skuId=${skuId}&warehouseCode=${warehouseCode}`,
        value = $(evt.currentTarget).siblings(".js-change-quantity").val()
    $(evt.currentTarget).addClass('disabled')
    if (type == 0) {
      message = "入库失败"
      quantityNew = quantityChange + quantityOld
      quantityAllNew = quantityChange + quantityAllOld
    }else {
      message = "出库失败"
      quantityNew = quantityOld - quantityChange
      quantityAllNew = quantityAllOld - quantityChange
    }
    $.ajax({
      url: "/api/zcy/stocks/changeStock",
      type: "POST",
      data: data,
      success: (data)=>{
        if (unit) {
          quantityDl.text(quantityNew + unit)
        } else {
          quantityDl.text(quantityNew)
        }
        quantityAllDl.text(quantityAllNew)
        thisDl.find(".js-change-quantity").val("")
        thisDl.addClass("hide")
        thisDl.siblings("a").removeClass("hide")
        this.cancelStock(evt)    //成功后去除 入库class
      },
      error: (data)=>{
        this.valNumber(evt,message,data,value)
        $(evt.currentTarget).removeClass('disabled')
      }
    })
  }

  //增加仓库
  addStockSubmit(evt,itemId,skuId,outerSkuId,quantity,warehouseCode,warehouseName,type,unit) {
    let value = $(evt.currentTarget).closest("tr").find(".js-add-stock-quantity").val(),
        message = "操作失败",
        result = {quantity,warehouseName,warehouseCode,skuId,unit},
        thisTr = $(evt.currentTarget).closest('.js-second-level-td').find('.js-add-stock-tr')
    if(warehouseCode == "0") {
      new Modal({
        icon: "warning",
        title: "警告",
        content: "请选择仓库"
      }).show(()=>{
        $(evt.currentTarget).removeClass('disabled')
      })
    }else {
      $.ajax({
        url: "/api/zcy/stocks/addSkuWarehouse",
        type: "POST",
        data: `itemId=${itemId}&skuId=${skuId}&outerSkuId=${outerSkuId}&quantity=${quantity}&warehouseCode=${warehouseCode}&comment='增加仓库'`,
        success: (data)=>{
          if (type == 1) {
            thisTr = $('.js-add-stock-tr')
            result = {quantity,warehouseName,warehouseCode,skuId,type,unit}
          }
          thisTr.after(addStockTemplates({data:result}))
          $('.fover-first').nextAll('tr').eq(0).removeClass('first')
          this.cancelAddStock(evt)
        },
        error: (data)=>{
          $(evt.currentTarget).removeClass('disabled')
          this.valNumber(evt,message,data,value)
        }
      })
    }
  }

  //验证为数字的输入框
  valNumber(evt,message,data,value) {
    let reg = /^[0-9]*$/
    if(!reg.test(value)) {
      this.isNumber = false
      new Modal({
        icon: 'warning',
        title: '输入错误',
        content: '请输入正整数'
      }).show()
    } else {
      new Modal({
        icon: "error",
        title: message,
        content: data.responseText
      }).show()
    }
  }
}

module.exports = ListManage
