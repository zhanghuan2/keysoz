const CustomerService = require('common/customer-service/extend');
const Modal = require("pokeball/components/modal");
const Cookie = require("common/cookie/view")

class ServiceGuarantee{
  constructor($){
    this.btnSubmit = $(".btn-submit");
    this.supplierEnv = $('.env_supplier').val()
    this.$btnShopLocated = $('.btn-shop-located')
    this.init($)
    this.bindEvent();
  }

  init($){
  }

  bindEvent(){
    let self = this
    this.btnSubmit.on("click",this.submitBtn);
    let hour = (new Date()).getHours();
    if (hour >= 6 && hour < 8) {
      $(".time-tip").text("早上好 ,");
    } else if (hour >= 8 && hour < 11) {
      $(".time-tip").text("上午好 ,");
    } else if (hour >= 11 && hour < 13) {
      $(".time-tip").text("中午好 ,");
    } else if (hour >= 13 && hour < 18) {
      $(".time-tip").text("下午好 ,");
    } else {
      $(".time-tip").text("晚上好 ,");
    }

    $('.js-kefu-service').on('click',() => {
      let uid = $('.js-kefu-service').data('uid');
      if(uid){
        $.ajax({
          url: '/api/customer/ant/param/encipher?uid='+uid,
          type: 'get',
          success: (resp)=>{
            let data = JSON.parse(resp);
            CustomerService.openFrame(data.cinfo, data.key);
          }
        })
      }
      else{
        CustomerService.openFrame();
      }
    });

    $('.js-shop-located').on('click', () => {
      // 国税特殊处理
      const ctaxccgpHref = $('.user-information').data('ctaxccgp');
      if(window.location.host == ctaxccgpHref.split("//")[1]){
        window.location.href = '//supplier.zcy.gov.cn/supplier/register-state-tax'
      }else{
        window.location.href = '//supplier.zcy.gov.cn/supplier/register'
      }
    })
  
  }

  submitBtn() {
    let member = $(".env_member").val();
    let target = $(".env_target").val();
    let notlogin = $(".not_login").val();
    if(member && target && notlogin){
      location.href = member + "/login?target="+target;
    }else{
      location.href = "/login";
    }
  }
}

module.exports =  ServiceGuarantee
