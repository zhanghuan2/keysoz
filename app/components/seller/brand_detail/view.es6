var download = require("common/uploadFile/extend");
class brandDetail {
  constructor($) {
    this.submitBtn = $(".js-submit-opinion")
    new download("","/api/zcy/attachment/downloadUrl",".downloadFile");

    this.bindEvent()
  }

  bindEvent() {
    this.initChangeInfo();
    this.submitBtn.on("click", evt => this.itemCheckstatus(evt))
  }

  initChangeInfo() {
    /*遍历 会把baseinfo都留下来*/
    var eachTr = function() {
      $.when(
        $('#information tr').map(function() {
          /* 排除th */
          var thLen = $(this).find('th').length;
          if(thLen > 0) {
            $(this).prepend(
              '<th width="40" style="text-align: right;"></th>'
            );
          } else if($(this).hasClass('tfoot')) {
            $(this).prepend(
              '<td style="width: inherit;"></td>'
            );
          } else {
            var change = $(this).data('change');
            var label, title;
            if(undefined === change || 'CHANGE_NOTHING' === change) {
              /* 没有变更 */
              $(this).prepend('<td style="width: inherit;"></td>');
            } else {
              /* 这里判断增删改 */
              if('CHANGE_UPDATE' === change) {
                label = 'label-yellow';
                title = '改';
              }
              var trName = $(this).data('trname');
              var prev = $(this).data('prev');
              var nowvalue = $(this).data('nowvalue');
              $(this).prepend(
                '<td class="text-center"><label class="label ' + label +
                ' label-popover">' + title + '</label>' +
                '<table class="table popover-change" style="display: none;">' +
                '<thead>' +
                '<tr class="popover-tr">' +
                '<th> 编辑前 </th>' +
                '<th> 编辑后 </th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr class="popover-tr">' +
                '<td>' + prev + '</td>' +
                '<td>' + nowvalue + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</td>'
              );
              $(this).children('.text-right').width('100');
            }
          }
        })).then(
        function() {
          setTimeout(function() {
            /* 绑定hover接口 */
            console.log($('tbody .label-popover').length)
            $('tbody .label-popover').map(function() {
              /* 只有删除有popover */
              if(true === $(this).hasClass('label-yellow')) {
                var $info = $(this).siblings('.popover-change').clone(true).show();
                $(this).popover({
                  trigger: 'hover',
                  placement: 'right',
                  html: true,
                  content: $info
                });
              }
            });
          }, 1000);
        }

      );
    };
    if($('input[name=changeDetailId]').val()){
      $.when(
        $.ajax({
          type: 'GET',
          url: "/api/brands/admin/getChangeDetail?changeDetailId="+$('input[name=changeDetailId]').val(),
          dataType: 'json',
          contentType: 'application/json;charset:utf-8',
          success: function(data) {
            if((null !== data) && (undefined !== data.changeValue)) {
              $.map(data.changeValue, function(value, key) {
                if(null !== value) {
                  if(data.changeValue[key] !== data.prevValue[key]) {
                    $("td[data-model=" + key + "]").closest('tr').attr('data-change', 'CHANGE_UPDATE')
                      .attr('data-prev', data.prevValue[key])
                      .attr('data-nowvalue', data.changeValue[key]);
                  }
                }
              });
            }
          }
        })
      ).then(
        function() {
          eachTr();
        }
      );
    }
  }

  //审核
  itemCheckstatus(evt) {
    itemId = $.query.get('id');
    this.submitBtn.prop("disabled", true)
    $("body").spin("medium")
    $.ajax({
      url: "/api/items-manage/batch-check",
      type: "POST",
      data: {
        "itemAuditIds": itemId
      },
      success: () => {
        window.location.reload()
        this.submitBtn.prop("disabled", false)
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }
}

module.exports = brandDetail
