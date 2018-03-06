class zcyOldComPrice {
	constructor () {
		this.$container = $ (".jsQuote")
		this.initDiscountPrecent ()
	}
	initDiscountPrecent() {
		// 价格比对优惠率 错了
		this.$container.find(".js-compare-primeDiscount").each(function(){
			let _this = $(this)
			let primeDiscount = _this.data("primediscount")
			let priVal = 100 - parseFloat(primeDiscount);
			_this.text(priVal.toFixed(2) + "%");
		})
	}
}

module.exports = zcyOldComPrice