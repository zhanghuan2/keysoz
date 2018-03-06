var OriginHeader = require("common/header/view");

export default class commonHeader extends  OriginHeader {
  constructor($) {
    super($)
    this.render();
  }

  bindEvent() {
    super.bindEvent()

  }
  render(){
    $(".sites-header").find(".search-tab a").on("click",function(){
      $(".sites-header").find(".search-tab a").removeClass("active");
      $(this).addClass("active");
      if($(this).hasClass("supplier-tab")){
        $(".sites-header").find(".search-input").attr("placeholder","输入您要搜索的供应商")
        $(".sites-header").find(".isSupplier").val(1);

      }else{
        $(".sites-header").find(".search-input").attr("placeholder","输入您要搜索的商品")
        $(".sites-header").find(".isSupplier").val(0);
      }
    })
  }
  searchSubmit(evt) {
    let searchInput = $(".search-input.active");
    if(!$.trim(searchInput.val())) {
      evt.preventDefault();
    }else{
      let link = $(".sites-header").find(".search-tab a").filter(".active");
      if(link.hasClass("supplier-tab")){
        let hrefbase = $("#form-search").data("hrefbase");
        $("#form-search").attr("action",hrefbase + "/pages/supplierlist");
      }
    }
  }
}