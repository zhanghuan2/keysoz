const carTemplate = Handlebars.templates["design/elevator/templates/car"]
const CustomerService = require('common/customer-service/extend');

export default class Elevator {
  constructor () {
    this.bindEvent()
  }

  bindEvent () {
    this.renderElevator()
    $(window).on("scroll", (evt) => this.bodyScroll(evt));
    this.$el.on("click", ".js-elevator-li", this.jumpToFloor);
  }

  bindItemHover() {
    $(".floor-evevator li").hover(function() {
      $(this).addClass('active');
    },function() {
      $(this).removeClass('active');
    });
  }

  renderElevator () {
    let floors = $(".js-floor-item");
    let floorData = _.map(floors, (floor) => {
      return {
        id: $(floor).data('id'),
        icon: $(floor).data('icon'),
        name: $(floor).data('name').substring(0,4)
      };
    });
    this.$el.append(carTemplate({data: floorData}));
    this.bindItemHover();
  }

  // 滚动条滚动
  bodyScroll (evt) {
    // 判断是否为装修模型
    let flag = $("body").data('design')
    if (!flag) {
      let windowTop = $(window).scrollTop()
      this.checkElevatorActive(windowTop)
      this.changeElevatorActive(windowTop)
    }
  }

  checkElevatorActive (windowTop) {
    let vm = this;
    let target = vm.$el.find(".js-elevator-li:first").data("target");
    if (!target) {
      return
    }
    let $target = $(`[data-id='${target}']`)
    if (!$target.size()) {
      return
    }
    let top = $target.offset().top
    if (windowTop >= top) {
      vm.$el.addClass("active")

      $('.floor-evevator .kefu-cart').off('click').click(() => {
        let uid = $('.js-uid-input').val();
        if(uid){
          $.ajax({
            url: '/api/customer/ant/param/encipher?uid='+uid,
            type: 'get',
            success: (resp)=>{
              let data = JSON.parse(resp);
              CustomerService.openFrame(data.cinfo, data.key);
            }
          })
        }
        else{
          CustomerService.openFrame();
        }
      });
      $('.floor-evevator .to-top-car').off('click').click(vm.jumpToTop);
    } else {
      vm.$el.removeClass("active")
    }
  }

  // 滚动式电梯组件改变选中项
  changeElevatorActive (windowTop) {
    windowTop = windowTop + $(window).height() / 2 + 40
    $.each(this.$el.find(".js-elevator-li"), (i, li) => {
      let target = $(li).data("target"),
          top = $(`[data-id='${target}']`).offset().top,
          height = $(`[data-id='${target}']`).height()
      if (top <= windowTop && windowTop <= (top + height)) {
        $(li).addClass("active").siblings("li").removeClass("active")
      }
    })
  }

  // 点击电梯跳转至相应DIV
  jumpToFloor (evt) {
    let target = $(evt.currentTarget).data("target"),
        jumpTop = $(`[data-id='${target}']`).offset().top - $(window).height() / 2 + 40
    $('html, body').animate({scrollTop: jumpTop})
  }

  jumpToTop () {
    $('html, body').animate({scrollTop: 0});
  }

}
