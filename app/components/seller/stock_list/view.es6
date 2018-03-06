import Modal from "pokeball/components/modal"
import ListManage from "common/stock_opearting/view"
import Pagination  from  "pokeball/components/pagination"
let warehouseListTemplates = Handlebars.templates["seller/stock_manage/templates/warehouse-list"]
let getAllTemplates = Handlebars.templates["seller/stock_list/templates/all-stock"]

class StockList{

  constructor($) {
    this.$jsAddStockBtn = $(".js-add-stock-btn")
    this.$jsAddStockSubmit = $(".js-add-stock-submit")
    this.skuId = $(".stock-list-body").data("sku-id")
    this.$jsSearchButton = $(".js-search-button")
    this.$jsSearchReset = $(".js-search-reset")
    this.ListManage = new ListManage()
    this.bindEvent()
    this.getAllStock()
  }

  bindEvent() {
    new Pagination(".pagination").total($(".stock-list-body").data("total")).show($('.pagination').data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.$jsAddStockBtn.on("click", (evt)=>this.addStockBtn(evt))
    this.$jsAddStockSubmit.on("click", (evt)=>this.addStockSubmit(evt))
    this.$jsSearchButton.on("click", (evt)=>this.search(evt))
    this.$jsSearchReset.on("click", (evt)=>this.searchReset(evt))
  }

  addStockBtn(evt) {
    let skuId = this.skuId
    $(".js-add-stock-tr").removeClass("hide")
    let selectWare = $(".js-add-stock-tr").find("select")
    selectWare.empty()
    $('.js-add-stock-submit').removeAttr('disabled')
    $.get(`/api/zcy/stocks/findChoseOfWarehouse?skuId=${skuId}`,(data)=>{
      selectWare.append(warehouseListTemplates({data:data}))
      selectWare.selectric("refresh")
    })
  }

  addStockSubmit(evt) {
    let itemId = $(".product-sku-list").data("item-id"),
        skuId = this.skuId,
        outerSkuId = $(".product-sku-list").data("outer-sku-id"),
        quantity = $(evt.currentTarget).closest(".js-add-stock-tr").find(".js-add-stock-quantity").val(),
        warehouseCode = $(evt.currentTarget).closest("tr").find("select option:selected").val(),
        warehouseName = $(evt.currentTarget).closest("tr").find("select option:selected").text()
    $(evt.currentTarget).attr('disabled','disabled')
    this.ListManage.addStockSubmit(evt,itemId,skuId,outerSkuId,quantity,warehouseCode,warehouseName,1)
  }

  search(evt) {
    evt.preventDefault()
    let selectWare = $(evt.currentTarget).closest("#form4").find("select option:selected")
    let code = $(".js-select-warehouse-code").val()
    window.location.search = $.query.set("warehouseId",selectWare.val()).set("warehouseCode",code)
  }

  searchReset(evt) {
    evt.preventDefault()
    window.location.search = $.query.remove("warehouseId").remove("warehouseCode")
  }

  getAllStock() {
    let skuId = this.skuId
    $.get(`/api/zcy/findSkuWarehouse?skuId=${skuId}`,(data)=>{
      $(".js-select-warehouse-id").append(getAllTemplates({result:data.data}))
      $(".js-select-warehouse-id").val($(".stock-list-body").data("warehouse-id"))
      $(".js-select-warehouse-id").selectric("refresh")
    })
  }

}

module.exports = StockList
