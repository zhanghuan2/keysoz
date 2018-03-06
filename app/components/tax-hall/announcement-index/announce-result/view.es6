import Cookie from "common/cookie/view"

let vm;

class AnnounceResult {
  constructor() {
    this.initAnnounceResult();
    vm = this;
  }

  initAnnounceResult() {
    let userDistrictId = Cookie.getCookie('districtCode') || '';
    let lasvegasPath = $('#lasvegasPath').val();
    let ctaxccgpPath = $('#ctaxccgphall').val();
    let $announceResultBody = $('#announceResultBody');
    $.ajax({
      url: `${lasvegasPath}/ctax/api/protocol/hall/protocolAnNouncementResult`,
      type: 'GET',
      dataType: 'jsonp',
      data: {
        userDistrictId: userDistrictId
      },
      success: function(data) {
        //console.log(`data:${JSON.stringify(data)}`);
        if (data.data && data.data.length > 0) {
          $.each(data.data, function(index, item) {
            let pageType;
            switch (item.type) {
              case 5:
                pageType = 'result';
                break;
              case 6:
                pageType = 'batch';
                break;
              case 7:
                pageType = 'cancel';
              default:
                pageType = 'result';
                break;
            }
            $announceResultBody.append(`<tr>
              <td>
                <a href="${ctaxccgpPath}/lasvegas/protocolhall/${pageType}?anNouncementId=${item.anNouncementId || ''}" title="${item.title}">${item.title}
                </a>
              </td>
              <td>${vm.formateDate(item.announcementStartTime)}</td>
            </tr>`);
          });
        } else {
          $announceResultBody.append(`<tr>
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

  formateDate(timeStamp) {
    let time = new Date(timeStamp);
    let prefixMonthOrDay = monthOrDay => {
      if (monthOrDay < 10) {
        return `0${monthOrDay}`;
      } else {
        return `${monthOrDay}`;
      }
    };
    return `${time.getFullYear()}-${prefixMonthOrDay(
      time.getMonth() + 1
    )}-${prefixMonthOrDay(time.getDate())}`;
  }

  sfadfadfadfadfadf() {
    console.log('fadfadfadfad');
  }
}

module.exports = AnnounceResult;
