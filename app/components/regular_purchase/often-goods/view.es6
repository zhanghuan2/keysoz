const goodsListTemplates = Handlebars.templates["regular_purchase/often-goods/templates/goods-list"]
const goodsCategoryTemplates = Handlebars.templates["regular_purchase/often-goods/templates/goods-category"]
import Pagination  from  "pokeball/components/pagination"
import Cookie from "common/cookie/view"
import Modal from "pokeball/components/modal"

const addToCartForm = Handlebars.templates["buyer/goods_search/templates/add-to-cart-form"]
class oftenGoodsList{
  constructor (){
  	this.$goodsList = $(".jOftenList")
	  this.$container = $(".regular-goods")
	  this.$oftenWrap = $(".jOftenWrap")
    this.userType = $('body').data('user-type');
    this.$leafRegion = ""
	  this.init()
	  this.bindEvents()
  }
 init(){
	 let self = this
	 // 用户未登录,跳转到登录页面
	 self.$leafRegion = Cookie.getCookie('aid') || '330102';
    if(this.userType + "" === "") {
	    window.location.href = '/login?target='+window.location.protocol+"//"+window.location.host+"/eevees/regular_purchase/goods";
	    return;
    }
    // 常购商品类目获取
	 $.ajax({
		 url:'/api/zcy/items/oftenBuyCategories',
		 type:'post'
	 }).done(function(resp){
		 self.$oftenWrap.empty()
	 	if(resp && resp.result && resp.result.length > 0){
	 		resp.result.splice(0,0,{"key":"","name":"全部"})
		  self.$oftenWrap.append(goodsCategoryTemplates({DATA:resp}))
	  }
		 // $(".jtotalGoods").text(resp.total)
	 })
	 // 获取常购商品列表
	 self.rendGoodsList()
 }
	bindEvents(){
		this.$container.on("click",".jTab",(evt) => this.rendGoodsList(evt))
		this.$container.on("click",".btn-search",() => this.rendGoodsList())
		$(".jSearchGoods").on('keypress',(evt) => this.keyEnter(evt))
		this.$container.on("click",".js-enter-shop",(evt) => this.enterShop(evt))
		this.$container.on("click",".js-product-cart",(evt) => this.showAddToCartForm(evt))

		this.$container.on("click", 'input[name="goodsAttr"]', (evt) => this.selectedGoodsAttr(evt));
		this.$container.on('click',".addToCartSubmit", (evt) => this.addToCartSubmit(evt));
		this.$container.on('click', ".addToCartCancel",(evt) => this.hideAddToCartForm(evt));
	}


  // 更新选中商品属性的样式
    selectedGoodsAttr(evt) {
      let item =  $(evt.currentTarget);
      item.toggleClass("selected").siblings().removeClass("selected")
    }
		// 提交 加入购物车
		addToCartSubmit(evt) {
		let target =  $(evt.currentTarget),
			  temp = {},
				skuList = target.closest('.addToCartForm').find('.sku-list').data('skulist'),
				stockMap = target.closest('.addToCartForm').find('.sku-list').data('stockMap'),
				skuId;
		target.parents('.tooltips').find('input.selected').each(function(){
			let attrkey = $(this).data('attrkey'),
					val = $(this).val();
			temp[attrkey] = val;
		});

		for(let k=0; k<skuList.length; k++){
			let attrs = skuList[k].attrs;
			let flag = false;
			for(let i=0; i<attrs.length; i++){
				if(temp[attrs[i].attrKey] != attrs[i].attrVal){
					break;
				}
				if(i == attrs.length-1){
					flag = true;
				}
			}
			if(flag) {
				skuId = skuList[k].id;
				break;
			}
		}

		//库存不足时给出提示
		if (!stockMap[skuId] || stockMap[skuId] < 1) {
			new Modal({
				icon: 'info',
				title: '温馨提示',
				content: '请勾选您需要的商品信息！'
			}).show()
			return
		}

		let _data = "skuId=" + skuId + "&quantity=1";
		$('.jOftenList').wcSpin('hide');

		$.ajax({
			async: false,
			url: "/api/zcy/carts",
			type: "PUT",
			data: _data,
			error: (jqXHR) => {
				//$('.js-search-list').spin(false);
				$('.wc-spin').addClass('hide');
				new Modal({
					title:'温馨提示',
					icon:'error',
					content: jqXHR.responseText
				}).show();
			}
		}).done((data)=>{
			$('.jOftenList').wcSpin('hide');
			new Modal({
				title:'温馨提示',
				icon:'success',
				content: '加入购物车成功！'
			}).show();
			target.closest('.tooltips').addClass('hide');
			target.closest('.product').removeClass('hovered');
		});
	}
		// 隐藏加入购物车表单
		hideAddToCartForm(evt) {
			let item =  $(evt.currentTarget);
			item.closest('.tooltips').addClass('hide');
			item.closest('.product').removeClass('hovered');
		}


	// 点击加入购物车事件
	showAddToCartForm(evt) {
		let self = this,
			  item =  $(evt.currentTarget),
				productId = item.parents('.product').data('id');
		$.ajax({
			url: '/api/zcy/items/findSkuAndStock?itemId=' + productId + '&leafRegion=' + self.$leafRegion,
			type: 'GET'
		}).done((data)=>{
			if(data.result.skus.groupedSkuAttrs.length > 0){
				item.siblings('.addToCartForm').empty().append(addToCartForm(data));
				item.siblings('.tooltips').removeClass('hide').slideDown('slow');
			}
			else {   // 商品无sku, 直接提交 加入购物车
				let skuId = data.result.skus.skus[0].id;
				let _data = "skuId=" + skuId + "&quantity=1";
				$('.jOftenList').wcSpin('large');


				$.ajax({
					async: false,
					url: "/api/zcy/carts",
					type: "PUT",
					data: _data,
					error: (jqXHR) => {
						$('.jOftenList').wcSpin('hide');
						new Modal({
							title:'温馨提示',
							icon:'error',
							content: jqXHR.responseText
						}).show();
					}
				}).done((data)=>{
					$('.jOftenList').wcSpin('hide');
					new Modal({
						title:'温馨提示',
						icon:'success',
						content: '加入购物车成功！'
					}).show();
				});
			}
		});
	}


// 获取常购商品列表
	rendGoodsList(evt,pageNo = 1,pageSize = 10){
		$('.jOftenList').wcSpin('large');

		let param = {},
				_this = this,
				keyword = $(".jSearchGoods").val()
		param.categoryId = $(".jTab.active").data("id")
		param.pageNo = pageNo
		param.pageSize = pageSize
		if(evt){
			let self = $(evt.currentTarget),id = self.data("id")
			self.addClass("active").siblings("span").removeClass("active")
			param.categoryId = id
		}
		if(keyword){
			param.keyword = keyword
		}
		$.ajax({
			url:'/api/zcy/items/oftenBuy',
			type:'post',
			data: param
		}).done(function(resp){
			if(resp && resp.result && resp.result.total > 0){
				$(".jOftenWrap").removeClass("hide")
			}else{
				$(".jOftenWrap").addClass("hide")
			}
			$(".jOftenList").wcSpin('large')
			resp.keyword =  keyword
			_this.$goodsList.empty().append(goodsListTemplates({DATA:resp}))
			$(".js-compare-primeDiscount").each(function(){
				let discount = ($(this).data("rate") - 0) * 100
				$(this).text(discount + "%")
			})
			_this.imgLazyLoad()
			new Pagination('.js-pagination').total($(".js-pagination").data("total")).show(pageSize,
				{
					current_page: pageNo - 1 ,
					jump_switch: true,
					page_size_switch: true,
					callback : function (pageNo,pageSize) {
						_this.rendGoodsList("",pageNo + 1,pageSize - 0)
						return true
					}
				})
		})
	}

	keyEnter(evt){
		if(evt.keyCode == 13){
			$("#innerSearch").trigger("click")
		}
	}
// 进入店铺
	enterShop(evt){
		let shopId = $(evt.currentTarget).data('shopId')
		if (shopId) {
			window.open(`/eevees/shop?searchType=1&shopId=${shopId}`)
		}
	}

	// 商品图片懒加载
	imgLazyLoad(){
		$('.regular-goods ').find('img.lazy').lazyload({
			placeholder: '',
			effect: "fadeIn",
			skip_invisible: false
		}).removeClass("lazy");
	}

}
module.exports = oftenGoodsList