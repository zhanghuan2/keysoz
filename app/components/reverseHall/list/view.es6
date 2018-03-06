const PaginationClass = require('pokeball/components/pagination')
const Modal = require("pokeball/components/modal")
const Cookie = require("common/cookies/extend")
const ZCYCookie = require("common/cookie/view")
let timer

class reverseHallList {
  constructor() {
    let vm = this;
    if ($.query.get('error') == "0") {
      new Modal({ title: '温馨提示', icon: 'error', content: "报价失败!" }).show()
    } else if ($.query.get('error') == 1) {
      new Modal({ title: '温馨提示', icon: 'error', content: "您不满足供应商要求，不能参与报价!" }).show()
    } else if ($.query.get('error') == 2) {
      new Modal({ title: '温馨提示', icon: 'error', content: "不在报价时间范围内!" }).show()
    } else if ($.query.get('error') == 3) {
      new Modal({ title: '温馨提示', icon: 'error', content: "竞价单不存在!" }).show()
    } else if ($.query.get('error') == 4) {
      new Modal({ title: '温馨提示', icon: 'error', content: "供应商未通过初审，不能参与报价!" }).show()
    } else if ($.query.get('error') == 5) {
      new Modal({ title: '温馨提示', icon: 'error', content: "当前供应商区划不支持!" }).show()
    } else if ($.query.get('error') == 6) {
      new Modal({ title: '温馨提示', icon: 'error', content: "由于上轮未报价,不能进行本轮报价!" }).show()
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


      //询价所在地 关闭icon
      $('.reverse-district-tip').on('click', '.close-select-icon', function () {
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
          //Cookie.set('districtCodeCookie', '')
          window.location.search = $.query.set('districtCode', codes.join(',')).remove('pageNo').remove('pageSize').remove('error');
        } else {
          //Cookie.set('districtCodeCookie', '')
          let hostName = window.location.host.replace(/^(.*?)\./, 'inquiry.');
          window.location.href = "//" + hostName + "/api/inquiry/dispatcher/reverseHall";
          //window.location.search = $.query.set('districtCode', '').remove('pageNo').remove('pageSize').remove('error');
        }
      })

      //最新询价和询价结果
      $('.reverse-type').on('click', function () {
        window.location.search = $.query.remove('pageNo').remove('pageSize').remove('error').set('page', $(this).data('type')).toString()
      })

      //报价跳转
      $('.getQuoteId').on('click', function () {
        let query = encodeURI("{" + $.query.toString().replace('?', '').replace(/&/g, ',') + "}")
        let id = $(this).data('id')
        let type = $(this).data('type')
        window.location.href = $('input[name=reversePath]').val() + "/api/reverse/announcement/detailQuote?requireId=" + id + "&q=" + query + "&type=1"
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



    if (!Cookie.get('districtCode')) {
      let removeSubDomain = (domain) => {
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
      let href = removeSubDomain(window.location.host);
      ZCYCookie.addCookie("districtCode", 339900, 0, href)
      ZCYCookie.addCookie("districtName", '浙江省本级', 0, href)
      window.location.search = '?districtCode=339900';
    } else {
      if (!Cookie.get('oldDistrictCode')) {
        Cookie.set('oldDistrictCode', Cookie.get('districtCode'));
        $.ajax({
          url: '/api/district/isDistrictEnable?districtCode=' + Cookie.get('districtCode'),
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
        if (Cookie.get('districtCode') !== Cookie.get('oldDistrictCode')) {
          Cookie.set('oldDistrictCode', Cookie.get('districtCode'));
          $.ajax({
            url: '/api/district/isDistrictEnable?districtCode=' + Cookie.get('districtCode'),
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
              if (data) {
                window.location.search = "?districtCode=" + Cookie.get('districtCode');
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


    /*
    if (Cookie.get('districtCodeCookie') || Cookie.get('districtCodeCookie') == '') {

    } else if ($('input[name=user_districtId]').val()) {

      if ($.query.get('districtCode') != '') {

        // $.query.get('districtCode') string
        var codes = $.query.get('districtCode').toString().split(',')

        var curCode = $('input[name=user_districtId]').val().trim()
          //flag 如果用户所在的区域code与url中的codes数组中有一致的,就不用跳转了
        let flag = true
        $.each(codes, function(index, ele) {
          if (ele == curCode) {
            flag = false
            return false
          }
        })
        if (flag) {
          window.location.search = $.query.set('districtCode', $('input[name=user_districtId]').val()).toString()
        }
      } else {
        window.location.search = $.query.set('districtCode', $('input[name=user_districtId]').val()).toString()
      }
    }
    */
    // $('.date1').datepicker()

  }

  sfadfadfadfadfadf() {
    console.log("fadfadfadfad")
  }

}

export default reverseHallList
