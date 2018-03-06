addressUnits = require "extras/address_units"
Modal = require "pokeball/components/modal"
provinceTemplate = Handlebars.partials["seller/delivery_templates/templates/_province_list"]
cityTemplate = Handlebars.templates["seller/delivery_templates/templates/city_list"]
regionTemplate = Handlebars.templates["seller/delivery_templates/templates/region_list"]
areaShowTemplate = Handlebars.templates["seller/delivery_templates/templates/area_show"]
deliveryItemTemplate = Handlebars.templates["seller/delivery_templates/templates/template_item"]

# to do
# 优化实现，现在这个太丑了

class Delivery
  constructor: ($)->
    @cityUnits = addressUnits.cityUnits
    @provinceUnits = addressUnits.provinceUnits
    #@regionUnits = addressUnits.regionUnits
    # @deliveryList = $(".js-delivery-list")
    # @showArea = $(".js-areas-show")
    # @saveArea = $(".js-save-area")
    @jsTemplateList = $("#js-template-list")
    @jsNewTemplate = $("#js-new-template")
    @bindEvents()

  bindEvents: ->
    @getProvince()
    @$el.on "click", ".js-edit-template", @editTemplate
    $(document).on "confirm:delete-delivery-template", @deleteTemplate
    $(document).on "click", ".js-delete-template", @deleteNewTemplate
    @jsNewTemplate.on "click", @addTemplate
    @$el.on "click", ".js-city-list", @getCity
    @$el.on "change", ".js-select-province-item", @checkProvince
    @$el.on "click", ".js-region-list", @getRegion
    @$el.on "change", ".js-select-city-item", @checkCity
    @$el.on "change", ".js-select-region-item", @checkRegion
    @$el.on "click", ".js-pack-list", @packageList
    @$el.on "change", ".js-check-all", @checkAllProvince
    @$el.on "click", ".js-save-template", @submitRegion

  setCheckbox: (el, checked) =>
    switch checked
      when "checked"
        $(el).attr("indeterminate", false).prop "checked": true, "indeterminate": false
      when "indeterminate"
        $(el).attr("indeterminate", true).prop "checked": false, "indeterminate": true
      when "unchecked"
        $(el).attr("indeterminate", false).prop "checked": false, "indeterminate": false
      else
        $(el).attr("indeterminate", false).prop "checked": false, "indeterminate": false

  deleteTemplate: (evt, id)=>
    $.ajax
      url: "/api/deliverTemplate/deleteDeliveryTemplate"
      type: "POST"
      data: {templateId: id}
      success: ->
        $(".js-template-item[data-id=#{id}]").remove()

  deleteNewTemplate: (evt) =>
    new Modal
      icon: "warning"
      isConfirm: true
      title: "确认删除此模板吗"
      content: "此模板还未保存，确认删除吗？"
    .show =>
      $(evt.currentTarget).closest(".js-template-item").remove()

  editTemplate: (evt)=>
    template = $(evt.currentTarget).closest(".js-template-item")
    template.find(".js-template-container").addClass("active")
    provinces = template.data("address")
    data = $.extend(true, [], @provinces)
    _.each data, (i) ->
      _.each provinces, (j) ->
        if j.province and (i.id is j.province.id)
          i.address = j
          i.check = if j.province.selectAll then "checked" else "indeterminate"

    unless template.find(".js-delivery-list").length
      template.append(provinceTemplate({provinces: data}))
      @setCheckbox($("input:checkbox[indeterminate=true]"), "indeterminate")

  getProvince: =>
    $.ajax
      url: "/api/address/provinces"
      type: "GET"
      success: (data) =>
        @provinces = @dealProvince(data, @provinceUnits)

  dealProvince: (data, units)=>
    _.map data, (i) =>
      _.each units, (j) ->
        reg = new RegExp(j)
        if i.name.length > 2 and reg.test i.name
          map = new RegExp("(.*)#{j}")
          i.name = i.name.match(map)[1]
      i

  addTemplate: =>
    if @provinces
      @jsTemplateList.prepend(deliveryItemTemplate({provinces: @provinces}))
    else
      new Modal
        icon: "info"
        title: "请稍后"
        content: "正在准备数据，请稍后"
      .show()

  ###
   * 获取某个省下的所有城市
  ###
  getCity: (evt)=>
    li = $(evt.currentTarget).closest("li")
    id = li.data("id")
    if li.hasClass("selected")
      li.removeClass("selected")
      return
    li.addClass("selected").siblings().removeClass "selected"
    unless li.find(".city-list").length
      $.ajax
        type: "GET"
        url: "/api/address/#{id}/children"
        success: (cities)=>
          @closeSelectList("other", ".freight-select-city")
          checkedAddress = []
          indeterminateAddress = []
          if li.data("address")
            cityData = li.data("address").cities
            _.each cityData, (i) =>
              if i.city.selectAll
                checkedAddress.push i.city.id.toString()
              else
                indeterminateAddress.push i.city.id.toString()

          data = _.map cities, (i)=>
            _.each @cityUnits, (j) ->
              reg = new RegExp(j)
              if i.name.length > 2 and reg.test i.name
                map = new RegExp("(.*)#{j}")
                i.name = i.name.match(map)[1]
              i.check = "checked" if (_.contains checkedAddress, i.id.toString()) or li.find(".js-select-province-item").prop "checked"
              if (_.contains indeterminateAddress, i.id.toString())
                i.check = "indeterminate"
                i.count = _.filter(cityData, (k) -> k if k.city.id.toString() is i.id.toString())[0].regions.length
            i
          count = (_.filter(data, (i)-> if i.checked then i)).length
          li.find(".js-city-count").text("(#{count})") if count
          li.append cityTemplate {data, provinceId: id}
          @setCheckbox($("input:checkbox[indeterminate=true]"), "indeterminate")

  ###
   * 获取某个市下面的所有区
  ###
  getRegion: (evt)=>
    li = $(evt.currentTarget).closest("li")
    province = $(evt.currentTarget).closest(".province-li").data("address")
    container = if li.hasClass("js-line-end") then li else li.nextAll(".js-line-end")[0]
    id = li.data("id")

    if li.hasClass("selected")
      li.removeClass("selected")
      $(container).next().remove()
      return
    li.addClass("selected").siblings().removeClass "selected"
    unless li.find(".city-list").length
      $.ajax
        type: "GET"
        url: "/api/address/#{id}/children"
        success: (regions)=>
          @closeSelectList("other", ".freight-select-city")
          if province and province.cities
            city = _.filter(province.cities, (i) => i if i.city.id.toString() is id.toString() )
            address = _.map(city[0].regions, (i) => i.id.toString()) if city[0]
            # console.log province, city
          data = _.map regions, (i)=>
            #_.each @regionUnits, (j) ->
            #  reg = new RegExp(j)
            #  if i.name.length > 2 and reg.test i.name
            #    map = new RegExp("(.*)#{j}")
            #    i.name = i.name.match(map)[1]
            i.checked = true if (_.contains address, i.id.toString()) or (li.find(".js-select-province-item").prop "checked") or (li.find(".js-select-city-item").prop "checked")
            i
          count = (_.filter(data, (i)-> if i.checked then i)).length
          li.find(".js-city-count").text("(#{count})") if count

          $(container).after regionTemplate {data, cityId: id}

  ###
   * 勾选省份
  ###
  checkProvince: (evt)=>
    provinceItem = $(evt.currentTarget).closest("li")
    id = $(evt.currentTarget).val()
    name = $(evt.currentTarget).data("name")
    cityCountShow = provinceItem.find(".js-city-count")
    regionCountShow = provinceItem.find(".js-region-count")
    regionCountShow.text("")
    provinceItem.find(".js-address-list[data-level=4]").remove()
    cityItems = provinceItem.find(".city-list input.js-select-city-item:checkbox")
    length = cityItems.length
    provinceItem.find(".city-li").removeClass("selected")
    if $(evt.currentTarget).prop "checked"
      @setCheckbox(cityItems, "checked")
      if length then cityCountShow.text("(#{length})") else cityCountShow.text("")
      provinceItem.data("address", {province: {id, name, selectAll: true}})
    else
      @setCheckbox(cityItems, "unchecked")
      cityCountShow.text("")
      provinceItem.data("address", null)

  ###
   * 勾选城市
  ###
  checkCity: (evt)=>
    cityArea = $(evt.currentTarget).closest(".city-list")
    checkedCities = cityArea.find(".js-select-city-item:checked,.js-select-city-item:indeterminate")
    cityCount = checkedCities.length
    cityItem = $(evt.currentTarget).closest("li")
    cityId = $(cityItem).data("id")
    regionArea = $(evt.currentTarget).closest(".js-template-item").find(".js-address-list[data-id='#{cityId}']")
    provinceItem = $(evt.currentTarget).closest(".province-li")
    cityLength = cityArea.find(".js-select-city-item").length
    regions = regionArea.find("input.js-select-region-item:checkbox")
    selectProvinceItem = provinceItem.find(".js-select-province-item")
    cityCountShow = provinceItem.find(".js-city-count")
    regionCountShow = cityItem.find(".js-region-count")

    if $(evt.currentTarget).prop "checked"
      @setCheckbox(evt.currentTarget, "checked")
      @setCheckbox(regions, "checked")
      if regions.length then regionCountShow.text("(#{regions.length})") else regionCountShow.text("")
    else
      @setCheckbox(evt.currentTarget, "unchecked")
      regionCountShow.text("")
      @setCheckbox(regions, "unchecked")

    if cityLength is cityCount
      @setCheckbox(selectProvinceItem, "checked")
      cityCountShow.text("(#{cityCount})")
    else if cityCount > 0
      @setCheckbox(selectProvinceItem, "indeterminate")
      cityCountShow.text("(#{cityCount})")
    else
      @setCheckbox(selectProvinceItem, "unchecked")
      cityCountShow.text("")
    @dealCityData(provinceItem, cityArea)
    @checkProvinceStatus(provinceItem)

  ###
   * 勾选区县
  ###
  checkRegion: (evt)=>
    regionArea = $(evt.currentTarget).closest(".region-list")
    checkedRegions = regionArea.find(".js-select-region-item:checked")
    regionCount = checkedRegions.length
    cityId = regionArea.data("id")
    provinceItem = $(evt.currentTarget).closest(".province-li")
    cityItem = provinceItem.find(".city-li[data-id=#{cityId}]")
    cityArea = provinceItem.find(".city-list")
    regionLenth = regionArea.find(".js-select-region-item").length
    selectCityItem = cityItem.find(".js-select-city-item")
    regionCountShow = cityItem.find(".js-region-count")

    if regionLenth is regionCount
      @setCheckbox(selectCityItem, "checked")
      regionCountShow.text("(#{regionCount})")
    else if regionCount > 0
      @setCheckbox(selectCityItem, "indeterminate")
      regionCountShow.text("(#{regionCount})")
    else
      @setCheckbox(selectCityItem, "unchecked")
      regionCountShow.text("")
    @dealRegionData(cityItem, regionArea)
    @dealCityData(provinceItem, cityArea)
    @checkProvinceStatus(provinceItem)

  checkProvinceStatus: (province)=>
    cityCount = province.find(".js-select-city-item")
    cityCheckedCount = _.filter(cityCount, (i) => $(i).prop("checked") is true)
    cityIndeterminateCount = cityCount.filter("[indeterminate=true]")
    provinceItem = province.find(".js-select-province-item")
    if cityCount.length is cityCheckedCount.length
      @setCheckbox(provinceItem, "checked")
    else if cityCheckedCount.length + cityIndeterminateCount.length > 0
      @setCheckbox(provinceItem, "indeterminate")
    else
      @setCheckbox(provinceItem, "unchecked")

  packageList: (evt)=>
    menu = $(evt.currentTarget).closest(".js-address-list")
    id = $(menu).data("id")
    @closeSelectList("self", menu, id)

  closeSelectList: (target, menu, id)->
    if id
      $("li[data-id='#{id}']").removeClass("selected")
    else
      if $(menu).data("level") is 3
        $(menu).closest(".js-address-list").find(".province-li").removeClass("selected")
      else
        $(menu).closest(".js-address-list").find(".city-li").removeClass("selected")
    $(menu).remove()

  dealRegionData: (area, container)=>
    cityId = $(area).data("id")
    cityName = $(area).data("name")
    regions = $(container).find(".js-select-region-item:checkbox")
    checkedRegions = _.filter(regions, (i) => $(i).prop("checked") is true)
    city =
      city:
        id: cityId
        name: cityName
        selectAll: true
    if checkedRegions.length is regions.length
      $(area).data("address", city)
    else if checkedRegions.length > 0
      city.city.selectAll = false
      city.regions = _.map(checkedRegions, (i) => {"id": $(i).val(), "name": $(i).data("name")})
      $(area).data("address", city)
    else
      $(area).data("address", "")

  dealCityData: (area, container) =>
    provinceId = $(area).data("id")
    provinceName = $(area).data("name")
    cities = $(container).find(".js-select-city-item:checkbox")
    checkedCities = _.filter(cities, (i) => $(i).prop("checked") is true)
    indeterminateCities = cities.filter("[indeterminate=true]")
    province =
      province:
        id: provinceId
        name: provinceName
        selectAll: true
    if checkedCities.length is cities.length
      $(area).data("address", province)
    else if checkedCities.length + indeterminateCities.length > 0
      
      checkedData = _.map checkedCities, (i) =>
        city = $(i).closest("li").data()
        city.selectAll = true
        {city}

      indeterminateData = _.map indeterminateCities, (i) -> 
        city = $(i).closest("li").data("address")
        if city
          city
        else 
          originAddress = $(i).closest('.province-li').data('address')
          if originAddress.cities 
            city = _.filter(originAddress.cities, (j) => j.city.id.toString() == i.value.toString())[0]
        city

      province.province.selectAll = false
      province.cities = _.union checkedData, indeterminateData
      $(area).data("address", province)
    else
      $(area).data("address", "")

    # @showAddress(area)

  showAddress: (area)->
    showArea = $(area).closest(".js-template-item").find(".js-template-area")
    _.map $(".js-select-province-item:checked"), (i) =>
    showData = _.flatten _.map $(".js-select-province-item:checked,.js-select-province-item:indeterminate"), (i) ->
      item = $(i).closest("li")

      provinceId = $(i).val()
      if $(i).prop "checked"
        $(i).data("name")
      else
        _.map $(i).closest("li").data("show"), (i) -> i.name
        @showArea.html areaShowTemplate {data: showData.join(",")}

  checkAllProvince: (evt)=>
    template = $(evt.currentTarget).closest(".js-template-item")
    provinceItem = template.find(".js-select-province-item")
    if $(evt.currentTarget).prop "checked"
      @setCheckbox(provinceItem, "checked")
      provinceItem.trigger("change")
    else
      @setCheckbox(provinceItem, "unchecked")
      provinceItem.trigger("change")

  ###
   * 获取区域信息
  ###
  organizeAreas: (evt)=>
    template = $(evt.currentTarget).closest(".js-template-item")
    province = template.find(".js-select-province-item:checked,.js-select-province-item:indeterminate")
    _.map province, (i) =>
      $(i).closest("li").data("address")

  organizeTemplateInfo: (evt) =>
    template = $(evt.currentTarget).closest(".js-template-item")
    id = template.data("id")
    name = template.find("input.js-template-name").val()
    {id, name}

  submitRegion: (evt, data)=>
    template = @organizeTemplateInfo(evt)
    template.regions = JSON.stringify @organizeAreas(evt)
    if $.trim(template.name)
      $(evt.currentTarget).closest(".js-template-item").find(".js-name-error").addClass("hide")

      if template.id
        url = "/api/deliverTemplate/updateDeliveryTemplate"
      else
        url = "/api/deliverTemplate/createDeliveryTemplate"

      $.ajax
        url: url
        type: "POST"
        contentType: "application/json"
        data: JSON.stringify template
        success: ->
          window.location.reload()
    else
      $(evt.currentTarget).closest(".js-template-item").find(".js-name-error").removeClass("hide")

module.exports = Delivery
