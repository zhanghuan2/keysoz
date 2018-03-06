let Cookie = require("common/cookie/view");

class newihref {
  constructor() {
    this.beforeRander();
  }

  beforeRander(){
    let color = $('.title_text').data('color');
    if(color){
      $('.title_text span').css('color', color);
    }
    let ifshow = this.$el.find('.dataStore').data('showdc');
    if(!ifshow){
      return;
    }
    let codeArr = ifshow.split(',');
    let code = Cookie.getCookie("districtCode");
    if(code && $.inArray(code,codeArr)>-1){
      this.$el.closest('.eve-col-cu').addClass('eve-hide');
    }else{
      this.$el.closest('.eve-col-cu').removeClass('eve-hide');
    }

  }
}
module.exports = newihref;