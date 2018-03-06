import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";

class PurchaseCheck{
  constructor($){
    //$(".timeline").timeline();
    this.checkAgree = $('.js-check-agree');
    this.checkReject = $('.js-check-reject');
    this.checkSubmit = $('.js-check-submit');
    //配送地址
    this.initPurchaseInfo()
    this.itemsForReceiverShow = $('.js-show-receiver-item-list');
    //发票信息
    this.itemsForInvShow = $('.js-show-inv-item-list');
    this.inputChecklog = $(".js-checklog-comment");
    //预算信息
    this.itemsForPayShow = $('.js-show-pay-item-list');
    this.itemsForOtherPayShow = $('.js-show-other-pay-item-list');

    this.bindEvent();
    this.popoverEvents();
  }

  bindEvent(){
    this.checkAgree.on('change', (evt)=>{this.agreeCheck(evt)});
    this.checkReject.on('change', (evt)=>{this.rejectCheck(evt)});
    this.checkSubmit.on('click', (evt)=>{this.submitCheck(evt)});
    //配送地址绑定事件
    this.itemsForReceiverShow.on('click', (evt)=>this.showItemsForReceiver(evt));
    //发票信息绑定事件
    this.itemsForInvShow.on('click', (evt)=>this.showItemsForInv(evt));
    //预算信息绑定事件
    this.itemsForPayShow.on('click', (evt)=>this.showItemsForPay(evt));
    this.itemsForOtherPayShow.on('click', (evt)=>this.showItemsForOtherPay(evt));

    this.inputChecklog.on('keyup', (evt)=>this.checkLogKeyup(evt));

    //疫苗采购单移交同级审核
    $('.js-check-transfer').on('change', (evt)=>this.transferChecker(evt));
    $('.js-transfer-checker').on('click', (evt)=>this.transferCheckerSubmit(evt));
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

  //输入备注时触发事件
  checkLogKeyup(evt){
    var maxChars = 500;//最多字符数
    let obj = $(evt.target);
    if (obj.val().length > maxChars)
      obj.val(obj.val().substring(0,maxChars));
    //可输入的数字
    //var curr = maxChars - obj.val().length;
    //$(".js-checklog-comment-count").html(curr.toString());
    $(".js-checklog-comment-count").html(obj.val().length);
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
  //点击通过审核
  agreeCheck(evt){
    $('.js-check-submit').show();
    $('.js-transfer-checker').hide();

    $(".js-check-agree").attr("checked","checked");
    $(".js-check-reject").removeAttr("checked");
    $('.js-post-checker').removeClass('hide');
    $('.js-post-purchaser').addClass('hide');
    $('.js-post-checker-list').removeClass('hide');
    $('.js-post-purchaser-name').addClass('hide');

    // let purId = $('.purchase-check-body').data('purchaseid');
    // $.ajax({
    //   url: '/api/purchases/next/operators',
    //   type: 'GET',
    //   data:{checked:true,purchaseId:purId},
    //   success:(data)=>{
    //     console.log(data);
    //   },
    //   error:(data)=>{
    //     console.log(data);
    //   }
    // });
  }
  //点击不通过审核
  rejectCheck(evt){
    $('.js-check-submit').show();
    $('.js-transfer-checker').hide();

    $(".js-check-reject").attr("checked","checked");
    $(".js-check-agree").removeAttr("checked");
    $('.js-post-checker').addClass('hide');
    $('.js-post-purchaser').removeClass('hide');
    $('.js-post-checker-list').addClass('hide');
    $('.js-post-purchaser-name').removeClass('hide');

    $(".js-select-check-reject").empty();
    $(".js-select-check-reject").selectric('refresh');
    let purId = $('.purchase-check-body').data('purchaseid');
    $.ajax({
      url: '/api/purchases/next/operators',
      type: 'GET',
      data:{checked:false,purchaseId:purId},
      success:(result)=>{
        //console.log(result.users);
        let status = result.value;
        _.each(result.users,(el,index)=>{
          let id = el.id;
          let orgId = el.orgId;
          let orgName = el.orgName;
          let displayName = el.displayName;
          $(".js-select-check-reject").append('<option value="'+id+'" data-status="'+status+'" data-orgid="'+orgId+'" data-orgname="'+orgName+'">'+displayName+'</option>');
        });
        $(".js-select-check-reject").selectric('refresh');
      },
      error:(data)=>{
        //console.log(data);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    });
  }
  //审核模块：提交审核
  submitCheck(evt){
    let purId = $('.purchase-check-body').data('purchaseid');
    let nextStatus = $('.js-select-check').find('option:selected').data("status");
    let checker = $('.js-select-check').find('option:selected').val();
    let comment = $('.js-checklog-comment').val();
    let passed = ($('.js-check-agree').attr("checked") == "checked")?true:false;
    let backlogId = $.query.get("backlogId");
    if(!passed){
      nextStatus = $('.js-select-check-reject').find('option:selected').data("status");
      checker = $('.js-select-check-reject').find('option:selected').val();
    }
    if(nextStatus == null || nextStatus == "" || checker == null || checker == "" || (passed != true && passed != false)){
      new Modal({
        title:'未选择 审核结果 或者 下一步接收人',
        icon:'info',
        content:'请先选择审核结果以及对应的下一步接收人'
      }).show();
      return;
    }
    new Modal({
      title:'您是否确定提交审核结果？',
      icon:'warning',
      htmlContent:'提交后将不能撤回',
      isConfirm: true
    }).show(()=>{
      $.ajax({
        url: '/api/purchases/'+purId+'/check',
        type: 'POST',
        data:{nextStatus:nextStatus,nextChecker:checker,comment:comment,passed:passed,backlogId:backlogId},
        success:(data)=>{
          new Modal({
            title:'审核结果提交成功',
            icon:'success',
            content:'请您在 预购单列表 中查看详情'
          }).show(()=>{
            let purchaseType = $('.purchase-check-body').data('purchaseType');
            if(purchaseType == 3){
              window.location.href = "/buyer/blocktrade-purchases";
            }
            else if(purchaseType == 2){
              window.location.href = "/buyer/vaccine-purchases";
            }
            else {
              window.location.href = "/buyer/purchases";
            }
          });
        },
        error:(data)=>{
          new Modal({
            title:'提交失败，请问是否重试',
            icon:'info',
            htmlContent: "提交失败："+data.responseText + '\r\n点击 确定 ，再次提交该次审核',
            isConfirm: true
          }).show(()=>{
            this.submitCheck({});
          });
        }
      });
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
        //console.log(data.responseText);
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
              //console.log(this.selectedSkuAndQuantity.size);
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
        //console.log(data.responseText);
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
              //console.log(this.selectedSkuAndQuantity.size);
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
        //console.log(data.responseText);
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
    let purchaseid = $(evt.target).closest('.purchase-check-body').data("purchaseid");
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
              //console.log(this.selectedSkuAndQuantity.size);
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
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    })
  }

  //点击移交同级审核
  transferChecker () {
    $('.js-post-checker').addClass('hide');
    $('.js-post-purchaser').removeClass('hide');
    $('.js-post-checker-list').addClass('hide');
    $('.js-post-purchaser-name').removeClass('hide');

    $(".js-select-check-reject").empty();
    $(".js-select-check-reject").selectric('refresh');
    let purId = $('.purchase-check-body').data('purchaseid');

    $('.js-check-submit').hide();
    $('.js-transfer-checker').show();

    $.ajax({
      url: '/api/purchases/level/operators?purchaseId=' + purId,
      type: 'GET',
      success:(result)=>{
        let status = result.value;
        _.each(result.users,(el,index)=>{
          let id = el.id;
          let orgId = el.orgId;
          let orgName = el.orgName;
          let displayName = el.displayName;
          $(".js-select-check-reject").append('<option value="'+id+'" data-status="'+status+'" data-orgid="'+orgId+'" data-orgname="'+orgName+'">'+displayName+'</option>');
        });
        $(".js-select-check-reject").selectric('refresh');
      },
      error:(data)=>{
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败："+data.responseText
        }).show();
      }
    });
  }

  transferCheckerSubmit(evt) {
    let purId = $('.purchase-check-body').data('purchaseid');
    let checker = $('.js-select-check-reject').find('option:selected').val();
    let comment = $('.js-checklog-comment').val();

    new Modal({
      title:'您是否确定移交审核？',
      icon:'warning',
      isConfirm: true
    }).show(()=>{
      $.ajax({
        url: '/api/purchases/transfer/'+purId,
        type: 'GET',
        data:{nextChecker:checker,comment:comment},
        success:()=>{
          new Modal({
            title:'移交审核成功',
            icon:'success',
            content:'请您在 预购单列表 中查看详情'
          }).show(()=>{
            let purchaseType = $('.purchase-check-body').data('purchaseType');
            if(purchaseType == 3){
              window.location.href = "/buyer/blocktrade-purchases";
            }
            else if(purchaseType == 2){
              window.location.href = "/buyer/vaccine-purchases";
            }
            else {
              window.location.href = "/buyer/purchases";
            }
          });
        },
        error:(data)=>{
          new Modal({
            title:'移交失败',
            icon:'info',
            htmlContent: data.responseText
          }).show();
        }
      });
    });
  }
  /////////////////////采购单预算信息模块脚本结束//////////////////////////

}
module.exports =  PurchaseCheck;
