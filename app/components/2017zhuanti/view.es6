class ZCY_topic_2017{
	constructor(){
		this.$container = $(".data-white-paper")
		this.init()
	}
	init(){
		this.$container.find("img.lazy").lazyload({
			effect: "fadeIn",
			skip_invisible : false
		}).removeClass("lazy")
	}
}
module.exports = ZCY_topic_2017;