const OriginItemDetail = require("buyer/item_detail/view")
const itemServices = require('common/item_services/view')
const Modal = require("pokeball/components/modal"),
  Cookie = require("common/cookie/view"),
  addToCartTemplate = Handlebars.templates["buyer/item_detail/templates/cart_tip"],
  activityTemplate = Handlebars.templates["buyer/item_detail/templates/activity"]

const Language = require("locale/locale")

export default class ItemDetail extends OriginItemDetail {
  constructor($) {
    super($)
    let that = this;
    this.result = {}
    this.total = 0
    this.flag = 1
    this.itemId = $('#YZHD_ITEMID').val()
    this.callback = null
    //优惠率随stu改变
    $(".item-skus").on("click", ".js-sku-attr", function () {
      that.initDiscountPrecent()
      //sku属性选择变化时，重置购买数量
      that.resetPurchaseQuantity()
    });
    //默认stu选中第一个
    setTimeout(function () {//某些回调不敢改@。@
      $(".sku-choose").find("a:first.sku-attr").trigger("click");
    }, 1000)

    this.getPagePrivilege();
    this.beforeRander();
  }

  beforeRander() {
    let isBlock = $("#IF_supperPro").val() == 1;
    if (isBlock) {
      let dom = $(".item-info-list").find(".supperPro_li").data();
      let param = {
        "shopId": dom.id,
        "categoryId": dom.cid,
        "itemId": this.itemId
      };
      $.ajax({
        url: "/api/item/block/decreaseRate",
        type: "GET",
        data: param,
        success: function (data) {
          let $label = $(".item-info-list").find(".supperPro_li").find("label"),
            $span = $(".item-info-list").find(".supperPro_li").find(".percent");
          /**
           * ＝0 -> 私有协议下浮率
           * >0 -> 标段下浮率
           */
          if (data && data.maxDecreaseRate > 0) {
            let min = (data.minDecreaseRate / 100).toFixed(2),
              max = (data.maxDecreaseRate / 100).toFixed(2)
            $label.text('标段下浮率：');
            if (min == max) {
              $span.html(`${min}%`);
            }
            else {
              $span.html(`${min}% ~ ${max}%`);
            }
          }
          else if (data && data.maxDecreaseRate == 0) {
            let pen = (data.maxDecreaseRate / 100).toFixed(2);
            $label.text('私有协议下浮率：');
            $span.html(pen + '%');
          }
          else {
            $span.html('--');
          }
        }
      })
    }
  }

  bindEvent() {
    this.itemServices = new itemServices('.js-item-service', {style: 'rich'})
    this.initDiscountPrecent();
    this.getItemMark();
    this.initAddress()
    this.comparePrice()
    this.itemPlatformPrice = $("#js-item-platform-price", this.$el)
    $(document).on("click", this.showAddress, (evt) => this.popAddressSelect(evt))
    // $(document).on("click", ".js-find-stock li", (evt) => this.findStock(evt))
    $(document).on('ZCYEvent.addressChange', this.showAddress, (evt) => this.findStock(evt))
    this.quantityByStockFunction(this.itemId, Cookie.getCookie("aid") || '330102')
    super.bindEvent()
  }

  //优惠率换算
  initDiscountPrecent() {
    let price = Number($("#js-item-price").text().replace("￥", ""));//网超价
    let platformPrice = Number($("#js-item-platform-price").text().replace("￥", ""));//自营平台价
    let discount_precent = "--";
    if (price && platformPrice) {
      discount_precent = ((platformPrice - price) / platformPrice * 100).toFixed(2) + "%";
    }
    $(".js-discount-precent").text(discount_precent);
    //let discount = $(".js-discount-precent").data("discountprecent");
    // let val = 100 - parseFloat(discount);
    // $(".js-discount-precent").text(val);
    //价格比对优惠率 错了
    // let primeDiscount = $(".js-compare-primeDiscount").data("primediscount") || 100;
    // let priVal = 100 - parseFloat(primeDiscount);
    // $(".js-compare-primeDiscount").text(priVal + "%");
  }

  resetPurchaseQuantity() {
    let count = $("#item-quantity").val(),
      max = $('.js-item-stock-quantity').data('max');
    if (count > max) {
      $("#item-quantity").val(max)
    }
  }

  //获取节能节水环保标示
  getItemMark() {
    let itemId = $("#YZHD_ITEMID").val();
    $.ajax({
      url: "/api/item-mark/getItemDetailMark?itemId=" + itemId,
      type: "GET",
      success: function (data) {
        if (data) {
          data.isEnergySave == 1 && $(".gfrzBZ .jieneng-box").addClass("isShow");
          data.isEnvironProtect == 1 && $(".gfrzBZ .huanbao-box").addClass("isShow");
          //data.isWaterSave == 1 && $(".js-isWaterSave").show();
          $(".gfrzBZ .isShow").length > 0 && $(".gfrzBZ").removeClass("hide")
        }
      }
    })
  }

  // 把组合的key放入结果集@SKUResult
  add2SKUResult(combArrItem, sku) {
    let key = combArrItem.join(";")
    if (this.SKUResult[key]) { // SKU信息key属性
      this.SKUResult[key].stockQuantity += sku.stockQuantity
      this.SKUResult[key].prices.push(sku.price)
      if (sku.extraPrice.platformPrice) {
        this.SKUResult[key].platformPrice.push([sku.extraPrice.platformPrice])
      }
    } else {
      this.SKUResult[key] = $.extend({}, true, sku)
      this.SKUResult[key].prices = [sku.price]
      if (sku.extraPrice.platformPrice == 0 || sku.extraPrice.platformPrice) {
        this.SKUResult[key].platformPrice = [sku.extraPrice.platformPrice]
      }
    }
  }

  // 初始化得到结果集
  initOtherSku(data) {
    let i = this.getObjKeys(data),
      j = this.getObjKeys(data),
      skuKeys = this.getObjKeys(data)
    data = _.object(this.getObjKeys(data), data)
    this.SKUResult = {}
    _.each(skuKeys, (skuKey) => {
      let sku = data[skuKey],
        skuKeyAttrs = skuKey.split(";")
      this.attrLength = this.attrLength || skuKeyAttrs.length

      // 对每个SKU信息key属性值进行拆分组合
      let combArr = this.arrayCombine(skuKeyAttrs)
      _.each(combArr, (arr) => {
        this.add2SKUResult(arr, sku)
      })

      // 结果集接放入this.SKUResult
      this.SKUResult[skuKey] = $.extend({}, true, sku)
      this.SKUResult[skuKey].prices = [sku.price]
      this.SKUResult[skuKey].image = sku.image
      if (sku.extraPrice.platformPrice || sku.extraPrice.platformPrice == 0) {
        this.SKUResult[skuKey].platformPrice = [sku.extraPrice.platformPrice]
      }
    })
  }

  setSkuInfo(sku) {
    super.setSkuInfo(sku)
    if (sku.platformPrice) {
      let maxPlatformPrice = _.max(sku.platformPrice),
        minPlatformPrice = _.min(sku.platformPrice)
      this.itemPlatformPrice.text(maxPlatformPrice > minPlatformPrice ? priceFormat(minPlatformPrice) + "-" + priceFormat(maxPlatformPrice) : priceFormat(maxPlatformPrice))
    }
  }

  itemQuantityPresent() {
    // 检查商品数量
    let quantity = $(".count-number").val();
    if (quantity < 1) {
      this.warning(0);
      return;
    }
    return quantity;
  }

  // 加入购物车，成功返回 200
  addCart() {
    let status = this.isAllselected()
    if (status) {
      // 检查商品数量
      if (!this.itemQuantityPresent()) {
        return -1;
      }

      $("body").overlay()
      let selectedSku = this.sku,
        region =  Cookie.getCookie("aid"),
        putUrl = "/api/zcy/carts",
        putData = `skuId=${selectedSku.id}&quantity=${$(".count-number").val()}&region=${region}`

      if ($("#IF_VACCINE").val() == 1) {
        putData = putData + "&classification=2&thirdId=" + selectedSku.id
      }

      if ($("#IF_supperPro").val() == 1) {
        putUrl = "/api/zcy/block/cart/change";
        putData = `skuId=${selectedSku.id}&quantity=${$(".count-number").val()}&classification=3`;
      }

      return $.ajax({
        async: false,
        url: putUrl,
        type: "PUT",
        data: putData,
        success: () => {
          if (this.flag == 1) {
            new Modal(addToCartTemplate({
              "isPro": $("#IF_supperPro").val()
            })).show()
          }
          $(".ceiling").data("compInstance").getCartCount()
        }
      }).status
    } else {
      this.warning(0)
    }
  }

  //立即购买
  buyNow(evt) {
    if (!this.itemQuantityPresent()) {
      return;
    }
    let status = this.isAllselected(),
      orgId = $(evt.currentTarget).data("org")
    this.flag = 2;
    if (status) {
      $("body").overlay()
      let selectedSku = this.sku
      //直接生成采购单
      if ($(evt.currentTarget).hasClass('createPurchase')) {
        $.ajax({
          type: "get",
          url: "/api/purchases/create",
          data: {
            skuId: selectedSku.id,
            quantity: $(".count-number").val()
          }
        }).done((resp) => {
          window.location.href = "/buyer/purchase-process?purchaseId=" + resp.purchaseId;
        })
      }
      else if ($(evt.currentTarget).hasClass('createOrder')) {
        let itemData = $(evt.currentTarget).data('itemData'),
          sellerId = $(evt.currentTarget).data('sellerId'),
          count = $(".count-number").val()
        let cartItem = {
          sku: selectedSku,
          cartItem: itemData.item,
          itemName: itemData.item.name,
          itemImage: itemData.item.mainImage,
          itemCount: count,
          unbindCount: count,
          catalogNodes: itemData.gpCatalog,
          categoryId: itemData.item.categoryId,
          categoryName: itemData.item.categoryName,
          specification: itemData.item.specification,
          unit: itemData.item.extra.unit,
          plans: []
        }
        if (!cartItem.cartItem.itemId) {//字段重命名，保持和购物车兼容
          cartItem.cartItem.itemId = cartItem.cartItem.id
        }
        let totalMoney = selectedSku.price * count / 100, orderType = 0
        if (itemData.item.tags && itemData.item.tags.vaccine) {
          orderType = 2
        }
        else if (itemData.item.tags && itemData.item.tags.blocktrade) {
          orderType = 3
        }
        sessionStorage.setItem('orderItems', JSON.stringify({
          'totalMoney': totalMoney,
          'orderType': orderType,
          'data': [{
            shopName: itemData.item.shopName,
            sellerId: sellerId,
            items: [cartItem]
          }]
        }));
        window.location.href = `/buyer/create-order?orderType=${orderType}`
      }
      //生成需求单
      else {
        let data = {
          skuId: selectedSku.id,
          quantity: $(".count-number").val()
        }
        if ($("#IF_VACCINE").val() == 1) {
          data.classification = 2
        }
        $.ajax({
          url: "/api/requisitions/createFromDetail",
          type: "get",
          data: data,
          success: (resp) => {
            window.location.href = `/buyer/requisition-process?reqId=${resp.requisitionId}&orgId=${orgId}`
          }
        })
      }
    }
    else {
      this.warning(0)
    }
  }

  warning(type) {
    if (type === 0) {
      this.itemSku.addClass("warning");
      this.warnWord.show();
      $("#choose-btns button", this.$el).prop('disabled', true);
      return this.closeWarningA.show();
    } else if (type === 1) {
      this.itemSku.removeClass("warning");
      this.warnWord.hide();
      $("#choose-btns button", this.$el).prop('disabled', false);
      return this.closeWarningA.hide();
    }
  }

  popAddressSelect(evt) {
    $(".address-area").show()
    this.initAddress()
    $('.address-close').click(() => {
      $(".address-area").hide()
    })
  }

  initAddress() {
    $.ajax({
      url: "/api/address/0/children",
      type: "GET",
      success: (data) => {
        $(`.address-tab li[data-level=1]`).trigger("click")
        this.provinceChange()
      }
    })
  }

  comparePrice() {
    $(".compare-price li").on("click", function () {
      window.open($(this).data('id'))
    })
  }

  findStock(evt) {
    _.each($('.js-sku-attr'), (el) => {
      $(el).removeClass("selected")
    })
    let leafRegion = $(evt.currentTarget).data('region') || $(evt.currentTarget).data('city') || $(evt.currentTarget).data('province')
    Cookie.addCookie("aid", leafRegion, 30, window.location.hostname)
    this.quantityByStockFunction(this.itemId, leafRegion)
  }

  quantityByStockFunction(itemId, leafRegion) {
    this.initSkuSelect('false')
    $.ajax({
      url: '/api/zcy/stocks/findStockByItemIdAndRegion',
      type: 'GET',
      data: {
        itemId,
        leafRegion
      },
      success: (data) => {
        this.result = data
        this.initAllStock(data)
        this.combineStock()
      },
      error: (data) => {
        this.initSkuSelect('disabled')
        $('#js-item-stock').text(0)
      }
    })
    //获取商品服务信息
    let that = this
    this.itemServices.loadServiceInfo(leafRegion, (result) => {
      try {
        let services = result[that.itemId]
        if (services.length > 0) {
          $('.service-protocol').show()
        }
      } catch(e) {}
    })
  }

  combineStock() {
    this.total = 0
    this.skus = $('#choose').data('skus')
    _.each(this.skus, (el) => {
      el.stockQuantity = this.result[el.id]
    })
    this.dealSkus()
    this.initOtherSku(this.skus)
    this.autoSelectSku()
  }

  initAllStock(data) {
    _.each(_.values(data), (el) => {
      this.total = el + this.total
    })
    $('#js-item-stock').text(this.total)
    $('#js-item-stock').data('stock', this.total)
    if (this.total) {
      $('.js-item-stock-quantity').data('max', this.total).data("mix", 1)
      $("#item-quantity").val(1)
    } else {
      $('.js-item-stock-quantity').data('max', 0).data("min", 0)
      $("#item-quantity").val(0)
    }
  }

  //复写按钮无效方法
  autoSelectSku() {
    _.each(this.$skuAttr, (i, d) => {
      let attr_id = $(i).data("attr")
      if (!this.SKUResult[attr_id]) {
        $(i).attr('disabled', 'disabled')
      } else $(i).attr('disabled', false)
    })
  }

  //sku设置是否可选
  initSkuSelect(mode) {
    _.each($('.js-sku-attr'), (i, d) => {
      $(i).attr('disabled', mode)
    })
  }

  //获取页面权限
  getPagePrivilege() {
    $.ajax({
      url: '/api/zcy/getResourcePrivilege',
      type: 'get',
      data: {pageId: 'itemDetail'}
    }).done((resp) => {
      if (resp.createRequisition || resp.createPurchase || resp.createOrder) {
        $('.js-add-cart').show()
      }
      else {
        $('.js-add-cart').unbind().hide()
      }
      if (resp.createRequisition) {
        $('.js-buy-now.createRequisition').show()
      }
      else {
        $('.js-buy-now.createRequisition').unbind().hide()
      }
      if (resp.createPurchase) {
        $('.js-buy-now.createPurchase').show()
      }
      else {
        $('.js-buy-now.createPurchase').unbind().hide()
      }
      if (!resp.createPurchase && resp.createOrder) {
        $('.js-buy-now.createOrder').show()
      }
      else {
        $('.js-buy-now.createOrder').unbind().hide()
      }
    }).fail(() => {
      $('.js-buy-now').unbind().hide()
    })
  }
}