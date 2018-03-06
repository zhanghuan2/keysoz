const commentListTemplate = Handlebars.templates["shop_detail/spu_tab/templates/user-description"]
const dealRecordTemplate = Handlebars.templates["shop_detail/spu_tab/templates/deal-record"]
const sevPromiseTemplate = Handlebars.templates["shop_detail/spu_tab/templates/service-promise"]
import Pagination from "pokeball/components/pagination"

class goodsDetail {
  constructor () {
    this.$container = $(".goods-tab")
    this.$goodsEvaluate = $(".jsEvaluateList")
    this.$tabs = $(".jsNavs")
    this.$tabContainers = $(".jsTabCintents")
    this.$pageSize = 20
    this.$hasAppend = ""
    this.$filter = "all"
    this.init()
    this.bindEvent()
    this.$flag = true
  }

  init () {
    this.renderOtherAttrs()
    this.showMoreParams()
    this.renderComment()
    this.renderDealRecord()
// 渲染服务承诺
    this.$container.off ("serviceRender").on ("serviceRender", () => {
      let servicePromise = this.$container.data ("service")
      if (servicePromise) {
        $ (".jServicePromise").removeClass ("hide")
				$ (".service-promise-list").empty ().append (sevPromiseTemplate (servicePromise));
			} else {
				$ (".jServicePromise").addClass ("hide")
			}
		})

	}

	bindEvent () {
		this.$tabs.on ("click", "li", (evt) => this.tabsChange (evt))
		this.$container.on ("click", ".js-more-params", () => this.showMoreParams ())
		this.$container.on ("click", ".evaluate-tabs li", (evt) => this.showEvaluate (evt))
		this.$container.on ("click", ".toTop", (evt) => this.toTop (evt))
		this.$container.on ("click", ".js-fixed-car", () => this.addToCart ())
		$ (window).on ("scroll", (evt) => this.returnTop (evt))
	}

	addToCart () {
		$ (".js-add-cart").trigger ("click")
	}

	returnTop (evt) {
		let self = $ (evt.currentTarget),
			position = self.scrollTop (),
			tabOffsetTop = $(".goods-tab")[0].offsetTop,
			showAddCart = this.$container.data ("showAddCart")
		if (position > 200) {
			$ (".toTop").fadeIn ("1000")
		} else {
			$ (".toTop").fadeOut ("1000")
		}
		if (position > tabOffsetTop) {
			if (showAddCart) {
				$ (".js-fixed-car").removeClass ("hide")
			}
			this.$container.find (".tab-navs").addClass ("js-fixed-nav")
		} else {
			this.$container.find (".tab-navs").removeClass ("js-fixed-nav")
			$ (".js-fixed-car").addClass ("hide")
		}
	}

	toTop (evt) {
		$ ('body,html').animate ({scrollTop: 0}, 500);
	}

// 渲染商品评价,hasAppend参数代表是否有追评
	renderComment (pageNo = 1, pageSize = 20) {
		let itemId = $ (".tab-navs").data ("item"), self = this, hasAppend = self.$hasAppend
		$.ajax ({
			url: "/api/credit/evaluate/getMoreItemEvaluateDetail",
			type: 'GET',
			data: {itemId, pageNo, pageSize, hasAppend},
		}).done (function (resp) {
			if (resp && resp.evaluateItems && resp.evaluateItems.length > 0) {
				$.each (resp.evaluateItems, (i, n) => {
					if (n.evaluateItem) {
						let score = self.parseIntScore (n.evaluateItem.score)
						n.evaluateItem.starNum = score
					}
				})
			}
			resp.filter = self.$filter
			self.$goodsEvaluate.empty ().append (commentListTemplate ({data: resp}))
			new Pagination (".evaluate-contents .js-pagination").total ($ (".js-pagination").data ("total")).show (pageSize, {
				current_page: pageNo - 1,
				page_size_switch: true,
				jump_switch: true,
				callback: function (pageNo, pageSize) {
					self.renderComment (pageNo + 1, pageSize - 0)
					return true
				}
			})
		})
	}

// 对打分四舍五入，因为星星至少半颗星
	parseIntScore (num) {
		let a = num % 10
		let b = (num - a) / 10
		let c = a >= 5 ? b + 1 : b
		return c * 10
	}

// 商品评价tab切换
	showEvaluate (evt) {
		let self = $ (evt.target)
		self.siblings ("li").removeClass ("active")
		self.addClass ("active")
		if (self.data ("filter") == "append") {
			this.$hasAppend = true
		} else {
			this.$hasAppend = ""
		}
		this.$filter = self.data ("filter")
		this.renderComment ()
	}

// tabs切换
	tabsChange (evt) {
		if (this.$flag) {
			this.$flag = false
			let self = $ (evt.currentTarget), _index = self.index ()
			self.siblings ("li").removeClass ("active")
			self.addClass ("active")

			if (_index == 1) {
				this.$tabContainers.find (".tab-content").each (function (i) {
					if (i >= _index) {
						$ (this).show ()
					} else {
						$ (this).hide ()
					}
				})
			} else {
				this.$tabContainers.find (".tab-content").each (function (i) {
					if (i >= _index && !$ (this).hasClass ("other-param")) {
						$ (this).show ()
					} else {
						$ (this).hide ()
					}
				})
			}
		}
		this.$flag = true
	}

	// 渲染成交记录
	renderDealRecord(pageNo = 1,pageSize = 20){
		let itemId = $(".tab-navs").data("item"),self = this
		$.ajax({
			url : "/api/zcy/items/dealRecord?pageNo="+pageNo+"&pageSize="+pageSize+"&itemId="+itemId,
			type:'GET'
		}).done(function(resp){
			resp.size = pageSize
			$(".js-record-box").empty().append(dealRecordTemplate({DATA:resp}))
			new Pagination(".record-list .js-pagination").total(resp.total).show(pageSize ,{
				current_page:pageNo -1,
				page_size_switch: true,
				jump_switch: true,
				callback: function (pageNo, pageSize) {
					self.renderDealRecord (pageNo + 1, pageSize - 0)
					return true
				}
			})
		})
	}

// 查看更多参数
	showMoreParams () {
		this.$tabs.find ("li").eq (1).trigger ("click")
	}

// 渲染商品详情规格参数
	renderOtherAttrs () {
		let otherAttrTable = $ ('.js-other-attributes-box').find ('table'),
			tr = otherAttrTable.find ('tr'),
			th = otherAttrTable.find ('th'),
			compositeTr = otherAttrTable.find ('.composite-tr'),
			multi = otherAttrTable.find ('.multi-td')
		if (compositeTr.length > 0) {
			for (let n in tr) {
				if (!$ (n).hasClass ('composite-tr')) {
					$ (n).find ('.main-parameter').prop ('colspan', 2)
				}
			}
			for (let m in th) {
				$ (m).prop ('colspan', 3)
			}
			if (multi.length > 0) {
				for (let multiTd in multi) {
					tdText = $ (multiTd).text ().replace ('#', ',')
					$ (multiTd).text (tdText)
				}
			}
		}
	}
}
module.exports = goodsDetail