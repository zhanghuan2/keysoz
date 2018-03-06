const InvoiceEdit = Handlebars.templates["buyer/invoice_picker/templates/invoiceEdit"]
const Modal = require("pokeball/components/modal")
const FormChecker = require('common/formchecker/view')

class InvoiceSetting {
  constructor($) {
    this.$createBtn = $('.js-create')

    this.total = $('.total')
    this.orgId = this.$createBtn.data('org-id')

    this.popoverEvents()

    this.bindEvents($)
  }

  bindEvents($){
    let here = this

    // 添加发票事件
    here.$createBtn.on('click', function(e){
      here.addInvoice(e)
    })

    // 编辑发票事件
    $('.js-edit').on('click', function(e){
      here.updateInvoice(e, true)
    })

    // 设置默认发票事件
    $('.js-set-default').on('click', function(e){
      here.setDefaultEvent(e)
    })

    // 删除事件
    $('.js-delete').on('click', function(e){
      here.deleteEvent(e)
    })

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
  // 设置默认发票事件
  setDefaultEvent(e){
    new Modal({
      icon: 'info',
      title: '是否确定设置为默认发票？',
      content: '请慎重选择！',
      isConfirm: true
    }).show(function () {
      let invoiceId = $(e.target).data('id')
      $.ajax({
        type: 'POST',
        url: `/api/user/invoices/${invoiceId}/default`,
        success: function () {
          new Modal({
            icon: 'success',
            isConfirm: false,
            content: '设置成功'
          }).show(function(){
            window.location.reload()
          })
        }
      })
    })
  }

  // 删除事件
  deleteEvent(e){
    new Modal({
      icon: 'info',
      isConfirm: true,
      title: '您是否确定删除该发票？',
      content: '删除后不可恢复！'
    }).show(function () {
      let invoiceId = $(e.target).data('id')
      $.ajax({
        type: 'POST',
        url: `/api/user/invoices/${invoiceId}/delete`,
        success: function () {
          new Modal({
            icon: 'success',
            title: '操作成功',
            content: '删除成功'
          }).show(function(){
            window.location.reload()
          })
        }
      })
    })
  }

  addInvoice(evt) {
    evt.stopPropagation()
    let editModal = new Modal(InvoiceEdit())
    editModal.show()
    this.popoverEvents()
    this.bindModalEvents(editModal, false)
  }

  updateInvoice(evt) {
    evt.stopPropagation()
    let invoice = $(evt.target).data('invoice')
    let editModal = new Modal(InvoiceEdit(invoice))
    editModal.show()
    this.popoverEvents()
    this.bindModalEvents(editModal, true)
  }

  bindModalEvents(editModal, isEdit) {
    let self = this, modal = editModal.modal
    $(modal).delegate('.invoice-type', 'change', (evt)=>{
      let type = $(evt.target).val()
      if(type === '2'){
        $(modal).find('.invoice-type2-field span.required').show()
        $(modal).find('span.js-identify-no').removeClass("hide")
        $(modal).find('.invoice-type2-field input[type="text"]').attr('required', true)
        $(modal).find('input[name="taxNumber"]').attr('required', true)
      }
      else{
        $(modal).find('.invoice-type2-field span.required').hide()
        $(modal).find('span.js-identify-no').addClass("hide")
        $(modal).find('.invoice-type2-field input[type="text"]').removeAttr('required')
        $(modal).find('input[name="taxNumber"]').removeAttr('required')
      }
      new FormChecker({
        container: '.modal.invoice-edit .invoice-edit-table',
        ctrlTarget: '.save-invoice',
        precheck: true
      })
    })
    $(modal).delegate('.invoice-content-type', 'click', (evt)=>{
      if($(evt.currentTarget).hasClass('selected')) return
      $(modal).find('.invoice-content-type.selected').removeClass('selected')
      $(evt.currentTarget).addClass('selected')
      let contentType = $(evt.currentTarget).data('content')
      $(modal).find('input[name="content"]').val(contentType)
      if(contentType === 3){
        $(modal).find('.custom-content').show()
        $(modal).find('.custom-content textarea').attr('required', true)
      }
      else{
        $(modal).find('.custom-content textarea').removeAttr('required')
        $(modal).find('.custom-content').hide()
      }
      new FormChecker({
        container: '.modal.invoice-edit .invoice-edit-table',
        ctrlTarget: '.save-invoice',
        precheck: true
      })
    })
    $(modal).delegate('.save-invoice', 'click', (evt)=>this.saveInvoice(evt, editModal))
    $(modal).find('.invoice-type').trigger('change')
    $(modal).find('select[name="type"]').selectric()

    bankSelectInit()
    //初始化开户行选择
    function bankSelectInit(){
      let $bankSelect = $(modal).find('select[name="bank"]')
      //已经初始化过的不需要重新初始化
      if ($bankSelect.children().length > 0) return
      $.ajax({
        type: "get",
        url: "/api/org/bank/getPurchaserOrgPayBanks?orgId=" + self.orgId
      }).done(function(data) {
        if (data.length === 0) {
          let envHref = $('.js-evn-href').data('envHref')
          $bankSelect.closest('tr').after(`<tr><td></td><td><label>您未配置开户行账户，若需填写，请&nbsp;<a href="${envHref.middle}/account/organization">点击</a></label></td></tr>`)
        }
        let options = [{
          id: '-1',
          text: '请选择',
          bank: '请选择',
          account: ''
        }].concat(data)
        $bankSelect.select2({
          "language": {
            "noResults": function() {
              return "未找到银行卡信息"
            }
          },
          placeholder: "请选择",
          data: $.map(options, function(obj) {
            obj.text = obj.text || obj.bank
            return obj
          }),
          minimumResultsForSearch: Infinity,
          escapeMarkup: function(markup) {
            return markup
          },
          templateResult: collectionFormatResult,
          templateSelection:collectionFormatSelected
        })

        let saLen = $bankSelect.find("option").length
        let bankName = $bankSelect.data('bank')
        let selectedAccount = $bankSelect.data('account')
        let bankId

        for (let i = 0; i < saLen; i++){
          let obj = options[i]
          if(obj.isDefault){
            bankId = obj.id
            break
          }
        }
        for (let i = 0; i < saLen; i++){
          let obj = options[i]
          if(obj.bank == bankName && obj.account == selectedAccount){
            bankId = obj.id
            break
          }
        }

        for (let i = 0; i < saLen; i++) {
          let opDom = $bankSelect.find("option").eq(i)
          if (opDom.val() == bankId) {
            $bankSelect.val(opDom.prop("value"))
            break
          }
        }
        $bankSelect.trigger("change")
      })
    }
    //选项列表的格式
    function collectionFormatResult(data) {
      return "<div class='select2-result-bank'>" + data.bank + "</div>" + "<div class='select2-result-account'>" + data.account + "</div>"
    }
    //选中时的选项格式
    function collectionFormatSelected(data) {
      $(modal).find('input[name="bankAccount"]').val(data.account).trigger('blur')
      if(data.bank === '请选择'){
        $(modal).find('input[name="bank"]').val('')
      }
      else{
        $(modal).find('input[name="bank"]').val(data.bank)
      }
      return data.bank
    }

    new FormChecker({
      container: '.modal.invoice-edit .invoice-edit-table',
      ctrlTarget: '.save-invoice',
      precheck: isEdit
    })
  }

  saveInvoice(evt, editModal) {
    let modal = editModal.modal
    $(evt.target).prop('disabled', true)
    let url, invoiceId = $(evt.target).data('id')
    if(invoiceId){
      url = `/api/user/invoices/${invoiceId}/update`
    }
    else{
      url = '/api/user/invoices/create'
    }
    let $table = $(modal).find('.invoice-edit-table')
    let data = {
      title: $table.find('input[name="title"]').val().trim(),
      type: $table.find('select[name="type"]').val(),
      isDefault: $table.find('input[name="isDefault"]').prop('checked'),
      content: $table.find('input[name="content"]').val(),
      taxNumber: $table.find('input[name="taxNumber"]').val().trim(),
      bank: $table.find('input[name="bank"]').val(),
      bankAccount: $table.find('input[name="bankAccount"]').val()
    }
    if(data.content === '3'){
      data.customContent = $table.find('textarea[name="customContent"]').val()
    }

    $.ajax({
      url: url,
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(()=>{
      editModal.close()
      window.location.reload()
    }).fail(()=>{
      $(evt.target).prop('disabled', false)
    })
  }
}
module.exports = InvoiceSetting
