import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
import GetPhone from "common/get_phone/view";
const selectRequisitions = Handlebars.templates["buyer/requisition_list/templates/select_requisitions"];
const TableCheckbox = require('common/table_checkbox/extend')
const CheckedInfoLine = Handlebars.templates["buyer/requisition_list/templates/checkedInfo"]
const dateIntervalPicker = require('common/date-interval-picker/view')
const fuzzyQueryPurchaseOrgs = require('common/fuzzy_query_input/purchaseOrgs/view')
const fuzzyQuerySupplierOrgs = require('common/fuzzy_query_input/supplierOrgs/view')
const fuzzyQueryPurchaser = require('common/fuzzy_query_input/purchaser/view')

class RequisitionList{
  constructor($){
    this.$searchTable = $('.search-table')
    this.totalComment = $(".buyer-req-lists").data("req-lists-total");
    let $reqPagination = $(".req-pagination");
    new Pagination($reqPagination).total(this.totalComment).show($reqPagination.data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    new GetPhone();
    this.itemBatchReject = $(".js-reject-batch");
    this.itemBatchDelete = $(".js-delete-batch");
    this.reqDelete = $(".js-req-delete");
    this.reqSubmit = $(".js-req-submit");
    this.selectRquItem = $(".js-select-requisition-item");
    this.batchSelectItem = $(".js-batch-select");
    this.inputKey = $('.js-search-keyword');
    this.searchResetClick = $('.js-search-reset');
    this.reversed = $('#reversedConfirm');

    this.initQueryConditions();
    this.bindEvent();
    this.allSelectionReqIds="";
    this.allSelectionReqPrice = 0.0;
    this.renderRequisitionList();
  }
  bindEvent(){
    this.sumEveryItem();
    this.sumEveryReq();
    this.selectRquItem.on("change", (evt)=>this.checkReqItems(evt));
    this.batchSelectItem.on("change", (evt)=>this.batchSelectItems(evt));
    this.itemBatchReject.on("click", (evt)=>this.rejectreqs(evt));
    this.itemBatchDelete.on("click", (evt)=>this.deleteItems(evt));
    this.reqDelete.on("click", (evt)=>this.deleteReq(evt));
    $(".js-search").on("click", (evt)=>this.searchRequisitions(evt));
    this.inputKey.on('keypress', (evt)=>this.searchContentKeyPress(evt));
    this.searchResetClick.on('click', ()=>this.clickSearchReset());
    this.reqSubmit.on("click", this.submitReq);
    this.reversed.on('click',(evt)=>this.reversedHandle(evt));
    $('.first-level-tr').on('click', (evt)=>this.hideOrShowSecondLevel(evt));
    $('.js-show-select-modal').on('click', ()=>this.showSelectModal());
  }

  //点击重置按钮
  clickSearchReset(){
    window.location.href = window.location.pathname + '?pageNo=1';
  }
  //关键字按enter按钮事件
  searchContentKeyPress(evt){
    if (!evt) evt = window.event;
    var keyCode = evt.keyCode || evt.which;
    if(keyCode == 13){
      //console.log('关键字按enter按钮事件:'+$(evt.target).val());
      this.searchRequisitions();
    }
  }

  initQueryConditions(){

    this.$searchTable.spin('medium')

    new dateIntervalPicker('.time-interval-input.create-time')

    new fuzzyQueryPurchaseOrgs('select[name="purchaseOrg"]', {
      tag: this.tag,
      module: 'requisition'
    })

    new fuzzyQuerySupplierOrgs('select[name="supplierOrg"]', {
      tag: this.tag,
      module: 'requisition'
    })

    new fuzzyQueryPurchaser('select[name="purchaser"]', {
      tag: this.tag,
      module: 'requisition'
    })

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
  //通过需求单编号查找需求单
  searchRequisitions(evt){
    let url = window.location.pathname + '?pageNo=1';

    //下单时间
    let startTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getStartDate().getTime(),
      endTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getEndDate().getTime()
    if (startTime) {
      url += "&startTime=" + startTime;
    }
    if (endTime) {
      url += "&endTime=" + endTime;
    }

    let status = $(".js-select-status").val();
    if(status!== ""){
      url += "&status="+status;
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

    let rno = $('input[name="rno"]').val();
    if(rno){
      url += "&rno=" + rno;
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

  //批量删除需求单
  deleteItems(evt){
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "需求单【删除】之后不可恢复，确认【删除】？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      _.each($(".js-select-requisition-item:checked"), (checkbox)=>{
        let reqId = $(checkbox).closest(".requisition-tr").data("requisition");
        this.deleteItem(reqId);
      });
      window.location.href = window.location.href;
    })
  }

  deleteReq(evt){
    let reqId = $(evt.target).closest(".requisition-tr").data("requisition");
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "需求单删除之后不可恢复，确认删除？",
      isConfirm: true,
    }).show(()=>{
        $.ajax({
          type: 'GET',
          url: '/api/requisitions/'+reqId+'/delete',
          success:(data)=>{
            window.location.href="/buyer/requisitions";
          },
          error:(data)=>{
            new Modal({
              title:"温馨提示",
              icon:"error",
              content:data.responseText
            }).show();
          }
        })
    });
  }

  //删除需求单
  deleteItem(reqId){
    //console.log("删除需求单测试～～");
    $.ajax({
        type:"DELETE",
        url:"/api/requisitions/"+reqId,
        success:(data)=>{
        },
        error:(data)=>{

        }
    });
  }

 //批量拒绝需求申请单
 rejectreqs(evt){
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "需求单【拒绝】之后不可恢复，确认【拒绝】？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      _.each($(".js-select-requisition-item:checked"), (checkbox)=>{
        let reqId = $(checkbox).closest(".requisition-tr").data("requisition");
        this.rejectreq(reqId);
      });
      window.location.href = window.location.href;
    })
 }
 //拒绝申请单
 rejectreq(reqId){
  $.ajax({
      type:"POST",
      url:"/api/requisitions/"+reqId,
      data: {status:-1},
      dataType: "json",
      success:(data)=>{
      },
      error:(data)=>{
      }
  });
 }

  //选中一个需求单
  checkReqItems(evt){
    let requisitionId = $(evt.target).closest(".requisition-tr").data("requisition");
    //选中需求单的价格小计
    let thisPrice = parseFloat($(evt.target).closest('.requisition-tr').find('.requisition-subtotal').html());
    if($(evt.target).prop("checked")){
       //var requisitions = $(".item-tr[data-site="+requisitionId+"]");
       $(".item-tr[data-site="+requisitionId+"] ").addClass("isSelect");
       if(this.allSelectionReqIds != undefined && this.allSelectionReqIds != ""){
         this.setSelection(this.allSelectionReqIds + "," +requisitionId);
       }
       else{
         this.setSelection(requisitionId);
       }
       //增加总价
       this.allSelectionReqPrice = this.allSelectionReqPrice + thisPrice;
      } else{
       $(".js-batch-select").prop("checked", false);
       $(".item-tr[data-site="+requisitionId+"] ").removeClass("isSelect");
       //删除缓存中的reqIds
       //console.log("删除缓存："+requisitionId);
       this.allSelectionReqIds = this.allSelectionReqIds.filter((id)=>{return id!=requisitionId});
       //减除总价
       this.allSelectionReqPrice = this.allSelectionReqPrice - thisPrice;
       this.setSelection(this.allSelectionReqIds);
     }

  }

  //全选需求单
  batchSelectItems(evt){
    //console.log("全选需求单");
    let thisPrice = 0.0;
    let requisitions = $(".js-select-requisition-item");
    if($(evt.target).prop("checked")){
      let requisitionIds = "";
      _.each(requisitions,(el,index)=>{
        let requisitionId = $(el).closest(".requisition-tr").data("requisition");
        if(this.allSelectionReqIds.indexOf(requisitionId.toString()) > -1) return true;
        //选中需求单的价格小计
        thisPrice += parseFloat($(el).closest('.requisition-tr').find('.requisition-subtotal').html());
        $(el).prop("checked", true);
        $(".item-tr[data-site="+requisitionId+"]").addClass("isSelect");
        //let subtotal = $(".item-tr[data-site="+requisitionId+"] .item-subtotal").html();
        requisitionIds +=requisitionId+","
      });
      if(requisitionIds != ""){
        requisitionIds = requisitionIds.substring(0,requisitionIds.length-1);
        if(this.allSelectionReqIds != undefined && this.allSelectionReqIds != ""){
          this.setSelection(this.allSelectionReqIds + "," +requisitionIds);
        }
        else{
          this.setSelection(requisitionIds);
        }
        //增加总价
        this.allSelectionReqPrice = this.allSelectionReqPrice + thisPrice;
      }
    }else{
      requisitions.prop("checked", false);
      $(".item-tr").removeClass("isSelect");
      //删除缓存中的reqIds
      _.each(requisitions,(item)=>{
        let requisitionId = $(item).closest('.requisition-tr').data('requisition');
        this.allSelectionReqIds = this.allSelectionReqIds.filter((id)=>{return id!=requisitionId});
        //选中需求单的价格小计
        thisPrice = parseFloat($(item).closest('.requisition-tr').find('.requisition-subtotal').html());
        //减除总价
        this.allSelectionReqPrice = this.allSelectionReqPrice - thisPrice;
      });
      this.setSelection(this.allSelectionReqIds);
    }
  }

  //统计选中需求的总数
  selectItemCount(){
    //统计总数
    let sum = this.allSelectionReqIds.length;
    //_.each($(".js-select-requisition-item:checked"), (item)=>{
    //  sum++
    //});
    //$(".total-item .total-count").text(sum);
    $(".total-item .total-count").text(this.allSelectionReqIds.length);
    if(sum != 0){
      $(".js-req-submit").removeAttr("disabled");
     }else{
      $(".js-req-submit").attr("disabled", true);
    }
  }

  //统计选中商品的总价
  totalSum(){
    //统计总价
    let total = this.allSelectionReqPrice;
    //_.each($(".item-tr.isSelect"), (item)=>{
    //  let subtotal = $(item).find(".item-subtotal");
    //  total += parseFloat($(subtotal).text());
    //});
    $(".total-price .currency").text(parseFloat(total).toFixed(2));
  }

  //计算每一个需求单的商品数量和总价
  sumEveryReq(){
    let requisitions = $(".requisition-tr");
    requisitions.each(function(index, item) {
      let requisitionId = $(item).data("requisition");
      let subItems = $(".item-tr[data-site="+requisitionId+"]");
      let price = 0.0;
      let count = 0;
      subItems.each(function(index, el) {
         price += parseFloat($(el).find(".item-subtotal").text());
         count += parseInt($(el).find(".count-number").html());
      });
      $(item).find(".requisition-subsum").text(count);
      $(item).find(".requisition-subtotal").text(price.toFixed(2));
    });
  }
  //需求单列表，循环每个SKU用于计算每个商品价格
  sumEveryItem(){
    _.each($(".item-tr"), (item)=>{
      this.sumItem(item);
    });
  }

  //计算每个商品的价格
  sumItem(item){
    let unitPrice = $(item).find(".sku-price").text();
    let count = parseInt($(item).find(".count-number").html());
    $(item).find(".item-subtotal").text((unitPrice * count).toFixed(2));
  }

  //显示或者隐藏商品列表
  hideOrShowSecondLevel(evt){
    if(evt.target.nodeName == 'INPUT' || evt.target.nodeName == 'A'  || evt.target.nodeName == "SPAN" || evt.target.nodeName == "LABEL"){
      return;
    }
    let items = $(evt.target);
    let id = items.closest('.first-level-tr').data('requisition');
    let item = $('.second-level-tr[data-site="'+id+'"]');
    if($(item).is(":hidden")){
      $(item).slideDown('fast', ()=>{});
    }else{
      $(item).slideUp('fast');
    }
  }
  //撤消按钮
  reversedHandle(evt){
    console.log('hasdhsadh');
    let reverseReason = $('[name="reverseModalRemark"]').val();
    let id = $('.reversed').parent().parent('tr').data('requisition');
    console.log(id);
    $.ajax({
      url: `/api/requisitions/${id}/revoke?reason=${reverseReason}`,
      type: 'get'
    }).done(function(){
      window.location.reload();
    });
  }

  renderRequisitionList(){
    $('.requisition-tr').each((i, tr)=>{
      let requisitionId = $(tr).data('requisition');
      let isValid = true;
      if(requisitionId){
        $(".item-tr[data-site="+requisitionId+"] ").each((i,itemTr)=>{
          let skuStatus = $(itemTr).data('skuStatus');
          if(skuStatus != 1){
            isValid = false;
            return false;
          }
        })
      }
      if(!isValid){
        $(tr).find('.js-items-valid').html('<span class="red-text">商品失效</span>');
      }
    })
  }

  /**
   * 创建采购单事件
   */
  showSelectModal(selectModal, pageNo, pageSize){
    let self = this
    pageNo = pageNo || 1
    pageSize = pageSize || 10
    $('.js-show-select-modal').prop('disabled', true);
    $.ajax({
      url: '/api/requisitions/createPurchase',
      type: 'get',
      data: {pageSize, pageNo}
    }).done((resp)=>{
      resp.createType = $('.js-show-select-modal').data('type')
      if(selectModal){
        let html = $(selectRequisitions(resp)).find('.select-req-list-table')
        $(selectModal.modal).find('.select-req-list-table').replaceWith(html)
        self.renderModal(selectModal);
      }
      else{
        selectModal = new Modal(selectRequisitions(resp));
        selectModal.beforeClose = function () {
          $('.js-show-select-modal').prop('disabled', false);
        }
        selectModal.show();
        self.checkedRequisitions = [];
        self.renderModal(selectModal);
        self.bindModalEvents(selectModal);
      }
      new Pagination(".requisitions-pagination").total($('.requisitions-pagination').data('total')).show(pageSize,
        {
          current_page: pageNo - 1,
          show_if_single_page: true,
          callback : function (pageNo) {

            self.showSelectModal(selectModal, pageNo+1, pageSize)
          }
        });
    }).fail(()=>{
      $('.js-show-select-modal').prop('disabled', false);
    })

  }

  renderModal(selectModal) {
    let self = this

    new TableCheckbox('.select-req-list-table',{
      onLineChange: function (tr, checked) {
        self.getCheckedRequisition(tr, checked)
        self.updateCheckedInfo(selectModal)
      },
      onTotalChange: function (trs, checked) {
        _.each(trs, (tr)=>{
          self.getCheckedRequisition(tr, checked)
        })
        self.updateCheckedInfo(selectModal)
      }
    })

    //计算需求单金额
    let requisitions = $(selectModal.modal).find(".requisition-tr");
    requisitions.each(function(index, tr) {
      let subItems = $(tr).data('requisitionItems');
      let money = 0.0;
      _.each(subItems, (item)=>{
        money += (item.sku.price * item.requisitionItem.quantity / 100)
      })
      $(tr).find(".requisition-subtotal").text(money.toFixed(2));
      //勾选已选择采购单
      let requisitionId = $(tr).data('requisition');
      _.each(self.checkedRequisitions, (requisition)=>{
        if(requisitionId === requisition.id){
          $(tr).find('input[name="table-line-check"]').prop('checked', true);
          return false
        }
      })
    });

    $('.select-req-list-table tbody').prepend(CheckedInfoLine())
    self.updateCheckedInfo(selectModal)
  }

  bindModalEvents(selectModal) {
    let self = this
    $(selectModal.modal).delegate('.js-clear-select', 'click', ()=>{
      $(selectModal.modal).find('input[name="table-total-check"]').prop('checked', false)
      $(selectModal.modal).find('input[name="table-line-check"]').prop('checked', false)
      self.checkedRequisitions = []
      self.updateCheckedInfo(selectModal)
    })
    $(selectModal.modal).delegate('.js-submit', 'click', (evt)=>self.submitRequisitions(evt))
    $(selectModal.modal).delegate('.js-create-order', 'click', (evt)=>self.createOrder(evt))
  }

  getCheckedRequisition(tr, checked) {
    let self = this
    let requisitionId = $(tr).data('requisition')
    if (!requisitionId) return
    if (!checked) {
      let index = -1
      _.each(self.checkedRequisitions, (requisition, i) => {
        if (requisition.id === requisitionId) {
          index = i
          return false
        }
      })
      if (index >= 0) {
        self.checkedRequisitions.splice(index, 1)
      }
    }
    else {
      let money = $(tr).find('.requisition-subtotal').text()
      let items = $(tr).data('requisitionItems')
      money = money ? parseFloat(money) : 0
      self.checkedRequisitions.push({
        id: requisitionId,
        money: money,
        items: items
      })
    }
  }

  updateCheckedInfo(selectModal) {
    let self = this
    let count = self.checkedRequisitions.length, totalMoney = 0
    if (count > 0) {
      $(selectModal.modal).find('.btn-medium').prop('disabled', false)
    }
    else {
      $(selectModal.modal).find('.btn-medium').prop('disabled', true)
    }
    _.each(self.checkedRequisitions, (requisition) => {
      totalMoney += requisition.money
    })
    $(selectModal.modal).find('.js-checked-count').text(count)
    $(selectModal.modal).find('.js-checked-money').text(totalMoney.toFixed(2))
  }

  submitRequisitions(evt) {
    $(evt.target).prop('disabled', true);
    let reqIds
    _.each(this.checkedRequisitions, (requisition) => {
      if (reqIds) {
        reqIds = reqIds + ',' + requisition.id
      }
      else {
        reqIds = requisition.id
      }
    })
    if (reqIds != "") {
      $.ajax({
        type: "GET",
        dataType: "text",
        url: "/api/requisitions/submits?reqIds=" + reqIds + "&type=p",
        success: (data) => {
          window.location.href = "/buyer/purchase-process?purchaseId=" + data;
        },
        error: (data) => {
          new Modal({
            icon: "warning",
            title: "提醒",
            content: "提交失败！错误信息: " + data.responseText + ""
          }).show();
          $(evt.target).prop('disabled', false);
        }
      });
    }
  }

  createOrder(evt) {
    let cartItems = [],
        totalMoney = 0,
        requisitionIds = [],
        cartItemsMap = {}
    _.each(this.checkedRequisitions, (requisition)=>{
      totalMoney += requisition.money
      requisitionIds.push(requisition.id)
      _.each(requisition.items, (item)=>{
        let cartItem = cartItemsMap[item.sku.id]
        if(!cartItem){
          cartItem = {
            sku: item.sku,
            cartItem: item.requisitionItem,
            itemName: item.requisitionItem.itemName,
            itemCount: item.requisitionItem.quantity,
            unbindCount: item.requisitionItem.quantity,
            catalogNodes: item.catalogNodes,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            specification: item.specification,
            unit: item.unit,
            plans:[]
          }
          cartItemsMap[item.sku.id] = cartItem
          cartItems.push(cartItem)
        }
        else{
          cartItem.cartItem.quantity += item.requisitionItem.quantity
          cartItem.itemCount = cartItem.cartItem.quantity
          cartItem.unbindCount = cartItem.cartItem.quantity
        }
      })
    })
    //前端暂存需求单商品
    sessionStorage.setItem('orderItems', JSON.stringify({
      'totalMoney': totalMoney,
      'orderType': 0,
      'data': [{items:cartItems}],
      'requisitionIds': requisitionIds
    }));
    window.location.href = '/buyer/create-order-with-requisitions'
  }
}

module.exports =  RequisitionList;
