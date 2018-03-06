import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
import GetPhone from "common/get_phone/view";
const comfirmOrder = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/comfirmOrder"];
const orderPrint = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/order-print"];
let Download = require('common/uploadFile/extend');


class PurchaseOrderDetail{
  constructor($){
    this.purCancel = $('.js-pur-cancel');
    this.purSubmit = $('.js-pur-submit');
    //配送地址
    this.initPurchaseInfo();
    this.purAddrAdd = $(".js-add-pur-addr");
    this.otherAddrSelect = $('.js-select-other-pur-addr');
    this.unifiedAddr = $(".js-unifiedAddr");
    this.mulitAddr = $('.js-mulitAddr');
    this.newAddrAddr = $('.js-add-new-addr');
    this.defaultAddrSet = $('.js-set-default-addr');
    this.itemsForReceiverShow = $('.js-show-receiver-item-list');
    this.unbindItemsForReceiverShow = $('.js-show-receiver-unbind-item-list');
    this.receiverItemDelete = $('.js-delete-receiver-item');
    //发票信息
    this.unifiedInv = $(".js-unifiedInv");
    this.mulitInv = $('.js-mulitInv');
    this.invTitleSave = $('.js-save-inv-title');
    this.mulitInvTitleSave = $('.js-save-mulit-inv-title');
    this.otherInvAddrSelect = $('.js-select-other-pur-inv-addr');
    this.newAddrInv = $('.js-add-new-inv');
    this.itemsForInvShow = $('.js-show-inv-item-list');
    this.unbindItemsForInvShow = $('.js-show-inv-unbind-item-list');
    this.invItemDelete = $('.js-delete-inv-item');
    this.popoverEvents();
    //预算信息
    this.newAddrPay = $('.js-add-new-pay');
    this.itemsForPayShow = $('.js-show-pay-item-list');
    this.unbindItemsForPayShow = $('.js-show-pay-unbind-item-list');
    this.payItemDelete = $('.js-delete-pay-item');
    this.itemsForOtherPayShow = $('.js-show-other-pay-item-list');
    this.$print = $('.btn-print');
    new GetPhone();
    this.bindEvent();
    this.Ordermodal = "";
    new Download(
      '',
      '/api/zcy/attachment/downloadUrl',
      '#uploadFile'
    );
  }

  bindEvent(){
    this.purCancel.on('click', (evt)=>{this.deletePurchase(evt)});
    this.purSubmit.on('click', (evt)=>{this.submitPurchase(evt)});
    //配送地址绑定事件
    this.purAddrAdd.on('click', (evt)=>this.addPurAddr(evt));
    this.defaultAddrSet.on('click', (evt)=>this.setDefaultAddr(evt));
    this.otherAddrSelect.on('click', (evt)=>this.selectOtherAddr(evt));
    this.unifiedAddr.on('change', (evt)=>this.selectUnifiedAddr(evt));
    this.mulitAddr.on('change', (evt)=>this.selectMulitAddr(evt));
    this.newAddrAddr.on('click', (evt)=>this.mulitAddrAddNewAddr(evt));
    this.itemsForReceiverShow.on('click', (evt)=>this.showItemsForReceiver(evt));
    this.unbindItemsForReceiverShow.on('click', (evt)=>this.showUnbindItemsForReceiver(evt));
    this.receiverItemDelete.on('click', (evt)=>this.deleteReceiverItem(evt));
    //发票信息绑定事件
    this.unifiedInv.on('change', (evt)=>this.selectUnifiedInv(evt));
    this.mulitInv.on('change', (evt)=>this.selectMulitInv(evt));
    this.invTitleSave.on('click', (evt)=>this.saveInvTitle(evt));
    this.mulitInvTitleSave.on('click', (evt)=>this.saveMulitInvTitle(evt));
    this.otherInvAddrSelect.on('click', (evt)=>this.selectOtherInvAddr(evt));
    this.newAddrInv.on('click', (evt)=>this.mulitInvAddNewInv(evt));
    this.itemsForInvShow.on('click', (evt)=>this.showItemsForInv(evt));
    this.unbindItemsForInvShow.on('click', (evt)=>this.showUnbindItemsForInv(evt));
    this.invItemDelete.on('click', (evt)=>this.deleteInvItem(evt));
    //预算信息绑定事件
    this.newAddrPay.on('click', (evt)=>this.addNewPay(evt));
    this.itemsForPayShow.on('click', (evt)=>this.showItemsForPay(evt));
    this.unbindItemsForPayShow.on('click', (evt)=>this.showUnbindItemsForPay(evt));
    this.payItemDelete.on('click', (evt)=>this.deletePayItem(evt));
    this.itemsForOtherPayShow.on('click', (evt)=>this.showItemsForOtherPay(evt));
    this.$print.on('click', (evt)=>this.showPrint(evt));
  }

  /**
   * 初始化popover显示
   * */
  popoverEvents(){
    let $info = '<div>如果您的单位没有纳税人识别号码，可输入统一社会信用代码代替</div>'
    $('.js-invoice-popover').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      content: $info,
      delay: {
        hide: 100
      }
    })
  }
  //打印采购单
  showPrint(){
    if($(".order-detail-print-content").length==1){
      $(".order-detail-print-content").print();
      return;
    }
    $.ajax({
      url:"/api/purchaseOrder/printPurchaseById",
      type:"GET",
      data:$.query.keys,
      success:(result)=>{
        let template = orderPrint(result);
        $(".order-print-box").html(template);

          let tr =  $(".order-print-box").find(".item-list tbody tr.item-tr-price");
          let sumAll = 0;
          $.each(tr,function(){
            let price = $(this).find(".count_td").html()-0;
            let count = $(this).find(".price_td").data("price")-0;
            let sum = (price*count).toFixed(2);
            $(this).find(".price_td").html(sum);
            sumAll += (sum-0);
          });
        $(".order-print-box .total-money").html(sumAll.toFixed(2));
        $(".order-detail-print-content").print();
      },
      error:()=>{

      }
    });
  }

  //确定采购单模块：初始化采购单信息
  initPurchaseInfo(){
    let selectedAddress = $('.selected-receiver-address');
    if($('#deliveryList').val() != null && $('#deliveryList').val() != ""){
      let deliveryList = JSON.parse($('#deliveryList').val());
      if(deliveryList.length > 0){
        let delivery = deliveryList && deliveryList[0].delivery;
        if(delivery != undefined){
          let _label = delivery.receiverProvinceName+delivery.receiverCityName+delivery.receiverDistrictName+
          "&nbsp;&nbsp;"+delivery.receiverAddress+"("+delivery.receiverName+" 收)"+
          "&nbsp;&nbsp;&nbsp;&nbsp;"+delivery.receiverMobile+'<a class="js-set-default-addr set-default-addr">设为默认地址</a>';
          selectedAddress.html(_label);
          selectedAddress.data('id', delivery.id);
        }
      }else {
        selectedAddress.html("无数据");
      }
    }
  }

  /////////////////////采购单地址配送模块脚本开始//////////////////////////

  //显示已经绑定地址的商品列表
  showItemsForReceiver(evt,pageNo,templates){
    let deliveryId = $(evt.target).closest('.itme-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/purchases/delivery/'+deliveryId+'/items',
      type: 'GET',
      data:{pageNo, pageSize},
      success:(result)=>{
        if(result.total == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"该地址暂无商品，请先添加商品。"
          }).show();
        }else{
          _.each(result.data,(el,index)=>{
            let subItemCount = el.currentCount + el.unbindDeliveryCount;
            el.subItemCount = subItemCount;
          });
          result.deliveryId=deliveryId;
          result.wontNeedShow = true;
          if(templates == undefined){
            //let _showItemsForReceiver = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/showDeliveryItems"];
            let _showItemsForReceiver = Handlebars.wrapTemplate("buyer/purchase_detail/purchase_order_detail/templates/showDeliveryItems");
            templates = _showItemsForReceiver;
            let _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
            _modal.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
            this.bindShowDeliveryItemFormOnce(0);
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
                  //console.log("select value:"+value);
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(input).data('init'));
                  //this.changeCountAffect(input,initData);
                  let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
                  let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
                  let nowData = $(input).val();
                  let diffent = nowData-initData;
                  unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
                }
              })
            });
          }
          this.bindShowDeliveryItemForm(0);
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              //_modal.close();
              this.showItemsForReceiver(evt,pageNo+1,templates);
            }
          });
        }
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowDeliveryItemForm(mode){
    // $(".plus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $(".minus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $("input.count-number").on("keyup", (evt)=>this.changeCount(evt,mode));
    // $("input.count-number").on("change", (evt)=>this.changeCount(evt,mode));
    // //初始化数字增减控件
    // $('.input-amount').amount();
    // $('.js-select-item').on("change", (evt)=>this.checkOneItem(evt));
    $("input.count-number").attr("readonly","readonly");
    $('.js-select-item').css("display","none");
  }
  //显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowDeliveryItemFormOnce(mode){
    // $('.js-batch-select').on("change", (evt)=>this.batchSelectItems(evt));
    // $('.js-delivery-items-submit').on('click', (evt)=>this.deliveryItemsSubmit(evt,mode));
    $('.js-batch-select').closest('label').css("display","none");
    $('.js-invoice-items-submit').css("display","none");
    $('.js-delivery-items-submit').css("display","none");
    $('.js-payment-items-submit').css("display","none");
  }

  /////////////////////采购单地址配送模块脚本结束//////////////////////////

  /////////////////////采购单发票信息模块脚本开始//////////////////////////

  //查看已经绑定发票信息的商品列表
  showItemsForInv(evt,pageNo,templates){
    let itemId = $(evt.target).closest('.itme-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/purchases/invoice/'+itemId+'/items',
      type: 'GET',
      data:{pageNo, pageSize},
      success:(result)=>{
        if(result.total == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"该发票暂无商品，请先添加商品。"
          }).show();
        }else{
          _.each(result.data,(el,index)=>{
            let subItemCount = el.currentCount + el.unbindInvoiceCount;
            el.subItemCount = subItemCount;
          });
          result.itemId=itemId;
          result.wontNeedShow = true;
          if(templates == undefined){
            let _showItemsForReceiver = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/showInvoiceItems"];
            templates = _showItemsForReceiver;
            let _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
            _modal.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
            this.bindShowInvoiceItemFormOnce(0);
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
                  console.log("select value:"+value);
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(input).data('init'));
                  //this.changeCountAffect(input,initData);
                  let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
                  let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
                  let nowData = $(input).val();
                  let diffent = nowData-initData;
                  unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
                }
              })
            });
          }
          this.bindShowInvoiceItemForm(0);
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              //_modal.close();
              this.showItemsForInv(evt,pageNo+1,templates);
            }
          });
        }
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowInvoiceItemForm(mode){
    // $(".plus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $(".minus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $("input.count-number").on("keyup", (evt)=>this.changeCount(evt,mode));
    // $("input.count-number").on("change", (evt)=>this.changeCount(evt,mode));
    // //初始化数字增减控件
    // $('.input-amount').amount();
    // $('.js-select-item').on("change", (evt)=>this.checkOneItem(evt));
    $("input.count-number").attr("readonly","readonly");
    $('.js-select-item').css("display","none");
  }
  //显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowInvoiceItemFormOnce(mode){
    // $('.js-batch-select').on("change", (evt)=>this.batchSelectItems(evt));
    // $('.js-invoice-items-submit').on('click', (evt)=>this.invoiceItemsSubmit(evt,mode));
    $('.js-batch-select').closest('label').css("display","none");
    $('.js-invoice-items-submit').css("display","none");
    $('.js-delivery-items-submit').css("display","none");
    $('.js-payment-items-submit').css("display","none");
  }

  /////////////////////采购单发票信息模块脚本结束//////////////////////////

  /////////////////////采购单预算信息模块脚本开始//////////////////////////

  //显示已关联确认书的商品列表
  showItemsForPay(evt,pageNo,templates){
    let itemId = $(evt.target).closest('.itme-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    //获取选中的确认书信息，以便在显示商品列表中看到
    let paymentsInfo = {};
    paymentsInfo.confirmationId  = $(evt.target).closest('.itme-tr').find('.js-confirmationname').data("confirmationid");
    paymentsInfo.confirmationName  = $(evt.target).closest('.itme-tr').find('.js-confirmationname').html();
    paymentsInfo.gpCatalogId  = $(evt.target).closest('.itme-tr').find('.js-gpcatalogname').data("gpcatalogid");
    paymentsInfo.gpCatalogName  = $(evt.target).closest('.itme-tr').find('.js-gpcatalogname').html();
    paymentsInfo.availableAccount  = $(evt.target).closest('.itme-tr').find('.js-availableaccount').html();
    paymentsInfo.availableQuantity  = $(evt.target).closest('.itme-tr').find('.js-availablequantity').html();
    paymentsInfo.fee  = $(evt.target).closest('.itme-tr').find('.js-fee').html();
    paymentsInfo.quantity  = $(evt.target).closest('.itme-tr').find('.js-quantity').html();

    $.ajax({
      url: '/api/purchases/payment/'+itemId+'/items',
      type: 'GET',
      data:{pageNo, pageSize},
      success:(result)=>{
        if(result.total == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"该确认书暂无商品，请先添加商品。"
          }).show();
        }else{
          _.each(result.data,(el,index)=>{
            let subItemCount = el.currentCount + el.unbindPayCount;
            el.subItemCount = subItemCount;
          });
          result.itemId=itemId;
          result.wontNeedShow = true;
          result.paymentsInfo = paymentsInfo;
          if(templates == undefined){
            let _showItemsForReceiver = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/showPaymentItems"];
            templates = _showItemsForReceiver;
            let _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
            _modal.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
            this.bindShowPaymentItemFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
                  console.log("select value:"+value);
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(input).data('init'));
                  //this.changeCountAffect(input,initData);
                  let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
                  let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
                  let nowData = $(input).val();
                  let diffent = nowData-initData;
                  unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
                }
              })
            });
          }
          this.bindShowPaymentItemForm(0);
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              //_modal.close();
              this.showItemsForPay(evt,pageNo+1,templates);
            }
          });
        }
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowPaymentItemForm(mode){
    // $(".plus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $(".minus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    // $("input.count-number").on("keyup", (evt)=>this.changeCount(evt,mode));
    // $("input.count-number").on("change", (evt)=>this.changeCount(evt,mode));
    // //初始化数字增减控件
    // $('.input-amount').amount();
    // $('.js-select-item').on("change", (evt)=>this.checkOneItem(evt));
    $("input.count-number").attr("readonly","readonly");
    $('.js-select-item').css("display","none");
  }
  //显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowPaymentItemFormOnce(){
    // $('.js-batch-select').on("change", (evt)=>this.batchSelectItems(evt));
    // $('.js-payment-items-submit').on('click', (evt)=>this.paymentItemsSubmit(evt));
    $('.js-batch-select').closest('label').css("display","none");
    $('.js-invoice-items-submit').css("display","none");
    $('.js-delivery-items-submit').css("display","none");
    $('.js-payment-items-submit').css("display","none");
  }

  //显示自有资金支付的商品列表
  showItemsForOtherPay(evt,pageNo,templates){
    let itemId = $(evt.target).closest('.itme-tr').data("id");
    let purchaseid = $(evt.target).closest('.pur-detail-body').data("purchaseid");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/purchases/'+purchaseid+'/org/pay/items',
      type: 'GET',
      data:{pageNo, pageSize},
      success:(result)=>{
        if(result.total == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"该支付方式暂无商品。"
          }).show();
        }else{
          _.each(result.data,(el,index)=>{
            let subItemCount = el.currentCount + el.unbindPayCount;
            el.subItemCount = subItemCount;
          });
          result.itemId=itemId;
          if(templates == undefined){
            let _showItemsForReceiver = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/showOtherPaymentItems"];
            templates = _showItemsForReceiver;
            let _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
            _modal.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
                  console.log("select value:"+value);
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(input).data('init'));
                  //this.changeCountAffect(input,initData);
                  let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
                  let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
                  let nowData = $(input).val();
                  let diffent = nowData-initData;
                  unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
                }
              })
            });
          }
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              //_modal.close();
              this.showItemsForOtherPay(evt,pageNo+1,templates);
            }
          });
        }
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }
  /////////////////////采购单预算信息模块脚本结束//////////////////////////

  //滚动滚动条保证清单状态栏悬浮于同一位置
  runScroll(evt){
    let footDiv = $(".pur-detail-foot");
    let originY = $(".pur-detail-body").offset().top + $(".pur-detail-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".pur-detail-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".pur-detail-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}
module.exports =  PurchaseOrderDetail;
