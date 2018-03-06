import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
const confirmOrder = Handlebars.templates["buyer/purchase_detail/purchase_order_detail/templates/confirmOrder"];

class ConfirmOrder{
  constructor($){

    this.purCancel = $('.js-pur-cancel');
    this.purSubmit = $('.js-pur-submit');
    //配送地址
    this.initPurchaseInfo();
    this.itemsForReceiverShow = $('.js-show-receiver-item-list');
    //发票信息
    this.itemsForInvShow = $('.js-show-inv-item-list');
    //预算信息
    this.itemsForPayShow = $('.js-show-pay-item-list');
    this.itemsForOtherPayShow = $('.js-show-other-pay-item-list');
    this.Ordermodal = "";
    this.$print = $('.btn-print');
    this.bindEvent();
    this.popoverEvents();
  }

  bindEvent(){
    this.purCancel.on('click', (evt)=>{this.deletePurchase(evt)});
    this.purSubmit.on('click', (evt)=>{this.submitPurchase(evt)});
    //配送地址绑定事件
    this.itemsForReceiverShow.on('click', (evt)=>this.showItemsForReceiver(evt));
    //发票信息绑定事件
    this.itemsForInvShow.on('click', (evt)=>this.showItemsForInv(evt));
    //预算信息绑定事件
    this.itemsForPayShow.on('click', (evt)=>this.showItemsForPay(evt));
    this.itemsForOtherPayShow.on('click', (evt)=>this.showItemsForOtherPay(evt));
    this.$print.on('click', (evt)=>this.showPrint(evt));
    let that = this;
    $("body").on('click',".js-payment-items-submit",function(){
      that.ajaxOrder();
    })

    //初始化上传
    $('#purchase-list-attachment').uploadFile({
      bizCode: 1001,
      multiple:1,
      maxSize: 20 * 1024 * 1024
    }).on('uploadFile-max-size-error', () => {
      ZCY.warning('警告', '文件最大为20M')
    });
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


  showPrint(){
    $(".order-detail-print-content").print();
  }
  //初始化采购单信息
  initPurchaseInfo(){
    let selectedAddress = $('.selected-receiver-address');
    if($('#deliveryList').val() != null && $('#deliveryList').val() != ""){
      let deliveryList = JSON.parse($('#deliveryList').val());
      if(deliveryList.length > 0){
        let delivery = deliveryList && deliveryList[0];
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
    if($('#InvAddr').val() != null){
      let invList = JSON.parse($('#InvAddr').val());
      let invInfo = invList && invList[0];
      if(invInfo != undefined){
        let selectedAddress = $('.js-selected-receiver-invoices-address');
        let _label = invInfo.receiverProvinceName+invInfo.receiverCityName+invInfo.receiverDistrictName+
        "&nbsp;&nbsp;"+invInfo.receiverAddress+"("+invInfo.receiverName+" 收)"+
        "&nbsp;&nbsp;&nbsp;&nbsp;"+invInfo.receiverMobile;
        selectedAddress.html(_label);
        selectedAddress.data('id', invInfo.id);
        let invTitle = $('.js-inv-title');
        invTitle.val(invInfo.invoiceTitle);
      }
    }
  }
  //确认订单上传附件
  ajaxOrder(){
    let uploadfiles = $('#purchase-list-attachment').data('uploadFile')||{};
    if(uploadfiles.getFiles().length==0){
      this.confirmOrder()
    }else{
      $.ajax({
        url: '/api/purchases/'+$.query.keys.purchaseId+"/attachment",
        type: 'POST',
        contentType: 'application/json;charset:utf-8',
        data:JSON.stringify(uploadfiles.getFiles()),
        success:(result)=>{
          result && this.confirmOrder()
        },
        error:()=>{
          this.Ordermodal.close();
        }
      })
    }
  }
  //确认订单界面：提交采购单
  confirmOrder(){
    let purId = $('.confirm-order-body').data('purchaseid');
    let backlogId = $.query.get("backlogId");
    $.ajax({
      url: '/api/zcy/orders/create',
      type: 'POST',
      data:{purchaseOrderId:purId,backlogId:backlogId},
      success:()=>{
        //成功后转跳到订单列表页面
        let purchaseType = $('.js-purchase-type').val();
        if(purchaseType == 3){
          window.location.href = "/buyer/blocktrade-orders";
        }
        else if(purchaseType == 2){
          window.location.href = "/buyer/vaccine-orders";
        }
        else{
          window.location.href = "/buyer/orders";
        }
      },
      error:(data)=>{
        new Modal({
          title:'温馨提示',
          icon:'info',
          content:data.responseText
        }).show(()=>{
            window.location.reload();
          });
      }
    });
  }
  //确认订单界面：//弹出上传附件
  submitPurchase(){
    this.ajaxOrder()
  }
  //确认订单界面：删除采购单
  deletePurchase(evt){
    let purId = $('.confirm-order-body').data('purchaseid');
    let backlogId = $.query.get("backlogId");
    new Modal({
      title:'警告',
      icon:'warning',
      htmlContent:'取消采购单后将不可恢复！<br/>您确定<strong>取消</strong>本采购单吗？',
      isConfirm:true
    }).show(()=>{
      $.ajax({
        url: '/api/purchases/'+purId+"?backlogId="+backlogId,
        type: 'DELETE',
        success:(data)=>{
          //window.location.reload();
          //成功后转跳到采购单列表页面
          window.location.href = "/buyer/purchases";
        },
        error:(data)=>{
          new Modal({
            title:'温馨提示',
            icon:'info',
            content:data.responseText
          }).show();
        }
      })
    });
  }

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowItemForm(){
    $("input.count-number").attr("readonly","readonly");
    $('.js-select-item').css("display","none");
  }
  //显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowItemFormOnce(){
    $('.js-batch-select').closest('label').css("display","none");
    $('.js-invoice-items-submit').css("display","none");
    $('.js-delivery-items-submit').css("display","none");
    $('.js-payment-items-submit').css("display","none");
  }

  /////////////////////采购单地址配送模块脚本开始//////////////////////////
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
            this.bindShowItemFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
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
          this.bindShowItemForm();
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
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
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
            this.bindShowItemFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(input).data('init'));
                  let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
                  let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
                  let nowData = $(input).val();
                  let diffent = nowData-initData;
                  unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
                }
              })
            });
          }
          this.bindShowItemForm(0);
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
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
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
            this.bindShowItemFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
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
          this.bindShowItemForm();
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
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }

  //现在自有资金支付的商品列表
  showItemsForOtherPay(evt,pageNo,templates){
    let itemId = $(evt.target).closest('.itme-tr').data("id");
    let purchaseid = $(evt.target).closest('.confirm-order-body').data("purchaseid");
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
            this.bindShowItemFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") === value){
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
          this.bindShowItemForm();
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
    let footDiv = $(".confirm-order-foot");
    let originY = $(".confirm-order-body").offset().top + $(".confirm-order-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".confirm-order-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".confirm-order-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}
module.exports =  ConfirmOrder;
