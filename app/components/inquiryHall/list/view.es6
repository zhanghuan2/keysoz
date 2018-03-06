const PaginationClass = require('pokeball/components/pagination')
const Modal = require("pokeball/components/modal")
const ZCYCookie = require("common/cookie/view")
let timer

class inquiryHallList {
  constructor() {
    let vm = this;
    if ($.query.get('error') == "0") {
      new Modal({ title: '温馨提示', icon: 'error', content: "报价失败!" }).show()
    } else if ($.query.get('error') == 1) {
      new Modal({ title: '温馨提示', icon: 'error', content: "您不满足供应商询价要求，不能参与报价!" }).show()
    } else if ($.query.get('error') == 2) {
      new Modal({ title: '温馨提示', icon: 'error', content: "不在报价时间范围内!" }).show()
    } else if ($.query.get('error') == 3) {
      new Modal({ title: '温馨提示', icon: 'error', content: "询价单不存在!" }).show()
    } else if ($.query.get('error') == 4) {
      new Modal({ title: '温馨提示', icon: 'error', content: "询价单状态已变更，无法报价。" }).show()
    }

    this.getData = function () {
      this.totalItems = $('.pagination').data('total')
      this.pagination = new PaginationClass('.pagination').total(this.totalItems).show($('.pagination').data('size'), {
        num_display_entries: 5,
        jump_switch: true,
        maxPage: -1,
        page_size_switch: true,
        callback: function (curr, pagesize) {
          window.location.search = $.query.REMOVE('error').set('pageNo', parseInt(curr) + 1).set('pageSize', pagesize).toString()
        }
      })


      // 询价所在地 关闭icon
      $('.inquiry-district-tip').on('click', '.close-select-icon', function () {
        $(this).parent().remove()

        let codes = []
        $('.close-select-icon').each(function (i, ele) {
          let hideCode = $(ele).siblings('span')
          let pCode = hideCode.children('.p-code')
          let cCode = hideCode.children('.c-code')
          if (cCode.children('span').length == 0) {
            codes.push(pCode.text())
          } else {
            cCode.children('span').each(function (i, e) {
              codes.push($(e).text())
            });
          }
        })
        if (codes.length) {
          window.location.search = $.query.set('districtCode', codes.join(',')).remove('pageNo').remove('pageSize').remove('error');
        } else {
          let hostName = window.location.host.replace(/^(.*?)\./, 'inquiry.');
          window.location.href = "//" + hostName + "/api/inquiry/dispatcher/inquiryHall";
          //window.location.search = $.query.set('districtCode', '').remove('pageNo').remove('pageSize').remove('error');
        }
      })

      //最新询价和询价结果
      $('.inquiry-type').on('click', function () {
        window.location.search = $.query.remove('pageNo').remove('pageSize').remove('error').set('page', $(this).data('type')).toString()
      })

      //报价跳转
      $('.getQuoteId').on('click', function () {
        let query = encodeURI("{" + $.query.toString().replace('?', '').replace(/&/g, ',') + "}")
        let id = $(this).data('id')
        let type = $(this).data('type')
        window.location.href = $('input[name=inquiryPath]').val() + "/api/inquiry/announcement/listQuote?inquiryId=" + id + "&type=" + type + "&q=" + query
      })

      //倒计时刷新
      function timerCount() {
        $('.timer').each(function (i) {
          let timeEnd = $(this).data('time')
          if (timeEnd >= 1000) {
            var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
            var hh = parseInt(timeEnd / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数
            var mm = parseInt(timeEnd / 1000 / 60 % 60, 10); //计算剩余的分钟数
            dd = checkTime(dd)
            hh = checkTime(hh)
            mm = checkTime(mm)
            $(this).html(dd + "天:" + hh + "时" + mm + "分")
            $(this).data('time', timeEnd - 1000)
          } else {
            $(this).html("00天:00时00分")
          }
        })
      }

      //获取未报价页面状态截止时间
      function timeRest() {
        $('.time-rest').each(function (i) {
          let timeEnd = $(this).data('time')
          if (timeEnd >= 1000) {
            var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
            var hh = parseInt(timeEnd / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数
            var mm = parseInt(timeEnd / 1000 / 60 % 60, 10); //计算剩余的分钟数
            dd = checkTime(dd)
            hh = checkTime(hh)
            mm = checkTime(mm)
            $(this).html(dd + "天:" + hh + "时" + mm + "分")
          } else {
            $(this).html("00天:00时00分")
          }
        })
      }

      function checkTime(i) {
        if (i < 10) {
          i = "0" + i
        }
        return i
      }

      //设置定时器
      function setTimer() {
        timer = window.setInterval(function () {
          timerCount()
        }, 1000)
        timeRest()
      }

      setTimer()
    }

    const removeSubDomain = (domain) => {
      //ip地址时不做截取
      let firstChar = domain.charAt(0);
      if (firstChar >= '0' && firstChar <= '9') {
        return domain;
      }
      let parts = domain.split('.');
      if (parts.length > 2) {
        parts.splice(0, 1);
        return parts.join('.');
      }
      return domain;
    }

    if (!ZCYCookie.getCookie('districtCode')) {
      let href = removeSubDomain(window.location.host);
      ZCYCookie.addCookie("districtCode", 339900, 0, href)
      ZCYCookie.addCookie("districtName", '浙江省本级', 0, href)
      window.location.search = '?districtCode=339900';
    } else {
      if (!ZCYCookie.getCookie('oldDistrictCode')) {
        let href = removeSubDomain(window.location.host);
        ZCYCookie.addCookie("oldDistrictCode", ZCYCookie.getCookie('districtCode'), 0, href)
        $.ajax({
          url: '/api/district/isDistrictEnable?districtCode=' + ZCYCookie.getCookie('districtCode'),
          type: 'GET',
          dataType: 'json',
          contentType: 'application/json;charset=utf-8',
          success: function (data) {
            if (data) {
              vm.getData();
            } else {
              $('.active-district, .no-active-district').toggleClass('hide');
            }
          }
        });
      } else {
        if (ZCYCookie.getCookie('districtCode') !== ZCYCookie.getCookie('oldDistrictCode')) {
          let href = removeSubDomain(window.location.host);
          ZCYCookie.addCookie("oldDistrictCode", ZCYCookie.getCookie('districtCode'), 0, href)
          $.ajax({
            url: '/api/district/isDistrictEnable?districtCode=' + ZCYCookie.getCookie('districtCode'),
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
              if (data) {
                window.location.search = "?districtCode=" + ZCYCookie.getCookie('districtCode');
              } else {
                $('.active-district, .no-active-district').toggleClass('hide');
              }
            }
          });
        } else {
          vm.getData();
        }
      }
    }
  }

  sfadfadfadfadfadf() {
    console.log("fadfadfadfad")
  }

}
module.exports = inquiryHallList;
