
import Modal from "pokeball/components/modal";
const storage = require('common/local_storage/extend');

class PurchaseOrderProcess {
  constructor ($) {
    this.purCancel = $('.js-pur-cancel');
    this.purSubmit = $('.js-pur-submit');
    this.$commentInput = $("textarea[name=orderComment]");

    this.inputChecklog = $('.js-checklog-comment');
    this.bindEvent();
    this.popoverEvents();
  }

  bindEvent () {
    this.purCancel.on('click', (evt) => { this.deletePurchase(evt) });
    this.purSubmit.on('click', (evt) => { this.submitPurchasePreCheck(evt) });
    this.inputChecklog.on('keyup', evt => this.checkLogKeyup(evt));
    this.$commentInput.on("blur", function () {
      storage.set("orderComment" + $.query.get("purchaseId"), $(this).val());
    })

    const commentContents = storage.get("orderComment" + $.query.get("purchaseId"));
    if (commentContents) {
      this.$commentInput.val(commentContents);
    }
    this.organizeItemsInfo();
    // 发票管理
    $('#invoice-mode-unify').on('click', (evt) => {
      this.setInvoiceMode(evt, 1);
    })
    $('#invoice-mode-waybill').on('click', (evt) => {
      this.setInvoiceMode(evt, 2);
    })
    $('body').delegate('.invoice-block', 'click', (evt) => {
      this.changeInvoice(evt);
    })
    $('body').delegate('.address-block', 'click', (evt) => {
      this.changeAddress(evt);
    })
  }

  /**
   * 初始化popover显示
   * */
  popoverEvents(){
    let $info = '<div>商品代码是商家定义商品唯一性的编码，便于管理</div>'
    $('.js-item-code-popover').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      content: $info,
      delay: {
        hide: 100
      }
    })
  }
  // 输入备注时触发事件
  checkLogKeyup (evt) {
    const maxChars = 500;// 最多字符数
    const obj = $(evt.target);
    if (obj.val().length > maxChars) { obj.val(obj.val().substring(0, maxChars)); }
    // 可输入的数字
    // var curr = maxChars - obj.val().length;
    // $(".js-checklog-comment-count").html(curr.toString());
    $(".js-checklog-comment-count").html(obj.val().length);
  }

  submitPurchasePreCheck (evt) {
    let needContractForOrder = $('.js-contract-checkbox').prop('checked');
    if(needContractForOrder){
      new Modal({
        icon: "info",
        title:"温馨提示",
        content: "选择需要网超合同后不允许修改采购计划书，是否确定下单？",
        isConfirm: true
      }).show(() => {
            this.submitPurchase(evt, needContractForOrder);
          });
    }
    else{
      this.submitPurchase(evt, needContractForOrder);
    }
  }

  // 提交采购单
  submitPurchase (evt, needContractForOrder) {
    let tipContent = '确定提交后将不能再次编辑',
      purId = $('.pur-process-body').data('purchaseid'),
      checkerId = $('.js-select-check').find('option:selected').val(),
      nextStatus = $('.js-select-check').find('option:selected').data("status"),
      comment = $('.js-checklog-comment').val(),
      backlogId = $.query.get("backlogId"),
      purchaseType = $('.js-purchase-type').val(),
      invoiceMode = $('input[name="invoice-mode"]:checked').val();

    if (invoiceMode == '2' && $('.invoice-block.active').length === 0) {
      new Modal({
        title: '未选择发票模板',
        icon: 'warning',
        content: '当前预购单的开票方式是货票同行，请选择一个发票'
      }).show();
      return false;
    }

    if (purchaseType != 2 && purchaseType != 3) {
      const $input = $('.js-purchase-plan-bind');
      const bindAmount = parseInt($input.data('bindAmount'));
      const unbindAmount = parseInt($input.data('unbindAmount'));
      if (isNaN(bindAmount) || bindAmount === 0) {
        tipContent = '您还未关联任何采购计划，是否确定提交?'
      } else if (unbindAmount > 0) {
        tipContent = '您还有部分采购金额未关联采购计划，是否确定提交?'
      }
    }

    // 判断是否选择审核人
    if ($(evt.currentTarget).data('check') == 5) {
      checkerId = null
    } else if (checkerId == "") {
      new Modal({
        title: '未选择审核人',
        icon: 'warning',
        content: '请选择审核人后再提交'
      }).show(() => { $('.js-select-check').focus(); });
      return false;
    }
    new Modal({
      title: '是否确定提交？',
      icon: 'warning',
      htmlContent: tipContent,
      isConfirm: true
    }).show(() => {
      $.ajax({
        url: '/api/purchases/' + purId + '/submit',
        type: 'POST',
        data: { nextStatus, checker: checkerId, comment, backlogId, orderComment: this.$commentInput.val(), needContractForOrder: needContractForOrder },
        success: () => {
          storage.del("orderComment" + $.query.get("purchaseId"));
          new Modal({
            title: '预购单提交成功！',
            icon: 'success',
            htmlContent: '请在“预购单管理 --> 预购单列表”中查看'
          }).show(() => {
            if (purchaseType == 3) {
              window.location.href = "/buyer/blocktrade-purchases";
            } else if (purchaseType == 2) {
              window.location.href = "/buyer/vaccine-purchases";
            } else {
              window.location.href = "/buyer/purchases";
            }
          });
        },
        error: (data) => {
          let resultJson;
          try {
            resultJson = JSON.parse(data.responseText);
            if (resultJson.type == undefined) {
              const _resultJson = JSON.parse(resultJson);
              if (_resultJson.type != undefined) {
                resultJson = _resultJson;
              }
            }
            if (resultJson.type != undefined) {
              const errorMsg = resultJson.errorMsg;
              new Modal({
                title: '温馨提示',
                icon: 'info',
                content: errorMsg
              }).show();
            }
          } catch (e) {
            new Modal({
              title: '温馨提示',
              icon: 'info',
              content: data.responseText
            }).show();
          }
        }
      });
    });
  }

  // 删除采购单
  deletePurchase () {
    const purId = $('.pur-process-body').data('purchaseid');
    const backlogId = $.query.get("backlogId");
    new Modal({
      title: '警告',
      icon: 'warning',
      htmlContent: '取消预购单后将不可恢复！<br/>您确定<strong>取消</strong>本预购单吗？',
      isConfirm: true
    }).show(() => {
      $.ajax({
        url: '/api/purchases/' + purId + "?backlogId=" + backlogId,
        type: 'DELETE',
        success: (data) => {
            // window.location.reload();
            // 成功后转跳到采购单列表页面
          window.location.href = "/buyer/purchases";
        },
        error: (data) => {
          new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.responseText
          }).show();
        }
      })
    });
  }

  setInvoiceMode (evt, mode) {
    $('body').spin('medium');
    evt.stopPropagation();
    const purchaseId = $('.pur-process-body').data('purchaseid');
    $.ajax({
      url: '/api/purchases/' + purchaseId + '/billingMode/' + mode,
      type: 'post'
    }).done(() => {
      window.location.reload()
    }).fail(() => {
      window.location.reload();
    })
  }

  changeInvoice (evt) {
    const prevId = $('.js-purchase-invoice').val()
    const invoice = $(evt.currentTarget).data('invoice')
    if (!invoice || invoice.id == prevId) {
      return
    }
    const data = {
      purchaseId: $('.pur-process-body').data('purchaseid'),
      invoiceOuterId: invoice.id
    }
    $('body').spin('medium')
    $.ajax({
      url: '/api/purchases/invoice',
      type: 'post',
      data
    }).done(() => {
      window.location.reload()
    }).fail(() => {
      window.location.reload();
    })
  }

  changeAddress (evt) {
    const prevId = $('.js-purchase-address').val()
    const address = $(evt.currentTarget).data('address')
    if (!address || address.id == prevId) {
      return
    }
    const data = {
      purchaseId: $('.pur-process-body').data('purchaseid'),
      addrId: address.id
    }
    $('body').spin('medium')
    $.ajax({
      url: '/api/purchases/delivery',
      type: 'post',
      data
    }).done(() => {
      window.location.reload()
    }).fail(() => {
      window.location.reload();
    })
  }

  organizeItemsInfo () {
    let purchaseItems = $('.js-purchase-items').val()
    try {
      purchaseItems = JSON.parse(purchaseItems)
    } catch (e) {
      console.log(e)
    }
    let cartItems = [],
      totalMoney = 0
    _.each(purchaseItems, (item) => {
      totalMoney += (item.skuPrice * item.currentCount / 100)
      const cartItem = {
        sku: {
          id: item.skuId,
          price: item.skuPrice
        },
        itemName: item.itemName,
        itemCount: item.currentCount,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        specification: item.specification,
        unit: item.unit
      }
      cartItems.push(cartItem)
    })
    // 前端暂存需求单商品
    sessionStorage.setItem('orderItems', JSON.stringify({
      totalMoney,
      data: [ { items: cartItems } ]
    }));
  }
}
module.exports = PurchaseOrderProcess;
