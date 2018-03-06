/*
  商品主搜组件
 */

import Modal from "pokeball/components/modal"
import Pagination from "pokeball/components/pagination"
import Tip from "common/tip_and_alert/view"
import Language from "locale/locale"
import Cookie from "common/cookie/view"
const AddressGroup = require("common/address_select_group/view")
const itemServices = require('common/item_services/view')

const itemCompareTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/item-compare"]
const searchTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/search"]
const categoryListTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/category-list"]
const goodsListTemplate = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/goods-list"]
const addToCartForm = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/add-to-cart-form"]
const otherAttrSearch = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/other-attr-search"]
const addressSelectDown = Handlebars.templates["zcyEvEtemp/comps/goods_search/templates/address-select-down"]

class GoodsList extends AddressGroup {

  constructor() {
    super()
    this.userType = $('body').data('user-type');
    this.search = "";
    this.spuSearch = "";
    this.isShop = !!$.query.keys.shopId;
    this.pageSize = this.isShop ? 40 : 50;
    // 判断是spu聚合页，还是商品搜索页
    if(window.location.href.indexOf('spu') >= 0){
      this.pageType = 'spu';
      this.urlPrefix = '/api/zcy/search/spu';
      this.spuRender();
    }
    else {
      this.pageType = 'goodsSearch';
      this.urlPrefix = '/api/zcy/search';
      this.render();
    }
  }

  spuRender() {
    this.getSpuInitData();
  }

  // 固定于顶部的搜索栏 的相关事件绑定
  bindFixedBarEvent(){
    $('.fix-nav-bar #search-button').on('click', (evt) => {   // 搜索
      let target = $(evt.currentTarget);
      $('.input-group .search-input').val( target.siblings('.search-input').val().trim() );
      $('.input-group #search-button').trigger('click');
    });
    $('.fix-nav-bar .js-item-sells').on('click', (evt)=> {    // 销量
      $('.goods-search-list .js-item-sells').trigger('click');
    });
    $('.fix-nav-bar .js-item-news').on('click', (evt)=> {    // 最新
      $('.goods-search-list .js-item-news').trigger('click');
    });
    $('.fix-nav-bar .js-item-price').on('click', (evt)=> {    // 价格
      $('.goods-search-list .js-item-price').trigger('click');
    });
    $('.fix-nav-bar .js-filter-submit').on('click', (evt)=> {   // 价格区间筛选
      $('.goods-search-list input.p_f').val( $('.fix-nav-bar input.p_f').val().trim() );
      $('.goods-search-list input.p_t').val( $('.fix-nav-bar input.p_t').val().trim() );
      $('.goods-search-list .js-filter-submit').trigger('click');
    });
    $('.fix-nav-bar .js-filter-clear').on('click', (evt)=> {    // 清除价格区间筛选
      $('.fix-nav-bar input.p_f').val('');
      $('.fix-nav-bar input.p_t').val('');
      $('.goods-search-list .js-filter-clear').trigger('click');
    });
    $('.fix-nav-bar .js-has-goods').on('click', (evt)=> {    // 仅显示有货
      $('.goods-search-list .js-has-goods').trigger('click');
    });
    $('.fix-nav-bar .js-energy').on('click', (evt)=> {    // 节能(节水)
      $('.goods-search-list .js-energy').trigger('click');
    });
    $('.fix-nav-bar .js-environ').on('click', (evt)=> {    // 环保
      $('.goods-search-list .js-environ').trigger('click');
    });
    $('.fix-nav-bar .js-mfacture').on('click', (evt)=> {    // 品质制造
      $('.goods-search-list .js-mfacture').trigger('click');
    });
    $('.fix-nav-bar .js-ticketServ').on('click', (evt)=> {    // 上传票证服务
      $('.goods-search-list .js-ticketServ').trigger('click');
    });
    $('.fix-nav-bar .js-deliveryServ').on('click', (evt)=> {    // 送货上门服务
      $('.goods-search-list .js-deliveryServ').trigger('click');
    });
    $('.fix-nav-bar .js-installServ').on('click', (evt)=> {    // 上门安装服务
      $('.goods-search-list .js-installServ').trigger('click');
    });
  }

  render(){
    let self = this;
    this.getInitData();

    $('.component-goods-supplierSearch-list').off('categorySearch').on('categorySearch', () => {
      let fcid = $('.component-goods-supplierSearch-list').data('fcid');
      let newParams = this.getCurrentParams('fcids');
      if(fcid!=undefined){
        newParams.push('fcids='+fcid);
      }
      let newSearch = '?' + newParams.join('&');
      this.getSearchData(newSearch, "category");
    });

    window.onscroll = function(){
      if(!self.isShop){  // 商品搜索页才显示固定筛选条
        var ht = document.documentElement.scrollTop || document.body.scrollTop;
        if(ht > 470){
          $(".fix-nav-bar").removeClass('hide');
        }
        else{
          $(".fix-nav-bar").addClass('hide');
        }
      }
    }
  }

  // SPU 页面初始化渲染
  getSpuInitData() {
    let self = this;
    let spuId = $.query.keys.spuId;
    this.spuSearch = `?spuId=${spuId}&hasStock=true&pageNo=1&pageSize=${this.pageSize}`
    this.spuSearch = encodeURI(this.spuSearch);
    $('.js-search-list').wcSpin('large');

    $.ajax({
      url: self.urlPrefix + this.spuSearch,
      type: "GET",
      contentType: "application/x-www-form-urlencoded; charset=utf-8",
      success: function(data) {
        $('.js-search-list').wcSpin('hide');
        let _DATA_ = data.searchWithAggs;
        $(".js-search-list").empty().append(searchTemplate(data));
        // $('.filter-container').css('width', '515px');
        $('.deliveryAddress').empty().append(addressSelectDown(data.addr));
        self.showServiceFilter(data.serviceProtocols);
        $('.total span').text(_DATA_.entities.total);
        $('.custom-total').text( Math.floor(_DATA_.entities.total / self.pageSize ) + 1);
        _DATA_.searchType = $.query.get('searchType');
        _DATA_.pageSize = self.pageSize;
        _DATA_.pageType = self.pageType;
        // 控制是否显示采购意向链接
        let userInfo = $('.storeUserInfo').data('userInfo');
        if(userInfo) {
          _DATA_.isPurchaser = userInfo.isPurchaser;
        }else {
          _DATA_.isPurchaser = false;
        }
        $(".goods-list").empty().append(goodsListTemplate(_DATA_));
        $(".js-has-goods").prop('checked', true);
        // SPU聚合页，显示 checkbox 只看本区划
        if( $('.checkbox-region').hasClass('hide') ){
          $('.checkbox-region').removeClass('hide');
        }
        // 是否显示 "此商品仅在其他区划销售"
        if(data.currentDistrictItems){
          self.hasRegionSell(data.currentDistrictItems);
        }

        if(self.pageType == "spu"){
          $('.product').css('margin', "0 15px 15px 0");
          $('.product.last').css('margin', "0");
        }

        self.bindEvent();
        self.bindGoodsListEvent();
        self.imageLazyLoad();
        self.bindAddressSelectEvent();
        self.init();
        self.renderListTable();
        //获取商品服务信息
        // new itemServices('.js-item-service', {style: 'simple'}).showServiceInfo()
      },
      error: function (data) {
        $('.js-search-list').wcSpin('hide');
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: data.responseText
          }).show();
      }
    });
  }

  // 是否显示 "此商品仅在其他区划销售"
  hasRegionSell(currentDistrictItems) {
    if(currentDistrictItems) {
      $('.product').each(function(){
        let flag = 1;
        let id = $(this).data('id');
        for(let i=0; i<currentDistrictItems.length; i++){
          if(id == currentDistrictItems[i]){
            flag = 0;
            break;
          }
        }
        if(flag) {
          $(this).find('.regionSell').removeClass('hide');
        }
      });
    }
  }

  // 页面初始化渲染
  getInitData(){
    let self = this;
    let currentParams = [], searchStr = "";
    // for (var index in $.query.keys){
    //   currentParams.push(index+'='+$.query.keys[index]);
    // }
    // searchStr = currentParams.join('&');

    // this.search = `?hasStock=true&pageNo=1&pageSize=${this.pageSize}&${searchStr}`
    searchStr = window.location.search || "?q=";
    this.search = `${searchStr}&hasStock=true&pageNo=1&pageSize=${this.pageSize}`
    // this.search = encodeURI(this.search);
    //console.log(this.search);
    // 默认的 deliveryCode = 330102

    $('.js-search-list').wcSpin('large');

    $.ajax({
      url: self.urlPrefix + this.search,
      type: "GET",
      contentType: "application/x-www-form-urlencoded; charset=utf-8",
      error: (jqXHR) => { 
        $('.js-search-list').wcSpin('hide');
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: jqXHR.responseText
          }).show();
      }
    }).done((data) => {
      $('.js-search-list').wcSpin('hide');
      let _DATA_ = data.searchWithAggs;
      $(".js-search-list").empty().append(searchTemplate(data));
      self.bindFixedBarEvent();
      $('.deliveryAddress').empty().append(addressSelectDown(data.addr));
      self.showServiceFilter(data.serviceProtocols);
      $('.total span').text(_DATA_.entities.total);
      $('.custom-total').text( Math.floor(_DATA_.entities.total / self.pageSize ) + 1);
      data.searchType = $.query.get('searchType');
      $(".category-list").empty().append(categoryListTemplate(data));
      _DATA_.searchType = $.query.get('searchType');
      _DATA_.pageSize = self.pageSize;
      _DATA_.pageType = self.pageType;
      // 控制是否显示采购意向链接
      let userInfo = $('.storeUserInfo').data('userInfo');
      if(userInfo) {
        _DATA_.isPurchaser = userInfo.isPurchaser;
      }else {
        _DATA_.isPurchaser = false;
      }
      $(".goods-list").empty().append(goodsListTemplate(_DATA_));
      $(".js-has-goods").prop('checked', true);

      self.bindEvent();
      self.bindCategoryListEvent();
      self.bindGoodsListEvent();
      self.imageLazyLoad();
      self.bindAddressSelectEvent();
      self.init();
      self.renderListTable();
      //获取商品服务信息
      // new itemServices('.js-item-service', {style: 'simple'}).showServiceInfo()
    });
  }

  // 显示已配置的 服务相关筛选
  showServiceFilter(serviceProtocols) {
    if(serviceProtocols){
      for(let i=0; i<serviceProtocols.length; i++){
        let servName = serviceProtocols[i].name;
        let servId = serviceProtocols[i].id;
        $('.filter-checkbox input[name="'+ servName +'"]').data('service-id', servId).closest('.box').show();
      }
      // 绑定服务筛选事件：上传票证服务，送货上门服务，上门安装服务
      $('.goods-search-list .js-ticketServ, .goods-search-list .js-deliveryServ, .goods-search-list .js-installServ').on('change', (evt) => this.serviceFilter(evt));
      // 显示更多按钮
      if(this.isShop){
        $('.goods-search-list .filter-container').addClass('shop-filter-box');
        $('.show-more-filter').show();
        $('.show-more-filter').on('mouseenter', (evt)=>{
          let target = $(evt.currentTarget);
          let icon = target.closest('.show-more-filter').find('i');
          let span = target.closest('.show-more-filter').find('span');
          icon.removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie');
          span.text('收起');
          target.closest('.filter-container').addClass('more-filter-box');
          $('.moreFilter').css('display', 'inline-block');
        })
        $('.shop-filter-box').on('mouseleave', (evt)=>{
          let target = $(evt.currentTarget);
          let icon = target.find('.show-more-filter').find('i');
          let span = target.find('.show-more-filter').find('span');
          icon.removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
          span.text('更多');
          target.removeClass('more-filter-box');
          $('.moreFilter').hide();
        });
      }
      else {
        $('.moreFilter').css('display', 'inline-block');
      }
    }
  }

  // 服务筛选方法
  serviceFilter(evt) {
    let self = this;
    let ticketServ = $('.goods-search-list .js-ticketServ');
    let deliveryServ = $('.goods-search-list .js-deliveryServ');
    let installServ = $('.goods-search-list .js-installServ');

    let ticketServState = ticketServ.prop('checked')?1:0;
    let deliveryServState = deliveryServ.prop('checked')?1:0;
    let installServState = installServ.prop('checked')?1:0;
    let newSearch = "", servArr = [];

    // 如果选了服务，必须要带serviceProtocolItemStatus=1这个参数
    let currentParams = [], newParams = [];
    let temp = this.pageType=='spu' ? this.spuSearch : this.search;
    if(temp.length > 1){
      let p;
      currentParams = temp.substr(1).split('&');
      currentParams.forEach(function(p){
        if( !( p.indexOf('pageNo=')>=0 || p.indexOf('serviceProtocolItemStatus=')>=0 || p.indexOf('serviceProtocolIds=')>=0 ) )
          newParams.push(p);
      });
      newParams.push('pageNo=1');
    }

    if(ticketServState){
      servArr.push( ticketServ.data('service-id') );
      $('.fix-nav-bar .js-ticketServ').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-ticketServ').prop('checked', false);
    }

    if(deliveryServState){
      servArr.push( deliveryServ.data('service-id') );
      $('.fix-nav-bar .js-deliveryServ').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-deliveryServ').prop('checked', false);
    }

    if(installServState){
      servArr.push( installServ.data('service-id') );
      $('.fix-nav-bar .js-installServ').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-installServ').prop('checked', false);
    }

    if(servArr.length > 0){
      newParams.push('serviceProtocolIds=' + servArr.join('_'));
      newSearch = '?' + newParams.join('&') + '&serviceProtocolItemStatus=1';
    }
    else {
      newSearch = '?' + newParams.join('&');
    }

    this.getSearchData(newSearch, "filter");
  }

  // 商品图片懒加载
  imageLazyLoad(){
    $('.component-goods-supplierSearch-list').find('img.lazy').lazyload({
      placeholder: '',
      effect: "fadeIn",
      skip_invisible: false
    }).removeClass("lazy");
  }

  // 渲染搜索结果数据 公共方法
  getSearchData(newSearch, type){
    let self = this;
    $('.js-search-list').wcSpin('large');

    $.ajax({
      url: self.urlPrefix + newSearch,
      type: "GET",
      error: (jqXHR) => {
        $('.js-search-list').wcSpin('hide');
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: jqXHR.responseText
          }).show();
      }
    }).done((data)=>{
      $('.js-search-list').wcSpin('hide');
      let _DATA_ = data.searchWithAggs;
      $('.total span').text(_DATA_.entities.total);
      $('.custom-total').text( Math.floor(_DATA_.entities.total / self.pageSize ) + 1);
      _DATA_.searchType = $.query.get('searchType');
      _DATA_.pageSize = self.pageSize;
      _DATA_.pageType = self.pageType;
      // 控制是否显示采购意向链接
      let userInfo = $('.storeUserInfo').data('userInfo');
      let hrefInfo = $('.storeHrefInfo').data('hrefInfo');
      if(userInfo) {
        _DATA_.isPurchaser = userInfo.isPurchaser;
      }else {
        _DATA_.isPurchaser = false;
      }
      if(hrefInfo) {
        _DATA_.baseLocation = hrefInfo.main;
      }
      else {
        _DATA_.baseLocation = "https://zcy.gov.cn";
      }
      $(".goods-list").empty().append(goodsListTemplate(_DATA_));
      // 切换到当前的视图模式
      let modeType = $('.view-mode .active').data('type');
      $('.list').removeClass('view-thumb view-list').addClass('view-' + modeType);
      if(type == "category"){
        data.searchType = $.query.get('searchType');
        $(".category-list").empty().append(categoryListTemplate(data));
      }

      // 是否显示 "此商品仅在其他区划销售"  , 只有spu聚合页才有currentDistrictItems这个属性
      if(self.pageType == "spu"){
        self.hasRegionSell(data.currentDistrictItems);
        $('.product').css('margin', "0 15px 15px 0");
        $('.product.last').css('margin', "0");
      }

      self.bindGoodsListEvent();
      self.imageLazyLoad();
      if(type == "category") {
        self.bindAddressSelectEvent();
        self.bindCategoryListEvent();
      }
      self.init();
      self.renderListTable();
      if(self.pageType == 'spu'){
        self.spuSearch = newSearch;
      } else {
        self.search = newSearch;
      }
      //获取商品服务信息
      // new itemServices('.js-item-service', {style: 'simple'}).showServiceInfo()
    });
  }

  // 获取最近的请求参数
  getCurrentParams(paramName) {
    let currentParams = [], newParams = [];
    let temp = this.pageType=='spu' ? this.spuSearch : this.search;
    if(temp.length > 1){
      let p;
      currentParams = temp.substr(1).split('&');
      currentParams.forEach(function(p){
        if( !(p.indexOf('pageNo=')>=0 || p.indexOf(paramName + '=')>=0 ) )
          newParams.push(p);
      });
      newParams.push('pageNo=1');
    }
    return newParams;
  }

  getPageNo(){
    let currentParams = [], pageNo;
    let temp = this.pageType=='spu' ? this.spuSearch : this.search;
    if(temp.length > 1){
      let p;
      currentParams = temp.substr(1).split('&');
      currentParams.forEach(function(p){
        if(p.indexOf('pageNo=')>=0){
          pageNo = p.split('=')[1];
        }
      });
    }
    return parseInt(pageNo);
  }

  // 配送区 筛选
  bindAddressSelectEvent(){
    $('.address-text').on('click', (evt) => this.popAddressSelect(evt));
    $(document).on("click", ".address-tab li", this.addressTab);
    $(document).on("click", this.provinceSelect, this.provinceChange);
    $(document).on("click", this.citySelect, this.cityChange);
    $(document).on("click", this.regionSelect, this.regionChange);
    $(document).on("click", this.streetSelect, this.streetChange);
    $(document).on("click", this.addressList, this.addressChange);
    $(".address-area [data-level='3']").delegate("li", 'click', (evt) => this.addressFilter(evt));
  }

  getDomElems() {
    // 商品筛选
    this.$jsSort = $('.js-sort');
    this.filterForm = $(".goods-search-list .js-price-range");
    this.$jsPriceInput = $('.js-price-range input');
    this.$jsPriceSubmit = $('.goods-search-list .js-filter-submit');
    this.$jsFilterClear = $('.goods-search-list .js-filter-clear');
    // 商品对比
    this.compareBtn = ".anon-contrast";
    this.closeCompare = ".close-compare-module";
    this.emptyProduct = ".empty-compare-product";
    this.jsDelectSelected = ".js-delect-selected";
  }

  // 绑定商品筛选和商品对比事件
  bindEvent() {
    this.getDomElems();

    // 自定义分页
    $('.custom-prev').on("click", function(){
      $('.prev').trigger("click");
    });
    $('.custom-next').on("click", function(){
      $('.next').trigger("click");
    });
    let currentPage = $('.current').text();
    $('.custom-pageNo').text( (currentPage == "") ? 1 : currentPage);

    // 商品对比
    $(this.closeCompare).on("click", this.compareClose);
    $(this.emptyProduct).on("click", this.productEmpty);
    $(this.compareBtn).on("click", this.btnCompare);
    $(document).on("click", this.jsDelectSelected, (evt) => this.deletelItemCompareId(evt));
    // 按照 销量，新品，价格 排序
    this.$jsSort.delegate("button", "click", (evt) => this.goodsSort(evt));
    // 价格区间筛选
    this.$jsPriceInput.on('click', (evt) => {
      evt.stopPropagation();
      $('.js-price-filter').removeClass('hide');
    });
    $(document).on('click', (evt) => {
      let target = $(evt.currentTarget);
      if(!target.hasClass('p_f') && !target.hasClass('p_t') && !target.hasClass('js-filter-submit') && !target.hasClass('js-filter-clear')) {
        $('.js-price-filter').addClass('hide');
      }
    });

    this.$jsPriceSubmit.on('click', (evt) => this.priceRangeFilter(evt));
    this.$jsFilterClear.on('click', (evt) => this.cancelPriceFilter(evt));
    this.filterForm.validator({
      isErrorOnParent: true
    });
    // 标签(节能,环保,品质制造) 筛选
    $('.goods-search-list .js-energy, .goods-search-list .js-environ, .goods-search-list .js-mfacture').on('change', (evt) => this.tagFilter(evt));
    // 只看本区划 筛选
    $('.goods-search-list .js-region').on('change', (evt) => this.onlyRegionFilter(evt));
    // 仅显示有货 筛选
    $('.goods-search-list .js-has-goods').on('change', (evt) => this.hasGoodsFilter(evt));
  };

  // 绑定其他选项事件
  bindOtherAttrEvent() {
    $(".js-property-selector").on("click", (evt) => this.propertySelectorClick(evt));
    $(".more-options").on("click", (evt) => this.electsBrands(evt));
    $(".js-brand-cancel").off('click').on("click", (evt) => this.brandCancel(evt));
    $(".js-attrs-confirm").on("click", (evt) => this.attrsConfirm(evt));
  }

  // 配送地 筛选
  addressFilter(evt){
    let target = $(evt.currentTarget);
    let regionId = target.data('value');
    //console.log('regionId: '+ regionId);
    let newParams = [], newSearch = "";
    newParams = this.getCurrentParams('deliveryCode');
    if(!!regionId){
      newParams.push('deliveryCode=' + regionId);
    }
    newSearch = '?' + newParams.join('&');
    //console.log(newSearch);
    this.getSearchData(newSearch, "filter");
    Cookie.addCookie("aid", regionId, 30, window.location.hostname);
  }

  getCategoryListElems() {
    this.breadFrontSelector = $(".js-bread-front-selector");
    this.breadPropertySelector = $(".js-bread-property-selector");
    this.breadCategorySelector = $(".js-bread-category-selector");
    this.breadBrandSelector = $(".js-bread-brand-selector");
    this.breadPlanSelector = $(".js-bread-plan-selector");
    this.breadCatalogSelector = $(".js-bread-catalog-selector");
    this.categorySelector = $(".js-category-selector");
    this.catalogSelector = $(".js-catalogs-selector");
    this.brandSelector = $(".js-brand-selector");
    this.otherAttrSelector = $(".js-other-attr-selector");
    this.plansSelector = $('.js-plans-selector');
    this.$jsPrintSearchPrint = $(".js-print-search-result");
    this.$jsFilterToggle = $('.js-filter-toggle');
    //this.cancelFilterButton = $("#js-cancel-filter");
    this.$jsElects = $(".more-options");
    this.$jsBrandConfirm = $(".js-brand-confirm");
    this.$jsCategoryConfirm = $(".js-category-confirm");
    this.$jsPlanConfirm = $(".js-plan-confirm");
    this.$jsBrandCancel = $(".js-brand-cancel");
    this.$jsMoredd = $(".js-more-dd");
    //this.$jsSelecorMore = $('#js-selector-more');
    this.jsCancelProperty = $(".bread-selector");
    this.isUser = $(".current-location-dark").data("user");
  }

  // 绑定头部类别筛选事件
  bindCategoryListEvent() {
    this.getCategoryListElems();
    this.breadFrontSelector.on("click", (evt) => this.breadFrontSelectorClick(evt));
    this.breadPropertySelector.on("click", (evt) => this.breadPropertySelectorClick(evt));
    this.breadCategorySelector.on("click", (evt) => this.breadCategorySelectorClick(evt));
    this.breadBrandSelector.on("click", (evt) => this.breadBrandSelectorClick(evt));
    this.breadPlanSelector.on("click", (evt) => this.breadPlanSelectorClick(evt));
    this.breadCatalogSelector.on("click", (evt) => this.breadCatalogSelectorClick(evt));
    this.categorySelector.on("click", (evt) => this.categorySelectorClick(evt));
    this.catalogSelector.on("click", (evt) => this.catalogSelectorClick(evt));
    this.brandSelector.on("click", (evt) => this.brandSelectorClick(evt));
    this.otherAttrSelector.delegate("a", "mouseenter", (evt) => this.attrSelectorHover(evt));
    this.otherAttrSelector.on("mouseleave", (evt) => this.hideAttrSelector(evt))
    this.plansSelector.on("click", (evt) => this.plansSelectorClick(evt));
    this.$jsPrintSearchPrint.on("click", (evt) => this.printSearchResult(evt));
    this.$jsFilterToggle.on("click", (evt) => this.filterToggle(evt));
    //this.cancelFilterButton.on("click", this.cancelFilter);
    this.$jsElects.on("click", (evt) => this.electsBrands(evt));
    this.$jsBrandConfirm.on("click", (evt) => this.brandConfirm(evt));
    this.$jsCategoryConfirm.on("click", (evt) => this.categoryConfirm(evt));
    this.$jsPlanConfirm.on('click', (evt) => this.planConfirm(evt));
    this.$jsBrandCancel.on("click", (evt) => this.brandCancel(evt));
    this.$jsMoredd.on("click", (evt) => this.categoriesMore(evt));
    //this.$jsSelecorMore.on("click", (function(_this) {
    //  return function(evt) {
    //    return _this.selectorMore(evt);
    //  };
    //})(this));
    this.jsCancelProperty.on("click", this.cancelBreadProperty);
    this.bindOtherAttrEvent();
    //  测试一下
    $('.list-more input').on('click', (evt) =>{
      let target = $(evt.currentTarget);
      let thisDl = target.closest("dl");
      if( thisDl.find('.list-more').find('input:checked').length > 0 ){
        target.closest('dl').find('.js-brand-confirm').prop('disabled',false);
        target.closest('dl').find('.js-attrs-confirm').prop('disabled',false);
      }else {
        target.closest('dl').find('.js-brand-confirm').prop('disabled',true);
        target.closest('dl').find('.js-attrs-confirm').prop('disabled',true);
      }
    });
  }

  getGoodsListElems() {
    this.viewModeType = $('.view-mode-type');
    this.viewModeTableTrs = $('.view-mode-list tbody tr');
    this.timer = null;
    this.product = $('.product');
    this.$addToCart = $(".addToCart");
    this.selectCompare = $(".js-compare-checkbox");
  }

  // 绑定商品列表事件
  bindGoodsListEvent(){
    let self = this;
    this.getGoodsListElems();
    let pagination;
    pagination = new Pagination(".js-pagination").total( $('.total span').text() ).show($(".js-pagination").data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true,
      current_page: self.getPageNo() - 1,
      callback: function(pageNo, pageSize) {
        let currentParams = [], newParams = [], newSearch = "";
        let temp = self.pageType=='spu' ? self.spuSearch : self.search;
        if(temp.length > 1){
          let p;
          currentParams = temp.substr(1).split('&');
          currentParams.forEach(function(p){
            if(! (p.indexOf('pageNo=')>=0 || (p.indexOf('pageSize=')>=0) )){
              newParams.push(p);
            }
          });
          newParams.push('pageNo='+ (pageNo+1));
          newParams.push('pageSize=' + pageSize);
          newSearch = "?" + newParams.join('&');
        }
        self.pageSize = pageSize;
        if(self.pageType == 'spu'){
          self.spuSearch = newSearch;
        }
        else {
          self.search = newSearch;
        }
        self.getSearchData(newSearch, "filter");
        return true;
      }
    });
    let currentPage = $('.current').text();
    $('.custom-pageNo').text( (currentPage == "") ? 1 : currentPage);

    // 绑定事件：选择每页显示个数

    // $('.pagination .selectric-scroll ul li').unbind().on('click', (evt) => this.changePageSize(evt));

    // 加入对比
    this.selectCompare.on("click", (evt) => this.itemSelectId(evt));
    $('.compare-checkbox').on("change", (evt) => this.itemSelectId(evt));

    // 切换 大图/列表 视图
    this.viewModeType.on("click", this.changeViewMode);
    // 显示加入购物车和对比按钮。 并请求可用采购计划数
    this.product.on('mouseenter', (evt) => this.showOperationItem(evt));
    this.product.on('mouseleave', (evt) => this.hideOperationItem(evt));
    // 显示加入购物车表单
    this.$addToCart.on('click', (evt) => this.showAddToCartForm(evt));
    // 服务承诺 说明
    $('.js-item-service img').on('mouseenter', (evt)=> {
      let target = $(evt.currentTarget);
      target.next('span').removeClass('hide');
    }).on('mouseleave', (evt)=> {
      let target = $(evt.currentTarget);      
      target.closest('.js-item-service').find('.box').each( (index, domEle)=> {
        $(domEle).find('span').addClass('hide');
      });
    });

  }

  getAddToCartElems() {
    this.$goodsAttr = $('.goods-attr');
    this.$addToCartSubmit = $('.addToCartSubmit');
    this.$addToCartCancel = $('.addToCartCancel');
  }

  // 加入购物车表单相关事件
  bindAddToCartEvent() {
    this.getAddToCartElems();
    // 更新选中商品属性的样式
    this.$goodsAttr.delegate("input", 'click', (evt) => this.selectedGoodsAttr(evt));
    // 提交 加入购物车
    this.$addToCartSubmit.on('click', (evt) => this.addToCartSubmit(evt));
    // 取消 加入购物车
    this.$addToCartCancel.on('click', (evt) => this.hideAddToCartForm(evt));
  }

  init() {
    // 同步商品对比信息
    return this.asncGet();
  };

  popAddressSelect(evt) {
    $(".address-area").show()
    this.initAddress()
    $('.address-close').click(() => {
      $(".address-area").hide()
    })}

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

  // 提交 加入购物车
  addToCartSubmit(evt) {
    let target =  $(evt.currentTarget);
    let temp = {};
    let skuList = target.closest('.addToCartForm').find('.sku-list').data('skulist');
    let stockMap = target.closest('.addToCartForm').find('.sku-list').data('stockMap');
    let skuId;
    target.parents('.tooltips').find('input.selected').each(function(){
      let attrkey = $(this).data('attrkey');
      let val = $(this).val();
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
    $('.js-search-list').wcSpin('large');

    $.ajax({
      async: false,
      url: "/api/zcy/carts",
      type: "PUT",
      data: _data,
      error: (jqXHR) => {
        $('.js-search-list').wcSpin('hide');
        new Modal({
          title:'温馨提示',
          icon:'error',
          content: jqXHR.responseText
          }).show();
      }
    }).done((data)=>{
      $('.js-search-list').wcSpin('hide');
      new Modal({
        title:'温馨提示',
        icon:'success',
        content: '加入购物车成功！'
      }).show();
      target.closest('.tooltips').addClass('hide');
      target.closest('.product').removeClass('hovered');
    });
  }

  disableAttrs(container, attrs){
    for(let i=0; i<attrs.length; i++){
      let attr = container.find('[title="'+attrs[i]+'"]');      
      attr.css('border', '1px dashed #DDDDDD').css('cursor', 'default').attr('disabled',true);    
    }
  }

  enableAttrs(container, attrs){
    for(let i=0; i<attrs.length; i++){
      let attr = container.find('[title="'+attrs[i]+'"]');
      if(!attr.hasClass('selected')){
        attr.css('border', '1px solid #DDDDDD').css('cursor', 'pointer').attr('disabled', false);    
      }
    }
  }

  excepteIt(arr, special){
    let tempArr = [];
    for(let k=0; k<arr.length; k++){
      if(arr[k].attrVal != special){
        tempArr.push(arr[k].attrVal);
      }
    }
    return tempArr;
  }

  // 更新选中商品属性的样式
  selectedGoodsAttr(evt) {
    let item =  $(evt.currentTarget);
    item.toggleClass('selected');
    item.siblings().each(function(){   
      if($(this).hasClass('selected')){
        $(this).removeClass('selected');
      }
    });
    let text = item.val();
    let attrElms = item.closest('.addToCartForm');
    let dataStoreElem = attrElms.find('.sku-list');
    let skus = dataStoreElem.data('skulist');
    let stockMap = dataStoreElem.data('stockMap');
    let attrsArr = [];

    for(let i=0; i<skus.length; i++){
      for(let j=0; j<skus[i].attrs.length; j++){
        if(skus[i].attrs[j].attrVal == text){
          attrsArr = this.excepteIt(skus[i].attrs, text);
          if(stockMap[skus[i].id] === undefined || stockMap[skus[i].id] == 0){   // 无库存
            if(item.hasClass('selected')){
              this.disableAttrs(attrElms, attrsArr);
            }
            else{
              this.enableAttrs(attrElms, attrsArr);
            }
          }
          else {
            this.enableAttrs(attrElms, attrsArr);
          }
        }
      }
    }
  }

  // 只有一种sku属性时，根据库存信息，初始化sku样式
  initSkuInfo(target, skuInfo){
    let skus = skuInfo.skus.skus;
    let stockMap = skuInfo.stockMap;
    let attrElms = target.siblings('.addToCartForm');
    let attrsArr = [];
    for(let i=0; i<skus.length; i++){
      if(skus[i].attrs.length == 1){
        if(stockMap[skus[i].id] === undefined || stockMap[skus[i].id] == 0){  // 无库存
          attrsArr.push(skus[i].attrs[0].attrVal);
          this.disableAttrs(attrElms, attrsArr);
        }
      }
    }
  }

  // 显示加入购物车表单
  showAddToCartForm(evt) {
    let self = this;
    let item =  $(evt.currentTarget);
    let productId = item.parents('.product').data('id');
    let leafRegion = Cookie.getCookie('aid') || '330102';

    if(this.userType == "") {   // 用户未登录, 点击加入购物车按钮后，跳转到登录页面
      window.location.href = '/login';
      return;
    }

      $.ajax({
        url: '/api/zcy/items/findSkuAndStock?itemId=' + productId + '&leafRegion=' + leafRegion,
        type: 'GET'
      }).done((data)=>{
        if(data.result.skus.groupedSkuAttrs.length > 0){
          item.siblings('.addToCartForm').empty().append(addToCartForm(data));
          self.initSkuInfo(item, data.result);
          self.bindAddToCartEvent();
          item.siblings('.tooltips').removeClass('hide').slideDown('slow');
        }
        else {   // 商品无sku, 直接提交 加入购物车
          let skuId = data.result.skus.skus[0].id;
          let _data = "skuId=" + skuId + "&quantity=1";
          $('.js-search-list').wcSpin('large');

          $.ajax({
            async: false,
            url: "/api/zcy/carts",
            type: "PUT",
            data: _data,
            error: (jqXHR) => {
              $('.js-search-list').wcSpin('hide');
              new Modal({
                title:'温馨提示',
                icon:'error',
                content: jqXHR.responseText
                }).show();
            }
          }).done((data)=>{
            $('.js-search-list').wcSpin('hide');
            new Modal({
              title:'温馨提示',
              icon:'success',
              content: '加入购物车成功！'
            }).show();
          });
        }
      });
  }

  // 隐藏加入购物车表单
  hideAddToCartForm(evt) {
    let item =  $(evt.currentTarget);
    item.closest('.tooltips').addClass('hide');
    item.closest('.product').removeClass('hovered');
  }

  // 显示 加入购物车和对比菜单栏 + 请求可用采购计划数
  showOperationItem(evt) {
    let item =  $(evt.currentTarget);
    item.find('.addToCart').removeClass('disabled').attr('disabled', false);  // set to default
    if(this.userType === 2 || this.userType === 0){   // 供应商 或者 admin , 加入购物车按钮置灰
      item.find('.addToCart').addClass('disabled').attr('disabled', true);
    }
    item.find('.product-cart').removeClass('hide');

    // 请求 可用采购计划数
    //clearTimeout(this.timer);
    //this.timer = setTimeout(function(){
    //  let itemId = item.find('.js-compare-checkbox').data('itemid');
    //  $.ajax({
    //    url: "/api/zcy/search/item/hover?itemId=" + itemId,
    //    type: "GET",
    //    success: function(data) {
    //      if(data.ppalnCount > 0){
    //        item.find('.availablePlan span').text("该商品可用采购计划有" + data.ppalnCount + "个");
    //      } else{
    //        item.find('.availablePlan span').text("该商品无可用采购计划");
    //      }
    //      item.find('.availablePlan').removeClass('hide');
    //    },
    //    error: function(data) {
    //      new Modal({
    //        title:'温馨提示',
    //        icon:'info',
    //        content: data.responseText
    //      }).show();
    //    }
    //  });
    //}, 500);
  }

  // 隐藏 加入购物车和对比菜单栏
  hideOperationItem(evt) {
    let item =  $(evt.currentTarget);
    let productCart = item.find('.product-cart');
    let tooltips = item.find('.product-cart .tooltips');
    if(tooltips.hasClass('hide')){   // 还未点击加入购物车按钮
      productCart.addClass('hide');
    }
    else {
      item.addClass('hovered');
    }
    //item.find('.availablePlan').addClass('hide');
    //clearTimeout(this.timer);
  }

  changeCompare(leng, data) {
    $.each(data, (function(_this) {
      return function(i, d) {
        return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
      };
    })(this));
    if (leng >= 1) {
      $(".js-select-product").removeClass("hide");
      if (leng > 1) {
        return $(".select-function").removeClass("hide-mydefine");
      } else {
        return $(".select-function").addClass("hide-mydefine");
      }
    } else {
      $(".js-select-product").addClass("hide");
      return $(".select-function").addClass("hide-mydefine");
    }
  };

  // 商品对比
  compareCommon(data) {
    let i, itemIds, j, leng, ref, result;
    result = [];
    leng = data.length;
    itemIds = JSON.stringify(data);
    this.changeCompare(leng, data);
    for (i = j = ref = leng; ref <= 4 ? j < 4 : j > 4; i = ref <= 4 ? ++j : --j) {
      result.push(i + 1);
    }
    if (data.length > 0) {
      return $.ajax({
        url: "/api/zcy/compare/itemPropertyCompare",
        type: "GET",
        data: "itemIds=" + itemIds
      }).done((data)=>{
        data["result"] = result;
        $(".product-contrast-select .js-select").remove();
        $(".product-contrast-select .js-noselect").remove();
        return $(".product-contrast-select").append(itemCompareTemplate({
          data: data
        }));
      });
    }
  };

  // 同步商品对比信息
  asncGet() {
    return $.ajax({
      url: "/api/zcy/items/compare/getItemCompareIds",
      type: "GET",
      success: (function(_this) {
        return function(data) {
          _this.compareCommon(data);
          $('.js-compare-checkbox').removeClass('cancleCompare').find('.content').text('对比');
          $.each(data, function(i, d){
            $('#'+d).addClass('cancleCompare').find('.content').text('取消对比');
            $(".compare-checkbox[value='" + d + "']").prop("checked", true);
          });
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return new Modal({
            title: "温馨提示",
            icon: "info",
            content: "获取对比商品失败"
          }).show();
        };
      })(this)
    });
  };

  // 设置商品对比所需的ItemId
  setItemCompareId(evt, itemId) {
    return $.ajax({
    url: "/api/zcy/items/compare/setItemCompareId",
    type: "POST",
    data: {
      itemId: itemId
    },
    success: (function(_this) {
      return function(data) {
        if (data === false) {
          let target = $(evt.currentTarget);
          let itemId = target.data("itemid");
          $(".compare-checkbox[value='" + itemId + "']").prop("checked", false).parents("tr").removeClass("checked-style");
          $("#"+itemId).removeClass('cancleCompare').find('.content').text('对比');
          return;
        } else {
          $(".js-select-product.hide").removeClass("hide");
          return $.get("/api/zcy/items/compare/getItemCompareIds", function(el) {
            _this.compareCommon(el);
            return $.each(el, function(i, d) {
              return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
            });
          });
        }
      };
    })(this),
    error: (function(_this) {
      return function(data) {
        return new Modal({
          title: '温馨提示',
          icon: 'info',
          content: data.responseText
        }).show(function() {
              let target = $(evt.currentTarget)
              target.find('.content').text('对比');
              target.removeClass('cancleCompare');
              return target.prop("checked", false);
            });
      };
    })(this)
  });
  };

  // 切换视图模式
  changeViewMode(evt) {
    let $target, modeType;
    $target = $(evt.target);
    if($target.prop("tagName").toLowerCase() == "i"){
      $target = $target.parent();
    }
    modeType = $target.data('type');
    $target.addClass('active').siblings().removeClass('active');
    $.query = $.query.set('mode', modeType);
	  // 保留列表tr被选中状态
	  if(modeType == "list"){
		  $(".compare-checkbox:checked").each(function(){
			  $(this).parents("tr").addClass("checked-style")
		  })
	  };
    return $('.list').removeClass('view-thumb view-list').addClass('view-' + modeType);
  };

  removeSortActive($elem){
    if($elem.hasClass('active')){
      $elem.removeClass('active');
      $elem.find('i.active').each(function(){
        $(this).removeClass('active');
      });
    }
  }

  // 销量排序样式同步
  itemSellCssSync($target, sortCache) {
    $target.addClass('active');
    let triangleup = $target.find('.icon-triangleup');
    let trianglebottom = $target.find('.icon-trianglebottom');
    if(triangleup.hasClass('active')){    // 从高到低
      triangleup.removeClass('active');
      trianglebottom.addClass('active');
      sortCache[2] = 2;
    }
    else if(trianglebottom.hasClass('active')) {    // 从低到高
      trianglebottom.removeClass('active');
      triangleup.addClass('active');
      sortCache[2] = 1;
    }
    else {  // 第一次点击，默认从高到低
      trianglebottom.addClass('active');
      sortCache[2] = 2;
    }
    // 移除其他按钮的样式
    this.removeSortActive( $target.siblings('.js-item-price') );
    this.removeSortActive( $target.siblings('.js-item-news') );
  }

  // 最新排序样式同步
  itemNewsCssSync($target, sortCache) {
    let trianglebottom = $target.find('.icon-trianglebottom');
    if(trianglebottom.hasClass('active')){    //  不排序
      $target.removeClass('active');
      trianglebottom.removeClass('active');
      sortCache[3] = 0;
    }
    else {      // 从新到旧
      $target.addClass('active');
      trianglebottom.addClass('active');
      sortCache[3] = 2;
    }
    // 移除其他按钮的样式
    this.removeSortActive( $target.siblings('.js-item-sells') );
    this.removeSortActive( $target.siblings('.js-item-price') );
  }

  // 价格排序样式同步
  itemPriceCssSync($target, sortCache) {
    $target.addClass('active');
    let triangleup = $target.find('.icon-triangleup');
    let trianglebottom = $target.find('.icon-trianglebottom');
    if(triangleup.hasClass('active')){    // 从高到低
      triangleup.removeClass('active');
      trianglebottom.addClass('active');
      sortCache[0] = 2;
    }
    else if(trianglebottom.hasClass('active')) {    // 从低到高
      trianglebottom.removeClass('active');
      triangleup.addClass('active');
      sortCache[0] = 1;
    }
    else {  // 第一次点击，默认从低到高
      triangleup.addClass('active');
      sortCache[0] = 1;
    }
    // 移除其他按钮的样式
    this.removeSortActive( $target.siblings('.js-item-sells') );
    this.removeSortActive( $target.siblings('.js-item-news') );
  }

  // 按照 销量，最新，价格 排序
  /*  sort=0_0_2_0 -> 价格_库存_销量_更新时间
  * 0  不排序
    1  从低到高
    2  从高到低
  * */
  goodsSort(evt) {
    let self = this;
    let newParams = [],
        newSearch = "",
        currentParams = [],
        sortParams = "",
        sortCache = [0,0,0,0];

    newParams = self.getCurrentParams('sort');

    let $target = $(evt.currentTarget);
    if($target.hasClass('js-item-sells')){  // 销量
      let $targetCopy = $('.fix-nav-bar .js-item-sells');
      this.itemSellCssSync($targetCopy, sortCache);
      this.itemSellCssSync($target, sortCache);
    }
    if($target.hasClass('js-item-news')){   // 最新
      let $targetCopy = $('.fix-nav-bar .js-item-news');
      this.itemNewsCssSync($targetCopy, sortCache);
      this.itemNewsCssSync($target, sortCache);
    }
    if($target.hasClass('js-item-price')){  // 价格
      let $targetCopy = $('.fix-nav-bar .js-item-price');
      this.itemPriceCssSync($targetCopy, sortCache);
      this.itemPriceCssSync($target, sortCache);
    }

    sortParams = sortCache.join('_');
    newParams.push('sort=' + sortParams);
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "filter");
  };

  // 清空价格区间筛选
  cancelPriceFilter(evt){
    evt.stopPropagation();
    let newParams = [], currentParams = [], newSearch = "";
    let temp = this.pageType=='spu' ? this.spuSearch : this.search;
    $('.js-price-range input').each(function(){
      $(this).val('');
    });
    if(temp.length > 1){
      currentParams = temp.substr(1).split('&');
      currentParams.forEach(function(p){
        if( !(p.indexOf('pageNo=')>=0 || p.indexOf('p_f=')>=0 || p.indexOf('p_t=')>=0) )
          newParams.push(p);
      });
    }
    newSearch = '?' + newParams.join('&');
    // console.log(newSearch);
    this.getSearchData(newSearch, "filter");
  }

  // 价格区间筛选
  priceRangeFilter(evt) {
    evt.stopPropagation();
    let self = this;
    let temp = this.pageType=='spu' ? this.spuSearch : this.search;
    let newParams = [], currentParams = [], newSearch = "", p_f, p_t;
    evt.preventDefault();

    p_f = $(this.filterForm).find('input[name=p_f]').val();
    p_t = $(this.filterForm).find('input[name=p_t]').val();

    // 同步到fix-nav-bar上
    $('.fix-nav-bar input.p_f').val( $('.goods-search-list input.p_f').val().trim() );
    $('.fix-nav-bar input.p_t').val( $('.goods-search-list input.p_t').val().trim() );

    if( p_f!="" && p_t!=""){
      if(parseInt(p_f) <= parseInt(p_t)) {
        if(temp.length > 1){
          currentParams = temp.substr(1).split('&');
          currentParams.forEach(function(p){
            if( !(p.indexOf('pageNo=')>=0 || p.indexOf('p_f=')>=0 || p.indexOf('p_t=')>=0) )
              newParams.push(p);
          });
        }
        newParams.push('p_f=' + parseInt(p_f) *100);
        newParams.push('p_t=' + parseInt(p_t) *100);
        newSearch = '?' + newParams.join('&');
        this.getSearchData(newSearch, "filter");
      }
      else {
        new Modal({
          icon: "info",
          title:"温馨提示",
          content: "输入的价格区间有误！请重新输入"
        }).show();
      }
    }
    else {
      new Modal({
        icon: "info",
        title:"温馨提示",
        content: "请输入价格区间进行筛选！",
      }).show();
    }
  };

  // 仅显示有货 筛选
  hasGoodsFilter(evt){
    let hasGoods = $('.goods-search-list .js-has-goods').prop('checked');
    let newParams = [], newSearch = "";
    newParams = this.getCurrentParams('hasStock');
    if(hasGoods){
      newParams.push('hasStock='+ hasGoods.toString());
      $('.fix-nav-bar .js-has-goods').prop('checked', true);
    }
    else {
      $('.fix-nav-bar .js-has-goods').prop('checked', false);
    }
    newSearch = '?' + newParams.join('&');
    // console.log(newSearch);
    this.getSearchData(newSearch, "filter");
  }

  // 只看本区划 筛选
  onlyRegionFilter(evt) {
    let curDistrict = $('.goods-search-list .js-region').prop('checked');
    let newParams = [], newSearch = "";
    newParams = this.getCurrentParams('curDistrict');
    if(curDistrict){
      newParams.push('curDistrict='+ curDistrict.toString());
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "filter");
  }

  // 标签(仅显示有货,节能,环保) 筛选
  tagFilter(evt) {
    let self = this;
    let energy = $('.goods-search-list .js-energy').prop('checked')?1:0;
    let environ = $('.goods-search-list .js-environ').prop('checked')?1:0;
    let mfacture = $('.goods-search-list .js-mfacture').prop('checked')?1:0;

    let newParams = [], newSearch = "", tagsArr = [];
    newParams = this.getCurrentParams('tags');

    if(energy){
      tagsArr.push('energy:' + energy);
      $('.fix-nav-bar .js-energy').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-energy').prop('checked', false);
    }

    if(environ){
      tagsArr.push('environ:' + environ);
      $('.fix-nav-bar .js-environ').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-environ').prop('checked', false);
    }

    if(mfacture){
      tagsArr.push('mfacture:' + mfacture);
      $('.fix-nav-bar .js-mfacture').prop('checked', true);
    }else {
      $('.fix-nav-bar .js-mfacture').prop('checked', false);
    }

    if(tagsArr.length > 0){
      newParams.push('tags=' + tagsArr.join('_'));
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "filter");
  };

  // 添加奇偶行的显示
  renderListTable() {
    $('.discount-precent').each(function(index, item) {
      let discount;
      discount = 100 - parseFloat($(item).data('discount'));
      return $(item).text(discount + '%');
    });
    return $.each(this.viewModeTableTrs, function(index, tr) {
      return $(tr).addClass(index % 2 ? 'even' : 'odd');
    });
  };

  // 类别搜索： 按照品牌
  brandSelectorClick(evt) {
    let self = this;
    let bid, newParams = [], newSearch = "" ;
    let target = $(evt.currentTarget);
    bid = target.data("id");

    newParams = this.getCurrentParams('bids');

    if(bid != undefined ){
      newParams.push('bids=' + bid);
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 按照商品的其他选项 搜索
  attrSelectorHover(evt) {
    evt.preventDefault();
    let target = $(evt.currentTarget);

    if(target.hasClass('attr')) {
      let index = target.data('index');
      let attrBox = $('#attr-box'+index);

      target.siblings('.attr').each(function(){
        if($(this).hasClass('clicked')){
          $(this).removeClass('clicked');
          $(this).find('i').removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
        }
      });
      target.siblings('.otherAttrSearch').each(function(){
        if(! $(this).hasClass('hide')){
          $(this).addClass('hide');
        }
        $(this).find('.js-brand-cancel').trigger('click');
      });

      target.find('i').removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie');
      target.addClass('clicked');
      attrBox.removeClass('hide');
    }
  }

  hideAttrSelector(evt) {
    evt.preventDefault();
    let target = $(evt.currentTarget);
    $('.other-options').find('.icon-xiangshangzhedie').removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
    $('.attr').removeClass('clicked');
    $('.otherAttrSearch').addClass('hide');
  }

  // 按照可用采购计划 搜索
  plansSelectorClick(evt) {
    let self = this;
    let planId, newParams = [], newSearch = "";
    let target = $(evt.currentTarget);
    planId = target.data("id");
    newParams = this.getCurrentParams("pplanIds");
    if(planId != undefined){
      newParams.push('pplanIds=' + planId);
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  }

  //  商品其他选项属性 搜索
  propertySelectorClick(evt) {
    let self = this;
    let arrays = [], attr = "", attrs = "", currentParams = [], newParams = [], newSearch = "", p;
    let target = $(evt.currentTarget);
    let option = target.parents('.other-attr-box').find('.clicked').text().trim();
    if(this.search.length > 1){
      currentParams = this.search.substr(1).split('&');
      currentParams.forEach(function(p){
        if(p.indexOf("attrs=")>=0){
          attrs = p.split("=")[1];
        }
        if( !(p.indexOf('pageNo=')>=0 || p.indexOf('attrs=')>=0) )
          newParams.push(p);
      });
    }

    attr = target.data("attr");
    if(attrs != "") {
      arrays = attrs.split("_");
      arrays.push(option + ':' + attr);
      attrs = arrays.join("_");
    }
    else {
      attrs = option + ':' + attr;
    }

    newParams.push("attrs=" + attrs);
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  //cancelFilter() {
  //  return window.location.search = $.query.remove("p_f").remove("p_t").remove("pageNo");
  //};

  // 面包屑前台类目筛选
  breadFrontSelectorClick(evt) {
    let self = this;
    let currentParams = [], newParams = [], newSearch = "";
    newParams = this.getCurrentParams('fcid');
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 面包屑 公用取消 筛选
  breadSelectorClick(evt, typeName, idName) {
    let self = this;
    let shuzu = "", currentParams = [], newParams = [], newSearch = "";
    let target = $(evt.currentTarget);

    if(this.search.length > 1){
      currentParams = this.search.substr(1).split('&');
      currentParams.forEach(function(p){
        if(p.indexOf(typeName + '=')>=0){
          shuzu = p.split('=')[1].split('_');
        }
        if( !(p.indexOf('pageNo=')>=0 || p.indexOf(typeName + '=')>=0) )
          newParams.push(p);
      });
    }

    shuzu.splice($.inArray(target.data(idName), shuzu), 1);
    shuzu = shuzu.join('_');
    if(shuzu != ""){
      newParams.push(typeName + '=' + shuzu);
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  }

  // 面包屑品牌筛选
  breadBrandSelectorClick(evt) {
    this.breadSelectorClick(evt, "bids", "id");
  };

  // 面包屑 采购计划筛选
  breadPlanSelectorClick(evt) {
    this.breadSelectorClick(evt, "pplanIds", "id");
  }

  // 面包屑属性筛选
  breadPropertySelectorClick(evt) {
    this.breadSelectorClick(evt, "attrs", "selector");
  };

  // 面包屑后台类目筛选
  breadCategorySelectorClick(evt) {
    let self = this;
    let cid, fcid, topId;
    let target = $(evt.currentTarget);
    cid = target.data("id");
    topId = target.data('topId');

    let currentParams = [], newParams = [], newSearch = "";
    if(this.search.length > 1){
      let p, type="";
      currentParams = this.search.substr(1).split('&');
      currentParams.forEach(function(p){
        if(p.indexOf('type=')>=0) {
          type = p.split('=')[1];
        }
        if( !(p.indexOf('pageNo=')>=0 || p.indexOf('attrs=')>=0 || p.indexOf('fcid=')>=0 || p.indexOf('fcids=')>=0) )
          newParams.push(p);
      });
    }

    if (cid === 0) {   // 所有分类 cid == 0
      //fcid = (type === 'hall' || type === 'vaccine') ? topId || 0 : cid;
      fcid = cid;
      newParams.push('fcid=' + fcid);
    } else {
      newParams.push('fcids=' + cid);
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 面包屑采购目录筛选
  breadCatalogSelectorClick(evt) {
    let self = this;
    let currentParams = [], newParams = [], newSearch = "";
    if(this.search.length > 1){
      let p;
      currentParams = this.search.substr(1).split('&');
      currentParams.forEach(function(p){
        if( !(p.indexOf('catalogId=')>=0) )
          newParams.push(p);
      });
    }
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 商品类目筛选 单选
  categorySelectorClick(evt) {
    let self = this;
    let newParams = [], newSearch = "";
    let target = $(evt.currentTarget);
    newParams = this.getCurrentParams('fcids');
    newParams.push('fcids=' + target.attr("data-id"));
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 采购目录筛选
  catalogSelectorClick(evt) {
    let self = this;
    let newParams = [], newSearch = "";
    let target = $(evt.currentTarget);
    newParams = this.getCurrentParams('catalogId')
    newParams.push('catalogId=' + target.attr("data-id"));
    newSearch = '?' + newParams.join('&');
    this.getSearchData(newSearch, "category");
  };

  // 搜索结果打印
  printSearchResult(evt) {
    return window.open("/api/zcy/reports/search" + this.search);
  };

  // 显示/收起 筛选菜单栏
  filterToggle(evt) {
    let $target = $(evt.currentTarget);
    let $categoryNav = $('.category-nav');
    if($target.prop("tagName").toLowerCase() != "i"){
      $target = $target.find('i');
    }

    if($target.hasClass('icon-xiangxiazhedie')){   // 展开
      if($categoryNav.hasClass('hide')){
        $categoryNav.removeClass('hide');
      }
      $target.siblings('span').text('收起筛选');
      $target.removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie');
    }
    else {    // 收起
      if(!$categoryNav.hasClass('hide')){
        $categoryNav.addClass('hide');
      }
      $target.siblings('span').text('显示筛选');
      $target.removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
    }
  }

  // 品牌多选确认
  brandConfirm(evt) {
    let self = this;
    let bids, brands, thisDl;
    let target = $(evt.currentTarget);
    thisDl = target.closest("dl");
    brands = [];
    $.each($(".brand-dd", thisDl), function(i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        return brands.push($(dd).find("input:checked").val());
      }
    });
    if (brands.length === 0) {

    } else {
      bids = brands.join("_");

      let currentParams = [], newParams = [], newSearch = "";
      if(this.search.length > 1){
        let p;
        currentParams = this.search.substr(1).split('&');
        currentParams.forEach(function(p){
          if( !(p.indexOf('bid=')>=0) )
            newParams.push(p);
        });
      }
      newParams.push('bids=' + bids);
      newSearch = '?' + newParams.join('&');
      this.getSearchData(newSearch, "category");
    }
  };

  // 属性多选确认
  attrsConfirm(evt) {
    let self = this;
    let attrname = "", attrs = [];
    let target = $(evt.currentTarget);
    let parent = target.closest('.attr-list');
    attrname = target.closest('.other-attr-box').find('.clicked').text().trim();
    $.each($(".attr-dd", parent), function(i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        return attrs.push(attrname + ":" + $(dd).find("input:checked").val());
      }
    });
    if (attrs.length === 0) {
    } else {
      attrs = attrs.join("_");

      let currentParams = [], newParams = [], newSearch = "";
      if(this.search.length > 1){
        let p;
        currentParams = this.search.substr(1).split('&');
        currentParams.forEach(function(p){
          if( !(p.indexOf('attr=')>=0) )
            newParams.push(p);
        });
      }
      newParams.push('attrs=' + attrs);
      newSearch = '?' + newParams.join('&');
      this.getSearchData(newSearch, "category");
      //console.log(newSearch);
    }
  };

  // 后台类目多选确认
  categoryConfirm(evt) {
    let self = this;
    let fcids, thisDl;
    let target = $(evt.currentTarget);
    thisDl = target.closest("dl");
    fcids = [];
    $.each($(".category-dd", thisDl), function(i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        return fcids.push($(dd).find("input:checked").val());
      }
    });
    if (fcids.length === 0) {

    } else {
      fcids = fcids.join("_");

      let currentParams = [], newParams = [], newSearch = "";
      if(this.search.length > 1){
        let p;
        currentParams = this.search.substr(1).split('&');
        currentParams.forEach(function(p){
          if( !(p.indexOf('fcids=')>=0) )
            newParams.push(p);
        });
      }
      newParams.push('fcids=' + fcids);
      newSearch = '?' + newParams.join('&');
      this.getSearchData(newSearch, "category");
    }
  };

  // 采购计划多选确认
  planConfirm(evt) {
    let self = this;
    let pplanIds, plans, thisDl;
    let target = $(evt.currentTarget);
    thisDl = target.closest("dl");
    plans = [];
    $.each($(".plan-dd", thisDl), function (i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        return plans.push($(dd).find("input:checked").val());
      }
    });
    if (plans.length === 0) {

    } else {
      pplanIds = plans.join("_");
      let currentParams = [], newParams = [], newSearch = "";
      if (this.search.length > 1) {
        let p;
        currentParams = this.search.substr(1).split('&');
        currentParams.forEach(function (p) {
          if (!(p.indexOf('pplanIds=')>=0))
            newParams.push(p);
        });
      }
      newParams.push('pplanIds=' + pplanIds);
      newSearch = '?' + newParams.join('&');
      this.getSearchData(newSearch, "category");
    }
  }

  // 多选
  electsBrands(evt) {
    let $self, thisDl;
    $self = $(evt.currentTarget);
    $self.addClass("hide");
    thisDl = $self.closest("dl");
    $.each($("dd", thisDl), function(i, dd) {
      $(dd).find(".selector").addClass("hide");
      $(dd).find("label").removeClass("hide");
    });
    thisDl.find(".brand-buttons").removeClass("hide");
    thisDl.find('.js-brand-confirm').prop('disabled',true);
    $self.parent('.otherAttrSearch').find('.js-attrs-confirm').prop('disabled',true);
    let listmoreHeight = thisDl.find(".list-more").css("height", "100%").height();
    thisDl.find(".title").css("height", (listmoreHeight+57)+"px");
    thisDl.find(".js-more").text("收起");
    thisDl.find(".js-more").siblings("i").removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie");
  };

  // 品牌多选取消
  brandCancel(evt) {
    let thisDl;
    thisDl = $(evt.currentTarget).closest("dl");
    thisDl.find(".more-options").removeClass("hide");
    this.cancel(thisDl);
    thisDl.find(".js-more").trigger("click");
  };

  // 多选取消公用方法
  cancel(thisDl) {
    //thisDl.find(".js-elects").removeClass("hide");
    thisDl.find('dt').css("height", "initial");
    $.each($(".dd-cancel", thisDl), function(i, dd) {
      $(dd).find("input").prop("checked", false);
      $(dd).find(".selector").removeClass("hide");
      $(dd).find("label").addClass("hide");
    });
    //thisDl.find(".list-more").removeClass("active");
    return thisDl.find(".brand-buttons").addClass("hide");
  };

  // 更多 公用方法
  categoriesMore(evt) {
    let currentTarget = $(evt.currentTarget),
        parentdl = currentTarget.closest("dl");
    if (currentTarget.find('a').text() == "收起") {
      if(parentdl.find('.brand-buttons').length > 0){
	      parentdl.find(".more-options").removeClass("hide");
	      this.cancel(parentdl);
      }
      parentdl.find(".list-more").css("height", "28px");
      parentdl.find("dt").css("height", "41px");
      currentTarget.find('a').text("更多");
      currentTarget.find(".icon-zcy").removeClass("icon-xiangshangzhedie").addClass("icon-xiangxiazhedie");
      return;
    } else {
      let listmoreHeight = parentdl.find(".list-more").css("height", "100%").height();
      parentdl.find("dt").css("height", (listmoreHeight+12)+"px");
      currentTarget.find('a').text("收起");
      currentTarget.find(".icon-zcy").removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie");
      return;
    }
  };

  // 商品对比选择商品
  itemSelectId(evt) {
    let target = $(evt.currentTarget);
    let itemId = target.data("itemid");
    let flag = false;
    if(target.get(0).tagName == "SPAN" && !target.hasClass("cancleCompare")) {
      flag = true
    }
    if(target.get(0).tagName == "INPUT" && target.prop('checked')) {
      flag = true;
    }
    if (flag) {    // 对比
        $(".compare-checkbox[value='" + itemId + "']").prop('checked', true).parents("tr").addClass("checked-style");   // 保留列表tr被选中状态
        $("#"+itemId).addClass('cancleCompare').find('.content').text('取消对比');
        this.setItemCompareId(evt, itemId);
    } else {        // 取消对比
        $(".compare-checkbox[value='" + itemId + "']").prop('checked', false).parents("tr").removeClass("checked-style");
        $("#"+itemId).removeClass('cancleCompare').find('.content').text('对比');
        this.cancelItemCompareId(itemId);
    }
  }

  // 取消商品对比的item
  cancelItemCompareId(itemId) {
    return $.ajax({
      url: "/api/zcy/items/compare/cancelItemCompareId",
      type: "POST",
      data: {
        itemId: itemId
      },
      success: (function(_this) {
        return function(data) {
          //$(".compare-checkbox").prop("checked", false);
          return $.get("/api/zcy/items/compare/getItemCompareIds", function(el) {
            _this.compareCommon(el);
            return $.each(el, function(i, d) {
              return $(".compare-checkbox[value='" + d + "']").prop("checked", true);
            });
          });
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.responseText
          }).show(function() {
                return $(evt.currentTarget).prop("checked", false);
              });
        };
      })(this)
    });
  };

  // hover删除对比商品
  deletelItemCompareId(evt) {
    let itemId;
    itemId = $(evt.currentTarget).closest(".product-contrast-li").data("id");
    $('#'+itemId).removeClass('cancleCompare').find('.content').text('对比');
    $(".compare-checkbox[value='" + itemId + "']").prop("checked", false);
    $(".compare-checkbox[value='" + itemId + "']").closest('tr').removeClass('checked-style');
    return this.cancelItemCompareId(itemId);
  };

  // 商品对比按钮
  btnCompare() {
    let itemIds;
    itemIds = _.map($(".js-select-product:not(.hide) .js-select"), (function(_this) {
      return function(i) {
        return $(i).data("id");
      };
    })(this));
    return location.href = "/buyer/compare-item?itemIds=[" + itemIds + "]";
  };
  // 关闭商品对比栏
  compareClose() {
    return $(".js-select-product").addClass("hide");
  };

  // 清空待对比的商品
  productEmpty() {
    return $.ajax({
      url: "/api/zcy/items/compare/discardAllCompareItem",
      type: "GET",
      success: function(data) {
        GoodsList.prototype.asncGet();
        $(".compare-checkbox").closest('tr').removeClass('checked-style');
        return $(".compare-checkbox").prop("checked", false);
      },
      error: function(data) {
        new Modal({
        title:'温馨提示',
        icon:'info',
        content: data.responseText
        }).show();
      }
    });
  };

}

module.exports = GoodsList

