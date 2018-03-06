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
  }

  // 重载下架
  offTheItem (evt) {
    let itemId = $(evt.currentTarget).closest('tr').data('id')
    $('.js-item-off').attr('id', itemId)
    // $(document).on('confirm:off-one', (event, data) => this.changeItemStatus([data], '-1'))
    $(document).on('confirm:off-one', (event, data) => this.unshelfItem(data))
  }

  // 重载上架
  onTheItem (evt) {
    let vm = this
    let itemId = $(evt.currentTarget).closest('tr').data('id')
    $('.js-item-on').attr('id', itemId)
    let name = $(evt.currentTarget).parent().parent().find('.left-text').find('a').text()
    $(document).off('confirm:on-one').on('confirm:on-one', function (event, data) {
      let listExamine = $(listExamineTemplate({
        name
      }))
      new Modal(listExamine).show()
      $('.js-examine-submit').on('click', function () {
        let auditComment = $('#js-examine-reason').val().trim()
        vm.itemOnshelfExamin(data, auditComment)
      })
    })
  }

  // 撤销审核
  handleCancelAudit (evt) {
    let arr = []
    let itemId = $(evt.target).closest('tr').data('id')
    arr.push(itemId)
    let name = $(evt.target).data('product')
    new Modal(cancelAuditTemplate({name})).show()

    $('.js-cancel-submit').on('click', function () {
      let cancelReason = $('#js-cancel-reason').val()
      $('.js-cancel-submit').prop('disabled', true)
      $('body').spin('medium')
      $.ajax({
        url: '/api/seller/items-vaccine/cancel-audit',
        type: 'get',
        data: {
          'itemId': arr[0],
          'cancelReason': cancelReason
        },
        success: () => {
          window.location.reload()
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
    let itemId = $(evt.currentTarget).closest('tr').data('id')
    let self = this
    let modal = new Modal(unfreezeWidthComment())
    modal.show(function (modal) {
      let comment = $('.unfrozen-comment', modal.modal).val()
      self.unfrozenItem(itemId, comment)
    })
  }

  unfrozenItem (itemId, comment) {
    let api = '/api/seller/items-vaccine/applyUnfrozenItem'
    $('body').spin('medium')
    $.ajax({
      url: api,
      type: 'get',
      data: {
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
  itemOnshelfExamin (itemId, auditComment) {
    $('.js-examine-submit').prop('disabled', true)
    $('body').spin('medium')
    $.ajax({
      url: '/api/seller/items-vaccine/onshelf',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        'itemId': itemId,
        'auditComment': auditComment,
        'auditResult': 'SUBMIT_FIRST_AUDIT'
      }),
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
      url: '/api/seller/items-vaccine/batch-onshelf',
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

  // 商品下架申请 单个
  unshelfItem (itemId) {
    $.ajax({
      url: '/api/seller/items-vaccine/undershelf?itemId='+ itemId,
      type: 'get'
    }).done((resp)=>{
      window.location.reload();
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

  //重写商品删除
  deleteTheItem (evt) {
    let itemId = $(evt.currentTarget).closest("tr").data("id")
    $(".js-item-delete").attr("id", itemId)
    $(document).on("confirm:delete-one", (event, data)=> this.itemsDelete(data))
  }
  itemsDelete(data){
    $.ajax({
      url: "/api/seller/items/delete",
      type: "POST",
      data: {
        "itemId": data
      },
      success: () => {
        window.location.reload();
      },
      complete: () => {
      }
    })
  }
}

module.exports = ProductManageMarket
