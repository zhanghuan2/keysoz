###
  商品主搜组件
  author by terminus.io (zl)
###
Tip = require "common/tip_and_alert/view"
Language = require "locale/locale"
itemCompareTemplates = Handlebars.templates["tax-hall/search/templates/item-compare"]
Modal = require "pokeball/components/modal"

class TaxItemsList
  constructor: ($) ->
    @totalItems = $(".pagination").data("total")
    @totalSold = $(".js-sold-status")
    @filterForm = $(".filter-form")
    @propertySelector = $(".js-property-selector")
    @breadFrontSelector = $(".js-bread-front-selector")
    @breadPropertySelector = $(".js-bread-property-selector")
    @breadCategorySelector = $(".js-bread-category-selector")
    @breadBrandSelect = $(".js-bread-brand-selector")
    @categorySelector = $(".js-category-selector")
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
    @$iconZcy = $(".js-more").next(".icon-zcy")
    @$jsSelecorMore = $('#js-selector-more')
    @jsCancelProperty = $(".bread-selector")
    #列表切换
    @list_style=$(".listStyle")
    @table_style=$(".tableStyle")
    #商品对比小组件
    @selectItemId = $(".compare-checkbox")
    @jsDelete = $(".js-select")
    @compareBtn = ".anon-contrast"
    @closeCompare = ".close-compare"
    @emptyProduct = ".empty-product"
    @isUser = $(".current-location-dark").data("user")
    @jsDelectSelected = ".js-delect-selected"
    @bindEvent()
    @initSaleFt()
    @init()
    #排序
    @sort_brand()
    #有效期 selec
    @initMselect()
  that = this
  PaginationClass = require "pokeball/components/pagination"

  initMselect: ->
    $('.zcy-pagination .selectric-items').css('height','')

    if $.query.get('q') or $.query.get('p_f') or $.query.get('p_t')
      type = true
    else
      type = false
    noData = $('.noData')
    if noData.text().trim()
      text = if type then '没有找到您想要查询的商品' else '该目录非当年有效'
      noData.text text

    $("[name='tab']").on "change", () =>
      window.location.search=$.query.set("tab",$("[name='tab']").val())
      
  bindEvent: ->
    that = this
    @setSort()
    #pagination = new PaginationClass(".pagination").total(@totalItems).show($(".pagination").data("size"),{num_display_entries: 5, jump_switch: true, maxPage: -1, page_size_switch: true});
    @filterForm.validator
      isErrorOnParent: true
    @totalSold.on "click", @totalSoldFilter
    @filterForm.on "submit", @filterFormSubmit
    @propertySelector.on "click", @propertySelectorClick
    @brandSelector.on "click", @brandSelectorClick
    @breadPropertySelector.on "click", @breadPropertySelectorClick
    @breadCategorySelector.on "click", @breadCategorySelectorClick
    @breadBrandSelect.on "click", @breadBrandSelectorClick
    @categorySelector.on "click", @categorySelectorClick
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
    @$iconZcy.on "click",()=>@$jsMore.trigger("click")
    @$jsSelecorMore.on "click", (evt)=> @selectorMore(evt)
    @jsCancelProperty.on "click", @cancelBreadProperty
    #列表切换
    @list_style.on "click", @list_stylechange
    @table_style.on "click", @table_stylechange
    #商品对比
    @selectItemId.on "change", (evt) =>@itemSelectId(evt)
    @jsDelete.on "click", @delectSelectProduct
    @jsDelete.on "mouseleave",@delectHide
    $(@closeCompare).on "click",@compareClose
    $(@emptyProduct).on "click",@productEmpty
    $(@compareBtn).on "click",@btnCompare
    $(document).on "click",@jsDelectSelected,(evt) =>@deletelItemCompareId(evt)
  #列表切换
  list_stylechange: ->
    $(".list_style").removeClass("hide")
    $(".table_style").addClass("hide")
    window.location.search=$.query.set("showType","img")
  table_stylechange: ->
    $(".table_style").removeClass("hide")
    $(".list_style").addClass("hide")
    window.location.search=$.query.remove("showType")
  #提交价格区间筛选
  filterFormSubmit: (evt)->
    evt.preventDefault()
    pf = $(@).find('input[name=p_f]').val() *100
    pt = $(@).find('input[name=p_t]').val() *100
    if not pf
      pf = ""
    if not pt
      pt = ""
    window.location.search = $.query.set("p_f", pf).set("p_t", pt).remove("pageNo").toString()

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
    queryParams = $.query.remove("attrs").remove("fcid").remove("pageNo").remove("fcids").remove("nodeId").remove("bids")
    if cid == 0
     # window.location.search = queryParams.set("fcid", cid).toString()
      window.location.search = queryParams.set("nodeId", cid).toString()
    else if cid == undefined
      window.location.search = $.query.remove("attrs").remove("fcid").remove("pageNo").remove("fcids").remove("nodeId").remove("bids").toString()
    else
      #window.location.search = queryParams.set("fcids", cid).toString()
      window.location.search = queryParams.set("nodeId", cid).toString()

  categorySelectorClick: ->
    window.location.search = $.query.set("fcids", $(this).attr("data-id")).remove("pageNo").toString()

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
      if sort== "2"
        $(".js-item-sort i").addClass("icon-arrowdown12").removeClass("icon-barrowdown12")
      if sort == "3"
        $(".icon-barrowdown12").addClass("icon-arrowdown12").removeClass("icon-barrowdown12")
      if sort == "4"
        $(".icon-triangle-mt-slctd").css("border-bottom-color","#65DB00")
      if sort == "5"
        $(".icon-triangle-md-slctd").css("border-top-color","#65DB00")
  #排序
  sort_brand: ->
    $(".js-item-sort-brand").on "click", () ->
      window.location.search=$.query.set("sort", "0_0_3_0").remove("pageNo").toString()
    $(".js-item-sort-price").on "click", () ->
        sorts = $.query.get("sort")
        sort = sorts.split("_")[2]
        if sort == "4"
          window.location.search=$.query.set("sort", "0_0_5_0").remove("pageNo").toString()
        else
          window.location.search=$.query.set("sort", "0_0_4_0").remove("pageNo").toString()
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
    window.location.search = $.query.set("sort", sort).remove("pageNo").toString()

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
        # $(".compare-checkbox").prop("checked",false)
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
    itemIds = _.map($(".js-select-product:not(.hide) .js-select"), (i) => $(i).data("item"))
    ids = _.map($(".js-select-product:not(.hide) .js-select"), (j) => $(j).data("id"))
    location.href = "/hall/compare?itemIds=[#{itemIds}]&goodIds=[#{ids}]"

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
        url: "/api/zcy/goodsHall/compareGoods",
        type: "GET",
        data: "goodIds=#{itemIds}",
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
        TaxItemsList::asncGet()
        $(".compare-checkbox").prop("checked",false)
      error: (data)->

module.exports = TaxItemsList
