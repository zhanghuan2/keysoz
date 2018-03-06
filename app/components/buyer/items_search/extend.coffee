###
  商品主搜组件
  author by terminus.io (zl)
###
Tip = require "common/tip_and_alert/view"
Language = require "locale/locale"
itemCompareTemplates = Handlebars.templates["buyer/items_search/templates/item-compare"]
Modal = require "pokeball/components/modal"
class ItemsList
  constructor: ($) ->
    @totalItems = $(".items-total").data("total")
    @totalSold = $(".js-sold-status")
    @filterForm = $(".filter-form")
    @propertySelector = $(".js-property-selector")
    @breadFrontSelector = $(".js-bread-front-selector")
    @breadPropertySelector = $(".js-bread-property-selector")
    @breadCategorySelector = $(".js-bread-category-selector")
    @breadBrandSelect = $(".js-bread-brand-selector")
    @breadCatalogSelector = $(".js-bread-catalog-selector")
    @categorySelector = $(".js-category-selector")
    @catalogSelector = $(".js-catalogs-selector")
    @brandSelector = $(".js-brand-selector")
    @$jsPrintSearchPrint = $(".js-print-search-result");
    @itemSortButton = $(".js-item-sort")
    @cancelFilterButton = $("#js-cancel-filter")
    @$addCart = $(".add-cart")
    @$jsElects = $(".js-elects")
    @$jsBrandConfirm = $(".js-brand-confirm")
    @$jsAttrsConfirm = $(".js-attrs-confirm")
    @$jsCategoryConfirm = $(".js-category-confirm")
    @$jsBrandCancel = $(".js-brand-cancel")
    @$jsMore = $(".js-more")
    @$jsSelecorMore = $('#js-selector-more')
    @jsCancelProperty = $(".bread-selector")
    #商品对比小组件
    @selectItemId = $(".compare-checkbox")
    @jsDelete = $(".js-select")
    @compareBtn = ".anon-contrast"
    @closeCompare = ".close-compare"
    @emptyProduct = ".empty-product"
    @isUser = $(".current-location-dark").data("user")
    @jsDelectSelected = ".js-delect-selected"
    #视图模式切换
    @viewModeType = $('.view-mode-type')
    @list = $('.list')
    @viewModeTableTrs = $('.view-mode-list tbody tr')

    @bindEvent()
    @initSaleFt()
    @init()
    @renderListTable()
  that = this
  PaginationClass = require "pokeball/components/pagination"
  bindEvent: ->
    that = this
    @setSort()
    pagination = new PaginationClass(".pagination").total(@totalItems).show($(".pagination").data("size"),{num_display_entries: 5, jump_switch: true, maxPage: -1, page_size_switch: true});
    @filterForm.validator
      isErrorOnParent: true
    @totalSold.on "click", @totalSoldFilter
    @filterForm.on "submit", (evt) => @filterFormSubmit(evt)
    @propertySelector.on "click", @propertySelectorClick
    @brandSelector.on "click", @brandSelectorClick
    @breadPropertySelector.on "click", @breadPropertySelectorClick
    @breadCategorySelector.on "click", @breadCategorySelectorClick
    @breadBrandSelect.on "click", @breadBrandSelectorClick
    @breadCatalogSelector.on "click", @breadCatalogSelectorClick
    @categorySelector.on "click", @categorySelectorClick
    @catalogSelector.on "click", @catalogSelectorClick
    @$jsPrintSearchPrint.on "click", @printSearchResult
    @itemSortButton.on "click", @itemSortClick
    @cancelFilterButton.on "click", @cancelFilter
    @breadFrontSelector.on "click", @breadFrontSelectorClick
    @$jsElects.on "click", @electsBrands
    @$jsBrandConfirm.on "click", @brandConfirm
    @$jsAttrsConfirm.on "click", @attrsConfirm
    @$jsCategoryConfirm.on "click",@categoryConfirm
    @$jsBrandCancel.on "click", (evt)=>@brandCancel(evt)
    @$jsMore.on "click", (evt)=>@categoriesMore(evt)
    @$jsSelecorMore.on "click", (evt)=> @selectorMore(evt)
    @jsCancelProperty.on "click", @cancelBreadProperty
    #商品对比
    @selectItemId.on "change", (evt) =>@itemSelectId(evt)
    @jsDelete.on "click", @delectSelectProduct
    @jsDelete.on "mouseleave",@delectHide
    $(@closeCompare).on "click",@compareClose
    $(@emptyProduct).on "click",@productEmpty
    $(@compareBtn).on "click",@btnCompare
    $(document).on "click",@jsDelectSelected,(evt) =>@deletelItemCompareId(evt)
    #试图模式切换
    @viewModeType.on "click", @changeViewMode
    @autoSubmit()
  #提交价格区间筛选
  filterFormSubmit: (evt)->
    evt.preventDefault()
    pf = $(@filterForm).find('input[name=p_f]').val() *100
    pt = $(@filterForm).find('input[name=p_t]').val() *100
    ene = $(@filterForm).find(".ene").is(":checked");
    env = $(@filterForm).find(".env").is(":checked");
    wat = $(@filterForm).find(".wat").is(":checked");
    qumf = $(@filterForm).find(".qumf").is(":checked");
    tag = $.query.get("tags");
    if not pf
      if $(@filterForm).find('input[name=p_f]').val()==0
         pf = 0
      else pf=""

    if not pt
      if $(@filterForm).find('input[name=p_t]').val()==0
        pt = 0
      else pt=""

    tempArr = [];
    if tag.indexOf("lzh") > -1
      tempArr.push("lzh:1");
    if tag.indexOf("pzb") > -1
      tempArr.push("pzb:1");
    if tag.indexOf("stt") > -1
      tempArr.push("stt:1");
    if ene
      tempArr.push("energy:1");
    if env
      tempArr.push("environ:1");
    if qumf
      tempArr.push("mfacture:1");
    tagsJson =  tempArr.join("_");

    search = window.location.search
    newParams = []
    if search.length > 1
      params = search.substr(1).split('&')
      for p in params
        if !(p.startsWith('pageNo=') || p.startsWith('p_f=') || p.startsWith('p_t=') || p.startsWith('tags='))
          newParams.push(p)
    newParams.push('p_f='+ pf)
    newParams.push('p_t='+ pt)
    if tempArr.length > 0
      newParams.push('tags='+ tagsJson)
    newSearch = '?' + newParams.join('&')
    window.location.search = newSearch

  autoSubmit: () ->
    tags = $.query.get('tags');
    tags.indexOf("energy")>-1 and $(@$el).find(".ene").attr('checked', true)
    tags.indexOf("environ")>-1 and $(@$el).find(".env").attr('checked', true)
    tags.indexOf("mfacture")>-1 and $(@$el).find(".qumf").attr('checked', true)
    $('.ene,.env,.wat,.qumf').on 'change', (evt) => @filterFormSubmit(evt)

  # 添加奇偶行的显示
  renderListTable: () ->
    $('.discount-precent').each (index, item) ->
      discount = 100 - parseFloat($(item).data('discount'))
      $(item).text(discount + '%')
    $.each @viewModeTableTrs, (index, tr) ->
      $(tr).addClass(if index % 2 then 'even' else 'odd')

  changeViewMode: (evt) =>
    $target = $(evt.target)
    modeType = $target.data('type')
    $target.addClass('active').siblings().removeClass('active')
    $.query = $.query.set('mode', modeType)
    #先删除所有模式class，然后添加新的
    @list.removeClass('view-thumb view-list').addClass('view-' + modeType)

  #设置品牌筛选
  brandSelectorClick: ->
    bid = $(@).data("id")
    window.location.search = $.query.set("bids", bid).remove("pageNo").toString()

  # 设置属性
  propertySelectorClick: ->
    attrs = undefined
    if attrs = "" + $.query.get("attrs")
      arrays = attrs.split("_")
      arrays.push($(@).closest(".attr-list").siblings("dt").text()+$(this).data("attr"))
      attrs = arrays.join("_")
    else
      attrs = $(@).closest(".attr-list").siblings("dt").text()+$(this).data("attr")
    window.location.search = $.query.set("attrs", attrs.replace("true", "")).remove("pageNo").toString()

  #取消价格筛选
  cancelFilter: ->
    window.location.search = $.query.remove("p_f").remove("p_t").remove("pageNo")

  #面包屑前台类目筛选
  breadFrontSelectorClick: ->
    window.location.search = $.query.remove("fcid").remove("pageNo")

  #面包屑品牌筛选
  breadBrandSelectorClick: ->
    shu = JSON.stringify($.query.get("bids"))
    if shu.indexOf("_") < 0
      bids = ""
    else
      bids = $.query.get("bids").split("_")
      bid = $(@).data("id")
      bids.splice($.inArray("#{bid}",bids),1)
      bids = bids.join("_")
    window.location.search = $.query.set("bids",bids).remove("pageNo").toString()

  #面包屑属性筛选
  breadPropertySelectorClick: ->
    shuzu = $.query.get("attrs").split("_")
    shuzu.splice($.inArray($(@).data("selector"),shuzu),1)
    window.location.search = $.query.set("attrs",shuzu.join("_")).remove("pageNo").toString()

  #面包屑后台类目筛选
  breadCategorySelectorClick: ->
    cid = $(this).data("id")
    topId = $(this).data('topId')
    queryParams = $.query.remove("attrs").remove("fcid").remove("pageNo").remove("fcids")
    if cid == 0
      # 如果是特定id，则跳转到特定id
      fcid = if ($.query.get('type') is 'hall' || $.query.get('type') is 'vaccine') then (topId || 0) else cid
      window.location.search = queryParams.set("fcid", fcid).toString()
    else
      window.location.search = queryParams.set("fcids", cid).toString()

  #面包屑采购目录筛选
  breadCatalogSelectorClick: ->
    selectedCatalog = JSON.stringify($.query.get("catalogId"))
    window.location.search = $.query.remove("catalogId");

  #类目筛选
  categorySelectorClick: ->
    window.location.search = $.query.set("fcids", $(this).attr("data-id")).remove("pageNo").toString()

  #采购目录筛选
  catalogSelectorClick: ->
    window.location.search = $.query.set("catalogId", $(this).attr("data-id")).remove("pageNo").toString()

  printSearchResult: ->
    params = $.query.toString()
    window.location.href = "/api/zcy/reports/search" + params

  #价格库存销量上架时间组合筛选
  setSort: ->
    if sorts = $.query.get("sort")
      sort = sorts.split("_")[2]
      if sort == "0"
        className =
        $(".js-item-sort i").addClass("icon-barrowdown12").removeClass("icon-arrowdown12")
      else
        $(".js-item-sort i").addClass("icon-arrowdown12").removeClass("icon-barrowdown12")

  #组合筛选
  itemSortClick: ->
    sortCache = [0,0,0,0]
    if $(@).find("i").hasClass("icon-barrowdown12")
      $(@).find("i").removeClass().addClass "icon-arrowdown12"
    else if $(@).find("i").hasClass("icon-arrowdown12")
      $(@).find("i").removeClass().addClass "icon-barrowdown12"
    if $(@).find("i").hasClass("icon-arrowdown12")
      sort = 2
    else
      sort = 0
    sortCache[2] = sort
    sort = sortCache.join("_")

    search = window.location.search
    newParams = []
    if search.length > 1
      params = search.substr(1).split('&')
      for p in params
        if !(p.startsWith('pageNo=') || p.startsWith('sort='))
          newParams.push(p)
    newParams.push('sort='+ sort)
    newSearch = '?' + newParams.join('&')
    window.location.search = newSearch

  #多选
  electsBrands: (evt)=>
    $self = $(evt.currentTarget)
    $self.addClass("hide")
    thisDl = $self.closest("dl")
    $.each $("dd", thisDl), (i, dd)->
      $(dd).find("label").show().siblings("a").hide()
    thisDl.find(".brand-buttons").show()
    $(".js-more", thisDl).trigger("click")

  selectorMore: (evt)=>
    rowSize = 5
    $dls = $('.category-nav dl')
    rowSize < $dls.length && $.each $dls, (index, dl) =>
      if index > rowSize - 1
        if $(dl).is(":visible") then $(dl).hide() else $(dl).show()
    $smWrap = $('#js-selector-more .sm-wrap')
    if $smWrap.hasClass('opened')
      $smWrap.removeClass('opened')
      $smWrap.find('.sm-text').text('更多选项')
      $smWrap.find('i').removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie')
    else
      $smWrap.addClass('opened')
      $smWrap.find('.sm-text').text('收起')
      $smWrap.find('i').removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie')

  #品牌多选确认
  brandConfirm: ->
    thisDl = $(@).closest("dl")
    brands = []
    $.each $(".brand-dd", thisDl), (i, dd)->
      if $(dd).find("input:checked").length > 0
        brands.push $(dd).find("input:checked").val()
    if brands.length is 0
      # new Tip({parent: thisDl.find(".brand-list"), direct: "up", type: "tip", message: "请至少选择一个品牌", top: 40, left: 0, width: 140}).tip()
    else
      bids = brands.join("_")
      window.location.search = $.query.set("bids", bids).remove("bid").toString()

  #属性多选确认
  attrsConfirm: ->
    thisDl = $(@).closest("dl")
    attrname = $(thisDl).find("dt").text()
    attrs = $.query.get("attrs").split("_")
    $.each $(".attr-dd", thisDl), (i, dd)->
      if $(dd).find("input:checked").length > 0
        attrs.push (attrname + $(dd).find("input:checked").val())
    if attrs.length is 0

    else
      attrs = attrs.join("_")
      window.location.search = $.query.set("attrs",attrs).remove("attr").toString()

  #后台类目多选确认
  categoryConfirm: ->
    thisDl = $(@).closest("dl")
    fcids = []
    $.each $(".category-dd", thisDl), (i, dd)->
      if $(dd).find("input:checked").length > 0
        fcids.push $(dd).find("input:checked").val()
    if fcids.length is 0

    else
      fcids = fcids.join("_")
      window.location.search = $.query.set("fcids",fcids).toString()

  #品牌多选取消
  brandCancel:(evt) ->
    thisDl = $(evt.currentTarget).closest("dl")
    @cancel(thisDl)
    thisDl.find(".js-more").trigger("click")

  #取消的共同方法
  cancel:(thisDl) ->
    thisDl.find(".js-elects").removeClass("hide")
    thisDl.find(".list-more").css("height","32px")
    $.each $(".dd-cancel", thisDl), (i, dd)->
      $(dd).find("input").prop("checked", false)
      $(dd).find("label").hide().siblings("a").show()
    thisDl.find(".list-more").removeClass("active")
    thisDl.find(".brand-buttons").hide()

  #更多
  categoriesMore:(evt) ->
    if $(evt.currentTarget).text() is "#{Language.pack}"
      $(evt.currentTarget).closest("dl").find(".list-more").css("height","32px")
      $(evt.currentTarget).text("#{Language.more}")
      $(evt.currentTarget).siblings(".icon-zcy").removeClass("icon-xiangshangzhedie").addClass("icon-xiangxiazhedie")
      thisDl = $(evt.currentTarget).closest("dl")
      @cancel(thisDl)
    else
      $(evt.currentTarget).closest("dl").find(".list-more").css("height","100%")
      $(evt.currentTarget).text("#{Language.pack}")
      $(evt.currentTarget).siblings(".icon-zcy").removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie")

  #初始化已填价格
  initSaleFt: ->
    if ($('input[name=p_f]').val() is "")
      $('input[name=p_f]').val("")
    else $('input[name=p_f]').val($('input[name=p_f]').val()/100)
    if ($('input[name=p_t]').val() is "")
      $('input[name=p_t]').val("")
    else $('input[name=p_t]').val($('input[name=p_t]').val()/100)

    if !jQuery.query.get("normal")
       $(".jsQualityLabel").removeClass("hide")

  #商品对比
  init: =>
    @asncGet()

  #商品对比选择商品
  itemSelectId:(evt) ->
    itemId = $(evt.currentTarget).data("itemid")
    if($(evt.currentTarget).prop("checked"))
      @setItemCompareId(evt,itemId)
    else
      @cancelItemCompareId(itemId)

  #设置商品对比所需的ItemId
  setItemCompareId: (evt,itemId) =>
    $.ajax
      url: "/api/zcy/items/compare/setItemCompareId",
      type: "POST",
      data: {itemId},
      success:(data)=>
        if data is false
          $(evt.currentTarget).prop("checked", false)
        else
          $(".js-select-product.hide").removeClass("hide")
          $.get "/api/zcy/items/compare/getItemCompareIds", (el)=>
            @compareCommon(el)
            $.each el, (i, d)=>
              $(".compare-checkbox[value='#{d}']").prop("checked",true)
      error:(data)=>
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: data.responseText
        }).show(()=>$(evt.currentTarget).prop("checked",false))


  #取消商品对比的item
  cancelItemCompareId: (itemId)->
    $.ajax
      url: "/api/zcy/items/compare/cancelItemCompareId",
      type: "POST",
      data: {itemId},
      success:(data) =>
        $(".compare-checkbox").prop("checked",false)
        $.get "/api/zcy/items/compare/getItemCompareIds", (el)=>
          @compareCommon(el)
          $.each el, (i, d)=>
            $(".compare-checkbox[value='#{d}']").prop("checked",true)
      error:(data) =>
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: data.responseText
        }).show(()=>$(evt.currentTarget).prop("checked",false))

  #hover删除对比商品
  deletelItemCompareId: (evt)->
    itemId = $(evt.currentTarget).closest(".product-contrast-li").data("id")
    @cancelItemCompareId(itemId)

  changeCompare:(leng,data) ->
    $.each data, (i, d)=>
      $(".compare-checkbox[value='#{d}']").prop("checked",true)
    if(leng >=1)
      $(".js-select-product").removeClass("hide")
      if(leng>1)
       $(".select-function").removeClass("hide-mydefine")
      else $(".select-function").addClass("hide-mydefine")
    else
      $(".js-select-product").addClass("hide")
      $(".select-function").addClass("hide-mydefine")

  btnCompare: ->
    itemIds = _.map($(".js-select-product:not(.hide) .js-select"), (i) => $(i).data("id"))
    location.href = "/buyer/compare-item?itemIds=[#{itemIds}]"

  asncGet: =>
    $.ajax
      url: "/api/zcy/items/compare/getItemCompareIds",
      type: "GET",
      success:(data)=>
        @compareCommon(data)
      error: (data) =>
        new Modal({
          title: "温馨提示",
          icon: "info",
          content: "获取对比商品失败"
        }).show()

  compareCommon: (data)=>
    result = []
    leng = data.length
    itemIds = JSON.stringify(data)
    @changeCompare(leng,data)
    for i in [leng...4]
      result.push(i+1)
    if(data.length > 0)
      $.ajax
        url: "/api/zcy/compare/itemPropertyCompare",
        type: "GET",
        data: "itemIds=#{itemIds}",
        success: (data)=>
          data["result"] = result
          $(".product-contrast-select .js-select").remove()
          $(".product-contrast-select .js-noselect").remove()
          $(".product-contrast-select .inner-content").after(itemCompareTemplates({data:data}))
        error: (data)=>

  #关闭商品对比小组件
  compareClose: ->
    $(".js-select-product").addClass("hide")

  #清空待对比的商品
  productEmpty: ->
    $.ajax
      url: "/api/zcy/items/compare/discardAllCompareItem"
      type: "GET"
      success: (data)->
        ItemsList::asncGet()
        $(".compare-checkbox").prop("checked",false)
      error: (data)->

module.exports = ItemsList
