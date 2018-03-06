import Cookie from "common/cookie/view"

const PaginationClass = require("pokeball/components/pagination");
const Modal = require("pokeball/components/modal");
let timer;

class inquiryHallList {
  constructor() {
    // if ($.query.get('error') == '0') {
    //     new Modal({ title: '温馨提示', icon: 'error', content: '报价失败!' }).show()
    // } else if ($.query.get('error') == 1) {
    //     new Modal({ title: '温馨提示', icon: 'error', content: '您不满足供应商询价要求，不能参与报价!' }).show()
    // } else if ($.query.get('error') == 2) {
    //     new Modal({ title: '温馨提示', icon: 'error', content: '不在报价时间范围内!' }).show()
    // } else if ($.query.get('error') == 3) {
    //     new Modal({ title: '温馨提示', icon: 'error', content: '询价单不存在!' }).show()
    // } else if ($.query.get('error') == 4) {
    //     new Modal({ title: '温馨提示', icon: 'error', content: '询价单状态已变更，无法报价。' }).show()
    // }

    let userDistrictId = $('input[name=districtId]').val();
    let inquiryPath = $('input[name=inquiryPath]').val();
    let cookieDistrictCode = Cookie.getCookie('districtCode') || '';

    if(cookieDistrictCode && $.query.get('userDistrictId') != cookieDistrictCode){
      location.search = $.query.set('userDistrictId',prefixInteger(cookieDistrictCode,6));
    }
    // if(!$.query.get('userDistrictId') && userDistrictId){
    //   location.href=`${inquiryPath}/lasvegas/api/protocol/announcement/initHall?page=${$.query.get('page')}`
    //   // location.search = $.query.remove('error')
    //   // .set('districtCode',prefixInteger($.query.get('districtCode'),6))
    //   // .set('userDistrictId',prefixInteger(userDistrictId,6))
    // }

    // $('.date1').datepicker()
    this.totalItems = $(".pagination").data("total");
    this.pagination = new PaginationClass('.pagination').total(this.totalItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true,
      callback: function(curr, pagesize) {
        window.location.search = $.query.REMOVE('error')
          .set('pageNo', parseInt(curr) + 1)
          .set('pageSize', pagesize)
          .set('districtCode', prefixInteger($.query.get('districtCode'), 6))
          .set('userDistrictId', prefixInteger($.query.get('userDistrictId'), 6))
          .toString()
      }
    });

    function prefixInteger(num, length) {
      if(num.toString().length >= 6){
        return num;
      }
      if(num =='' || num == null || num == true){
        return '';
      }
      return (Array(length).join('0') + num).slice(-length);
    }

    // 询价所在地 关闭icon
    $(".inquiry-district-tip").on("click", ".close-select-icon", function() {
      $(this)
        .parent()
        .remove();
      let codes = [];
      $(".close-select-icon").each(function(i, ele) {
        let arr =
          $(ele)
            .siblings("span")
            .text()
            .replace(/\s*/g, "")
            .split("/") || [];
        let size = arr.length;
        for (let i = 0, len = size; i < len; i++) {
          if (arr[i]) {
            codes.push(arr[i]);
          }
        }
      });
      if (codes.length) {
        window.location.search = $.query
          .set("districtCode", codes.join(","))
          .set('userDistrictId', prefixInteger($.query.get('userDistrictId'), 6))
          .remove("pageNo")
          .remove("pageSize")
          .remove("error");
      } else {
        window.location.search = $.query
          .set("districtCode", "")
          .set('userDistrictId', prefixInteger($.query.get('userDistrictId'), 6))
          .remove("pageNo")
          .remove("pageSize")
          .remove("error");
      }
    });

    //最新询价和询价结果
    $(".inquiry-type").on("click", function() {
      window.location.search = $.query
        .remove("pageNo")
        .remove("pageSize")
        .remove("error")
        .set("page", $(this).data("type"))
        .set('districtCode', prefixInteger($.query.get('districtCode'), 6))
        .set('userDistrictId', prefixInteger($.query.get('userDistrictId'), 6))
        .toString();
    });

    //报价跳转
    $('.getQuoteId').on('click', function(e) {
      let lasvegasPath = $('input[name=lasvegasPath]').val();
      let selfUrl = location.href;
      let url = `${lasvegasPath}/ctax/api/protocol/announcement/announcementQuote`;
      let anNouncementId = $(this).data('announcement-id');

      $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        contentType: 'application/json;charset=utf-8',
        url: url,
        data: {
          anNouncementId: anNouncementId
        },
        success: function(data) {
          if (data.success) {
            let id = data.result.id;
            if (data.result.requireType == 20) {
              location.href = `${lasvegasPath}/agreementsupply/bidding/offer-ctax/quote?quoteOrderId=${id}`;
            } else if (data.result.requireType == 30) {
              location.href = `${lasvegasPath}/agreementsupply/bidding/offer-ctax/offer?quoteOrderId=${id}`;
            }
          } else {
            if (data.error == '303') {
              location.href = `${$(
                'input[name=loginPath]'
              ).val()}/?target=${selfUrl}`;
            } else {
              new Modal({
                title: '温馨提示',
                icon: 'error',
                content: data.error
              }).show();
            }
          }
        },
        error: function(XHR, textStatus, errorThrown) {
          console.log(
            `error textStatus:${textStatus};errorThrown:${errorThrown}`
          );
        }
      });
    });

    //倒计时刷新
    function timerCount() {
      $(".timer").each(function(i) {
        let timeEnd = $(this).data("time");
        if (timeEnd >= 1000) {
          var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
          var hh = parseInt((timeEnd / 1000 / 60 / 60) % 24, 10); //计算剩余的小时数
          var mm = parseInt((timeEnd / 1000 / 60) % 60, 10); //计算剩余的分钟数
          dd = checkTime(dd);
          hh = checkTime(hh);
          mm = checkTime(mm);
          $(this).html(dd + "天:" + hh + "时" + mm + "分");
          $(this).data("time", timeEnd - 1000);
        } else {
          $(this).html("00天:00时00分");
        }
      });
    }

    //获取未报价页面状态截止时间
    function timeRest() {
      $(".time-rest").each(function(i) {
        let timeEnd = $(this).data("time");
        if (timeEnd >= 1000) {
          var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
          var hh = parseInt((timeEnd / 1000 / 60 / 60) % 24, 10); //计算剩余的小时数
          var mm = parseInt((timeEnd / 1000 / 60) % 60, 10); //计算剩余的分钟数
          dd = checkTime(dd);
          hh = checkTime(hh);
          mm = checkTime(mm);
          $(this).html(dd + "天:" + hh + "时" + mm + "分");
        } else {
          $(this).html("00天:00时00分");
        }
      });
    }

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    //设置定时器
    function setTimer() {
      timer = window.setInterval(function() {
        timerCount();
      }, 1000);
      timeRest();
    }

    setTimer();
  }

  sfadfadfadfadfadf() {
    console.log("fadfadfadfad");
  }
}
module.exports = inquiryHallList;
