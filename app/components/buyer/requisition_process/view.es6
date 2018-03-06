import Modal  from  "pokeball/components/modal"
const ItemServices = require('common/item_services/view')

class RequisitionProcess{
  constructor($){
    this.cartSubmit = $(".js-cart-submit");
    this.cartCancel = $(".js-cart-cancel");
    this.cartModify = $(".js-cart-modify");
    this.requirerSelect = $('.js-requirer');
    this.inputChecklog = $('.js-checklog-comment');
    this.itemServices = new ItemServices('.js-item-services')
    this.initContent();
    this.bindEvent();
  };
  bindEvent(){
    this.sumEveryItem();
    this.totalSum();
    this.cartModify.on("click", this.modifyCart);
    this.cartSubmit.on("click", (evt)=>this.submitCart(evt));
    this.cartCancel.on("click",this.cancelCart);
    this.requirerSelect.on('change', (evt)=>this.selectRequirer(evt));
    this.inputChecklog.on('keyup', (evt)=>this.checkLogKeyup(evt));
    $('.js-select-addr').on('change', () => this.deliveryAddressChanged())
    // $(window).on({
    //   "scroll":(evt)=>this.runScroll(evt),
    //   "resize": (evt)=>this.runResize(evt)
    // });
    // $(window).scroll();
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

  //选择采购经办人之后触发经办人地址更新
  selectRequirer(evt){
    let selectPurId = $(evt.target).find('option:selected').val();
    $('.js-select-addr').empty();
    $(".js-select-addr").selectric('refresh');
    if(selectPurId=="" || selectPurId == null || selectPurId == undefined){
      $('.js-select-addr').append('<option value="">---请选择收货地址---</option>');
      $('.js-select-addr').selectric('refresh');//刷新select控件
      return;
    }
    $.ajax({
      url: '/api/users/purchaser/deliveries',
      type: 'GET',
      dataType: 'json',
      data: {purchaserId: selectPurId},
      success:(result)=>{
        //console.log(result);
        $('.js-select-addr-list').val(JSON.stringify(result));
        if(result.length>0){
          _.each(result,(el,index)=>{
            let _address = el.receiverProvinceName+el.receiverCityName+el.receiverDistrictName+
                        el.receiverStreetName+el.receiverAddress+"("+el.receiverName+" 收)"+"&nbsp;&nbsp;&nbsp;&nbsp;"+el.receiverMobile;
            $('.js-select-addr').append("<option value='"+index+"'>"+_address+"</option>");
          });
        }else{
          $('.js-select-addr').append('<option value="">---请选择收货地址---</option>');
        }
      }
    }).always(function() {
      $('.js-select-addr').selectric('refresh')//刷新select控件
      $('.js-select-addr').trigger('change')
    });
  }

  /*
   * 收货地址变更时，更新服务信息
   */
  deliveryAddressChanged () {
    let tradeInfos = JSON.parse($('.js-select-addr-list').val()),
     selectTradeInfoId =  $('.js-select-addr').find('option:selected').val(),
     tradeInfo = tradeInfos[parseInt(selectTradeInfoId)]
    if (tradeInfo) {
      this.itemServices.loadServiceInfo(tradeInfo.receiverDistrictId)
    }
  }

  //初始化数据，目前主要是初始化”补充说明“内容
  //"extra": "{\"comment\":\"\"}",
  initContent(){
    let comments = $("#js-requisition-extra").val();
    if(comments != null && comments != ""){
      let commentJson = JSON.parse(comments);
      _.each(commentJson, (comment)=>{
        $(".buyer-comment-content[data-shop="+comment.shopId+"]").val(comment.comment);
      })
    }
  }

   //取消需求清单
   cancelCart(){
    //console.log("提交商品到需求清单测试～～");
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "确定取消该需求单吗？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      let requisitionIds = $.query.get("reqId")+"";
      $.ajax({
          type:"GET",
          url:"/api/requisitions/"+$.query.get("reqId")+"/cancel",
          success:(data)=>{
            //console.log("success:"+data);
            //成功后转跳到需求单列表页面
            window.location.href = "/buyer/requisitions";
          },
          error:(data)=>{
            //console.log("error: "+data.responseText);
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
                  title:'提醒',
                  icon:'warning',
                  content:errorMsg
                }).show((evt)=>{
                });
              }
            }catch(e){
              new Modal({
                title:'提醒',
                icon:'warning',
                content:"取消失败！错误信息为："+data.responseText
              }).show();
            }
          }
      });
    })
   }

   //处理需求单模块:提交商品到需求清单（变更状态未已提交）
   submitCart(evt){
    //console.log("提交商品到需求清单测试～～");
    let requisitionIds = $.query.get("reqId")+"";
    let commentInputs = $(".buyer-comment-content");
    let selectPurId = $('.js-requirer').find('option:selected').val()+"";
    if(selectPurId == "" || selectPurId == null || selectPurId == undefined){
      //$('.js-requirer').focus();
      new Modal({
        icon: "warning",
        title: "提醒",
        content: "请先选择收货人"
      }).show(()=>{$('.js-requirer').focus();});
      return false;
    }
    let selectTradeInfoId =  $('.js-select-addr').find('option:selected').val();
    if(selectTradeInfoId == "" || selectTradeInfoId == null || selectTradeInfoId == undefined){
      //$('.js-select-addr').focus();
      new Modal({
        icon: "warning",
        title: "提醒",
        content: "请先选择收货地址"
      }).show(()=>{$('.js-select-addr').focus();});
      return false;
    }

    let checkerId = $('.js-select-check').find('option:selected').val()+"";
    //判断是否选择审核人
    if($(evt.currentTarget).data('value') == 1) {
      if(checkerId==""){
       new Modal({
         title:'未选择审核人',
         icon:'warning',
         content:'请选择审核人后再提交'
       }).show(()=>{$('.js-select-check').focus();});
       return false;
      }
    }
    let tradeInfos = JSON.parse($('.js-select-addr-list').val());
    let tradeInfo= tradeInfos[parseInt(selectTradeInfoId)];
    let extraStr = [];
    _.each(commentInputs,(el,index)=>{
      let commentContent = $(el).val();
      let shopId = $(el).data("shop");
      let comment = {};
      comment.shopId = shopId;
      comment.comment = commentContent;
      extraStr.push(comment);
    });
    $.ajax({
        type:"POST",
        url:"/api/requisitions/"+requisitionIds,
        dataType: "json",
        data: {
          status:0,
          extraStr:JSON.stringify(extraStr),
          tradeInfo:JSON.stringify(tradeInfo),
          purchaserId: `${selectPurId}`
        },
        success:(data)=>{
          //console.log("success:"+data);
          //成功后转跳到需求单列表页面
          //window.location.href = "/buyer/requisitions";
          //提交审核
          this.submitRequisition(evt);
        },
        error:(data)=>{
          //console.log("error: "+data.responseText);
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
                title:'提醒',
                icon:'warning',
                content:errorMsg
              }).show((evt)=>{
              });
            }
          }catch(e){
            new Modal({
              title:'提醒',
              icon:'warning',
              content:"提交失败！错误信息为："+data.responseText
            }).show();
          }
        }
    });
   }

   //提交需求单审核
   submitRequisition(evt){
     let reqId = $('.req-process-body').data('reqid');
     let checkerId = $('.js-select-check').find('option:selected').val()+"";
     let comment = $('.js-checklog-comment').val();
     let backlogId = $.query.get("backlogId");
     if($(evt.currentTarget).data('value') == 1) {
     } else {
      checkerId = null
     }
     $.ajax({
       url: '/api/requisitions/'+reqId+'/submit',
       type: 'POST',
       data:{checker:checkerId,comment:comment,backlogId:backlogId},
       success:(data)=>{
         new Modal({
           title:'需求单提交成功！',
           icon:'success',
           htmlContent:'请在“需求单管理 --> 需求单列表”中查看'
         }).show(()=>{
           //成功后转跳到需求单列表页面
           window.location.href = "/buyer/requisitions";
         });
       },
       error:(data)=>{
         let resultJson;
         try{
             resultJson = JSON.parse(data.responseText);
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
                 icon:'info',
                 content:errorMsg
               }).show((evt)=>{
               });
             }
         }catch(e){
           new Modal({
             title:'温馨提示',
             icon:'info',
             content:data.responseText
           }).show();
         }
       }
     });
   }

  //取消该需求单，返回购物车修改
  modifyCart(){
    //console.log("返回修改购物车测试～～");
    new Modal({
      icon: "info",
      title: "温馨提示",
      content: "确定重新选购商品吗？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      $.ajax({
          type:"GET",
          url:"/api/requisitions/"+$.query.get("reqId")+"/fall-back",
          success:(data)=>{
            //console.log("success:"+data);
            window.location.href = "/cart";
          },
          error:(data)=>{
            //console.log("error: "+data.responseText);
            let resultJson;
            try{
              resultJson = JSON.parse(data.responseText);
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
                  icon:'info',
                  content:errorMsg
                }).show((evt)=>{
                });
              }
          }catch(e){
            new Modal({
              title:'温馨提示',
              icon:'info',
              content:data.responseText
            }).show();
          }
        }
      });
  })
  }

  //需求单详情：统计选中商品的总数和总价
  totalSum(){
    let sum = 0;
    let total = 0;
    _.each($(".item-tr"), (item)=>{
      let subtotal = $(item).find(".item-subtotal");
      total += parseFloat($(subtotal).text());
      sum += 1;
    });
    $(".total-item .total-count").text(sum);
    $(".total-price .currency").text(total.toFixed(2));
  }

  //循环每个商品用于计算每个商品价格
  sumEveryItem(){
    _.each($(".item-tr"), (item)=>{
      this.sumItem(item);
    });
  }

  //计算每个商品的价格
  sumItem(item){
    let unitPrice = $(item).find(".price").text();
    let count = parseInt($(item).find(".count-number").html());
    $(item).find(".count-number").val(count);
    $(item).find(".item-subtotal").text((unitPrice * count).toFixed(2));
  }

  //滚动滚动条保证清单状态栏悬浮于同一位置
  runScroll(evt){
    let footDiv = $(".req-process-foot");
    let originY = $(".req-process-body").offset().top + $(".req-process-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".req-process-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".req-process-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}

// export default RequisitionProcess;
module.exports = RequisitionProcess;
