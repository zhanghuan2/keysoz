class ShopCart
  constructor: ($) ->
    @$userCartCount = $("#js-cart-count")
    @bindEvent()

  bindEvent: () ->
    @setCartCount()

  setCartCount: () ->
    vm = this
    url =  $('.count-query-url').val()
    if !url
      tags = $('.shop-cart-tags').val()
      try
        tags = JSON.parse(tags)
      catch e
        console.log(e)
      if tags && tags.blocktrade
        url = "/api/zcy/block/cart/count"
      else
        url = "/api/zcy/carts/count"
    $.ajax
      url: url
      type: "GET"
      success: (data) ->
        vm.$userCartCount.text(data || 0) if vm.$userCartCount
      error: ->
        vm.$userCartCount.text(0) if vm.$userCartCount

module.exports = ShopCart