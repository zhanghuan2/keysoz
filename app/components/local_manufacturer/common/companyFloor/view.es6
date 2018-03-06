const  supplierListRender = require("local_manufacturer/manufacture/hotSupplier/extend")

export default class companyFloor extends supplierListRender{
	constructor() {
		super()
	}
	beforeRander(){
		let self = this,
				param = {}
		param.tags = $.query.get("tags")
		$.ajax({
			url:"/api/portal/mfacture/shops",
			type:"get",
			data:param,
			success:function(resp){
				if(resp){
					super.render(resp)
					super.init()
					super.bindEvent()
					super.afterRender()
				}
			}
		})
	}


}