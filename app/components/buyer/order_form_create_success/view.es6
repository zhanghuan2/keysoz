
class OrderFormCreateSuccess {
  constructor() {
    this.preRender()
  }

  preRender() {
    let address, addressStr = sessionStorage.getItem('deliveryAddress'),
        orderCost, orderCostStr = sessionStorage.getItem('orderCost'),
        invoiceInfo, invoiceStr = sessionStorage.getItem('invoiceInfo')
    try {
      address = JSON.parse(addressStr)
      orderCost = JSON.parse(orderCostStr)
      invoiceInfo = JSON.parse(invoiceStr)
    }
    catch(e) {
      console.log(e)
      return
    }
    //渲染订单信息
    let $additionInfo = $('.order-addition-info')
    if(orderCost){
      $additionInfo.find('.js-total-money').text(orderCost.total)
      $additionInfo.find('.js-bind-money').text(orderCost.bind)
      $additionInfo.find('.js-unbind-money').text(orderCost.unbind)
    }
    if(address){
      let addressText = address.province + ' ' + address.city + ' ' + address.region + ' ' + address.street + ' ' + address.details + ' (' + address.receiverName + ' 收) ' + address.mobile
      $('.address-info').text(addressText)
    }
    if(invoiceInfo){
      if(invoiceInfo.type == 1){
        $('.invoice-type').text('增值税普通发票')
      }
      else{
        $('.invoice-type').text('增值税专用发票')
      }
      $('.invoice-title').text(invoiceInfo.title)
      $('.invoice-info').show()
    }
    //定时跳转
    let timerId = setInterval(()=>{
      let $timeSpan = $('.time-count-down')
      let time = parseInt($timeSpan.text())
      time--
      $timeSpan.text(time)
      if(time === 0){
        clearInterval(timerId)
        window.location.href ='/'
      }
    }, 1000)
  }

}

module.exports = OrderFormCreateSuccess