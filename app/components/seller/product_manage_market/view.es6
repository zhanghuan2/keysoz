const OriginShelfItem = require('seller/shelf_item/view')

const Modal = require('pokeball/components/modal')

const listExamineTemplate = Handlebars.templates['seller/shelf_item/templates/list_examine']
const cancelAuditTemplate = Handlebars.templates['seller/product_manage_market/templates/cancelAuditModal']
const unfreezeWidthComment = Handlebars.templates['seller/item_supervise/templates/unfreeze_with_comment']

let examine

class ProductManageMarket extends OriginShelfItem {
  constructor ($) {
    super($)
  }

  bindEvent () {
    super.bindEvent()
    let self = this
    $('body').on('keyup', '#js-examine-reason', function () {
      let content = $(this).val().trim()
      $(".js-examine-submit").attr("disabled", content == "")
    })
    $('body').on('keyup', '.unfrozen-comment', function () {
      let canSubmit = $(this).val() === ''
      $('.btn-unfrozen-submit').attr('disabled', canSubmit)
    })
    $('body').on('click', '.js-item-unfrozen', function (evt) {
      self.onUnfrozenItem(evt)
    })
    $('.cancelAudit').on('click', (evt) => this.handleCancelAudit(evt)) // 撤销审核
    $('body').on('change', '#js-cancel-reason', (evt) => this.handleCancelAuditReason(evt)) // 监听撤销原因change事件
    // 区划信息折叠
    $(".item-manage-table").on("click",".drawer-btn-container",function () {
      let btn=$(this);
      let icon=btn.children("i");
      let parentTr =btn.parent("tr");
      let operateToggle=parentTr.find(".js-operate-toggle").find("div");
      let statusToggle=parentTr.find(".js-status-toggle").find("div");
      let divisionsToggle=parentTr.find(".js-divisions-toggle").find("div");
      if (icon.hasClass('icon-xiangshangzhedie')) {
        $.each(operateToggle,function (i,node) {
          if(i>2){
            $(node).addClass("hide");
            $(statusToggle[i]).addClass("hide");
            $(divisionsToggle[i]).addClass("hide");
          }
        });
        icon.removeClass('icon-xiangshangzhedie');
      }else {
        operateToggle.removeClass("hide");
        statusToggle.removeClass("hide");
        divisionsToggle.removeClass("hide");
        icon.addClass('icon-xiangshangzhedie');
      }
    })
    //tab页签选中状态
    let tabs=$(".tab-navs").find("li");
    let tabStatus=$.query.get("status");
    tabs.removeClass("active");
    if(tabStatus==1){
      $(tabs[1]).addClass("active");
    }else if(tabStatus==-1){
      $(tabs[2]).addClass("active");
    }else{
      $(tabs[0]).addClass("active");
    }
  }

  // 重载下架
  offTheItem (evt) {
    let itemId = $(evt.currentTarget).closest('tr').data('id');
    let signDistrictCode = $(evt.currentTarget).attr('data-districtcode');
    $('.js-item-off').attr('id', itemId)
    $(document).on('confirm:off-one', (event, data) => this.undershelf(itemId,signDistrictCode))
  }
  // 单个商品下架请求
  undershelf(itemId,signDistrictCode){
    $.ajax({
      url: '/api/seller/items/undershelf',
      type: 'POST',
      data: {
        'itemId': itemId,
        'signDistrictCode':signDistrictCode
      },
      success: () => {
        window.location.reload();
      }
    });
  }
  // 重载上架
  onTheItem (evt) {
    let vm = this
    let itemId = $(evt.currentTarget).closest('tr').data('id')
    let signDistrictCode = $(evt.currentTarget).attr('data-districtcode');
    $('.js-item-on').attr('id', itemId)
    let name = $(evt.currentTarget).data("name")
    $(document).off('confirm:on-one').on('confirm:on-one', function (event, data) {
      let listExamine = $(listExamineTemplate({
        name
      }))
      new Modal(listExamine).show()
      $('.js-examine-submit').on('click', function () {
        let auditComment = $('#js-examine-reason').val().trim()
        vm.itemOnshelfExamin(data, auditComment,signDistrictCode)
      })
    })
  }

  // 撤销审核
  handleCancelAudit (evt) {
    let arr = []
    let itemId = $(evt.target).closest('tr').data('id');
    let signDistrictCode = $(evt.currentTarget).attr('data-districtcode');
    arr.push(itemId)
    let name = $(evt.target).data('product')
    new Modal(cancelAuditTemplate({name})).show()

    $('.js-cancel-submit').on('click', function () {
      let cancelReason = $('#js-cancel-reason').val()
      $('.js-cancel-submit').prop('disabled', true)
      $('body').spin('medium')
      $.ajax({
        url: '/api/seller/items/cancel-audit',
        type: 'POST',
        data: {
          'itemIds': arr,
          'cancelReason': cancelReason,
          'signDistrictCode':signDistrictCode
        },
        success: () => {
          window.location.reload()
          $('.js-cancel-submit').psrop('disabled', false)
        },
        complete: () => {
          $('body').spin(false)
        }
      })
    })
  }
  // 监听撤销原因change事件
  handleCancelAuditReason (evt) {
    if ($(evt.target).val() != '' || $(evt.target).val() != ' ') {
      $('.js-cancel-submit').prop('disabled', false)
    } else {
      $('.js-cancel-submit').prop('disabled', true)
    }
  }

  onUnfrozenItem (evt) {
    let itemId = $(evt.currentTarget).closest('tr').data('id');
    let signDistrictCode = $(evt.currentTarget).attr('data-districtcode');
    let self = this
    let modal = new Modal(unfreezeWidthComment())
    modal.show(function (modal) {
      let comment = $('.unfrozen-comment', modal.modal).val()
      self.unfrozenItem(itemId, comment,signDistrictCode)
    })
  }

  unfrozenItem (itemId, comment,signDistrictCode) {
    let api = '/api/seller/items/netsuper/applyUnfrozenItem'
    $('body').spin('medium')
    $.ajax({
      url: api,
      type: 'POST',
      data: {
        signDistrictCode:signDistrictCode,
        itemId: itemId,
        comment: comment
      },
      success: () => {
        window.location.reload()
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  // 批量下架商品
  batchOffItems () {
    let items = _.map($('input.js-item-select:checked'), (i) => $(i).closest('tr').data('id'))
    if (items.length) {
      this.changeItemStatus(items, '-1')
    } else {
      new Modal({
        icon: 'error',
        title: '没有商品没选中',
        content: '请勾选至少一个需要操作的商品'
      }).show()
    }
  }

  // 批量上架
  batchOnItems () {
    let vm = this
    let items = _.map($('input.js-item-select:checked'), (i) => {
      return $(i).closest('tr').data('id')
    })
    let name = '批量商品'
    if (items.length) {
      let listExamine = $(listExamineTemplate({
        name
      }))
      new Modal(listExamine).show()
      $('.js-examine-submit').on('click', function () {
        let auditComment = $('#js-examine-reason').val().trim()
        vm.batchItemOnshelfExamin(items, auditComment)
      })
    } else {
      new Modal({
        icon: 'error',
        title: '没有商品没选中',
        content: '请勾选至少一个需要操作的商品'
      }).show()
    }
  }

  // 重载商品选择
  selectItem (evt) {
    let totalCount = 0
    _.each($('.js-item-select:checked'), (item) => {
      totalCount++
    })
    if (totalCount != 0) {
      $('.js-item-batch-delete').removeAttr('disabled')
    } else {
      $('.js-item-batch-delete').attr('disabled', true)
    }
  }

  // 重载批量选择
  selectBatch (evt) {
    $('input.js-item-select').prop('checked', $(evt.currentTarget).prop('checked') ? true : false)
    this.selectItem(evt)
  }

  //重写商品删除
  deleteTheItem (evt) {
    let itemId = $(evt.currentTarget).closest("tr").data("id");
    $(".js-item-delete").attr("id", itemId);
    $(document).on("confirm:delete-one", (event, data)=> this.itemsDelete(data))
  }

  itemsDelete(data){
    $.ajax({
      url: '/api/seller/items/delete',
      type: "POST",
      data: {
        "itemId": data
      },
      success: () => {
        window.location.reload();
      }
    })
  }

  // 检查商品是否是协议商品(上架)
  checkItemdiscont (itemIds) {
    $('body').spin('medium')
    $.ajax({
      async: false,
      url: '/api/seller/items/check-discount',
      type: 'POST',
      data: {
        'itemIds': itemIds
      },
      success: (data) => {
        examine = data
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  // 商品上架申请单个
  itemOnshelfExamin (itemId, auditComment,signDistrictCode) {
    $('.js-examine-submit').prop('disabled', true)
    $('body').spin('medium')
    $.ajax({
      url: '/api/seller/items/do-onshelf',
      type: 'POST',
      data: {
        'itemId': itemId,
        'auditComment': auditComment,
        'auditResult': 'SUBMIT_FIRST_AUDIT',
        'signDistrictCode':signDistrictCode
      },
      success: () => {
        window.location.reload()
        $('.js-examine-submit').prop('disabled', false)
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  // 商品上架申请批量
  batchItemOnshelfExamin (itemIds, auditComment) {
    $('.js-examine-submit').prop('disabled', true)
    $('body').spin('medium')
    $.ajax({
      url: '/api/seller/items/batch-onshelf',
      type: 'POST',
      data: {
        'itemIds': itemIds,
        'auditComment': auditComment,
        'auditResult': 'SUBMIT_FIRST_AUDIT'
      },
      success: () => {
        window.location.reload()
        $('.js-examine-submit').prop('disabled', false)
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }
  // (覆盖)更改商品状态发送请求（上下架，删除）
  changeItemStatus (ids, status,signDistrictCode) {
    $("body").spin("medium")
    let datas={"ids": ids, "status": status};
    if(signDistrictCode){
      datas.signDistrictCode=signDistrictCode;
    }
    $.ajax({
      url: "/api/seller/items/status",
      type: "POST",
      data: datas,
      success: () => {
        window.location.reload()
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

  // 重载商品详情编辑
  getItemDetail (evt) {
    if ($(evt.currentTarget).data('status') == '2') { // 待审核状态不允许编辑
      return false
    }
    let itemId = $(evt.currentTarget).data('id')
    $.ajax({
      url: `/api/seller/items/${itemId}/detail`,
      type: 'GET',
      dataType: 'html',
      success: (data) => {
        this.renderRichEditor(itemId, data)
      }
    })
  }
}

module.exports = ProductManageMarket
