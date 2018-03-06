class ctaxhallHref {
  constructor() {
    this.beforeRander();
  }

  beforeRander(){
    let color = $('.title_text').data('color');
    if(color){
      $('.title_text span').css('color', color);
    }
  }
}
module.exports = ctaxhallHref;