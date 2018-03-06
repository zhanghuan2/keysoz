var OriginHeader = require("common/header/view");

export default class oftenGoodsSearch extends  OriginHeader {
	constructor($) {
		super($);
		this.render();
	}
	render(){
		this.$el = $('.ZCY-eevee-comp-often-goods');
		let that = this;
		let $forms = this.$el.find('#form-search');
		let hrefbase = $forms.data("hrefbase");
		this.$el.find(".jGoodsSelect li").on("click",function(){
			that.$el.find(".jGoodsSelect li").removeClass("active");
			$(this).addClass("active");
			$(".jChecked").text($(this).text())
			if($(this).hasClass("supplier-tab")){
				that.$el.find(".search-input").attr("placeholder","输入你要搜索的供应商");
				that.$el.find(".isSupplier").val(1);
				$forms.attr("action",hrefbase + "/pages/supplierlist");
			}else{
				that.$el.find(".search-input").attr("placeholder","输入你要搜索的商品");
				that.$el.find(".isSupplier").val(0);
				$forms.attr("action",hrefbase + "/search");
			}
		})
	}
	searchSubmit(evt) {
		let $forms = this.$el.find('#form-search');
		let searchInput = $(".search-input.active");
		if(!$.trim(searchInput.val())) {
			evt.preventDefault();
		}else{
			let link = this.$el.find(".jGoodsSelect li").filter(".active");
			if(link.hasClass("supplier-tab")){
				let hrefbase = $forms.data("hrefbase");
				$forms.attr("action",hrefbase + "/pages/supplierlist");
			}
		}
	}
}


module.exports = oftenGoodsSearch;