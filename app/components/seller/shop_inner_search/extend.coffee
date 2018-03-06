class ShopInnerSearch
  constructor: ($)->
    @$searchForm = $(".shop-search-form")
    @$inputQ = $("input[name=sq]")
    @$inputPF = $("input[name=p_f]")
    @$inputPT = $("input[name=p_t]")
    @bindEvent()

  bindEvent: ->
    @$searchForm.on "submit", @linkTOShopItems

  linkTOShopItems: (evt)=>
    evt.preventDefault()
    data = @$searchForm.serializeObject()
    data.p_f *= 100 if data.p_f
    data.p_t *= 100 if data.p_t
    query = _.without(_.map(data, (v, k) =>
      if v isnt "" then "#{k}=#{v}" else ""
    ), "")

    window.location.href = "/eevees/shop?#{encodeURI(query.join('&'))}"

module.exports = ShopInnerSearch
