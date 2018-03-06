class zcyQuote{
	constructor(){
		this.$container = $(".jsQuote")
		this.init()
		this.bindEvents()
	}
	init(){
		this.popoverReferPrice()
		this.renderPrice()
	}
	bindEvents(){

	}
	renderPrice(){
		let self = this
		this.$container.find(".js-deal-price").each(function(i,n){
			let _this = $(this),
					price = (parseFloat(_this.data("price"))/100).toFixed(2) - 0
			if(price){
				if(price >= 10000){
					price = (price/10000).toFixed(2) + "万"
				}
				if(price >= 1000000){
					price = (price/1000000).toFixed(2) + "百万"
				}
				_this.text("￥"+price)
			}
		})
	}

	/**
	 * 初始化popover显示市场参考价提示
	 * */
	popoverReferPrice(){
		let $info = '<div>以主流电商平台同款商品近期成交均价为基础，结合政采行业成本科学计算而成，作为政府采购参考价</div>'
		$('.js-price-popover').popover({
			trigger: 'hover',
			placement: 'bottom',
			html: true,
			content: $info,
			delay: {
				hide: 100
			}
		})
	}
}
module.exports = zcyQuote