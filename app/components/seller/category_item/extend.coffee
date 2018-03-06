
class CategoryItem

  constructor: (options)->

    @configs =
      queryUrl: '/api/zcy/backCategories/children'
      maxLevel: 5
    if options
      $.extend @configs, options

    @nextLever = "li.divide-li"
    @categorySearch = (".js-search-item")
    @bindEvent()

  bindEvent: ->
    $(".fixed-category").on("click", @nextLever, @nextCategory)
    $(".fixed-category").on("keyup", @categorySearch, @categorySearchItem)

  categorySearchItem: (evt)=>
    $(evt.currentTarget).closest(".category-body").find(".divide-ul li").hide().filter(":contains('" + ( $(evt.currentTarget).val() ) + "')").show()

  #设定选中样式
  setSelected: (_this)->
    $(_this).addClass("selected")
    $(_this).siblings().removeClass("selected")

  #渲染SPU层
  renderSpus: (categoryData)=>
    $.ajax
      url: "/api/seller/spu/bycat?categoryId=#{categoryData.id}&pageNo=1&pageSize=200"
      type: "GET"
      success: (data) =>
        spuTemplate = Handlebars.templates["seller/category_item/templates/category"]({
          extras: {
            "level": 5,
            "parentId": categoryData.id
          }, data: data.data
        })
        $(".fixed-category").append(spuTemplate)
        $(".category-#{@configs.maxLevel}").addClass("category-spu")
      complete: ->
        $(".category-list").spin(false)

  #设置已选SPU或者三级(叶子)类目
  setSpuOrLeaf: (categoryData)->
    $(".js-submit-spu").attr("disabled", false)
    selectedItemsCache = []
    $.each $(".js-category-component .selected"), (i, d)->
      selectedItemsCache[i] = $(@).data("category").name
    selectedString = selectedItemsCache.join("-")
    $(".selected-path").html(selectedString)


  #下一级类目逻辑
  nextCategory: (evt)=>
    $(evt.currentTarget).parents(".category").nextAll().remove()
    categoryData = $(evt.currentTarget).data("category")
    @setSelected(evt.currentTarget)
    $(".js-submit-spu").attr("disabled", true)
    $(".category-list").spin("medium")
    queryData = {pid: categoryData.id}
    if $.query.get('ptype') == 8
      queryData.tag = 'zzg'
    if categoryData.hasChildren is true
      $.ajax
        url: @configs.queryUrl
        type: "GET"
        data: queryData
        success: (data) ->
          categoryTemplate = Handlebars.templates["seller/category_item/templates/category"]({extras: {"level": parseInt(categoryData.level) + 1, "parentId": categoryData.id}, data: data})
          $(".fixed-category").append(categoryTemplate)
        complete: ->
          $(".category-list").spin(false)
    else
      if categoryData.status == 1
        @setSpuOrLeaf(categoryData)
        if (categoryData.level <= @configs.maxLevel) and categoryData.hasSpu
          @renderSpus(categoryData)
        else
          $(".category-list").spin(false)
      else
        $(".category-list").spin(false)

module.exports = CategoryItem