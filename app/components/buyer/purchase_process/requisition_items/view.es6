import Modal from "pokeball/components/modal"
import Pagination from "pokeball/components/pagination"
const ItemServices = require('common/item_services/view')

class RequisitionProcessItems {
  constructor($) {
    this.contentSum = $(".req-item-lists").data("req-lists-total");
    new Pagination($(".list-pagination")).total(this.contentSum).show($(".list-pagination").data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    });
    this.initEveryItem();
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
    this.itemCountChange = $('.js-chang-items-count');
    this.itemCountSave = $('.js-save-items-count');
    this.bindEvent();
  }

  //事件绑定
  bindEvent() {
    this.itemCountChange.on('click', (evt) => this.changeItemCount(evt));
    this.itemCountSave.on('click', (evt) => this.saveItemCount(evt));
    $(".plus").on("click", (evt) => this.addAndMinusCount(evt));
    $(".minus").on("click", (evt) => this.addAndMinusCount(evt));
    $("input.count-number").on("keyup", (evt) => this.changeCount(evt));
    $("input.count-number").on("change", (evt) => this.changeCount(evt));
    //初始化数字增减控件
    $('.input-amount').amount();
  }

  //统计每一项商品对应的小计价格
  initEveryItem() {
    _.each($(".item-tr"), (item) => {
      this.sumItem(item);
    });
  }

  //计算每个商品的价格
  sumItem(item) {
    let unitPrice = $(item).find('.item-price').html();
    if(isNaN(unitPrice)){
      $(item).find(".item-subtotal.currency").html('<span class="text-center">－</span>');
    }
    else{
      let itemCount = parseInt($(item).find('.item-count').html());
      $(item).find(".item-subtotal.currency").html((unitPrice * itemCount).toFixed(2));
    }
  }

  //处理采购单：点击变更数量按钮
  changeItemCount(evt) {
    let selectedItem = $(evt.target).closest('.item-tr');
    selectedItem.find('.item-count').addClass('hide');
    selectedItem.find('.input-amount').removeClass('hide');
    selectedItem.find('.js-chang-items-count').addClass('hide');
    selectedItem.find('.js-save-items-count').removeClass('hide');
    selectedItem.find('.js-unbind-delivery-count').html('-');
    //console.log('点击变更数量按钮');
  }

  //保存修改后的商品数据
  saveItemCount(evt) {
    let selectedItem = $(evt.target).closest('.item-tr');
    selectedItem.find('.item-count').removeClass('hide');
    selectedItem.find('.input-amount').addClass('hide');
    selectedItem.find('.js-chang-items-count').removeClass('hide');
    selectedItem.find('.js-chang-items-count').html("正在提交...");
    selectedItem.find('.js-save-items-count').addClass('hide');

    let purchaseId = $.query.get("purchaseId");
    let skuId = selectedItem.find('.item-id').data('skuid');
    let buyerId = selectedItem.find('.item-id').data('buyerid');
    let quantity = selectedItem.find('.count-number').val();
    let oldQuantity = selectedItem.find('.count-number').data('init');
    let nowQuantity = $(evt.target).closest(".item-tr").find('.item-count').html();
    if (nowQuantity == oldQuantity) {
      selectedItem.find('.js-chang-items-count').html("变更数量");
      selectedItem.find('.js-unbind-delivery-count').html($(selectedItem).data('unbind-delivery-count'));
      return;
    }
    //如果是设置为0，并且是最后一个商品，则需要提示用户，将删除该采购单的所有商品
    if (quantity == 0) {
      let itemTrs = $(evt.target).closest('tbody').find('.item-tr');
      if (itemTrs.length == 1) {
        new Modal({
          title: '警告',
          icon: 'warning',
          htmlContent: '您此次提交将删除本采购单的所有商品.<br>取消本采购单请点击本页面下方的“取消”按钮.',
          isConfirm: true
        }).show(() => {
          this.setPurchaseSkuAndQuantity(purchaseId, skuId, quantity, selectedItem,buyerId);
        });
        //如果点击取消，则恢复之前的数据
        selectedItem.find('.count-number').val(oldQuantity);
        $(evt.target).closest(".item-tr").find('.item-count').html(oldQuantity);
        selectedItem.find('.js-chang-items-count').html("变更数量");
        selectedItem.find('.js-unbind-delivery-count').html($(selectedItem).data('unbind-delivery-count'));
        return false;
      }
    }
    this.setPurchaseSkuAndQuantity(purchaseId, skuId, quantity, selectedItem,buyerId);
  }
    //提交采购单的商品及数量
  setPurchaseSkuAndQuantity(purchaseId, skuId, quantity, selectedItem,buyerId) {
    if (purchaseId == "" || purchaseId == undefined || purchaseId == null) {
      selectedItem.find('.js-chang-items-count').html("变更数量");
      new Modal({
        title: '提交失败',
        icon: 'info',
        content: "no purchaseId"
      }).show();
      return null;
    }
    if (skuId == "" || skuId == undefined || skuId == null) {
      selectedItem.find('.js-chang-items-count').html("变更数量");
      new Modal({
        title: '提交失败',
        icon: 'info',
        content: "no skuId"
      }).show();
      return null;
    }
    if (quantity == "" || quantity == undefined || quantity == null) {
      selectedItem.find('.js-chang-items-count').html("变更数量");
      new Modal({
        title: '提交失败',
        icon: 'info',
        content: "no quantity"
      }).show();
      return null;
    }
    if (buyerId == "" || buyerId == undefined || buyerId == null) {
      selectedItem.find('.js-chang-items-count').html("变更数量");
      new Modal({
        title: '提交失败',
        icon: 'info',
        content: "no buyerId"
      }).show();
      return null;
    }
    $.ajax({
      url: '/api/purchases/' + purchaseId + '/items',
      type: 'POST',
      data: {
        skuId: skuId,
        quantity: quantity,
        buyerId: buyerId
      },
      success: (data) => {
        window.location.href = "/buyer/purchase-process?purchaseId=" + purchaseId;
      },
      error: (data) => {
        selectedItem.find('.js-chang-items-count').html("变更数量");
        new Modal({
          title: '提交失败，请重试',
          icon: 'info',
          content: "提交失败：" + data.responseText
        }).show();
      }
    });
  }

  //处理采购单：手动更改商品数量（input控件修改）
  changeCount(evt) {
    //console.log("手动更改商品数量");
    let input = $(evt.target);
    let count = input.val();
    let stock = parseInt($(evt.target).closest(".input-amount").data("max"));
    if (count == "" || count < 0) {
      input.val(0);
      input.trigger("change");
    }
    if (count > stock) {
      input.val(stock);
      count = stock;
      input.trigger("change");
    }
    $(evt.target).closest(".item-tr").find('.item-count').html(input.val());
    this.sumItem($(evt.target).closest(".item-tr"));
  }

  //处理采购单：点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount(evt) {
    let input = $(evt.target).siblings("input.count-number");
    let count = input.val();
    let stock = parseInt($(evt.target).closest(".input-amount").data("max"));
    if (count > stock) {
      input.val(stock);
      count = stock;
    }
  }
}

module.exports = RequisitionProcessItems;