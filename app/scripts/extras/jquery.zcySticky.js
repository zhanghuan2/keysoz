/**
 * zcySticky - jQuery Plugin for sticky
 *
 * 使用:
 * $.zcySticky ===> opts参数
 *     @param {array} idParams - 锚点对应的id.
 *     @param {string} itemClass - 每个导航共有的class.
 *     @param {string} itemHover - 单个导航激活状态时的class.
 *     @param {string| number} topMargin - scroll触发fixed定位的预留距离(vartop === varscroll + topMargin). [可选]
 *     @param {string| number} zIndex - 层叠高度,默认990[可选]

 * .stickyEle: 初始化插件，该class被添加到目标元素。
 * .isfixed: 目标元素固定在screen上时, 此class将被添加到目标元素。反之则被移除。
 *
 *
 */

/*// 插件使用示例
 $('selector').zcySticky({
 idParams: ['home', 'first', 'second', 'third', 'fourth', 'fifth'],
 itemClass: 'menuItem',
 itemHover: 'active',
 topMargin: 'auto'
 })*/


;(function ($) {
  var lastScrollTop = 0; // 用于判断滚动方向
  var scrollDir = ''; // 滚动方向

  // 避免元素fixed定位后的高度突然塌陷
  var stickyEleHeight = 0;

  var stickyEleWidth = 0;// fixed定位后元素的宽度
  var topMargin = 0; // scroll触发fixed定位的预留距离

  var itemClass = ''; // 导航共有class,用于选取元素
  var itemHover = ''; // 导航active时class
  var itemSize = 0;

  var idParams = []; // 也可以传入公共类名，生成随机id，组成该数组
  var contentTop = [];

  var vartop; //目标元素距document的距离
  var varscroll; //滚动条滚动距离
  var zIndex; //层叠高度

  //js 实现锚点跳转
  var idScroll = function (id) {
    var $el = $('#' + id)
    if ($el.length) {
      $(document.body).add(document.documentElement)
        .animate({
          scrollTop: $el.offset().top - stickyEleHeight
        })
    }
  }

  // 判断滚动方向：up表示向上滚动，down表示向下滚动
  $(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    if (scrollTop > lastScrollTop) {
      scrollDir = 'down';
    } else {
      scrollDir = 'up';
    }
    lastScrollTop = scrollTop;
  });

  $.fn.zcySticky = function (opts) {
    if (!$(this).size()) {
      return
    }
    this.addClass('stickyEle');
    this.after($('<div class="sticky-attach"></div>'));//占位元素

    var defaultOpts = {
      idParams: [],
      itemClass: '',
      itemHover: ''
    };

    var options = $.extend({}, defaultOpts, opts);

    (options.idParams.length === 0) ? console.log('warning: idParams is null') : idParams = options.idParams;

    itemClass = options.itemClass;
    itemHover = options.itemHover;
    if (options.topMargin) {
      if (options.topMargin === 'auto') {
        topMargin = parseInt($('.stickyEle').css('margin-top'));
      } else {
        //兼容处理
        if (isNaN(options.topMargin) && options.topMargin.search("px") > 0) {
          topMargin = parseInt(options.topMargin.replace("px", ""));
        } else if (!isNaN(parseInt(options.topMargin))) {
          topMargin = parseInt(options.topMargin);
        } else {
          topMargin = 0;
        }
      }
    } else {
      topMargin = 0;
    }
    itemSize = $('.' + itemClass).size();
    zIndex = options.zIndex || 990; // 默认层叠高度

    stickyEleHeight = parseInt(this.height());
    stickyEleWidth = parseInt(this.width());//sticky 定位时元素的宽度
    $('.sticky-attach').height(this.outerHeight(true))
    $('.sticky-attach').width(stickyEleWidth)
    $('.sticky-attach').css('display', 'none')
    vartop = parseInt(this.offset().top);

    $('.stickyEle a[href^=#]').click(function (e) {
      var id = $(this).attr('href').slice(1)
      if (id) {
        e.preventDefault()
        idScroll(id)
      }
    });

    return this; // 链式调用
  };

  $(document).on('scroll', function () {

      varscroll = parseInt($(document).scrollTop());

      if (itemSize !== 0) {
        for (var i = 0; i < itemSize; i++) {
          contentTop[i] = $('#' + idParams[i] + '').offset().top;
          // scroll时，提前50px触发 类active 切换
          if (scrollDir === 'down' && varscroll > contentTop[i] - 50) { // 向下时提前切换
            $('.' + itemClass).removeClass(itemHover);
            $('.' + itemClass + ':eq(' + i + ')').addClass(itemHover);
          }
          // 向上滚动
          if (scrollDir == 'up') {
            if (varscroll > contentTop[i] - 50) {
              $('.' + itemClass).removeClass(itemHover);
              $('.' + itemClass + ':eq(' + i + ')').addClass(itemHover);
            }
          }
          // 向下滚动，varscroll由小变大，for循环从小到大遍历
          // 向上滚动，varscroll由大变小，for循环从小到大遍历，后者覆盖前者
        }
      }

      // fixed定位
      if (vartop < varscroll + topMargin) {
        $('.stickyEle').addClass('isfixed');
        $('.stickyEle').css('position', 'fixed');
        $('.sticky-attach').css('display', 'block')
        $('.isfixed').css({
          width: stickyEleWidth + 'px',
          top: '0px',
          zIndex: zIndex
        });
      }

      // relative定位
      if (varscroll + topMargin < vartop) {
        $('.stickyEle').removeClass('isfixed');
        $('.stickyEle').css('position', 'relative');
        $('.sticky-attach').css('display', 'none')
      }

    }
  );

})(jQuery);
