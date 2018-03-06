import GetPhone from "common/get_phone/view"
const ItemServices = require('common/item_services/view')

class RequisitionDetail{
  constructor($){
    this.cartSubmit = $(".js-cart-submit");
    this.cartCancel = $(".js-cart-cancel");
    this.cartModify = $(".js-cart-modify");
    this.itemServices = new ItemServices('.js-item-services')
    new GetPhone();
    this.initContent();
    this.bindEvent();
  };
  bindEvent(){
    this.sumEveryItem();
    this.totalSum();
    this.cartModify.on("click", this.modifyCart);
    this.cartSubmit.on("click", this.submitCart);
    this.cartCancel.on("click",this.cancelCart);
    // $(window).on({
    //   "scroll":(evt)=>this.runScroll(evt),
    //   "resize": (evt)=>this.runResize(evt)
    // });
    // $(window).scroll();
  }

  //初始化数据，目前主要是初始化”补充说明“内容
  //"extra": "{\"comment\":\"\"}",
  initContent(){
    let contentJson = $(".req-detail-about").data("requisition-extra");
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
    let footDiv = $(".req-detail-foot");
    let originY = $(".req-detail-body").offset().top + $(".req-detail-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".req-detail-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".req-detail-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}

module.exports =  RequisitionDetail;
