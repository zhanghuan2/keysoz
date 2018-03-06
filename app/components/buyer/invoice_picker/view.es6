import Modal from "pokeball/components/modal"
const InvoiceEdit = Handlebars.templates["buyer/invoice_picker/templates/invoiceEdit"]
const InvoiceDetailTable = Handlebars.templates["buyer/invoice_picker/templates/invoiceDetailTable"]
const InvoiceList = Handlebars.templates["buyer/invoice_picker/templates/invoicePickerList"]
const FormChecker = require('common/formchecker/view')

class InvoicePicker {
  constructor() {
    this.preRender()
    this.bindEvent()

    let mode = this.$invoicePicker.find('input[name="invoice-mode"]:checked').val()
    if(mode == 2) {
      this.reRenderInvoiceList()
      this.$invoiceTable.removeClass('hidden')
    }
  }

  preRender() {
    this.$invoicePicker = $('.invoice-picker')
    this.$invoiceTable = $('.invoice-table')
    this.popoverEvents()
  }

  bindEvent() {
    this.$invoicePicker.delegate('input[name="invoice-mode"]', 'click', this.changeInvoiceMode.bind(this))
    this.$invoicePicker.delegate('.expand-all', 'click', this.expandOrFold.bind(this))
    this.$invoicePicker.delegate('.add-invoice', 'click', this.addInvoice.bind(this))
    this.$invoicePicker.delegate('.manage-invoice', 'click', this.gotoManage.bind(this))
    this.$invoicePicker.delegate('.invoice-block', 'click', this.changeInvoice)
    this.$invoicePicker.delegate('.update-invoice', 'click', this.updateInvoice.bind(this))
    // this.$invoiceTable.delegate('.edit-content', 'click', this.editCustomContent)
    // this.$invoiceTable.delegate('.custom-content-input', 'blur', this.saveCustomContent)
    this.$invoiceTable.delegate('.set-default-invoice', 'click', this.setDefaultInvoice.bind(this))
    $('body').on('zcy.itemsChanged', this.bindPopoverInvoiceDetail.bind(this))
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
  reRenderInvoiceList() {
    let self = this,
      userId = this.$invoiceTable.data('userId')
    $.ajax({
      url: '/api/user/invoices/list?userId='+userId,
      type: 'get'
    }).done((data)=>{
      let html = InvoiceList({'data': data})
      self.$invoiceTable.empty().append(html)
      //保持原来的展开/折叠状态
      let $a = self.$invoiceTable.find('.foot-operations .expand-all')
      let $extra = self.$invoiceTable.find('.extra')
      if(self.$invoiceTable.attr('data-table-status') === 'fold'){
        $a.text('展开全部')
        $extra.css('display', 'none')
      }
      else{
        $a.text('收起')
        $extra.css('display', 'inline-block')
      }
      self.bindPopoverInvoiceDetail()
      this.popoverEvents()
      //选中指定发票
      let selectedId = self.$invoiceTable.data('selectedId')
      if(selectedId){
        self.$invoiceTable.find('.invoice-block').each((i, el)=>{
          let invoice = $(el).data('invoice')
          if(invoice.id == selectedId){
            let preBtn = $('.invoice-block.active')
            preBtn.find('.active-sign').hide()
            preBtn.removeClass('active')
            $(el).addClass('active')
            $(el).find('.active-sign').show()
            return false
          }
        })
      }
    }).always(()=>{
      $('body').spin(false)
    })
  }


  changeInvoiceMode() {
    let mode = $('input[name="invoice-mode"]:checked').val()
    if(mode === '2') {
      this.$invoiceTable.removeClass('hidden')
      if(this.$invoiceTable.children().length === 0){
        $('body').spin('medium')
        this.reRenderInvoiceList()
      }
    }
    else{
      this.$invoiceTable.addClass('hidden')
    }
  }

  editCustomContent(evt) {
    let $div = $(evt.target).closest('.invoice-content')
    $div.find('.invoice-content-text').hide()
    let $input = $div.find('.custom-content-input')
    $(evt.target).addClass('hidden')
    $input.show()
    $input.focus()
  }

  saveCustomContent(evt) {
    let $div = $(evt.target).closest('.invoice-content')
    $(evt.target).hide()
    let $text = $div.find('.invoice-content-text')
    let textValue = $(evt.target).val()
    $text.text(textValue)
    $text.attr('title', textValue)
    $text.show()
    $div.find('.edit-content').removeClass('hidden')
  }

  bindPopoverInvoiceDetail() {
    let orderItems = sessionStorage.getItem('orderItems'),
        itemsCount = 0,
        itemsArray = [],
        categoriesMap = {},
        categoriesArray = []
    if(!orderItems) return
    try {
      orderItems = JSON.parse(orderItems)
    }
    catch (e){
      console.log(e)
    }
    _.each(orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        itemsCount += item.itemCount
        itemsArray.push(item)
        let category = categoriesMap[item.categoryId]
        if(!category){
          category = {}
          category.name = item.categoryName
          category.count = 0
          category.money = 0
          categoriesMap[item.categoryId] = category
          categoriesArray.push(category)
        }
        category.count += item.itemCount
        category.money += parseFloat(item.sku.price) * item.itemCount / 100
      })
    })

    let hoverPoints = this.$invoiceTable.find('.popover-invoice-detail')
    _.each(hoverPoints, (el)=>{
      let data = [],
          contentType = $(el).data('contentType'),
          totalMoney = parseFloat(orderItems.totalMoney).toFixed(2)
      if(contentType === 1){//类目
        _.each(categoriesArray, (category)=>{
          data.push({
            name: category.name,
            count: category.count,
            money: category.money.toFixed(2)
          })
        })
      }
      else if(contentType === 2){//商品
        _.each(itemsArray, (item)=>{
          data.push({
            name: item.itemName,
            specification: item.specification,
            unit: item.unit,
            count: item.itemCount,
            price: (parseFloat(item.sku.price)/100).toFixed(2),
            money: (parseFloat(item.sku.price) * item.itemCount / 100).toFixed(2)
          })
        })
      }
      else if(contentType === 4){
        data.push({
          name: '办公用品',
          count: itemsCount,
          money: totalMoney
        })
      }
      else if(contentType === 5){
        data.push({
          name: '耗材',
          count: itemsCount,
          money: totalMoney
        })
      }
      else if(contentType === 6){
        data.push({
          name: '电脑配件',
          count: itemsCount,
          money: totalMoney
        })
      }
      let popover = $(el).data('bs.popover')
      if(popover){
        popover.options.content = InvoiceDetailTable({data, contentType})
      }
      else{
        $(el).popover("destroy").popover({
          trigger: 'hover',
          placement: 'bottom',
          html: true,
          content: InvoiceDetailTable({data, contentType}),
          delay: {
            hide: 100
          }
        })
      }
    })
  }

  expandOrFold(evt) {
    let $a = $(evt.target)
    let $extra = this.$invoiceTable.find('.extra')
    if(this.$invoiceTable.attr('data-table-status') === 'fold'){
      $a.text('收起')
      this.$invoiceTable.attr('data-table-status', 'expand')
      $extra.css('display', 'inline-block')
    }
    else{
      $a.text('展开全部')
      this.$invoiceTable.attr('data-table-status', 'fold')
      $extra.css('display', 'none')
    }
  }

  changeInvoice(evt) {
    let btn
    if ($(evt.target).hasClass('invoice-block')){
      btn = $(evt.target)
    }
    else{
      btn = $(evt.target).closest('.invoice-block')
    }
    if(btn.hasClass('active')) {
      return
    }
    let preBtn = $('.invoice-block.active')
    preBtn.find('.active-sign').hide()
    preBtn.removeClass('active')
    btn.addClass('active')
    btn.find('.active-sign').show()
  }

  gotoManage(){
    window.open('/invoice/invoiceSetting')
  }

  addInvoice(evt) {
    evt.stopPropagation()
    let editModal = new Modal(InvoiceEdit())
    editModal.show()
    this.bindModalEvents(editModal, false)
    this.popoverEvents()
  }

  updateInvoice(evt) {
    evt.stopPropagation()
    let invoice = $(evt.target).data('invoice')
    let editModal = new Modal(InvoiceEdit(invoice))
    editModal.show()
    this.bindModalEvents(editModal, true)
    this.popoverEvents()
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
      let orgId = self.$invoiceTable.data('orgId'),
          $bankSelect = $(modal).find('select[name="bank"]')
      //已经初始化过的不需要重新初始化
      if ($bankSelect.children().length > 0) return
      $.ajax({
        type: "get",
        url: "/api/org/bank/getPurchaserOrgPayBanks?orgId=" + orgId
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

  setDefaultInvoice(evt) {
    let invoiceId = $(evt.target).data('id')
    if(!invoiceId) return
    let self = this
    $('body').spin('medium')
    $.ajax({
      url: '/api/user/invoices/' + invoiceId + '/default',
      type: 'post'
    }).done(()=>{
      self.reRenderInvoiceList()
    }).fail(()=>{
      new Modal({
        icon:"error",
        title: '操作失败',
        content: '设置默认发票失败，请稍后再试'
      }).show()
    })
  }

  saveInvoice(evt, editModal) {
    let modal = editModal.modal
    $(evt.target).prop('disabled', true)
    let url, invoiceId = $(evt.target).data('id')
    if(invoiceId){
      url = '/api/user/invoices/'+invoiceId +'/update'
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
    let self = this
    $.ajax({
      url: url,
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(()=>{
      editModal.close()
      self.reRenderInvoiceList()
    }).fail(()=>{
      $(evt.target).prop('disabled', false)
    })
  }


}

module.exports = InvoicePicker