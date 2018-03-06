Tip = require "common/tip_and_alert/view"
Language = require "locale/locale"

class SellerShopDesign
  constructor: ->
    @$el.find(".js-shop-site-init").click (evt) ->
      evt.preventDefault()
      $.ajax
        type: "POST"
        url: "/api/design/shop-sites/init"
        success: ->
          window.location.reload()
    @$el.find(".js-shop-site-create").click (evt) ->
      evt.preventDefault()
      $.ajax
        type: "POST"
        url: "/api/design/shop-sites/init"
        data:
          layout: $(@).data("layout")
          app: $(@).data("app")
        success: ->
          window.location.reload()

    $(document).on "shop-site:active", (evt, siteId) ->
      $.ajax
        type: "POST"
        url: "/api/design/shop-sites/#{siteId}/active"
        success: ->
          window.location.reload()
    $(document).on "shop-site:release", (evt, siteId) ->
      $.ajax
        type: "POST"
        url: "/api/design/sites/#{siteId}/release"
        success: ->
          new Tip({parent: $("body"), type: "success", "title": "#{Language.publishSuccessfully}", message: "#{Language.effectNeedTime}"}).alert()
          left = $(window).width() / 2 - $(".alert").width() / 2
          top = $(window).height() / 2 - $(".alert").height() / 2
          $(".alert").css("left", left).css("top", top)

module.exports = SellerShopDesign
