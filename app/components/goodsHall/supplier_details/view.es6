class SupplierDetails {
  constructor($) {
    this.bindEvent();
  }

  bindEvent() {
    $(".js-select").on("change",(evt) => this.contactFun(evt));
  }
  contactFun(evt){
    let type = $(evt.target).data("type");
    let userName = $(evt.target).find("option:selected").data("name");
    if(type == "ww"){
      if(userName && userName !== ""){
        window.open("aliim:sendmsg?touid=cntaobao"+userName);
      }
    }else if(type == "qq"){
      let idNumber = $(evt.target).find("option:selected").data("qqid");
      let site = $(evt.target).find("option:selected").data("site");
      if(idNumber && idNumber !== ""){
        window.open("http://wpa.qq.com/msgrd?V=3&uin="+idNumber+"&Site="+site+"&Menu=yes");
      }
    }
  }
}

module.exports =  SupplierDetails
