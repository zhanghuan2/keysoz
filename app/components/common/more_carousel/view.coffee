class Carousel

  constructor: ->
    @timeOut
    @index = 0
    @carousel = @$el
    @carouselPrevBtn = @carousel.find(".prev")
    @carouselNextBtn = @carousel.find(".next")
    @carouselContainer = $(".carousel-container", @carousel)
    @config = _.extend {
      length: 1
      size: 1
      type: 1
      screen: 1
      auto: false
      time: 3000
    }, @carouselContainer.data()
    @carouselPagination = $(".carousel-pagination", @carousel)
    @bindEvent()

  bindEvent: ->
    @init()

  init: =>
    if !@carouselContainer.length or !@carouselContainer.children().length or @config.size <= @config.length
      return false
    else
      @carouselPrevBtn.show()
      @carouselNextBtn.show()
    @carouselPrevBtn.on "click", @carouselPrev
    @carouselNextBtn.on "click", @carouselNext
    @carousel.on "mouseenter", @carouselClear
    @carousel.on "mouseleave", @carouselAuto
    @winWidth = if @config.type
      @carousel.width()
    else
      style = @carouselContainer.children()[0].style || {}
      width = style.width
      if width and width.indexOf("px") isnt -1 and width.indexOf(".") isnt -1
        parseFloat(width) + parseFloat(style.marginRight)
      else
        @carouselContainer.children().outerWidth(true)
    @config.size = @carouselContainer.children().length
    @config.screen = Math.ceil(@config.size / @config.length)
    @config.size = @config.screen if @config.type
    @carouselInit()

  carouselInit: =>
    clone = @carouselContainer.children().clone()
    @carouselContainer.append(clone.clone()).append clone
    @carouselAuto() if @config.auto

  carouselAuto: =>
    if @config.auto
      @carouselClear()
      @timeOut = setTimeout =>
        @carouselIt "left"
      , @config.time || 3000

  carouselClear: (event) =>
    clearTimeout @timeOut

  carouselNext: (event) =>
    @carouselClear()
    @carouselIt "left"

  carouselPrev: (event) =>
    @carouselClear()
    @carouselIt "right"

  carouselIt: (panStatus) =>
    @carouselContainer.stop()
    if panStatus is "left"
      @index++
    else if panStatus is "right"
      if 0 >= @index
        @index = @config.size + @config.type  - 1
        @carouselContainer.css {"margin-left": - @winWidth * @index}
      @index--
    @carouselContainer.animate {"margin-left": - @winWidth * @index}, 400, =>
      if panStatus is "left" && @config.size <= @index - @config.type  + 1
        @index = 0
        @carouselContainer.css {"margin-left": 0}
      @carouselPagin()
      @carouselAuto() if @config.auto

  carouselPagin: =>
    if @carouselPagination.length
      index = @index
      if @carouselPagination.children().length is index
        index = 0
      @carouselPagination.find(":eq(" + index + ")").addClass("active").siblings().removeClass("active")

module.exports = Carousel
