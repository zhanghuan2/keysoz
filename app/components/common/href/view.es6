let Cookie = require("common/cookie/view");
export default class Href {
  constructor($){
    this.$hrefElm = this.$el.find('a');
    this.defaultColor =this.$hrefElm.data('color');
    this.color = this.$hrefElm.data('hoverColor');

    this.$hrefElm.css('color', this.defaultColor);
    this.render();
    this.bindEvent();
  }
  render(){
    let ifshow = this.$el.find('.dataStore').data('showdc');
    let ifimg = !!this.$el.find('.dataStore').data('ifimg');
    if(!ifshow){
      return;
    }
    let codeArr = ifshow.split(',');
    let code = Cookie.getCookie("districtCode");
    if(code && $.inArray(code,codeArr)>-1){
      this.$el.closest('.eve-col-cu').addClass('eve-hide');
      if(ifimg){
        this.$el.closest('.eve-col-cu').nextAll().not(':hidden').eq(0).addClass('eve-hide');
      }
    }else{
      this.$el.closest('.eve-col-cu').removeClass('eve-hide');
    }

  }
  bindEvent(){
    let color = this.color;
    let defaultColor = this.defaultColor;
    this.$hrefElm.on('hover',(e)=>{
      let $tar = $(e.target);
      $tar.css('color',color);
    },(e)=>{
      let $tar = $(e.target);
      $tar.css('color',defaultColor);
    })
  }
}