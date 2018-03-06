import Pagination from 'pokeball/components/pagination'
import Modal from "pokeball/components/modal"
let ConfirmView = Handlebars.templates['buyer/confirm_shipment_receipt/templates/confirmView']
const invoiceTemp = Handlebars.templates['buyer/confirm_shipment_receipt/templates/showInvoice']

class ConfirmShipmentReceipt {

  constructor(shipmentId, showAccept){
    if(!shipmentId) {
      console.error('shipment id cant be null')
      return
    }
    this.shipmentId = shipmentId
    this.showAccept = showAccept || 0
    this.pageNo = 1
    this.pageSize = 20
    this.popoverEvents()
  }

  show() {
    let self = this
    $.ajax({
      url: '/api/zcy/orders/pagingShipmentItems',
      type: 'get',
      data: {shipmentId: self.shipmentId, pageNo: self.pageNo, pageSize: self.pageSize}
    }).done((result)=>{
      if(self.modal) {
        let bodyHtml = $($.parseHTML(ConfirmView({_DATA_: result}))[0]).find('.modal-body')
        $(self.modal.modal).find('.modal-body').replaceWith(bodyHtml)
        $(self.modal.modal).find('#select-batch').prop( 'checked ', false)
      }
      else {
        self.modal = new Modal(ConfirmView(result))
        self.modal.show()
      }
      //疫苗商品附件展示
      if (result.total > 0 && result.data[0].orderType == 2) {
        $('.modal .batchNumber .js-ossFile').uploadFile({bizCode: 1042, showOnly: true})
      }

      self.bindModalEvents()
      self.checkAcceptance()//验收完毕复选框
      /*
      story#2576 在买家确认收货弹窗中，取消发票信息行的显示
        self.renderInvoice()
      */
    })
  }


  bindModalEvents() {
    let self = this
    //翻页控件
    let total = $(self.modal.modal).find('.pagination').data('total')
    new Pagination( '.pagination ').total(total).show(self.pageSize, {
      current_page: self.pageNo - 1,
      callback: (pageNo) => {
        self.pageNo = pageNo
        self.show()
      }
    })

    //初始化数字增减控件
    $('.input-amount').amount()
    //确认收货提交
    $('.js-received-items-submit').on('click',() => {
      $('.js-received-items-submit').prop('disabled', true)
      let shipmentItems = [], url, invoiceIds,
        step = $('.quantityTotal').prop('checked') == true ? 5 : ''//step=5时代表已验收
      if($('#invoiceBox').find('#invoiceTab').length > 0){
        invoiceIds = $('#invoiceTab').find('tbody tr').data('id')
        url = `/api/zcy/orders/confirmReceivePartItems?shipmentId=${self.shipmentId}&step=${step}&invoiceIds=${invoiceIds}`
      }
      else{
        url = `/api/zcy/orders/confirmReceivePartItems?shipmentId=${self.shipmentId}&step=${step}`
      }

      $('.received-items').find('.invoice-item-table tbody').find('tr').each(function(i,e){
        let id = $(e).data('id'),
          skuId = $(e).data('skuId'),
          itemId = $(e).data('itemId'),
          receiveQuantity = $(e).find('.count-number').val(),
          obj = {id, skuId, itemId, receiveQuantity}
        shipmentItems.push(obj)
      })

      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(shipmentItems),
        contentType:'application/json'
      }).done(()=>{
        window.location.reload()
      }).fail(()=>{
        $('.js-received-items-submit').prop('disabled', false)
      })
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

  //判断验收完毕复选框是否选中
  checkAcceptance() {
    if(!this.showAccept){
      $('.quantityTotalLabel').css('display','none')
    }
    else{
      $('input.count-number').on('change', function() {
        let total1 = 0, total2 = 0
        $('input.count-number').each(function(i, e) {
          total1 += parseInt($(e).val())
        })
        $('.input-amount').each(function(i, e) {
          total2 += parseInt($(e).data('max'))
        })
        if (total1 === total2) {
          $('.quantityTotal').prop('checked', true)
        } else {
          $('.quantityTotal').prop('checked', false)
        }
      })
      $('.quantityTotal').on('change', (evt) => {
        if ($(evt.currentTarget).prop('checked') == true) {
          $('input.count-number').each(function(i, e) {
            $(e).val($(e).parent().data('max'))
          })
        }
      })
    }
  }

  //渲染发票
  renderInvoice(){
    let $invoiceBox = $('#invoiceBox'),
    self = this
    $.ajax({
      url:'/api/zcy/orders/queryUnreceivedInvoice/byShipment',
      type:'GET',
      data:{shipmentId: this.shipmentId},
      success:function(res){
        if(res && res.success && res.result.length > 0){
          let html = invoiceTemp(res)
          $invoiceBox.html(html)
          self.popoverEvents()
        }
      }
    })
  }
}

module.exports = ConfirmShipmentReceipt