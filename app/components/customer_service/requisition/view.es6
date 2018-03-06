import Pagination from "pokeball/components/pagination"
const CustomerUtil = require('customer_service/extend')
const dateIntervalPicker = require('common/date-interval-picker/view')
const fuzzyQueryPurchaseOrgs = require('common/fuzzy_query_input/purchaseOrgs/view')
const fuzzyQuerySupplierOrgs = require('common/fuzzy_query_input/supplierOrgs/view')
const ItemServices = require('common/item_services/view')

let _self

class CustomerRequisition extends CustomerUtil {
  constructor () {
    super()
    _self = this
    this.pagination = $(".list-pagination")
    _self.initQueryConditions()
    _self.bindEvents()
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  initQueryConditions() {


    new dateIntervalPicker('.time-interval-input.create-time')

    new fuzzyQueryPurchaseOrgs('select[name="purchaseOrg"]', {
      tag: 'all',
      module: 'requisition',
      width: '190px'
    })

    new fuzzyQuerySupplierOrgs('select[name="supplierOrg"]', {
      tag: 'all',
      module: 'requisition',
      width: '190px'
    })

    let pageNo = $.query.get("pageNo")
    if (pageNo == "NaN") {
      window.location.href = $.query.set("pageNo", 1)
    }

    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      show_if_single_page: true,
      jump_switch: true,
      page_size_switch: true
    })

    let st = $.query.get("startTime"),
      et = $.query.get("endTime")
    if(st){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setStartDate(st)
    }
    if(et){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setEndDate(et)
    }

    $('select[name="status"]').selectric()
  }

  /* 绑定页面操作事件 */
  bindEvents () {
    $('#searchBtn').on('click', () => this.searchRequistions())
    $('#resetBtn').on('click', () => this.resetSearch())
  }

  searchRequistions () {
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


    //预购单金额
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

    let rno = $('input[name="rno"]').val();
    if (rno) {
      url += "&rno=" + rno;
    }

    let status = $('select[name="status"]').val();
    if (status !== "") {
      url += "&status=" + status;
    }


    let itemName = $('input[name="itemName"]').val();
    if (itemName) {
      url += "&itemName=" + itemName;
    }

    let pno = $('input[name="pno"]').val();
    if(pno){
      url += "&pno=" + pno;
    }

    let buyerId = $('select[name="userId"]').val();
    if(buyerId){
      url += "&buyerId=" + buyerId;
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
    
    let pageSize = $('.items-per-page-selector').val()
    if (pageSize) {
      url += `&pageSize=${pageSize}`
    }
    
    window.location.href = url;
  }

  resetSearch () {
    window.location.href = window.location.pathname + '?pageNo=1&pageSize=10';
  }
}

module.exports = CustomerRequisition
