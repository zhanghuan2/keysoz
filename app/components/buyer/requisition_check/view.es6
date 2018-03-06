import Modal  from  "pokeball/components/modal"
const ItemServices = require('common/item_services/view')

class RequisitionCheck{
  constructor($){
    this.cartSubmit = $(".js-cart-submit");
    this.cartCancel = $(".js-cart-cancel");
    this.cartModify = $(".js-cart-modify");
    this.checkAgree = $('.js-check-agree');
    this.checkReject = $('.js-check-reject');
    this.checkSubmit = $('.js-check-submit');
    this.inputChecklog = $('.js-checklog-comment');
    this.itemServices = new ItemServices('.js-item-services')
    this.initContent();
    this.bindEvent();
  };
  bindEvent(){
    this.sumEveryItem();
    this.totalSum();
    this.checkAgree.on('change', (evt)=>{this.agreeCheck(evt)});
    this.checkReject.on('change', (evt)=>{this.rejectCheck(evt)});
    this.checkSubmit.on('click', (evt)=>{this.submitCheck(evt)});
    this.inputChecklog.on('keyup', (evt)=>this.checkLogKeyup(evt));
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

  //需求单审核模块：初始化数据，目前主要是初始化”补充说明“内容
  //"extra": "{\"comment\":\"\"}",
  initContent(){
    let contentJson = $(".req-check-about").data("requisition-extra");
    if(contentJson != "" && contentJson != null && contentJson != undefined && contentJson.length <= 0){
      let _contentJson = JSON.parse(contentJson);
      if(_contentJson.shopId != undefined){
        contentJson = _contentJson;
      }
    }
    if(contentJson != "" && contentJson != null && contentJson != undefined && contentJson.length > 0){
      _.each(contentJson,(el,index)=>{
        $(".buyer-comment-content"+el.shopId).html(el.comment == ""?"无备注":el.comment);
      });
    }
    //显示商品服务信息
    this.itemServices.showServiceInfo()
  }

  //需求单审核模块：提交审核
  submitCheck(evt){
    let reqId = $('.req-check-body').data('reqid');
    let comment = $('.js-checklog-comment').val();
    let passed = ($('.js-check-agree').attr("checked") == "checked")?true:false;
    let backlogId = $.query.get("backlogId");
    new Modal({
      title:'您是否确定提交审核结果？',
      icon:'warning',
      htmlContent:'提交后将不能撤回',
      isConfirm: true
    }).show(()=>{
      $.ajax({
        url: '/api/requisitions/'+reqId+'/check',
        type: 'POST',
        data:{comment:comment,result:passed,backlogId:backlogId},
        success:(data)=>{
          new Modal({
            title:'审核结果提交成功',
            icon:'info',
            content:'请您在 需求单列表 --> 已审核 中查看详情'
          }).show(()=>{
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
    });
  }

  //点击通过审核
  agreeCheck(evt){
    $(".js-check-agree").attr("checked","checked");
    $(".js-check-reject").removeAttr("checked");
  }
  //点击不通过审核
  rejectCheck(evt){
    $(".js-check-reject").attr("checked","checked");
    $(".js-check-agree").removeAttr("checked");
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
    let footDiv = $(".req-check-foot");
    let originY = $(".req-check-body").offset().top + $(".req-check-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".req-check-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".req-check-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}

module.exports =  RequisitionCheck;
