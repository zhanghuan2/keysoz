let OrderFormList  = require('buyer/order_form_list/view')
import Pagination from "pokeball/components/pagination"
const fuzzyQueryPurchaseOrgs = require('common/fuzzy_query_input/purchaseOrgs/view')
const fuzzyQuerySupplierOrgs = require('common/fuzzy_query_input/supplierOrgs/view')
const fuzzyQueryPurchaser = require('common/fuzzy_query_input/purchaser/view')
const dateIntervalPicker = require('common/date-interval-picker/view')
const ItemServices = require('common/item_services/view')

class CustomerOrder extends OrderFormList {

  constructor($) {
    super($)
    this.tag = $('.js-order-tag').val() || 'all'
    $('.search-row').find('.search-cell:first').addClass('first')
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  initQueryConditions() {
    this.$searchTable.spin('medium')

    new dateIntervalPicker('.time-interval-input.create-time')
    new dateIntervalPicker('.time-interval-input.receive-time')


    new fuzzyQueryPurchaseOrgs('select[name="purchaseOrg"]', {
      tag: this.tag,
      module: 'order'
    })

    new fuzzyQuerySupplierOrgs('select[name="supplierOrg"]', {
      tag: this.tag,
      module: 'order'
    })

    new fuzzyQueryPurchaser('select[name="purchaser"]', {
      tag: this.tag,
      module: 'order'
    })


    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })

    let pageNo = $.query.get("pageNo")
    if (pageNo == "NaN") {
      window.location.href = $.query.set("pageNo", 1)
    }

    let st = $.query.get("startTime"),
      et = $.query.get("endTime")
    if(st){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setStartDate(st)
    }
    if(et){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setEndDate(et)
    }

    let receivedAtStart = $.query.get("receivedAtStart"),
      receivedAtEnd = $.query.get("receivedAtEnd")
    if(receivedAtStart){
      $('.time-interval-input.receive-time').data('dateIntervalPicker').setStartDate(receivedAtStart)
    }
    if(receivedAtEnd){
      $('.time-interval-input.receive-time').data('dateIntervalPicker').setEndDate(receivedAtEnd)
    }

    this.$searchTable.spin(false)
  }

  //点击搜索
  searchOrders() {
    let url = window.location.pathname + '?pageNo=1'

    //下单时间
    let startTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getStartDate().getTime(),
      endTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getEndDate().getTime()
    if (startTime) {
      url += "&startTime=" + startTime;
    }
    if (endTime) {
      url += "&endTime=" + endTime;
    }

    //确认收货时间
    let receivedAtStart = $('.time-interval-input.receive-time').data('dateIntervalPicker').getStartDate().getTime(),
      receivedAtEnd = $('.time-interval-input.receive-time').data('dateIntervalPicker').getEndDate().getTime()
    if (receivedAtStart) {
      url += "&receivedAtStart=" + receivedAtStart;
    }
    if (receivedAtEnd) {
      url += "&receivedAtEnd=" + receivedAtEnd;
    }

    //订单金额
    let minFee = $(".js-search-minFee").val(),
      maxFee = $(".js-search-maxFee").val()
    if(isNaN(minFee) || isNaN(maxFee)){
      ZCY.error("错误","最小价格和最大价格只能为数字！");
      return;
    } else if(maxFee && minFee && maxFee - minFee < 0){
      ZCY.error("错误","最大金额不能小于最小金额！");
      return;
    }
    if (minFee !== "" && minFee !== undefined) {
      url += "&minFee=" + minFee;
    }
    if (maxFee !== "" && maxFee !== undefined) {
      url += "&maxFee=" + maxFee;
    }

    let orderNo = $('input[name="orderNo"]').val();
    if (orderNo) {
      url += "&orderNo=" + orderNo;
    }

    let status = $(".js-select-status").val();
    if (status !== "") {
      url += "&status=" + status;
    }

    let itemName=$('input[name="itemName"]').val();
    if (itemName) {
      url += "&itemName=" + itemName;
    }

    let confirmationNo=$('input[name="confirmationNo"]').val();
    if (confirmationNo) {
      url += "&confirmationNo=" + confirmationNo;
    }

    let purchaserOrderId = $('input[name="purchaserOrderId"]').val();
    if(purchaserOrderId){
      url += "&purchaserOrderId=" + purchaserOrderId;
    }

    let districtCode = $('input[name="districtCode"]').val();
    let districtName = $('input[name="districtName"]').val();
    if(districtCode && districtName){
      url += "&districtCode=" + districtCode + "&districtName="+ districtName;
    }

    let $supplierOrgSelect = $('select[name="supplierOrg"]'),
      supplierOrgName = $supplierOrgSelect.data('orgName'),
      supplierOrgId = $supplierOrgSelect.data('orgId')
    if (supplierOrgName && supplierOrgId) {
      url += `&supplierOrgName=${supplierOrgName}&supplierOrgId=${supplierOrgId}`
    }

    let $purchaseOrgSelect = $('select[name="purchaseOrg"]'),
      purchaseOrgName = $purchaseOrgSelect.data('orgName'),
      purchaseOrgId = $purchaseOrgSelect.data('orgId')
    if (purchaseOrgName && purchaseOrgId) {
      url += `&purchaseOrgName=${purchaseOrgName}&orgId=${purchaseOrgId}`
    }

    let $purchaserSelect = $('select[name="purchaser"]'),
      purchaserName = $purchaserSelect.data('name'),
      purchaserId = $purchaserSelect.data('userId')
    if (purchaserName && purchaserId) {
      url += `&purchaserName=${purchaserName}&purchaserId=${purchaserId}`
    }

    window.location.href = url;
  }
}

module.exports = CustomerOrder;
