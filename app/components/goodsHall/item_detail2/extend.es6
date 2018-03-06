const OriginItemDetail = require("buyer/item_detail/view")

const Modal = require("pokeball/components/modal"),
  Cookie = require("common/cookie/view"),
  addToCartTemplate = Handlebars.templates["buyer/item_detail/templates/cart_tip"],
  activityTemplate = Handlebars.templates["buyer/item_detail/templates/activity"]

const Language = require("locale/locale")

const taxDistrictCodeArr = ['001000','981000','991000'];

export default class ItemDetail extends OriginItemDetail {
  constructor($) {
    var goodsId=jQuery.query.get("goodsId"),
        itemId=jQuery.query.get("itemId"),
        sellerId=jQuery.query.get("sellerId");

    if (goodsId && itemId && sellerId) {
      Cookie.addCookie("goodsId",goodsId,0,window.location.hostname);
      Cookie.addCookie("itemId",itemId,0,window.location.hostname);
      Cookie.addCookie("sellerId",sellerId,0,window.location.hostname);
    }else{
      let goodsId=Cookie.getCookie("goodsId"),itemId=Cookie.getCookie("itemId"),sellerId=Cookie.getCookie("sellerId");
      window.location.href="/hall/detail?goodsId="+goodsId+"&itemId="+itemId+"&sellerId="+sellerId;
    }
    super($)
    this.result = {}
    this.total = 0
    this.flag = 1
    this.itemId = $('#YZHD_ITEMID').val()
    this.addressClose = $('.address-close')
    this.callback = null
  }

  bindEvent() {
    this.initAddress()
    this.comparePrice()
    this.itemPlatformPrice = $("#js-item-platform-price", this.$el)
    $(document).on("click", this.showAddress, (evt) => this.popAddressSelect(evt))
    // $(document).on("click", ".js-find-stock li", (evt) => this.findStock(evt))
    $(document).on('ZCYEvent.addressChange', this.showAddress, (evt) => this.findStock(evt))
    this.quantityByStockFunction(this.itemId, Cookie.getCookie("aid") || '330102')
    super.bindEvent()
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
    let status = this.isAllselected();
    // 校验 配送至地区 是否可以加入购物车
    var Mstart = true;
    $.ajax({
      url : "/api/zcy/shoppingCartButtonCheck",
      async : false,
      data : {
        goodsId : $.query.get("goodsId"),
        distId : $(".address-area [data-level='3']").find(".active").attr("data-value")
      },
      success : function(data){
        if(data.data === true){
          return;
        }else{
          Mstart = false;
          new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.resultMessage
          }).show();
        }
      }
    });
    if(Mstart === false){
      return;
    }
    status = true;
    if (status) {
      // 检查商品数量
      if ( + $("#item-quantity").val() < 1) {
        new Modal({
          title: '温馨提示',
          icon: 'info',
          content: "商品数量输入有误"
        }).show();
        return;
      }

      $("body").overlay()
      let selectedSku = this.sku;
      var agreeMentId=$.query.get("goodsId");
      return $.ajax({
        async: false,
        url: "/api/zcy/carts",
        type: "PUT",
        data: `thirdId=${agreeMentId}&skuId=${$("[name='mSkuid']").val()}&snapshotPrice=${ + ($("#js-item-price").attr("data-range") * 100).toFixed(2)}&quantity=${$(".count-number").val()}&classification=1`,
        success: (data) => {
          if (this.flag == 1)
            new Modal(addToCartTemplate()).show()
          $(".ceiling").data("compInstance").getCartCount()
        }
      }).status
    } else {
      /*this.warning(0)*/
    }
  }

  //立即购买
  buyNow(evt) {
    // 检查商品数量
    if ( + $("#item-quantity").val() < 1) {
      new Modal({
        title: '温馨提示',
        icon: 'info',
        content: "商品数量输入有误"
      }).show();
      return;
    }
    let status = this.isAllselected(),
      orgId = $(evt.currentTarget).data("org"),
      skus = {};
    this.flag = 2;
    if (true) {
      /*$("body").overlay()*/
      let selectedSku = this.sku
      if (true) {
        /*skus[selectedSku.id] = $(".count-number").val()*/

        // var oobj = {
        //   skuId : $("[name='mSkuid']").val(),
        //   goodsId : $.query.get("goodsId"),
        //   quanity : $("#item-quantity").val()
        // };
        let createData = $.query.get("goodsId")+"_"+$("#item-quantity").val();
        var aarr = [];
        aarr.push(createData);
        const buyNow = $(".js-buy-now");
        buyNow.attr("disabled",true);
        let $lasvegasPath = $('#lasvegasPath');
        let host = $lasvegasPath.val();
        if(taxDistrictCodeArr.indexOf($lasvegasPath.data('district-id').toString()) !== -1){
          host += '/ctax';
        }else{
          host += '/finance';
        }
        $.ajax({
          type: "get",
          dataType:'jsonp',
          processData: false,
          timeout:10000,
          url: host + "/api/protocol/hall/saveHallRequirement?protocolParams=" + aarr.join(",") + "&target=" + window.location,
          success: (data) => {
            if(data.error){
                new Modal({
                    title: '温馨提示',
                    icon: 'warning',
                    content: data.error
                }).show();
                buyNow.attr("disabled",true);
            }else if(data.requireId){
                new Modal({
                    title: '温馨提示',
                    icon: 'success',
                    content: "生成竞价单成功"
                }).show(function(){
                    // location.reload();
                    window.location=data.redirectUrl;
                });
            }else{
                new Modal({
                    title: '温馨提示',
                    icon: 'warning',
                    content: "系统繁忙，请稍后再试。"
                }).show();
            }
          },
          error:function () {
              new Modal({
                title: '温馨提示',
                icon: 'warning',
                content: "系统繁忙，请稍后再试。"
              }).show();
            buyNow.attr("disabled",false);
          }
        })
      } else {

      }
    } else {
      this.warning(0)
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
    $(".compare-price li").on("click", function() {
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
    $('#js-item-stock').data('stock', "9999999999")
    if (this.total) {
      $('.js-item-stock-quantity').data('max', "9999999999").data("mix", 1)
      $("#item-quantity").val(1)
    } else {
      $('.js-item-stock-quantity').data('max', "9999999999").data("min", 0)
      $("#item-quantity").val(1)
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
      $(i).attr('disabled', false)
    })
  }
}