import Modal  from  "pokeball/components/modal"
import Pagination  from  "pokeball/components/pagination"
const ItemServices = require('common/item_services/view')

class PurchaseOrderDetailItems{
  constructor($){
    this.contentSum = $(".req-item-lists").data("req-lists-total");
    new Pagination($(".list-pagination")).total(this.contentSum).show();
    this.itemComment = $('.js-item-comment');
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
    this.bindEvent();
  }

  bindEvent(){
    this.itemComment.on('click', (evt)=>this.clickItemComment(evt));
    this.initEveryItem();
  }

  //查看商品备注
  clickItemComment(evt){
    let purchaseId = $('.req-item-lists').data('purchaseid');
    let purchaseStatus = $('.req-item-lists').data('purchasestatus');
    let skuId = $(evt.target).closest('.item-tr').data('skuid');
    $.ajax({
      url: '/api/purchases/item/comment',
      type: 'GET',
      data: {purchaseId: purchaseId,skuId:skuId},
      success: (result)=>{
        //console.log(result);
        let _DATA_ = {};
        _DATA_.data = result;
        _DATA_.purchaseId = purchaseId;
        _DATA_.purchaseStatus = purchaseStatus;
        _DATA_.skuId = skuId;
        let _showItemComments = Handlebars.wrapTemplate("buyer/purchase_check/templates/showItemComments");
        let _modal = new Modal(_showItemComments({_DATA_:_DATA_}));
        _modal.show();
        this.bindShowItemCommentsForm();
      },
      error:(data)=>{
        //console.log(data.responseText);
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:data.responseText
        }).show();
      }
    });
  }

  bindShowItemCommentsForm(){
    $('.js-commit-comment').on('click', (evt)=>this.commitComment(evt));
    $('.js-comment-content').on('keyup', (evt)=>this.checkCommentKeyup(evt));
  }

  //输入批注时触发事件
  checkCommentKeyup(evt){
    var maxChars = 50;//最多字符数
    let obj = $(evt.target);
    if (obj.val().length > maxChars)
      obj.val(obj.val().substring(0,maxChars));
    //可输入的数字
    //var curr = maxChars - obj.val().length;
    //$(".js-checklog-comment-count").html(curr.toString());
    $(".js-comment-content-count").html(obj.val().length);
  }

  //提交批注
  commitComment(evt){
    let comment = $('.js-comment-content').val();
    let purchaseId  = $('.item-comment-lists').data('purchaseid');
    let skuId  = $('.item-comment-lists').data('skuid');
    if(comment == "" || comment == null || comment == undefined){
      new Modal({
        title:"温馨提示",
        icon:"info",
        htmlContent:"请先输入批注"
      }).show(()=>{
        $('.js-comment-content').focus();
      });
      return;
    }
    $.ajax({
      url: '/api/purchases/item/comment',
      type: 'POST',
      data: {purchaseId: purchaseId,skuId:skuId,comment:comment},
      success: (result)=>{
        window.location.reload();
      },
      error:(data)=>{
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"批注失败"
        }).show();
      }
    });
  }

  //统计每一项商品对应的小计价格
  initEveryItem(){
    _.each($(".item-tr"),(item)=>{
      this.sumItem(item);
    });
  }
  //计算每个商品的价格
  sumItem(item){
    let unitPrice = $(item).find('.item-price').html();
    let itemCount = parseInt($(item).find('.item-count').html());
    if(isNaN(unitPrice)){
      $(item).find(".item-subtotal.currency").html('<span class="text-center">－</span>');
    }
    else{
      $(item).find(".item-subtotal.currency").html((unitPrice*itemCount).toFixed(2));
    }
  }

}

module.exports =  PurchaseOrderDetailItems;
