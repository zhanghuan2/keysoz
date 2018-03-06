import ContactSupplier from 'common/contact_supplier/view'
import Modal from "pokeball/components/modal"
import Pagination  from  "pokeball/components/pagination"
const ShopInfoRow = Handlebars.templates["regular_purchase/favorite-shops/templates/shopInfoRow"]
const RecommendShops = Handlebars.templates["regular_purchase/favorite-shops/templates/recommendShops"]
import Cookie from "common/cookie/view"

class FavoriteShop {

	constructor () {
		this.$favoriteShops = $('.eevee-favorite-shop')
		this.userType = $('body').data('user-type');
		this.pageNo = 1
		this.pageSize = 10
		this.preRender()
		this.bindEvents()
	}

	preRender () {
		let self = this
		// 用户未登录,跳转到登录页面
		self.$leafRegion = Cookie.getCookie('aid') || '330102';
		if(this.userType + "" === "") {
			window.location.href = '/login?target='+window.location.host+'/eevees/regular_purchase/shops';
			return;
		}
		this.renderFavoriteList()
		this.renderRecommendList()
	}

	bindEvents () {
		this.$favoriteShops.delegate('.js-manage-shops' ,'click', () => this.showManageView())
		this.$favoriteShops.delegate('.js-end-manage', 'click', () => this.hideManageView())
		this.$favoriteShops.delegate('.shop-info .mask', 'click', (evt) => this.selectShop(evt))
		this.$favoriteShops.delegate('.js-batch-select-shop', 'change', () => this.batchSelectShop())
		this.$favoriteShops.delegate('.tab li a', 'click', (evt) => this.switchTab(evt))
		this.$favoriteShops.delegate('.js-unfollow', 'click', (evt) => this.unFollowShop(evt))
		this.$favoriteShops.delegate('.js-add-favor', 'click', (evt) => this.followShop(evt))
		this.$favoriteShops.delegate('.js-delete-favor', 'click', (evt) => this.batchUnfollowShops(evt))
		this.$favoriteShops.delegate('.js-stick', 'click', (evt) => this.stickShop(evt))
		this.$favoriteShops.delegate('.js-unstick', 'click', (evt) => this.unstickShop(evt))
		this.$favoriteShops.delegate('.js-enter-shop', 'click', (evt) => this.enterShop(evt))
		this.$favoriteShops.delegate('.btn-search', 'click', (evt) => this.renderFavoriteList())
		$(".jShopSearch").on('keypress',(evt) => this.keyEnter(evt))
	}

	renderFavoriteList () {
		let self = this, shopsName = $(".jShopSearch").val()
		$(".jSpin").removeClass("hide")
		$.ajax({
			url: '/api/fav-shop/getFocusShop',
			type: 'get',
			data: {pageNo: self.pageNo, pageSize: self.pageSize,shopsName: shopsName}
		}).done((result) => {
			$(".jSpin").addClass("hide")
			$('.favorite-list').empty().append(ShopInfoRow(result.data))
			new ContactSupplier('a.contact-supplier')
			new Pagination('.shops-pagination').total(result.data.total).show(self.pageSize,
				{
					current_page: self.pageNo - 1 ,
					jump_switch: true,
					page_size_switch: true,
					callback : function (pageNo,pageSize) {
						self.pageNo = pageNo + 1
						self.pageSize = pageSize - 0
						self.renderFavoriteList()
						return true
					}
				})
		})
	}

	keyEnter(evt){
		if(evt.keyCode == 13){
			$(".btn-search").trigger("click")
		}
	}

	renderRecommendList () {
		$.ajax({
			url: '/api/fav-shop/getOfenBuyShop?pageNo=1&pageSize=6',
			type: 'get'
		}).done((result) => {
			$('.recommend-list').append(RecommendShops(result.data))
			//查询已关注的店铺
			let shopIds = []
			_.each(result.data.data, (obj) => {
				shopIds.push(obj.shopId)
			})
			FavoriteShop.getShopsFollowStatus(shopIds, (result) => {
				$('button.js-add-favor').each((i, e) => {
					let shopId = $(e).data('shopId')
					if (result[shopId]) {
						$(e).replaceWith('<button class="btn btn-info" disabled>已关注</button>')
					}
				})
			})
		})
	}

	showManageView () {
		$('.favorite-list').addClass('manage-mode')
		$('.manage-btns').show()
		$('.start-manage').hide()
	}
	hideManageView () {
		$('.favorite-list').removeClass('manage-mode')
		$('.manage-btns').hide()
		$('.start-manage').show()
		$('.js-batch-select-shop').prop('checked', false)
		$('.shop-info .mask').removeClass('selected')
	}

	selectShop (evt) {
		$(evt.currentTarget).toggleClass('selected')
		let allChecked = true
		$('.shop-info .mask').each((i, el) => {
			if (!$(el).hasClass('selected')) {
				allChecked = false
				return false
			}
			return true
		})
		$('.js-batch-select-shop').prop('checked', allChecked)
	}
	batchSelectShop () {
		const checked = $('.js-batch-select-shop').prop('checked')
		if (checked) {
			$('.shop-info .mask').addClass('selected')
		} else {
			$('.shop-info .mask').removeClass('selected')
		}
	}

	switchTab (evt) {
		const $li = $(evt.currentTarget).closest('li')

		if ($li.hasClass('active')) {
			return
		}

		const $shop = $li.closest('.shop-info')
		const listClass = $li.data('list')
		const $list = $shop.find(`.items-list.${listClass}`)

		$($li.siblings('.active')).removeClass('active')
		$li.addClass('active')

		$($list.siblings('.items-list')).hide()
		$list.show()
	}

	unFollowShop (evt) {
		let self = this,
			shopId = $(evt.currentTarget).closest('.shop-info').data('shopId')
		if (shopId) {
			new Modal({
				icon: 'warning',
				title: '是否取消关注该店铺？',
				isConfirm: true
			}).show(()=>{
				FavoriteShop.unFollowShops([shopId], () => {
					self.renderFavoriteList()
				})
			})
		}
	}

	followShop (evt) {
		$(evt.currentTarget).prop('disabled', true)
		let self = this,
			shopId = $(evt.currentTarget).closest('.shop-item').data('shopId')
		if (shopId) {
			FavoriteShop.followShops([shopId], () => {
				$(evt.currentTarget).replaceWith('<button class="btn btn-info" disabled>已关注</button>')
				self.renderFavoriteList()
			})
		}
	}

	batchUnfollowShops () {
		let self = this,
			shopIds = []
		$('.shop-info .mask.selected').each((i, e) => {
			let shopId = $(e).closest('.shop-info').data('shopId')
			if (shopId) {
				shopIds.push(shopId)
			}
		})
		if (shopIds.length === 0) {
			new Modal({
				icon: 'info',
				title: '温馨提示',
				content: '您还未选中任何店铺'
			}).show()
		} else {
			new Modal({
				icon: 'warning',
				title: `确认取消关注选中的${shopIds.length}家店铺？`,
				isConfirm: true
			}).show(() => {
				FavoriteShop.unFollowShops(shopIds, () => {
					self.hideManageView()
					self.renderFavoriteList()
				})
			})
		}
	}

	stickShop (evt) {
		let self = this,
			shopId = $(evt.currentTarget).closest('.shop-info').data('shopId')
		if (shopId) {
			FavoriteShop.stickShop(shopId, () => {
				self.renderFavoriteList()
			})
		}
	}

	unstickShop (evt) {
		let self = this,
			shopId = $(evt.currentTarget).closest('.shop-info').data('shopId')
		if (shopId) {
			FavoriteShop.unstickShop(shopId, () => {
				self.renderFavoriteList()
			})
		}
	}

	enterShop (evt) {
		let shopId = $(evt.currentTarget).data('shopId')
		if (shopId) {
			window.open(`/eevees/shop?searchType=1&shopId=${shopId}`)
		}
	}

	/*
	 * 批量关注店铺
	 */
	static followShops (shopIds, successCallback, failureCallback) {
		if (shopIds.length === 0) {
			return
		}
		$.ajax({
			url: '/api/fav-shop/follow',
			type: 'post',
			data:{'shopIds':shopIds}
		}).done((result) => {
			if(result.code == '200') {
				new Modal({
					icon: 'success',
					title: '关注成功',
					htmlContent: '可在<a href="/buyer/favorite-shops" target="_blank">我的关注</a>查看'
				}).show()
			}
			else if(result.code == '901') {
				new Modal({
					icon: 'info',
					title: '已关注此店铺',
					htmlContent: '可在<a href="/buyer/favorite-shops" target="_blank">我的关注</a>查看'
				}).show()
			}
			if (successCallback) {
				successCallback(result)
			}
		}).fail((error) => {
			if (failureCallback) {
				failureCallback(error)
			}
		})
	}

	/*
	 * 批量取消关注
	 */
	static unFollowShops (shopIds, callback) {
		if (shopIds.length === 0) {
			return
		}
		$.ajax({
			url: '/api/fav-shop/unfollow',
			type: 'post',
			data: {shopIds:shopIds}
		}).done((result) => {
			if (callback) {
				callback(result)
			}
		})
	}

	/*
	 * 获取店铺关注状态
	 */
	static getShopsFollowStatus (shopIds, callback) {
		if (shopIds.length === 0) {
			return
		}
		$.ajax({
			url: '/api/fav-shop/isFollow',
			type: 'get',
			data:{shopIds:shopIds}
		}).done((result) => {
			let followMap = {}
			_.each(result.data, (obj) => {
				followMap[obj.shopId] = obj.isFollow
			})
			if (callback) {
				callback(followMap)
			}
		})
	}

	/*
	 * 置顶供应商
	 */
	static stickShop (shopId, callback) {
		$.ajax({
			url: '/api/fav-shop/stick',
			type: 'post',
			data: {shopId}
		}).done((result) => {
			if (callback) {
				callback(result)
			}
		})
	}

	/*
	 * 取消供应商置顶
	 */
	static unstickShop (shopId, callback) {
		$.ajax({
			url: '/api/fav-shop/unstick',
			type: 'post',
			data: {shopId}
		}).done((result) => {
			if (callback) {
				callback(result)
			}
		})
	}
}

module.exports = FavoriteShop
