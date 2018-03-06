Cookie = require "common/cookie/view"

class NavHeader
  constructor: ($)->
    @target = @$el
    @$category = $(".category-li")
    @categoryList = $(".js-category-list")
    @navBarItemLi = $(".navbar-item")
    @$allCategoryShow = $(".home-channel-container")
    @listHeight = @categoryList.height() - 1
    $(".expand-category").css("min-height", @listHeight + "px")
    @setActive()
    @bindEvent()

  that = this

  bindEvent: ->
    that = this
    if @checkIsIndex()
      @setMinHeight()
    else
      @$allCategoryShow.on "mouseenter", @showCategory
      @$allCategoryShow.on "mouseleave", @hideCategory
    @setImagesHeight()
    @navBarItemLi.on "click", @navBarClick
    @target.on "mouseenter", ".category-li", @overCategory
    @target.on "mouseleave", ".category-li", @outCategory

  checkIsIndex: ->
    currentHost = window.location.hostname
    currentPath = window.location.pathname
    districtCode = Cookie.getCookie "districtCode"
    targetHosts = /^https?:\/\/(.*)$/.exec(@target.find(".navbar-collapse").data("href"))
    # hostname 相同并且 path 是 / 或者 /index 或者 /区划编码
    if targetHosts and targetHosts[1] is currentHost and (currentPath is "/" or currentPath is "/index" or currentPath is "/"+districtCode)
      return true
    false

  showCategory: (evt)=>
    #evt.stopPropagation()
    $(evt.currentTarget).find(".home-channel").addClass("active")
    @setMinHeight()

  hideCategory: (evt)=>
    $(evt.currentTarget).find(".home-channel").removeClass("active")

  overCategory: (evt)=>
    evt.stopPropagation()
    $(evt.currentTarget).find(".expand-panel").removeClass("disappear")
    @setRelativeIndex(evt.currentTarget)
    $(evt.currentTarget).find("img.lazy").lazyload
      effect: "fadeIn"
      skip_invisible : false
    .removeClass("lazy")

  outCategory: (evt)=>
    evt.stopPropagation()
    $(evt.currentTarget).find(".expand-panel").addClass("disappear")

  setMinHeight: ->
    _.each @$category, (categoryLi)->
      height = $(categoryLi).height()
      $(categoryLi).find(".attach").css("height", height)

  setRelativeIndex: (category)=>
    panel = $(category).find(".expand-category")
    attach = $(category).find(".attach")
    categoryHeight = @categoryList.height()
    categoryTop = @categoryList.offset().top
    parentHeight = @target.height()
    parentTop = @target.offset().top + parentHeight - $(window).scrollTop()

    if $(window).scrollTop() > categoryTop
      panelMinHeight = categoryHeight + categoryTop - $(window).scrollTop()
      panelTop = $(attach).offset().top - $(window).scrollTop()
    else
      panelMinHeight = categoryHeight
      panelTop = $(attach).offset().top - parentTop - $(window).scrollTop()
    $(panel).css("top", - panelTop).css("min-height", panelMinHeight)

  setImagesHeight: ->
    @target.find(".home-channel").removeClass("disappear")
    _.each @$category, (categoryLi)->
      height = $(categoryLi).find(".expand-panel").removeClass("disappear").find(".expand-category").css("visibility", "hidden").height()
      if height > $(categoryLi).find(".image-recommend").height()
        $(categoryLi).find(".image-recommend").css("height", height)
      $(categoryLi).find(".expand-panel").addClass("disappear").find(".expand-category").css("visibility", "visible")
    @target.find(".home-channel").addClass("disappear") unless @checkIsIndex()

  regExp: (regs, type)->
    status = true
    $.each @navBarItemLi, (i, d)->
      href = $(@).find("a").attr "href"
      if type is 0
        reg = regs
        str = href
      else
        reg = href
        str = regs
      re = new RegExp(".*#{reg}.*")
      if re.test(str)
        $(".nav-header li").removeClass("active")
        $(@).closest("li").addClass("active")
        if type is 0
          status = false
        return false
    status

  setActive: ->
    hostname = window.location.hostname
    pathName = window.location.pathname
    url = window.location.href
    status = true
    if pathName isnt "/"
      status = @regExp(pathName, 0)
    if status
      @regExp(url, 1)

  navBarClick: ->
    $(".nav-header li").removeClass("active")
    $(@).closest("li").addClass("active")

module.exports = NavHeader
