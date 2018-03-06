const Modal = require("pokeball/components/modal")

class reverseDetail {
  constructor() {
    $('.reverse-price-btn').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      let id = $(this).data('id')
      let type = $(this).data('type')
      window.location.href = $('input[name=reversePath]').val() + "/api/reverse/announcement/detailQuote?requireId=" + id + "&type=2"
    })
   
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
    }
     let mestitle=/信息/g;
     if($(".title-detail").html()!=''&&$(".title-detail").html()!=null){
         let titledetailchange=$(".title-detail").html().replace(mestitle,"结果");
        $(".title-detail").html(titledetailchange);
     }
  }
}

export default reverseDetail