const Modal = require("pokeball/components/modal")
class brandDetail {
  constructor($) {
    this.submitBtn = $(".js-submit-opinion")
    this.bindEvent()
  }

  bindEvent() {
    this.initChangeInfo();
    this.submitBtn.on("click", evt => this.itemCheckstatusSubmit(evt))
  }

  initChangeInfo() {
    /*遍历 会把baseinfo都留下来*/
    var eachTr = function() {
      $.when(
        $('.control-group').map(function() {
          /* 排除th */
            var change = $(this).data('change');
            var label, title;
            if(undefined === change || 'CHANGE_NOTHING' === change) {
              /* 没有变更 */
            } else {
              /* 这里判断增删改 */
              if('CHANGE_UPDATE' === change) {
                label = 'label-yellow';
                title = '改';
              }
              var prev = $(this).data('prev');
              var nowvalue = $(this).data('nowvalue');
              $(this).prepend(
                '<label class="label ' + label +
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
                '</table>'
              );
            }
        })).then(
        function() {
          setTimeout(function() {
            /* 绑定hover接口 */
            console.log($('.control-group .label-popover').length)
            $('.control-group .label-popover').map(function() {
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
                    $(".control-group[data-model=" + key + "]").attr('data-change', 'CHANGE_UPDATE')
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
  itemCheckstatusSubmit(evt) {
    var bizId = $.query.get('spuId');
    var workflowId = $.query.get('workflowId');
    this.submitBtn.prop("disabled", true)
    let auditResult = $("input[name=agree]:checked").val() === "true" ? "AUDIT_APPROVE" : "AUDIT_REJECT";
    var checkUrl = "/api/spu/admin/submit-audit ";
    if($.query.get("spuType")==1){
      checkUrl = "/api/spu/admin/change-audit";
    }
    let data = {
        "bizId": bizId,
        "workflowId": workflowId,
        "auditResult":auditResult,
        "auditComment": $("textarea[name=opinion]").val()
      }
    $("body").spin("medium")
    $.ajax({
      url: checkUrl,
      type: "POST",
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: () => {
        new Modal({
          icon: "success",
          title: "提交成功"
        }).show(()=>{
          window.location.href = "/items/brand-manage"
        })
        this.submitBtn.prop("disabled", false)
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }
}

module.exports = brandDetail