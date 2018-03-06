class caibaoAssist{
	constructor (){
		this.$container = $(".caibao-assist")
		this.init();
		this.bindEvents();
		this.time = '';
		this.time2 = '';
		this.closeEye = this.$container.find('.closeEye');
		this.openEye = this.$container.find('.openEye');
		this.sayhi = this.$container.find('.sayhi');
	}
	init(){}
	bindEvents(){
		this.$container.on("click",".js-return-top",(evt) => this.toTop(evt))
		$(window).on("scroll",(evt) => this.returnTop(evt))
		this.$container.on('webkitAnimationStart .openEye',(e)=>{
			console.log(e);
		});
		this.$container.on('webkitAnimationEnd .openEye',(e)=>{
			this.time = setTimeout(()=>{
				this.closeEye.css('display','inline');
				this.openEye.addClass('jsCloseEye');
				this.sayhi.removeClass('hide');
			},200);
			this.time2 = setTimeout(()=>{
				this.closeEye.css('display','none');
				this.openEye.removeClass('jsCloseEye');
			},700);
		});
		this.$container.on('mouseleave',()=>{
			this.sayhi.addClass('hide');
		});
	}

	returnTop(evt){
		let self = $(evt.currentTarget),
			position = self.scrollTop()
		if(position > 50){
			$(".js-return-top").fadeIn("1000")
		}else{
			$(".js-return-top").fadeOut("1000")
		}
	}
	toTop(evt){
		$('body,html').animate({scrollTop:0},500);
	}


}
module.exports = caibaoAssist