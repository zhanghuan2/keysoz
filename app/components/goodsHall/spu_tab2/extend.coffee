commentListTemplate = Handlebars.templates["goodsHall/spu_tab2/templates/user-description"]
supplier = Handlebars.templates["goodsHall/spu_tab2/templates/supplier"]
dealRecordTpl = Handlebars.templates["goodsHall/spu_tab2/templates/dealrecord-list"]
Pagination = require "pokeball/components/pagination"
Cookie = require("common/cookie/view")
class Tab
  constructor: ($) ->
    goodsId = jQuery.query.get('goodsId')
    itemId = jQuery.query.get('itemId')
    sellerId = jQuery.query.get('sellerId')
    if !goodsId or !itemId or !sellerId
      return
    @$tab = @$el
    @$commentList = $(".comments-ul")
    @selectStar = "input[name='star']"
    @jsExpandAddEvaluation = ".js-expand-add-evaluation"
    @jsHideAddEvaluation = ".js-hide-add-evaluation"
    @$navRole = $("""li[data-role="nav"]""")
    @jsMoreParams = $('.js-more-params')
    @jsgysSearch=".gysSearch"
    @jsgysReset=".gysReset"
    @bindEvent()


  bindEvent: ->
    $("#address").zcyDistrict().data('zcyDistrict').setValue(Cookie.getCookie("districtCode"));
    $(".spu-tab").on "change", @selectStar, @selectChange
    $(document).on "click", @jsExpandAddEvaluation, @expandAddEvaluation
    $(document).on "click", @jsHideAddEvaluation, @hideAddEvaluation
    @renderComment()
    # 供应商 点击搜索
    $(document).on "click", @jsgysSearch, () =>@renderSupplier()
    # 比较 点击比较
    $(".mBj").on "click", @bjFn
    # 比较 商品的change事件
    $(".mCheckbox").on "change", @bjspChange
    # 点击重置
    $(document).on "click",@jsgysReset,() =>@renderSupplier(1,true)
    #供应商初始化
    @renderSupplier()
    #成交记录初始化
    @renderDealRecord()
    @spuTabs = @$tab.tab()
    @jsMoreParams.on 'click', @toMoreParams
    @$navRole.on "click", @tabRefresh

  tabRefresh: (evt)=>
    $self = $(evt.currentTarget)
    setTimeout (evt) =>
      index = @$navRole.index($self)
      @$tab.find(".tab-content:eq(#{index})").hide().show()
    , 10

  #渲染评论
  renderComment: (pageNo)=>
    pageNo = pageNo || 1
    pageSize = 20
    beginScore = $(".comments-ul").data("beginscore")
    endScore = $(".comments-ul").data("endscore")
    hasContent =  $(".comments-ul").data("hascontent")
    hasAppend = $(".comments-ul").data("hasappend")
    hasAppend = null if hasAppend == undefined
    hasContent = null if hasContent == undefined
    itemId = $(".tab-navs").data("item")
    $.ajax
      url: "/api/credit/evaluate/getMoreItemEvaluateDetail"
      type: "GET"
      data: {itemId, pageNo, pageSize, beginScore, endScore, hasContent, hasAppend}
      success:(data)=>
        $(".list-comment").hide().html(commentListTemplate({data:data})).show()
        $(".list-comment .js-comment-image").viewer({navbar: false})
        @initAgreeDu()
        new Pagination(".list-comment .pagination").total($(".user-description").data("total")).show pageSize,
          current_page: pageNo - 1
          callback: (pageNo)=>
            @renderComment pageNo + 1


  #渲染供应商列表
  renderSupplier: (pageNo,flage)=>
    pageNo = pageNo || 1
    pageSize = 10
    goodsId=$.query.get("goodsId")
    if !flage
      distIdTry= $("#address").data('zcyDistrict').getDistrictId()||""
      verticalDistId = Cookie.getCookie("districtCode")||""
      distIdTry&&(distId=distIdTry)
    else
      ## 有空的在组件里加个方法可好 ^(￥-￥)^
      $("#address").data('zcyDistrict').district={city:{code:"",id:"",text:""},province:{code:"",id:"",text:""},region:{code:"",id:"",text:""}}
      $("#address").data('zcyDistrict').generator()
    
    $.ajax
      url: "/api/zcy/queryAgreeDealerInfos"
      type: "GET"
      data: {goodsId, pageNo, pageSize, distId, verticalDistId}
      success:(data)=>
        $(".L_supplierList").hide().html(supplier({_DATA3_:data})).show()
        Pagination = require "pokeball/components/pagination"
        new Pagination(".L_supplierList .pagination").total($(".L_supplierList").find(".pagination").data("total")).show pageSize,
          current_page: pageNo - 1
          callback: (pageNo)=>
            @renderSupplier pageNo + 1

  #渲染成交记录列表
  renderDealRecord: (pageNo)=>
    pageNo = pageNo || 1
    pageSize = 10
    protocolId=$.query.get("goodsId")

    $.ajax
      url: $('#lasvegasPath').val()+"/finance/api/protocol/hall/pagingHallProtocolDeal?protocolId="+protocolId + "&pageNo=" + pageNo + "&pageSize=" + pageSize
      type: "get"
      dataType:'jsonp'
      processData: false
      ##data: {protocolId, pageNo, pageSize}
      success:(data)=>
        $.each(data.data,(i,v)=>
          v.dealTime=new Date(v.dealTime).getTime();
          v.dealPrice=v.dealPrice.toFixed(2);
          v.totalPrice = parseFloat(v.dealPrice * v.dealQuantity).toFixed(2);
        )
        $(".js-dealrecord-list").hide().html(dealRecordTpl(data)).show()
        new Pagination(".js-dealrecord .js-pagination").total(data.total||0).show pageSize,
          current_page: pageNo - 1
          callback: (pageNo)=>
            @renderDealRecord pageNo + 1

  selectChange: =>
    hasContent = null
    hasAppend = null
    beginScore = 0
    endScore = 100
    if $("#four-five").is(":checked")
      beginScore = 80
      endScore = 100
    if $("#three").is(":checked")
      beginScore = 40
      endScore = 79
    if $("#two-one").is(":checked")
      beginScore = 0
      endScore = 39
    if $("#all").is(":checked")
      beginScore = 0
      endScore = 100
    hasContent = true if $("#content").is(":checked")
    hasAppend = true if $("#add").is(":checked")
    $(".comments-ul").data("beginscore","#{beginScore}")
    $(".comments-ul").data("endscore","#{endScore}")
    $(".comments-ul").data("hascontent","#{hasContent}")
    $(".comments-ul").data("hasappend","#{hasAppend}")
    @renderComment()


  #比较tab 比较的点击事件
  bjFn:(event) =>
    checke = $(event.target).parents(".pb-box").find("input:checked");
    checkLength = $(event.target).parents(".pb-box").find("input:checked").length;
    
    if checkLength > 0 and checkLength < 4
      arr = []
      arr2 = []
      arr.push $.query.get("itemId")
      arr2.push $.query.get("goodsId")
      checke.each () -> 
        arr.push (+ $(this).val())
        arr2.push (+ $(this).attr("data-mgoodsid"))
      location.href = "/hall/compare?itemIds=" + JSON.stringify(arr) + "&goodIds=" + JSON.stringify(arr2)
  #比较tab 商品的change事件
  bjspChange:(event) =>
    checkLength = $(event.target).parents(".pb-box").find("input:checked").length
    # 如果不符合筛选条件 不选中
    if (checkLength>3)
      event.target.checked = false
    if checkLength > 0
      $(event.target).parents(".pb-box").find(".mBj").css("border","1px solid #1eb6f8")
    else
      $(event.target).parents(".pb-box").find(".mBj").css("border","1px solid #bbb")

  toMoreParams: =>
    switchable = @spuTabs.data().switchable
    switchable && switchable.to(1)

  initAgreeDu: ->
    gradeHide = $(".tip-grade").text()
    grade = gradeHide/20
    position = grade/5*425
    realPosition = parseInt(grade)/5*425
    lastPosition = parseInt(position - realPosition)
    for po in [0..parseInt(grade)]
      color = 0.2 + po/10*2
      $(".bar-show-li").eq(parseInt(grade)).css "width", "#{lastPosition}"
      $(".bar-show-li").eq(po).css "background-color","#ff7300"
      $(".bar-show-li").eq(po).css "opacity","#{color}"
    $(".tip-grade").css("left",position - 15)
    $(".arrow-down").css("left",position - 4)

  expandAddEvaluation: ->
    $(@).siblings(".item-add-evaluation").removeClass("expand-add-evaluation")
    $(@).addClass("hide").siblings("i").removeClass("hide")

  hideAddEvaluation: ->
    $(@).siblings(".item-add-evaluation").addClass("expand-add-evaluation")
    $(@).addClass("hide").siblings("i").removeClass("hide")

module.exports = Tab
