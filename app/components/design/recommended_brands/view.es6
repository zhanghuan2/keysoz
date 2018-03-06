import Modal from "pokeball/components/modal"

class RecommendedBrands {
  constructor($) {
    this.$tab = this.$el;
    this.jsBrandKind = $(".js-brand-kind")
    this.bindEvent();
  }

  bindEvent() {
    this.$tab.tab();
    this.jsBrandKind.on("click",this.brandKind);
  }

  brandKind() {
    let index = $(this).index(".js-brand-kind")+1;
    let brandTemplates = Handlebars.templates["design/recommended_brands/templates/brand-logo"];
    let brandIds = $(this).data("brandids");
    $.ajax({
      url: "/api/zcy/brand",
      type: "GET",
      data: `brandIds=[${brandIds}]`,
      success:(data)=> {
        $(".tab-content").eq(index).empty();
        $(".tab-content").eq(index).append(brandTemplates({data:data}));
        },
      error:(data)=> {
        new Modal( {
          title:"温馨提示",
          icon:"info",
          htmlContent:"获取信息失败：用户未登陆"
        }).show();
      }
    });
  }
}

module.exports =  RecommendedBrands
