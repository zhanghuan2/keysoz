const CustomerServiceFrame = require('common/customer-service/extend');

export default class CustomerService {
  constructor () {
    let img = $('.customer-service-icon');
    this.src = img.attr('src');
    this.hover = img.data('hover');
    this.bindEvent()
  }

  bindEvent () {
    let vm = this;
    $(".customer-service-box").on("click", () => {
      CustomerServiceFrame.openFrame();
    });
    // 存在hover才切换
    if (vm.hover) {
      $('.customer-service-icon').hover(function() {
        this.src = vm.hover;
      }, function() {
        this.src = vm.src;
      });
    }
  }
}
