import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
//2016.9.22
const changeConfrimBookTemplates = Handlebars.templates["buyer/order_form_detail/templates/change-confirm-book"];
const changeConfirmBookModalContent = Handlebars.templates["buyer/order_form_detail/templates/changeConfirmBookModalContent"];
//2016.9.22
let _showItems = Handlebars.wrapTemplate("buyer/change_confirmbook/templates/showNewPayMents");
let here;

let _paymodal;//选择采购计划的弹框
let _modal;//商品列表弹框
let _modal2;//添加商品弹框
class ChangeConfirmBook {
  constructor($) {
    here = this;
    this.$jsShowPayItemList = ".js-show-pay-item-list"
    this.$jsShowPayUnbindItemList = ".js-show-pay-unbind-item-list"
    this.$jsDeletePayItems = ".js-delete-pay-item"
    this.$jsAddNewPay = ".js-add-new-pay"
    // this.orderId = $(".pur-body").data("order-id")
    this.$jsConfirmSubmit = ".js-confirm-submit"
    this.flag = 1
    this.bindEvent()
  }

  bindEvent() {
    $(document).on("click",this.$jsDeletePayItems, (evt)=>this.deletePayItems(evt))
    $(document).on("click",this.$jsAddNewPay, (evt)=>this.addNewPay(evt))
    $(document).on("click",this.$jsConfirmSubmit, (evt)=>this.confirmSubmit(evt))
  }

  //商品列表弹框
  showPayItemList(evt,pageNo,templates) {
    let deliveryId = $(evt.target).closest('tr').data("id");
    let payId = deliveryId
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/zcy/orders/pagingOrderPayItemBindInfo',
      type: 'GET',
      data:`payId=${payId}&pageNo=${pageNo}&pageSize=${pageSize}`,
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
          if(templates == undefined){
            let _showItemsForReceiver = Handlebars.templates["buyer/change_confirmbook/templates/showDeliveryItems"];
            templates = _showItemsForReceiver;
            _modal = new Modal(_showItemsForReceiver({_DATA_:result}));
            _modal.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
            this.bindShowDeliveryItemFormOnce(0,payId);
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value) => {
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
          this.bindShowDeliveryItemForm(0);
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
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

  //显示未绑定地址的商品列表
  showPayUnbindItemList(evt,pageNo,templates) {
    let orderId = $(".order-form-detail-body").data("order-id")
    let orderPayId = $(evt.currentTarget).closest("tr").data("id")
    // let purchaseId = $('.pur-process-body').data('purchaseid');
    let deliveryId = $(evt.target).closest('tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/zcy/orders/pagingConfirmUnBindItems',
      type: 'GET',
      data:{pageNo, pageSize, orderId, orderPayId},
      success:(result)=>{
        if(result.total == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"该地址没有可以添加的商品"
          }).show();
        }else{
          result.deliveryId=deliveryId;
          if(templates == undefined){
            let _showUnbindItemsForReceiver = Handlebars.wrapTemplate("buyer/change_confirmbook/templates/showUnbindDeliveryItems");
            templates = _showUnbindItemsForReceiver;
            _modal2 = new Modal(_showUnbindItemsForReceiver({_DATA_:result}));
            _modal2.show();
            //用于保存选中的商品信息
            this.selectedSkuAndQuantity = {};
            this.bindShowDeliveryItemFormOnce(1,orderPayId);
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
            let selectItems = $('.js-select-item');
            _.each(selectItems,(el,index)=>{
              _.each(_.keys(this.selectedSkuAndQuantity), (value)=>{
                if($(el).closest('.item-tr').data("id") == value){
                  $(el).prop('checked', true);
                  let input = $(el).closest('.item-tr').find('input.count-number');
                  input.val(this.selectedSkuAndQuantity[value].quantity);
                  let initData = parseInt($(el).data('init'));
                }
              })
            });
          }
          this.bindShowDeliveryItemForm(1);
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              this.showUnbindItemsForReceiver(evt,pageNo+1,templates);
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

  //添加采购计划
  addNewPay(evt,pageNo,templates){
    pageNo = pageNo || 1;
    let pageSize = 20;
    let orderId = $(".order-form-detail-body").data("order-id");
    $.ajax({
      url: '/api/zcy/orders/getPurchaserConfirmations',
      type: 'GET',
      data: {orderId},
      success:(result)=>{
        let _data_ = {"data":result};
        _data_.total = result.length;
        let selectedIds = "";
        let selectedIdsDiv = $('.selected-confirmationid');
        _.each(selectedIdsDiv,(el,index)=>{
          selectedIds += $(el).data('confirmationid')+",";
        });
        if(selectedIds!=""){
          selectedIds = selectedIds.substring(0,selectedIds.length-1);
          _data_.selectedIds = selectedIds;
        }
        if(result.length == 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"没有可用的采购单计划"
          }).show();
        }else{
          if(templates == undefined){
            templates = _showItems;
            _paymodal = new Modal(_showItems({_DATA_:_data_}));
            _paymodal.show();
            this.addNewPaymentFormOnce();
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: _data_ }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked",false);
          }
          new Pagination(".selected-pagination").total(_data_.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              this.addNewPay(evt,pageNo+1,templates);
            }
          });
        }
      },
      error:(data)=>{
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："
        }).show();
      }
    })
  }
  addNewPaymentFormOnce(){
    $('.js-new-payment-items-submit').on('click', (evt)=>this.addNewPaymentSubmit(evt));
  }

  //添加采购计划：窗口的确定按钮事件
  addNewPaymentSubmit(evt){
    let orderId = $(".order-form-detail-body").data("order-id")
    let comfirmId = $("input[type='radio']:checked").closest("td").siblings(".left-text").data("confirmationid")
    if(comfirmId == null) {
      new Modal({
        icon: "warning",
        title: '警告',
        content: '没有可用的采购计划'
      }).show()
    }else {
      $.ajax({
        url: '/api/zcy/orders/createOrderPay',
        type: 'GET',
        contentType: "application/json",
        dataType: "json",
        data: `orderId=${orderId}&confirmId=${comfirmId}`,
        success:(data)=>{
          // window.location.reload()
          //2016.9.22
          // $('.pur-modal').remove();x
          _paymodal.close();
          let $orderFormDetail = $(".order-form-detail-body");
          let orderId = $orderFormDetail.data("order-id");
          $.ajax({
            url: "/api/zcy/getAndCheckOrderPayInfos",
            type: "GET",
            data: `orderId=${orderId}`,
            success: (data)=>{
              // let changeConfrimBookModal = new Modal(changeConfrimBookTemplates({data:data}));
              // changeConfrimBookModal.show();
              // // $(".js-cancel-submit").on("click", (evt)=>this.cancelSubmit(evt));
              // // this.initTrBlackOrNot()
              $('#confirmBookModal').find('.confirmModalContent').empty();
              $('#confirmBookModal').find('.confirmModalContent').append(changeConfirmBookModalContent({data:data}));
              $('#confirmBookModal').find('.js-show-pay-item-list').on('click',function(evt){
                here.showPayItemList(evt);
              });
              $('#confirmBookModal').find('.js-show-pay-unbind-item-list').on('click',function(evt){
                here.showPayUnbindItemList(evt);
              });
              $('#confirmBookModal').find('.close').on('click',function(){
                window.location.reload();
              });

            },
            error: (data)=>{
              new Modal({
                icon: "error",
                title: "获取确认书失败",
                content: data.responseText
              }).show(()=>{
                  window.location.reload();
                })
            }
          })
          //2016.9.22
        },
        error:(data)=>{
          new Modal({
            icon: "error",
            title: "采购计划替换失败",
            content: data.responseText
          }).show(()=>{
              window.location.reload();
            })
        }
      });
    }
  }
  bindShowDeliveryItemFormOnce(mode,orderPayId){
    $('.js-batch-select').on("change", (evt)=>this.batchSelectItems(evt));
    $('.js-delivery-items-submit').on('click', (evt)=>this.deliveryItemsSubmit(evt,mode,orderPayId));
  }

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowDeliveryItemForm(mode){
    $(".plus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    $(".minus").on("click", (evt)=>this.addAndMinusCount(evt,mode));
    $("input.count-number").on("keyup", (evt)=>this.changeCount(evt,mode));
    $("input.count-number").on("change", (evt)=>this.changeCount(evt,mode));
    //初始化数字增减控件,将初始化的有效区域限制在$('.pur-modal')
    $(".input-amount",$('.pur-modal')).amount();
    $('.js-select-item').on("change", (evt)=>this.checkOneItem(evt));
  }

  //选中单个商品
  checkOneItem(evt){
    $(this).closest("tr").removeClass("fail-item");
    let skuId = $(evt.target).closest('.item-tr').data("id");
    if(!($(evt.target).prop("checked"))){
      $(".js-batch-select").prop("checked", false);
      this.delPurchaseSkuAndQuantity(skuId);
    }else{
      this.setPurchaseSkuAndQuantity(evt.target);
    }
    this.showSelectItemCount();
  }

  //全选商品
  batchSelectItems(evt){
    if($(evt.target).prop("checked")){
      $(".js-select-item").prop("checked", true);
      let selectItem = $(".js-select-item");
      _.each(selectItem,(el,index)=>{
        this.setPurchaseSkuAndQuantity(el);
      });
    }else{
      $(".js-select-item").prop("checked", false);
      let selectItem = $(".js-select-item");
      _.each(selectItem,(el,index)=>{
        let skuId = $(el).closest('.item-tr').data("id");
        this.delPurchaseSkuAndQuantity(skuId);
      });
    }
    this.showSelectItemCount();
  }

  deletePayItems(evt) {
    let orderPayId = $(evt.currentTarget).closest("tr").data("id")
    $.ajax({
      url: "/api/zcy/orders/deleteOrderPayAndItems",
      type: "POST",
      data: {orderPayId},
      success:(data)=>{
      new Modal({
              title:"提示",
              icon:"success",
              content:"删除成功"
            }).show(function(){
              window.location.reload()
            });

      },
      error:(data)=>{}
    })
  }

  setPurchaseSkuAndQuantity(el){
    let skuId = $(el).closest('.item-tr').data("id");
    let itemId = $(el).closest('.item-tr').data("itemid");
    let unbindDeliveryCount = parseInt($(el).closest('.item-tr').find('input.count-number').val());
    let bindDeliveryCount = parseInt($(el).closest('.item-tr').find('input.count-number').data('current-count'));
    let quantity = unbindDeliveryCount+bindDeliveryCount;
    let PurchaseSkuAndQuantity = {skuId:skuId,itemId:itemId,quantity:quantity};
    this.selectedSkuAndQuantity[skuId] = PurchaseSkuAndQuantity;
  }
  //提交采购单模块：维护选中的商品信息（减少）
  delPurchaseSkuAndQuantity(skuId){
    _.omit(this.selectedSkuAndQuantity, skuId);
  }

  //显示选中的商品信息
  showSelectItemCount(){
    $('.js-select-item-info').html("一共选中了"+_.size(this.selectedSkuAndQuantity)+"项");
  }

  //点击加减按钮修改商品数量（自动触发input的change事件）
  //mode:0绑定地址商品列表；1未绑定地址商品列表
  addAndMinusCount(evt,mode){
    let input = $(evt.target).siblings("input.count-number");
    let count  = input.val();
    let sum = parseInt($(evt.target).closest(".input-amount").data("max"));
    if(count > sum){
      input.val(sum);
      count = sum;
    }
  }

  //确定采购单模块：手动更改商品数量（input控件修改）
  //mode:0绑定地址商品列表；1未绑定地址商品列表
  changeCount(evt,mode){
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
    let initData = parseInt($(evt.target).data('init'));
    this.changeCountAffect(input,initData);
  }

  //修改商品数量后需要维护的变化
  changeCountAffect(input,initData){
    let unbindDeliveryItemSubCountDiv = $(input).closest('.item-tr').find('.js-unbind-item-subCount');
    let unbindDeliveryCount = parseInt(unbindDeliveryItemSubCountDiv.data("init"));
    let nowData = $(input).val();
    let diffent = nowData-initData;
    unbindDeliveryItemSubCountDiv.html(parseInt(unbindDeliveryCount-diffent));
    let _selectItem = $(input).closest('.item-tr').find('.js-select-item');
    if(!_selectItem.prop("checked")){
      _selectItem.prop("checked",true);
    }
    if(_selectItem.prop("checked")){
      let skuId = $(input).closest('.item-tr').data("id");
      if(this.selectedSkuAndQuantity.skuId){
        this.delPurchaseSkuAndQuantity(skuId);
      }
      this.setPurchaseSkuAndQuantity(input);
    }
    this.showSelectItemCount();
  }

  //窗口的确定按钮事件
  //mode:0绑定地址商品列表；1未绑定地址商品列表
  deliveryItemsSubmit(evt,mode,orderPayId){
    let bindItems = [];
    if(_.size(this.selectedSkuAndQuantity) > 0){
      if(mode == 0)
        _.each($(".js-select-item:checked").closest("tr"),(i)=>{
          bindItems.push({orderItemId:$(i).data("order-item-id"),skuId:$(i).data("skuid"),bindItemCount:parseInt($(i).find(".count-number").val())})
        })
      else
        _.each($(".js-select-item:checked").closest("tr"),(i)=>{
          bindItems.push({orderItemId:$(i).data("id"),skuId:$(i).data("skuid"),bindItemCount:parseInt(parseInt($(i).find(".count-number").data("init")) - parseInt($(i).find(".count-number").val()) + parseInt($(i).find(".count-number").data("old-count")))})
        })
      $.ajax({
        url: `/api/zcy/orders/createOrderPayItems?orderPayId=${orderPayId}`,
        type: 'POST',
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(bindItems),
        success:(data)=>{
          console.log(data);
          if(data){
            // window.location.reload();
            // console.log(data);
            //wuchunlei
            if(mode == 0){
              _modal.close();
            }else{
              _modal2.close();
            }
            // _modal2.close();
          let $orderFormDetail = $(".order-form-detail-body");
          let orderId = $orderFormDetail.data("order-id");
          $.ajax({
            url: "/api/zcy/getAndCheckOrderPayInfos",
            type: "GET",
            data: `orderId=${orderId}`,
            success: (data)=>{
              // // $(".js-cancel-submit").on("click", (evt)=>this.cancelSubmit(evt));
              // // this.initTrBlackOrNot()
              $('#confirmBookModal').find('.confirmModalContent').empty();
              $('#confirmBookModal').find('.confirmModalContent').append(changeConfirmBookModalContent({data:data}));
              $('#confirmBookModal').find('.js-show-pay-item-list').on('click',function(evt){
                here.showPayItemList(evt);
              });
              $('#confirmBookModal').find('.js-show-pay-unbind-item-list').on('click',function(evt){
                here.showPayUnbindItemList(evt);
              });
              $('#confirmBookModal').find('.close').on('click',function(){
                window.location.reload();
              });
              },
            error: (data)=>{
              new Modal({
                icon: "error",
                title: "获取确认书失败",
                content: data.responseText
              }).show(()=>{
                  window.location.reload();
                })
            }
          })
            //wuchunlei
          }else{
            new Modal({
              title:"提示",
              icon:"warning",
              content:"提交商品失败！错误信息为："+ data.error
            }).show(()=>{
                window.location.reload();
              });
          }
        },
        error:(data)=>{
          try{
            let resultJson = JSON.parse(data.responseText);
            if(resultJson.type == undefined){
              let _resultJson = JSON.parse(resultJson);
              if(_resultJson.type != undefined){
                resultJson = _resultJson;
              }
            }
            if(resultJson.type != undefined){
              let type = resultJson.type;
              let errorMsg = resultJson.errorMsg;
              let errorCode = resultJson.errorCode;
              let ids = resultJson.ids
              new Modal({
                title:'温馨提示',
                icon:'warning',
                content:errorMsg
              }).show((evt)=>{
                  window.location.reload();
                });
            }
          }catch(e){
            new Modal({
              title:'温馨提示',
              icon:'warning',
              content:"提交商品失败！错误信息为："+data.responseText
            }).show(()=>{
                window.location.reload();
              });
          }
        }
      });
    }else{
      new Modal({
        title:"提示",
        icon:"warning",
        content:"未选中任何商品！请选择商品后提交!"
      }).show();
    }
  }

  confirmSubmit() {
    let orderId = $(".order-form-detail-body").data("order-id")
    $.ajax({
      url: "/api/zcy/orders/orderPayBindItemsConfirm",
      type: "GET",
      data: `orderId=${orderId}`,
      success:(data)=>{
        window.location.reload()
      },
      error: (data)=>{
        new Modal({
          icon: "warning",
          title: "提交失败",
          content: data.responseText
        }).show()
      }
    })
  }
}

module.exports = ChangeConfirmBook
