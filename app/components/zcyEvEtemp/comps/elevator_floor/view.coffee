###
  楼层电梯对应楼层组件
  auther by terminus.io (zl)
###

class Elevator
  constructor: ($)->
    @thisModule = @$el
    @$elevatorLi = $(".elevator .elevator-li")
    @$jumpTop = $(".jump-top")
    @$floorItem = $(".js-floor-item")
    @designMode = @$floorItem.data("design")
    @bindEvent()

  bindEvent: ->
    $(window).on "scroll", @bodyScroll
    @$elevatorLi.on "click", @jumpToFloor
    @$jumpTop.on "click", @jumpTop


  ###
    滚动条滚动
  ###
  bodyScroll: (evt)=>
    #判断是否为装修模型
    flag = $(".elevator").data('design')
    if !(flag == 1)
      windowTop = $(window).scrollTop()
      @changeElevatorActive(windowTop)
      $.each $(".item-list[data-rendered=0]"), (i, list)->
        listTop = $(list).offset().top
        if listTop < (windowTop + $(window).height())
          FloorItems::renderItems(list, windowTop)

  ###
    滚动式电梯组件改变选中项
  ###
  changeElevatorActive: (windowTop)=>
    windowTop = windowTop + $(window).height() / 2 + 40
    $.each @$elevatorLi, (i, li)->
      target = $(li).data("target")
      top = $(target).offset().top
      height = $(target).height()
      if top <= windowTop && windowTop <= (top + height)
        $(li).addClass("active").siblings("li").removeClass("active")

  ###
    点击电梯跳转至相应DIV
  ###
  jumpToFloor: (evt)=>
    target = $(evt.currentTarget).data("target")
    jumpTop = $(target).offset().top - $(window).height() / 2 + 40
    $('html, body').animate({scrollTop: jumpTop})

  #跳至页头
  jumpTop: ->
    $('html, body').animate({scrollTop: "0px"})

module.exports = Elevator
