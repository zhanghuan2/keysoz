const productListTemp = Handlebars.templates["local_manufacturer/common/productFloor/templates/productList"]
class productWithLabel {
	constructor() {
		this.$floorProduct = $(".floor-products")
		this.$tags = $.query.get("tags")
		this.$showNo = this.$floorProduct.data("number")
		this.preRender()
		this.bindEvent()
	}

	preRender(){
		let self = this
		$.ajax({
			url:" /api/portal/mfacture/index/item?tags="+self.$tags+":1",
			type:"get"
		}).done(function(resp){
			self.$floorProduct.empty().append(productListTemp({DATA:resp.items,showNo:self.$showNo}))
		})
	}
	bindEvent(){}
}

module.exports = productWithLabel

