class Carousel
  constructor: ($)->
    @$carousel = $(".carousel")
    @interval = parseInt(@$carousel.data("interval"))
    
    colors = @$carousel.data('colors')
    @colors = colors && colors.split(',') || []
    @bgParent = @getBgParent()
    @bindEvent()

  bindEvent: ->
    @bgParent.css('backgroundColor', @colors[0])
    @$carousel.carousel
      interval: @interval
      before: (activeIndex) =>
        if activeIndex + 1 is @colors.length
          color = @colors[0]
        else
          color = @colors[activeIndex + 1]
        color && @bgParent.css('backgroundColor', color)

  getBgParent: ->
    rowSize = parseInt(@$carousel.data('rowSize'))
    return @$carousel if !rowSize

    $parent = @$carousel.closest('.eevee-grids')
    # [1..rowSize-1].forEach -> $parent = $parent.parents('.eevee-grids')
    $parent
module.exports = Carousel
