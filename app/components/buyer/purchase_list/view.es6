import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
import GetPhone from "common/get_phone/view";
const FormChecker = require('common/formchecker/view')
const dateIntervalPicker = require('common/date-interval-picker/view')
const fuzzyQueryPurchaseOrgs = require('common/fuzzy_query_input/purchaseOrgs/view')
const fuzzyQuerySupplierOrgs = require('common/fuzzy_query_input/supplierOrgs/view')
const fuzzyQueryPurchaser = require('common/fuzzy_query_input/purchaser/view')

class PurchaseOrderList{
  constructor($){
    this.tag = $('.js-purchase-tag').val()
    this.$searchTable = $('.search-table')
    this.totalComment = $(".buyer-pur-lists").data("pur-lists-total");
    this.purDelete = $(".js-pur-delete");
    this.reversed = $('#reversedConfirm');
    new GetPhone();
    this.initQueryConditions();
    this.bindEvent();

    new FormChecker({container: '#reversedModal', ctrlTarget: '#reversedConfirm'});
  }
  bindEvent(){
    this.initUrl();
    $(".js-search").on("click", (evt)=>this.searchPurchases(evt));
    $('.js-search-keyword').on('keypress', (evt)=>this.searchContentKeyPress(evt));
    $('.js-search-reset').on('click', (evt)=>this.clickSearchReset(evt));
    this.purDelete.on("click",  (evt)=>this.deletePurchase(evt));
    this.reversed.on('click',(evt)=>this.reversedHandle(evt));
  }

  initQueryConditions() {
    this.$searchTable.spin('medium')

    new dateIntervalPicker('.time-interval-input.create-time')

    new Pagination($(".list-pagination")).total(this.totalComment).show($(".list-pagination").data("size"),{
      num_display_entries: 5, 
      jump_switch: true, 
      show_if_single_page: true,
      page_size_switch: true
    });

    new fuzzyQueryPurchaseOrgs('select[name="purchaseOrg"]', {
      tag: this.tag,
      module: 'purchase'
    })

    new fuzzyQuerySupplierOrgs('select[name="supplierOrg"]', {
      tag: this.tag,
      module: 'purchase'
    })

    new fuzzyQueryPurchaser('select[name="purchaser"]', {
      tag: this.tag,
      module: 'purchase'
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


    this.$searchTable.spin(false)
  }

  //点击重置按钮
  clickSearchReset(evt){
    window.location.href = window.location.pathname + '?pageNo=1';
  }
  //关键字按enter按钮事件
  searchContentKeyPress(evt){
    if (!evt) evt = window.event;
    var keyCode = evt.keyCode || evt.which;
    if(keyCode == 13){
      this.searchPurchases();
    }
  }

  //采购单列表界面：初始化url对应的过滤条件值
  initUrl(){
    let purchaseId = $.query.get("purchaseId");
    let period = $.query.get("period");
    let status = $.query.get("status");
    let pageNo = $.query.get("pageNo");
    if (purchaseId !== "" && purchaseId != "true")$(".search-content").val(purchaseId);
    if (period !== "" && period != "true")$(".js-select-time").val(period);
    if (status !== "")$(".js-select-status").val(status);

    if (pageNo == "NaN") {
      window.location.href = $.query.set("pageNo",1);
    };
  }
  //通过采购单编号查询采购单
  searchPurchases(evt){
    let url = window.location.pathname + '?pageNo=1',
        tag = $('.js-purchase-tag').val();

    let status = $(".js-select-status").val();
    if(status!== ""){
      url += "&status="+status;
    }

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


    let itemName = $('input[name="itemName"]').val();
    if (itemName) {
      url += "&itemName=" + itemName;
    }

    let confirmationNo=$('input[name="confirmationNo"]').val();
    if (confirmationNo) {
      url += "&confirmationNo=" + confirmationNo;
    }

    let pno = $('input[name="pno"]').val();
    if(pno){
      url += "&pno=" + pno;
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

  //删除采购单
  deletePurchase(evt){
    let purchaseId = $(evt.target).closest(".purchase-tr").data("purchase");
    new Modal({
      icon:"warning",
      title:"温馨提示",
      content:"删除采购单不可恢复，确定删除?",
      isConfirm: true
    }).show(()=>{
      $.ajax({
        type: "DELETE",
        url: "/api/purchases/delete/"+purchaseId,
        success:(data)=>{
          let url, tag = $('.js-purchase-tag').val();
          if(tag == 'vaccine'){
            url = "/buyer/vaccine-purchases";
          }
          else if(tag == 'netsuper'){
            url = "/buyer/netsuper-purchases";
          }
          else {
            url= "/buyer/purchases";
          }
          window.location.href= url;
        },
        error:(data)=>{
          new Modal({
            title:"删除失败",
            icon:"error",
            content:data.responseText
          }).show();
        }
      })
    });
  }
  //撤消按钮
  reversedHandle(evt){
    console.log('hasdhsadh');
    let reverseReason = $('[name="reverseModalRemark"]').val();
    let id = $('.reversed').parent().parent().data('purchase');
    console.log(reverseReason);
    $.ajax({
      url: `/api/purchases/revoke/${id}?reason=${reverseReason}`,
      type: 'get'
    }).done(function(){
      window.location.reload();
    });
  }

}

module.exports =  PurchaseOrderList;
