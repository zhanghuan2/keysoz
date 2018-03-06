import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";

class OrderFormShipments{
  constructor($){
    this.contentSum = $(".order-form-shipments-total").data("list-total");
    new Pagination($(".list-pagination")).total(this.contentSum).show($(".list-pagination").data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.itemsForReceiverShow = $('.js-show-receiver-item-list');
    this.confirmReceive = $('.js-confirm-receiving');
    this.bindEvent();
  }

  bindEvent(){
    this.itemsForReceiverShow.on('click', (evt)=>this.showItemsForReceiver(evt));
    this.confirmReceive.on('click',(evt)=>this.confirmReceiving(evt));
  }

  //订单模块：查看已经绑定发货单的商品列表
  showItemsForReceiver(evt,pageNo,templates){
    let $orderShipmentsItem = $(evt.target).closest('.orderShipments-item-tr');
    let shipmentId = $orderShipmentsItem.data("id");
    let orderType = $orderShipmentsItem.data('ordertype');
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/zcy/orders/pagingShipmentItems',
      type: 'GET',
      data:{shipmentId, pageNo, pageSize},
      success:(result)=>{
        result.orderType = orderType;
        if(templates == undefined){
          let _showItemsForReceiver = Handlebars.templates["buyer/order_form_detail/templates/showDeliveryItems"];
          templates = _showItemsForReceiver;
          let _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
          _modal.show();
          this.bindShowItemFormOnce();
        }else{
          $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
          $('.pur-modal').find('#select-batch').prop("checked",false);
        }
        this.bindShowItemForm(0);
        new Pagination(".selected-pagination").total(result.total).show(pageSize,{
          current_page: pageNo - 1,
          callback: (pageNo)=>{
            //_modal.close();
            this.showItemsForInv(evt,pageNo+1,templates);
          }
        });
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
    $('.js-no-need-show-count').css("display","none");
  }

  //点击某一个发货单项的“确认收货”
  // confirmReceiving(evt){
  //   let shipmentId = $(evt.target).closest('.orderShipments-item-tr').data("id");
  //   let status = 1;//1表示已收货
  //   $.ajax({
  //     url: '/api/zcy/orders/confirmReceiveItems',
  //     type: 'POST',
  //     dataType: 'json',
  //     data: {shipmentId: shipmentId,status:status},
  //     success:(result)=>{
  //       console.log(result);
  //       if(this.tabId != undefined && this.tabId != null){
  //         let tabId = $.query.get("tab");
  //         if(tabId != ""){
  //           window.location.href = window.location.href + "&tab=" + this.tabId;
  //         }else{
  //           window.location.reload();
  //         }
  //       }else{
  //         window.location.reload();
  //       }
  //     },
  //     error:(data)=>{
  //       //console.log(data.responseText);
  //       new Modal({
  //         title:"温馨提示",
  //         icon:"info",
  //         htmlContent:"操作失败："+data.responseText
  //       }).show();
  //     }
  //   });
  // }
  //发货单列表模块：点击某一个发货单项的“确认收货”
  confirmReceiving(evt,pageNo,templates){
    let isReissue = $(evt.target).closest('.orderShipments-item-tr').data("isreissue");
    if(isReissue == "" || isReissue == null || isReissue == undefined){
      isReissue = false;
    }
    let shipmentId = $(evt.target).closest('.orderShipments-item-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/zcy/orders/pagingShipmentItems',
      type: 'GET',
      data:{shipmentId, pageNo, pageSize},
      success:(result)=>{
        result.shipmentId = shipmentId;
        result.isReissue = isReissue;
        if(templates == undefined){
          let _showItemsRecevied = Handlebars.templates["buyer/order_form_detail/templates/showConfirmReceviedItems"];
          templates = _showItemsRecevied;
          let _modal = new Modal(_showItemsRecevied({_DATA_:result}));
          _modal.show();
          this.selectedShipmentSkuAndQuantity = {};
          this.bindShowReceviedItemFormOnce();
        }else{
          $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
          $('.pur-modal').find('#select-batch').prop("checked",false);
        }
        this.bindShowReceviedItemForm();
        new Pagination(".selected-pagination").total(result.total).show(pageSize,{
          current_page: pageNo - 1,
          callback: (pageNo)=>{
            //_modal.close();
            this.confirmReceiving(evt,pageNo+1,templates);
          }
        });
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
  //显示确认收货商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowReceviedItemForm(){
    //console.log('显示确认收货商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）');
    $(".plus").on("click", (evt)=>this.addAndMinusCount(evt));
    $(".minus").on("click", (evt)=>this.addAndMinusCount(evt));
    $("input.count-number").on("keyup", (evt)=>this.changeCount(evt));
    $("input.count-number").on("change", (evt)=>this.changeCount(evt));
    //初始化数字增减控件
    $('.input-amount').amount();
  }
  //显示确认收货商品列表窗口后绑定事件（只能绑定一次）
  bindShowReceviedItemFormOnce(){
    //console.log('显示确认收货商品列表窗口后绑定事件（只能绑定一次）');
    $('.js-recevied-items-submit').on('click', (evt)=>this.confirmReceivePartItems(evt));
  }

  //点击确定收货按钮事件
  confirmReceivePartItems(evt){
    //console.log('点击确定收货按钮事件');
    let shipmentId = $('.recevied-items-lists').data('shipmentid');
    let data = [];
    _.each(_.keys(this.selectedShipmentSkuAndQuantity), (value)=>{
      let id = this.selectedShipmentSkuAndQuantity[value].id;
      let itemId = this.selectedShipmentSkuAndQuantity[value].itemId;
      let skuId = value;
      let receiveQuantity = this.selectedShipmentSkuAndQuantity[value].receiveQuantity;
      let orderShipmentItem = {id, itemId, skuId, receiveQuantity};
      data.push(orderShipmentItem);
    })
    //return;
    $.ajax({
      url: '/api/zcy/orders/confirmReceivePartItems?shipmentId='+shipmentId,
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      contentType:'application/json',
      success: (result)=>{
        //console.log(result);
        window.location.reload();
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"确定收货失败："+data.responseText
        }).show();
      }
    });
  }

  //确定收货单模块：手动更改商品数量（input控件修改）
  changeCount(evt){
    //console.log("手动更改商品数量");
    let input = $(evt.target);
    let count = input.val();
    let sum = parseInt($(evt.target).closest(".item-tr").find(".input-amount").data("max"));
    if(count == "" || count < 0){
      input.val(1);
      input.trigger("change");
    }
    if(count > sum){
      input.val(sum);
      count = sum;
      input.trigger("change");
    }
    this.changeCountAffect(input);
  }
  //确定收货单模块：点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount(evt){
    let input = $(evt.target).siblings("input.count-number");
    let count  = input.val();
    let sum = parseInt($(evt.target).closest(".item-tr").data("max"));
    if(count > sum){
      input.val(sum);
      count = sum;
    }
  }

  //维护选中的商品信息（增加）
  setPurchaseSkuAndQuantity(el){
    let id = $(el).closest('.item-tr').data("id");
    let skuId = $(el).closest('.item-tr').data("skuid");
    let itemId = $(el).closest('.item-tr').data("itemid");
    let quantity = parseInt($(el).closest('.item-tr').find('input.count-number').val());
    let skuAndQuantity = {id:id,skuId:skuId,itemId:itemId,receiveQuantity:quantity};
    this.selectedShipmentSkuAndQuantity[skuId] = skuAndQuantity;
  }
  //维护选中的商品信息（减少）
  delPurchaseSkuAndQuantity(skuId){
    _.omit(this.selectedShipmentSkuAndQuantity, skuId);
  }

  //修改商品数量后需要维护的变化
  changeCountAffect(input){
    let skuId = $(input).closest('.item-tr').data("id");
    if(this.selectedShipmentSkuAndQuantity.skuId){
      this.delPurchaseSkuAndQuantity(skuId);
    }
    this.setPurchaseSkuAndQuantity(input);
  }
}

module.exports =  OrderFormShipments;
