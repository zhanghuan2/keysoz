commentListTemplate = Handlebars.templates["shop_decoration/spu_tab/templates/user-description"]
dealRecordTemplate = Handlebars.templates["shop_decoration/spu_tab/templates/deal-record"]
Pagination = require "pokeball/components/pagination"

class Tab
  constructor: ($) ->
    @$tab = @$el
    @$commentList = $(".comments-ul")
    @selectStar = "input[name='star']"
    @jsExpandAddEvaluation = ".js-expand-add-evaluation"
    @jsHideAddEvaluation = ".js-hide-add-evaluation"
    @$navRole = $("""li[data-role="nav"]""")
    @jsMoreParams = $('.js-more-params')
    @jsRecordList = $(".js-record-list")
    @bindEvent()

  bindEvent: ->
    $(".spu-tab").on "change", @selectStar, @selectChange
    $(document).on "click", @jsExpandAddEvaluation, @expandAddEvaluation
    $(document).on "click", @jsHideAddEvaluation, @hideAddEvaluation
    @renderOtherAttrs()
    @renderComment()
    @renderDealRecord()
    @spuTabs = @$tab.tab()
    @jsMoreParams.on('click', @toMoreParams)
    @$navRole.on("click", @tabRefresh)

  tabRefresh: (evt)=>
    $self = $(evt.currentTarget)
    setTimeout (evt) =>
      index = @$navRole.index($self)
      @$tab.find(".tab-content:eq(#{index})").hide().show()
    , 10


  #渲染商品详情规格参数
  renderOtherAttrs: =>
    $otherAttrTable = $('.js-other-attributes-box').find('table')
    $tr = $otherAttrTable.find('tr')
    $th = $otherAttrTable.find('th')
    $compositeTr = $otherAttrTable.find('.composite-tr')
    $multi = $otherAttrTable.find('.multi-td')
    if $compositeTr.length>0
      for n in $tr
        if (!$(n).hasClass('composite-tr'))
          $(n).find('.main-parameter').prop('colspan',2)

      for m in $th
        $(m).prop('colspan',3)

    if $multi.length>0
      for multiTd in $multi
        tdText = $(multiTd).text().replace('#',',')
        $(multiTd).text(tdText)

#渲染成交记录
  renderDealRecord:(pageNo)=>
    pageNo = pageNo || 1
    pageSize = 10
    itemId = $(".tab-navs").data("item")
    $.ajax
      url : "/api/zcy/items/dealRecord?pageNo="+pageNo+"&pageSize="+pageSize+"&itemId="+itemId
      type: "get"
      success:(res) =>
        @jsRecordList.empty().append(dealRecordTemplate(DATA:res))
        $.each(res.data,(i,n) =>
          str = ""
          if n.skuAttrMap
            $.each(n.skuAttrMap,(h,k) =>
              str += "<p>"+h+" : "+k+"</p>"
            )
          $(".js-record-list tr").eq(i).find(".sku-attr").html(str)
        )
        new Pagination(".js-pagination .pagination").total(res.total).show pageSize,
          current_page: pageNo - 1
          callback: (pageNo)=>
            @renderDealRecord pageNo + 1
      error: (res)=>

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
      error: (data)=>

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
