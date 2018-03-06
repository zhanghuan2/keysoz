class headerSearch {
  constructor() {
    this.init();
  }

  init(){
    this.$el = $('.ZCY-eevee-comp-normalSearch');
    this.$input = this.$el.find('.search-input');
    this.bindEvent();
  }
  bindEvent(){
    this.$el.find('#search-button-local').on('click',()=>{
      let value = this.$input.val();
      if(String($.trim(value)).length==0)return;
      let shopid = this.$el.find('.temp-shopid').html();
      location.href=`/eevees/shop?shopId=${shopid}&q=${value}`;
    });
    this.$el.find('#search-button-all').on('click',()=>{
      let value = this.$input.val();
      if(String($.trim(value)).length==0)return;
      location.href=`/eevees/search?q=${value}`;
    })
  }
}
module.exports = headerSearch;
