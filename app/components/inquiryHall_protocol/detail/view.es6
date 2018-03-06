const Modal = require("pokeball/components/modal");
let vm;

class inquiryDetail {
  constructor() {
    vm = this;
    this.offering();
    // $('.inquiry-price-btn').on('click', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     let id = $(this).data('id')
    //     let type = $(this).data('type')
    //     window.location.href = $('input[name=inquiryPath]').val() + '/api/inquiry/announcement/detailQuote?inquiryId=' + id + '&type=' + type
    // })

    // $('.icon-close').on('click', function() {
    //     $('.supplier-registe').hide()
    // })

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
  }

  offering() {

    let $inquiryOffer = $("#inquiryOffer");
    let anNouncementId = $inquiryOffer.data("announcement-id");
    let lasvegasPath = $("input[name=lasvegasPath]").val();
    let selfUrl = location.href;    
    let url = `${lasvegasPath}/ctax/api/protocol/announcement/announcementQuote`;

    $inquiryOffer.on("click", function(e) {
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        contentType: "application/json;charset=utf-8",
        url: url,
        data: {
          anNouncementId: anNouncementId
        },
        success: function(data) {
          if(data.success){
            let id=data.result.id;
            if(data.result.requireType==20){
              location.href=`${lasvegasPath}/agreementsupply/bidding/offer-ctax/quote?quoteOrderId=${id}`;
            }else if(data.result.requireType==30){
              location.href=`${lasvegasPath}/agreementsupply/bidding/offer-ctax/offer?quoteOrderId=${id}`;              
            }
          }else {
            if (data.error == '303') {
              location.href = `${$(
                'input[name=loginPath]'
              ).val()}/?target=${selfUrl}`;
            } else {
              new Modal({
                title: '无法报价',
                icon: 'error',
                content: data.error
              }).show();
            }
          }
        },
        error: function(XHR, textStatus, errorThrown) {
          console.log(`error textStatus:${textStatus};errorThrown:${errorThrown}`);
        }
      });
    });
  }

  sfadfadfadfadfadf() {
    console.log("fadfadfadfad");
  }
}
module.exports = inquiryDetail;
