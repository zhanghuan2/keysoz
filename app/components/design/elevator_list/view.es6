const carTemplate = Handlebars.templates["design/elevator_list/templates/car"]
const CustomerService = require('common/customer-service/extend');

export default class ElevatorList {
  constructor () {
    this.bindEvent()
  }

  bindEvent () {
    this.renderElevator()
    $(window).on("scroll", (evt) => this.bodyScroll(evt));
    this.$el.on("click", ".js-elevator-hook-li", this.jumpToFloor);
  }

  bindItemHover() {
    $(".js-list-evevator li").hover(function() {
      $(this).addClass('active');
    },function() {
      $(this).removeClass('active');
    });
  }

  renderElevator () {
    let floors = $(".js-elevator-hook-item");
    let floorData = _.map(floors, (floor) => {
      return {
        id: $(floor).data('id'),
        // icon: $(floor).data('icon'),
        name: $(floor).data('name').substring(0,4)
      };
    });
    this.$el.prepend(carTemplate({data: floorData}));
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
    let target = vm.$el.find(".js-elevator-hook-li:first").data("target");
    if (!target) {
      return
    }
    let $target = $(`.js-elevator-hook-item[data-id='${target}']`)
    if (!$target.size()) {
      return
    }
    let top = $target.offset().top
    let halfHeight = $(window).height() / 2
    if (windowTop + halfHeight >= top) {
      vm.$el.addClass("active")
      $('.js-list-evevator .to-top-car').off('click').click(vm.jumpToTop);
    } else {
      vm.$el.removeClass("active")
    }
  }

  // 滚动式电梯组件改变选中项
  changeElevatorActive (windowTop) {
    windowTop = windowTop + $(window).height() / 2
    let $elevators = this.$el.find(".js-elevator-hook-li")
    $.each($elevators, (index, li) => {
      let target = $(li).data("target")
      let $elevatorItem = $(`.js-elevator-hook-item[data-id='${target}']`)
      let top = $elevatorItem.offset().top
      let height = 0
      let dataHeight = $(li).data('height')
      // 不是最后一个
      if (dataHeight) {
        height = dataHeight
      } else {
        if (index < $elevators.size() - 1) {
          let nextTarget = $($elevators[index + 1]).data('target')
          let $nextElevatorItem = $(`.js-elevator-hook-item[data-id='${nextTarget}']`)
          // 当前的高度为下一个的高度减去当前的高度
          height = $nextElevatorItem.offset().top - $elevatorItem.offset().top
          // 写入，避免每次都计算
          $(li).data('height', height)
        }
      }

      if (!height) {
        if (top <= windowTop) {
          $(li).addClass("active").siblings("li").removeClass("active")
        }
      } else {
        if (top <= windowTop && windowTop <= top + height) {
          $(li).addClass("active").siblings("li").removeClass("active")
        }
      }
    })
  }

  // 点击电梯跳转至相应DIV
  jumpToFloor (evt) {
    let target = $(evt.currentTarget).data("target"),
        jumpTop = $(`.js-elevator-hook-item[data-id='${target}']`).offset().top - $(window).height() / 2 + 40
    $('html, body').animate({scrollTop: jumpTop})
  }

  jumpToTop () {
    $('html, body').animate({scrollTop: 0});
  }

}
