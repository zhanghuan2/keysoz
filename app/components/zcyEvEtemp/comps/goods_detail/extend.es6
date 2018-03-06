const OriginItemDetail = require("buyer/item_detail/view")

const Modal = require("pokeball/components/modal"),
    Cookie = require("common/cookie/view"),
    addToCartTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_detail/templates/cart_tip"],
    activityTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_detail/templates/activity"]

const Language = require("locale/locale")

export default class GoodsDetail extends OriginItemDetail {
    constructor($) {
        super($)
        let that=this;
        this.result = {}
        this.total = 0
        this.flag = 1
        this.itemId = $('#YZHD_ITEMID').val()
        this.callback = null
        this.userInfo = $('.user-info').data('userInfo');  // 用户信息
        this.userPrivilege = {};   // 用户权限
        //优惠率随stu改变
        $(".item-skus").on("click",".js-sku-attr", function (evt) {
          that.initDiscountPrecent()
          //sku属性选择变化时，重置购买数量
          that.resetPurchaseQuantity()
          // tick-icon 对勾
          let target = $(evt.currentTarget);
          if(!target.hasClass('disabled')){
            target.find('.tick-icon').toggleClass('hide');
            target.siblings().find('.tick-icon').addClass('hide');
          }
        });

        //this.chooseDefault();
        this.getPagePrivilege();
        this.beforeRender();
        this.numberFormat();   // format 采购人下单数量 和 累计销量
        this.adaptStyle();
    }

    // 如果只存在一个sku，就 默认sku选中第一个
    chooseDefault() {
        let flag = 0;
        let skuAttrs = $('#choose').data('attrs');
        if(skuAttrs && skuAttrs.length > 0){
            for(let i=0; i<skuAttrs.length; i++){
                if(skuAttrs[i].skuAttributes.length > 1){
                    flag = 1;
                    break;
                }
            }
            if(!flag) {
                $(".sku-choose").find("a:first.sku-attr").trigger("click");
            }
        }
    }

    adaptStyle() {
        let spuId = $('.spu-id').data('spuId');
        let comparePrice = $('.compare-price').data('comparePrice');
        if(!spuId && !comparePrice.length) {
            $('.item-detail-right').css('width', '730px');
            $('.item-info-list .line').css('left', '580px');
            $('.item-detail-right .catalog-list').css('width', '470px');
        }
    }

    numberFormat() {
        let purchaseNum = $('.purchaseNum').data('num');
        if(purchaseNum >= 10000){
            $('.purchaseNum .num').text( Math.round((purchaseNum/10000) * 100) / 100 + "万");
        }
        let salesNum =  $('.salesNum').data('num');
        if(salesNum >= 10000){
            $('.salesNum .num').text( Math.round((salesNum/10000) * 100) / 100 + "万");
        }
    }

    beforeRender(){
      // 可申请采购目录 最后的逗号去掉
      let catalogListText = $('.catalog-list').text().trim();
      $('.catalog-list').text(catalogListText.slice(0,catalogListText.length-1));

      // 展开 可申请采购目录
      let gpCatalog = $('.purchase-catalog').data('gpcatalog');
      if( gpCatalog ){
          $('.total-num').text(gpCatalog.length);
          $('.total-num-inner').text(gpCatalog.length);

          $('.js-show-more').on('click', function(evt){
              $('.show-more-box').show();
              $('.show-more-box .close-warning').show();
          });
          $('.show-more-box .close-warning').unbind().on('click', function(evt){
              $('.show-more-box').hide();
          });
      }

      // 销售价根据宽度自适应，来调整字体大小
      let textWidth = $('#js-item-price').width();
      if(textWidth > 195){
          $('#js-item-price').css('font-size', '20px');
      }
      else {
          $('#js-item-price').css('font-size', '26px');
      }

      // 无 政策属性时，显示暂无
      let itemDetailMark = $('.policy-attrs').data('itemDetailMark');
      if(itemDetailMark) {
          let count = 0;
          $.each(itemDetailMark, function(name, value){
              if(name != 'itemId') {
                  count++;
              }
          });
          if(count == 0) {
              //$('.none-policy').show();
              $('.policy-attrs').addClass('hide');
          }
      }

      let isBlock = $("#IF_supperPro").val()==1;
      if(isBlock){
        let dom = $(".item-info-list").find(".supperPro_li").data();
        let param = {
          "shopId":dom.id,
          "categoryId":dom.cid,
          "itemId": this.itemId
        };
        $.ajax({
          url: "/api/item/block/decreaseRate",
          type: "GET",
          data:param,
          success: function (data) {
            let $label = $(".item-info-list").find(".supperPro_li").find("label"),
              $span = $(".item-info-list").find(".supperPro_li").find(".percent");
            /**
             * ＝0 -> 私有协议下浮率
             * >0 -> 标段下浮率
             */
            if(data && data.maxDecreaseRate > 0){
              let min = (data.minDecreaseRate/100).toFixed(2),
                max = (data.maxDecreaseRate/100).toFixed(2)
              $label.text('标段下浮率：');
              if(min == max){
                $span.html(`${min}%`);
              }
              else{
                $span.html(`${min}% ~ ${max}%`);
              }
            }
            else if(data && data.maxDecreaseRate == 0){
              let pen = (data.maxDecreaseRate/100).toFixed(2);
              $label.text('私有协议下浮率：');
              $span.html(pen+'%');
            }
            else{
              $span.html('--');
            }
          }
        })
      }
    }
    bindEvent() {
        this.initDiscountPrecent();
        //this.getItemMark();
        this.initAddress()
        this.comparePrice()
        this.itemPlatformPrice = $("#js-item-platform-price", this.$el)
        $(document).on("click", this.showAddress, (evt) => this.popAddressSelect(evt))
        // $(document).on("click", ".js-find-stock li", (evt) => this.findStock(evt))
        $(document).on('ZCYEvent.addressChange', this.showAddress, (evt) => this.findStock(evt))
        this.quantityByStockFunction(this.itemId, Cookie.getCookie("aid") || '330102')
        //$(document).bind('click',function(e){
        //    var e = e || window.event; //浏览器兼容性
        //    var elem = e.target || e.srcElement;
        //    elem = $(elem);
        //    if(elem.parents('.address-select-label') || elem.hasClass('address-select-label')){
        //        return;
        //    }
        //    else {
        //        $(".address-area").hide() //点击的不是div或其子元素
        //    }
        //});
        super.bindEvent()
    }

    //优惠率换算
    initDiscountPrecent() {
        let price = Number($("#js-item-price").text().replace("￥",""));//网超价
        let platformPrice = Number($("#js-item-platform-price").text().replace("￥",""));//自营平台价
        let discount_precent = "--";
        if(price&&platformPrice){
            discount_precent = ((platformPrice - price)/platformPrice*100).toFixed(2)+"%";
            $(".js-discount-precent").text(discount_precent);
            $('.discount-li').removeClass('hide');
        }
        else {  // 无电商平台价时，隐藏优惠率
            $('.discount-li').addClass('hide');
        }
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
    if(count > max){
      $("#item-quantity").val(max)
    }
  }

    //获取节能节水环保标示
    //getItemMark() {
    //    let itemId = $("#YZHD_ITEMID").val();
    //    $.ajax({
    //        url: "/api/item-mark/getItemDetailMark?itemId=" + itemId,
    //        type: "GET",
    //        success: function (data) {
    //            if (data) {
    //                data.isEnergySave == 1 && $(".gfrzBZ .jieneng-box").addClass("isShow");
    //                data.isEnvironProtect == 1 && $(".gfrzBZ .huanbao-box").addClass("isShow");
    //                //data.isWaterSave == 1 && $(".js-isWaterSave").show();
    //                $(".gfrzBZ .isShow").length>0 && $(".gfrzBZ").removeClass("hide")
    //            }
    //        }
    //    })
    //}

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
        if(this.userInfo == null){  // 游客未登录
            let target = top.location.href;
            window.location.href = `/login?target=${target}`;
        }
        else {
            let status = this.isAllselected()
            if (status) {
                // 检查商品数量
                if (!this.itemQuantityPresent()) {
                    return -1;
                }

                $("body").overlay()
                this.warning(1);
                let selectedSku = this.sku
                let _data = `skuId=${selectedSku.id}&quantity=${$(".count-number").val()}`;
                if($("#IF_VACCINE").val()==1){
                    _data = _data+"&classification=2&thirdId="+selectedSku.id
                }
                let _url="/api/zcy/carts";
                if($("#IF_supperPro").val()==1){
                    _url = "/api/zcy/block/cart/change";
                    _data = `skuId=${selectedSku.id}&quantity=${$(".count-number").val()}&classification=3`;
                }
                return $.ajax({
                    async: false,
                    url: _url,
                    type: "PUT",
                    data: _data,
                    success: (data) => {
                        if (this.flag == 1){
                            let _param = {
                                "isPro": $("#IF_supperPro").val()
                            };
                            new Modal(addToCartTemplate(_param)).show();
                        }
                        $(".ceiling").data("compInstance").getCartCount()
                    }
                }).status
            } else {
                this.warning(0)
            }
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
      this.warning(1);
      let selectedSku = this.sku
      // 立即下单
      if ($(evt.currentTarget).hasClass('createNow')) {
          if(this.userInfo == null){  // 游客未登录
              let target = top.location.href;
              window.location.href = `/login?target=${target}`;
          }
          else {
              if(this.userPrivilege.createPurchase) {   // 直接生成预购单(采购单)
                  $.ajax({
                      type: "get",
                      url: "/api/purchases/create",
                      data:{
                          skuId: selectedSku.id,
                          quantity: $(".count-number").val()
                      }
                  }).done((resp)=>{
                      $("body").overlay(false);
                      window.location.href = "/buyer/purchase-process?purchaseId=" + resp.purchaseId;
                  }).fail((jqXHR)=>{
                      $("body").overlay(false);
                  });
                  return;
              }
              if(this.userPrivilege.createOrder) {   // 直接生成订单
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
                      plans:[]
                  }
                  if(!cartItem.cartItem.itemId){   //字段重命名，保持和购物车兼容
                      cartItem.cartItem.itemId = cartItem.cartItem.id
                  }
                  let totalMoney = selectedSku.price * count / 100 , orderType = 0
                  if(itemData.item.tags && itemData.item.tags.vaccine){
                      orderType = 2
                  }
                  else if(itemData.item.tags && itemData.item.tags.blocktrade){
                      orderType = 3
                  }
                  sessionStorage.setItem('orderItems', JSON.stringify({
                      'totalMoney': totalMoney,
                      'orderType': orderType,
                      'data': [{
                          shopName: itemData.item.shopName,
                          sellerId: sellerId,
                          items:[cartItem]
                      }]
                  }));
                  $("body").overlay(false);
                  window.location.href = `/buyer/create-order?orderType=${orderType}`;
                  return;
              }
          }
      }
      //生成需求单
      if ($(evt.currentTarget).hasClass('createRequisition')) {
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
          data: data
        }).done((resp)=>{
           $("body").overlay(false);
           window.location.href = `/buyer/requisition-process?reqId=${resp.requisitionId}&orgId=${orgId}`;
        }).fail((jqXHR)=>{
           $("body").overlay(false);
        });
      }
      return;
    }
    else {
      this.warning(0)
    }
  }

    warning(type) {
    if (type === 0) {   // 显示 warning-box
      $('.js-warning-box').addClass("warning-box");
      $('.js-warning-box .title').show();
      $("#choose-btns button", this.$el).prop('disabled', true).addClass('disabled');
      return this.closeWarningA.show();
    } else if (type === 1) {   // 隐藏  warning-box
      $('.js-warning-box').removeClass("warning-box");
      $('.js-warning-box .title').hide();
      $("#choose-btns button", this.$el).prop('disabled', false).removeClass('disabled');
      return this.closeWarningA.hide();
    }
  }

    popAddressSelect(evt) {
        $(".address-area").show()
        this.initAddress()
        $('.address-close').click(() => {
            $(".address-area").hide()
        })
        this.stopPropagation(evt);
    }

    stopPropagation(e) {
      if (e.stopPropagation)
        e.stopPropagation();
      else
        e.cancelBubble = true;
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
            $(el).removeClass("selected");
            $(el).find('.tick-icon').addClass('hide');
        })
        let leafRegion = $(evt.currentTarget).data('region') || $(evt.currentTarget).data('city') || $(evt.currentTarget).data('province')
        Cookie.addCookie("aid", leafRegion, 30, window.location.hostname)
        this.quantityByStockFunction(this.itemId, leafRegion)
    }

    // 配送地变更后，更新库存信息 和 服务承诺信息
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
                // 配送地 变更后, 如果只存在一个sku，就 默认sku选中第一个
                this.chooseDefault();
            },
            error: (data) => {
                this.initSkuSelect('disabled')
                $('#js-item-stock').text(0)
            }
        })
        //获取商品服务信息
        $.ajax({
            url: '/api/service/getItemServicesDetail',
            type: 'get',
            data: {itemId: itemId, region: leafRegion}
        }).done((result) => {
            //console.log(result);
            let content = $('.service-commitment .content').empty();
            if(result && result.length>0){
                for(let i=0; i<result.length; i++){
                    let domEle = `<span class="box"><a class="service" href="${result[i].descriptionUrl}" target="_blank"> <img src="${result[i].iconSmall}" alt="${result[i].name}"/> <span>${result[i].name}</span> </a></span>`;
                    content.append(domEle);
                    //jQuery.get(result[i].iconSmall, function(data) {   // 修改svg颜色
                    //    var $svg = jQuery(data).find('svg')
                    //    $svg.css('margin-right', '4px')
                    //    $svg.find('path').attr('fill', '#bbb')
                    //    let $domEle =$(`<span class="box"><a class="service" href="${result[i].descriptionUrl}" target="_blank"><span>${result[i].name}</span> </a></span>`)
                    //    $domEle.find('a').prepend($svg)
                    //    content.append($domEle)
                    //}, 'xml')
                }
                $('.service-commitment').show();
            }
            else {
                //content.append('暂无');
                $('.service-commitment').hide();
            }

            // trigger 下面tab组件的 服务承诺更新
            $('.goods-tab').data('service', result);
            $('.goods-tab').trigger('serviceRender');
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
            $('.js-item-stock-quantity').data('max', this.total).data("mix", 1);
            $("#item-quantity").val(1);
            if(this.total == 1){
                $('.js-item-stock-quantity .minus').addClass('disabled').off('click');
                $('.js-item-stock-quantity .plus').addClass('disabled');
            }
            else {
                $('.js-item-stock-quantity .plus').removeClass('disabled');
            }
            // 隐藏提示信息
            $('#choose-amount .tooltip').addClass('hide');
            // 恢复按钮
            $('#choose-btns .btn').removeClass('disabled').attr("disabled", false);
        } else {   // 库存为 0
            $('.js-item-stock-quantity').data('max', 0).data("min", 0);
            $("#item-quantity").val(0);
            $('.js-item-stock-quantity .minus').addClass('disabled');
            $('.js-item-stock-quantity .plus').addClass('disabled');
            // 显示提示信息
            $('#choose-amount .tooltip').removeClass('hide');
            // 置灰按钮
            $('#choose-btns .btn').addClass('disabled').attr("disabled", true);
        }
    }

    //复写按钮无效方法 (无库存)
    autoSelectSku() {
        _.each(this.$skuAttr, (i, d) => {
            let attr_id = $(i).data("attr")
            if (!this.SKUResult[attr_id]) {
                $(i).attr('disabled', 'disabled').addClass('disabled');
            } else {
                $(i).attr('disabled', false).removeClass('disabled');
            }
        })
    }

    // 复写sku属性点击方法
    attrClick(evt) {
        let $hasImage, $selected, $selectedShow, $self, src;
        $self = $(evt.currentTarget);
        if (!$self.attr("disabled")) {
            if($('.js-warning-box').hasClass('warning-box')){
                $("#choose-btns button", this.$el).prop('disabled', false).removeClass('disabled');
            }
            else{
                this.warning(1);
            }
            $self.toggleClass("selected").siblings().removeClass("selected");
            $selected = this.$skuAttr.filter(".selected");
            $hasImage = $selected.filter(".hasImage");
            $selectedShow = $selected.filter("[data-show=true]");
            if ($hasImage.length) {
                src = $selectedShow.length ? $selectedShow.data("src") : null;
                if ($self.hasClass("selected")) {
                    src = src || $self.data("src");
                } else {
                    if ($hasImage.length) {
                        src = src || $hasImage.data("src");
                    }
                }
                if (src !== this.mainImage.attr("src")) {
                    this.changeMainImage(src);
                }
            }
            this.setSelectAttrs($self);
        }
    }

    //sku设置是否可选
    initSkuSelect(mode) {
        _.each($('.js-sku-attr'), (i, d) => {
            $(i).attr('disabled', mode)
        })
    }

    //获取页面权限
    getPagePrivilege(){
      $.ajax({
        url: '/api/zcy/getResourcePrivilege',
        type: 'get',
        data: {pageId:'itemDetail'}
      }).done((resp)=>{

        if($.isEmptyObject(resp)){   // resp=={}
          if(this.userInfo == null){   // 游客
            $('.js-add-cart').show();
            $('.goods-tab').data('showAddCart', true);
            $('.js-buy-now.createNow').show();
          }
          else {     // 用户已经登录, 但无购买下单权限
            $('.js-add-cart').unbind().hide();
            $('.goods-tab').data('showAddCart', false);
            $('.js-buy-now.createNow').hide();
            $('.js-buy-now.createRequisition').hide();
          }
        }
        else {   // resp对象不为空
          $('.js-add-cart').show();
          $('.goods-tab').data('showAddCart', true);
          if(resp.createRequisition){
            $('.js-buy-now.createRequisition').show()
          }
          else{
            $('.js-buy-now.createRequisition').hide()
          }
          if(resp.createPurchase || resp.createOrder){  // 直接生成订单 和 直接生成预购单 合并成同一个 "立即下单"
            $('.js-buy-now.createNow').show();
          }
          else{
            $('.js-buy-now.createNow').hide();
          }
        }

        this.userPrivilege  = resp;

      }).fail(()=>{
          $('.js-buy-now').unbind().hide();
      })
    }
}