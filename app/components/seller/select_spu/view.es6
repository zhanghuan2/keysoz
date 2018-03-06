import Modal from 'pokeball/components/modal'
const keyAttrsSearchTemplate = Handlebars.templates["seller/select_category/templates/key_attribute_search"]
const keyAttrsTemplate = Handlebars.templates["seller/select_category/templates/attribute_list"]

class selectSpu {
  constructor () {
    this.itemId = $.query.get('itemId')
    this.categoryId = $.query.get('categoryId')
    this.categoryPath = $.query.get('categoryPath')
    this.ptype = parseInt($.query.get('ptype'))
    this.$el = $('.select-spu')
    this.$categoryList = $('.category-list')
    this.showKeyAttrs(this.categoryId)
    this.bindEvents()
  }

  bindEvents () {
    this.$el.delegate('.key-attribute-search-box .js-search-item', 'keyup', (evt) => this.searchAttr(evt))
    this.$el.delegate('.js-attribute-list-component .divide-li', 'click', (evt) => this.selectAttr(evt))
    this.$el.delegate('.js-submit-spu', 'click', (evt) => this.submitSpuClick(evt))
  }

  showKeyAttrs (categoryId) {
    this.$categoryList.append(keyAttrsSearchTemplate({categoryId}))
    this.$keyAttrList = $('.key-attribute-list')
    this.$categoryList.css('width', `900px`)
    this.$keyAttrSearchInput = $('.key-attribute-search-box .js-search-item')
    this.searchAttrsList(categoryId)
  }

  searchAttrsList (categoryId, keyWord) {
    let keyPropertyText = keyWord || ''
    this.recentKeyWord = keyPropertyText
    this.$keyAttrList.html('<div class="tip-info">正在获取数据...</div>')
    $.ajax({
      url: '/api/zcy/backCategories/listKeyPropertiesByCategoryId',
      type: 'get',
      data: {categoryId, keyPropertyText}
    }).done((result) => {
      if (keyPropertyText === this.recentKeyWord) {
        if (result.length === 0) {
          this.$keyAttrList.html('<div class="tip-info">没有相关数据</div>')
        } else {
          let html = keyAttrsTemplate({data: result})
          this.$keyAttrList.html(html)
          if (result.length > 2) {
            this.$categoryList.css('width', `${(result.length + 3 ) * 180}px`)
          }
        }
      }
    })
  }

  searchAttr (evt) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      let categoryId = $(evt.currentTarget).data('categoryId'),
        keyWord = $(evt.currentTarget).val()
      this.searchAttrsList(categoryId, keyWord)
    }, 600)
  }

  selectAttr (evt) {
    $(evt.currentTarget).addClass("selected")
    $(evt.currentTarget).siblings().removeClass("selected")
    this.setSpuOrLeaf()
    //是否已经选择所有关键属性
    let allSelected = true
    $('.attibute-list').each((i, el) => {
      if ($(el).find('.divide-li.selected').length === 0) {
        allSelected = false
        return false
      }
    })
    if (allSelected) {
      $(".js-submit-spu").prop('disabled', false)
    } else {
      $(".js-submit-spu").prop('disabled', true)
    }
  }

  //设置已选SPU或者三级(叶子)类目
  setSpuOrLeaf () {
    let selectedItemsCache = [],selectedString,
      $selectedPath = $('.selected-path')
    $selectedPath.attr('data-category-path',this.categoryPath)
    $('.js-attribute-list-component .selected').each((i, e)=>{
      selectedItemsCache.push($(e).data('attrVal'))
    })
    selectedString = this.categoryPath + '-' + selectedItemsCache.join("-")
    $selectedPath.html(selectedString)
  }

  submitSpuClick () {
    $('body').spin('medium')
    let keyPropertyText = '',
      categoryPath = this.$el.find(".selected-path").data('categoryPath')
    $('.js-attribute-list-component .selected').each((i, e)=>{
      let attrKey = $(e).data('attrKey'),
        attrVal = $(e).data('attrVal')
      keyPropertyText += `${attrKey}:${attrVal};`
    })
    $.ajax({
      url: '/api/spu/getSimpleByCategory',
      type: 'get',
      data: {categoryId:this.categoryId, keyPropertyText}
    }).done((result) => {
      let spuId = result.spuId
      if (!spuId) {
        new Modal({
          icon: "info",
          title: "温馨提示",
          htmlContent: `找不到符合条件的SPU<br><a href='/seller/spus/spu-publish?categoryId=${this.categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=5'>点击申请SPU</a>`
        }).show()
        return
      }
      if(this.ptype == 7) {//协议商品编辑页面独立开了
        window.location.href = `/agreement/item-publish?goodId=${this.itemId}&spuId=${spuId}`
      } else {
        window.location.href = `/seller/item-issue?itemId=${this.itemId}&categoryPath=${categoryPath}&ptype=${this.ptype}&spuId=${spuId}`
      }

    }).always(() => {
      $('body').spin(false)
    })
  }
}

module.exports = selectSpu