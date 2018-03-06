import Pagination  from  "pokeball/components/pagination"
import ListManage from "common/stock_opearting/view"
let warehouseListTemplates = Handlebars.templates["seller/stock_manage/templates/warehouse-list"]

class StockManage {

  constructor ($) {
    this.$jsSecondTr = $(".js-expand-second")
    this.$jsAddStock = $(".js-add-stock")
    this.jsAddStockSubmit = $(".js-add-stock-submit")
    this.jsSearchReset = $(".js-search-reset")
    new Pagination(".list-pagination").total($(".stock-manage-body").data("total")).show($('.list-pagination').data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.ListManage = new ListManage()
    this.init()
    this.bindEvent()
  }

  init() {
    _.each($(".js-view-record"),(i,d)=>{
      let oldHref = $(i).attr("href") + "&unit=",
          newHref = oldHref + $(i).closest(".js-second-level-tr").data("unit")
      $(i).attr("href",newHref)
    })
    //搜索skuCode时,展现出来
    if($.query.get('skuCode') !== "") {
      _.each($('.js-sku-code'),(el,index)=>{
        if($(el).data('outer') == $.query.get('skuCode')) {
          let itemId = $(el).closest('tr').data('item-id')
          $(el).closest('tr').toggle()
          $(el).closest(`.js-tr-${itemId}`).prevAll('.js-first-level-tr').eq(0).find(".js-expand-second").removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie')
        }
      })
    }
    //高亮显示
    // if($.query.get('skuCode') !== "") {
    //   _.each($('.js-sku-code'),(el,index)=>{
    //     if($(el).data('outer') == $.query.get('skuCode')) {
    //       let itemId = $(el).closest('tr').data('item-id')
    //       $(el).closest('.stock-manage-table').find(`.js-tr-${itemId}`).toggle()
    //       $(el).closest(`.js-tr-${itemId}`).prevAll('.js-first-level-tr').eq(0).find(".js-expand-second").removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie')
    //       $(el).closest('tr').css('background-color','yellow')
    //     }
    //   })
    // }
  }

  bindEvent() {
    this.$jsAddStock.on("click", (evt)=>this.addStock(evt))
    this.$jsSecondTr.on("click", (evt)=>this.secondTrToggle(evt))
    this.jsAddStockSubmit.on("click", (evt)=>this.addStockSubmit(evt))
    this.jsSearchReset.on("click", (evt)=>this.searchReset(evt))
  }

  addStock(evt) {
    let thisSelect = $(evt.currentTarget).closest("td").siblings(".js-second-level-td"),
        skuId =  $(evt.currentTarget).closest("tr").data("sku-id"),
        selectWare = thisSelect.find("select")
    selectWare.empty()
    $(evt.currentTarget).closest('.js-second-level-tr').find('.js-add-stock-submit').removeClass('disabled')
    thisSelect.find(".js-add-stock-tr").removeClass("hide")
    $.get(`/api/zcy/stocks/findChoseOfWarehouse?skuId=${skuId}`,(data)=>{
      selectWare.append(warehouseListTemplates({data:data}))
      selectWare.selectric("refresh")
    })
  }

  secondTrToggle(evt) {
    let $evt = $(evt.currentTarget),
        thisDl = $evt.closest(".js-first-level-tr").nextAll(".js-second-level-tr").eq(0),
        skuId = thisDl.data('item-id'),
        Tr = $evt.closest(".js-first-level-tr").nextAll(`.js-tr-${skuId}`)
    if ($evt.hasClass('icon-xiangshangzhedie'))
      $evt.removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie')
    else $evt.removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie')
    Tr.toggle()
  }

  addStockSubmit(evt) {
    $(evt.currentTarget).addClass('disabled')
    let thisTr = $(evt.currentTarget).closest(".js-second-level-tr"),
        thisOption = thisTr.find("select option:selected"),
        itemId = thisTr.data("item-id"),
        skuId = thisTr.data("sku-id"),
        outerSkuId = thisTr.data("outer-sku-id"),
        unit = thisTr.data("unit"),
        quantity = thisTr.find(".js-add-stock-quantity").val(),
        warehouseCode = thisOption.val(),
        warehouseName = thisOption.text(),
        data = JSON.stringify({itemId,skuId,outerSkuId,quantity,warehouseCode})
    this.ListManage.addStockSubmit(evt,itemId,skuId,outerSkuId,quantity,warehouseCode,warehouseName,null,unit)
  }

  searchReset(evt) {
    evt.preventDefault()
    window.location.search = $.query.remove("itemNameCondition").remove("itemIdCondition").remove("skuCode").remove("itemCodeCondition")
  }
}


module.exports = StockManage
