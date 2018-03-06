import Cookie from "common/cookie/view"

let vm;
class AnnounceDetail {
  constructor() {
    this.initAnnounceDetail();
    vm=this;
  }

  initAnnounceDetail() {
    let userDistrictId = Cookie.getCookie('districtCode') || '';
    let lasvegasPath = $('#lasvegasPath').val();
    let ctaxccgpPath = $('#ctaxccgphall').val();
    let $announceDetailBody = $('#announceDetailBody');
    $.ajax({
      url: `${lasvegasPath}/ctax/api/protocol/hall/protocolAnNouncementNew`,
      type: 'GET',
      dataType: 'jsonp',
      data: {
        userDistrictId: userDistrictId
      },
      success: function(data) {
        if (data.data && data.data.length > 0) {
          $.each(data.data, function(index, item) {
            let timeCol;
            if(item.stateName=='报价中'){
              timeCol=`<td class="timer" data-time="${item.endTime}"></td>`
            }else{
              timeCol=`<td>-</td>`
            }
            $announceDetailBody.append(`<tr>
              <td><a href="${ctaxccgpPath}/lasvegas/protocolhall/detail?anNouncementId=${item.anNouncementId}" title="${item.purchaserRequire || ''}">${item.purchaserRequire || ''}</a></td>
              ${timeCol}
            </tr>`);
          });

          //报价倒计时
          setInterval(e => {
            vm.timerCount();
          }, 1000);
          vm.timerCount();
        } else {
          $announceDetailBody.append(`<tr>
            <td colspan="2" class="text-center">暂无数据</td>
          </tr>`);
        }
      },
      error: function(xhr, status, thrown) {
        console.log(
          `error message xhr:${xhr};status:${status};thrown:${thrown}`
        );
      }
    });
  }

  //倒计时刷新
  timerCount() {
    let checkTime = function(i) {
      if (i < 10) {
        i = '0' + i;
      }
      return i;
    };
    $('.timer').each(function(i) {
      let timeEnd = $(this).data('time');
      if (timeEnd >= 1000) {
        var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
        var hh = parseInt((timeEnd / 1000 / 60 / 60) % 24, 10); //计算剩余的小时数
        var mm = parseInt((timeEnd / 1000 / 60) % 60, 10); //计算剩余的分钟数
        dd = checkTime(dd);
        hh = checkTime(hh);
        mm = checkTime(mm);
        $(this).html(dd + '天:' + hh + '时' + mm + '分');
        $(this).data('time', timeEnd - 1000);
      } else {
        $(this).html('00天:00时00分');
      }
    });
  }

  sfadfadfadfadfadf() {
    console.log('fadfadfadfad');
  }
}

module.exports = AnnounceDetail;
