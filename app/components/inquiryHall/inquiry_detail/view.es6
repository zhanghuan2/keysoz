const Modal = require("pokeball/components/modal")

class inquiryDetail {
  constructor() {
    $('.inquiry-price-btn').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      let id = $(this).data('id')
      let type = $(this).data('type')
      window.location.href = $('input[name=inquiryPath]').val() + "/api/inquiry/announcement/detailQuote?inquiryId=" + id + "&type=" + type
    })

    $('.icon-close').on('click', function () { 
      $('.supplier-registe').hide()
    })

    if($.query.get('error') == "0") {
      new Modal({ title: '温馨提示', icon: 'error', content: "报价失败!" }).show()
    } else if($.query.get('error') == 1) {
      new Modal({ title: '温馨提示', icon: 'error', content: "您不满足供应商询价要求，不能参与报价!" }).show()
    } else if($.query.get('error') == 2) {
      new Modal({ title: '温馨提示', icon: 'error', content: "不在报价时间范围内!" }).show()
    } else if($.query.get('error') == 3) {
      new Modal({ title: '温馨提示', icon: 'error', content: "询价单不存在!" }).show()
    } else if ($.query.get('error') == 4) {
      new Modal({ title: '温馨提示', icon: 'error', content: "询价单状态已变更，无法报价。" }).show()
    }
  }

  sfadfadfadfadfadf() {
    console.log("fadfadfadfad")
  }
}
module.exports = inquiryDetail;