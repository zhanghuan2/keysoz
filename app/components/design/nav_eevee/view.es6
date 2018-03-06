class navEevee{
	constructor(){
		this.$category = $('.nav-categorys')
		this.init()
		this.bindEvents()
	}

	init (){
		let width  = this.$category.width()
		this.$category.find(".expand-category").css("left",width)
	}
	bindEvents(){
		this.$category.on("click",".jShowAll", (evt) => this.showAllCategory(evt))
	}
	showAllCategory(evt){
		let self = $(evt.currentTarget)
			self.parent(".first-category-li").find(".child-second-category").toggle('normal')
	}
}
module.exports = navEevee