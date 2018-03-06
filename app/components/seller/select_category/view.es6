import Modal from 'pokeball/components/modal'
const ItemIssueTool = require('common/item_issue/view')
const categoryTemplate = Handlebars.templates["seller/select_category/templates/category_items"]
const keyAttrsSearchTemplate = Handlebars.templates["seller/select_category/templates/key_attribute_search"]
const keyAttrsTemplate = Handlebars.templates["seller/select_category/templates/attribute_list"]
const searchResultTemplate = Handlebars.templates["seller/select_category/templates/search_result"]

/* ptype定义
1 -> 普通商品
2 -> 网超商品
3 -> 疫苗商品
4 -> 大宗商品
5 -> spu
7 -> 协议商品
8 -> 制造馆商品
*/

class SelectCategory {
  constructor () {
    this.$el = $('.select-category')
    this.$categoryList = $('.category-list')
    this.ptype = parseInt(this.$el.find('#ptype').val())
    this.$categoryId = parseInt($.query.get("category"))
    this.urlTag = $.query.keys.tag || '';
    this.preRender()
    this.bindEvents()
  }

  preRender () {
    $('body').spin('medium')
    let self = this,
      tag = this.urlTag || ItemIssueTool.tagOfPtype(this.ptype)
    $.ajax({
      url: '/api/zcy/backCategories/categoriesByTag',
      type: "GET",
      data: {tag: tag},
      success: (result) => {
        let html = categoryTemplate({data: result})
        self.$categoryList.append(html)
        self.allNodes = []
        self.travelTree(result, self.allNodes, -1)
        //发布标品时需要先发布spu时缓存当前类目选择
        if(self.ptype == 5 && self.$categoryId){
          let result  = []
          _.each(self.allNodes,(obj) => {
            let nodeId = obj.node.id+""
            if(nodeId == self.$categoryId){
              result.push(obj)
            }
          })
          let nodePath = self.getNodePaths(result)[0]
          self.openCategoryPath(nodePath)
        }
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  bindEvents () {
    this.$el.delegate('.js-category-component .divide-li', 'click', (evt) => this.showNextCategory(evt))
    this.$el.delegate('.js-submit-spu', 'click', (evt) => this.submitSpuClick(evt))
    this.$el.delegate('.js-search-category', 'click', (evt) => this.clickSearch(evt))
    this.$el.delegate('.scroll-view', 'click', () => this.hideSearch())
    this.$el.delegate('input[name=keyword]', 'keypress', (evt) => this.keyPressSearch(evt))
    this.$el.delegate('.category-path', 'click', (evt) => this.selectSearchRow(evt))
    this.$el.delegate('.key-attribute-search-box .js-search-item', 'keyup', (evt) => this.searchAttr(evt))
    this.$el.delegate('.js-attribute-list-component .divide-li', 'click', (evt) => this.selectAttr(evt))
  }

  showNextCategory (evt) {
    $(evt.currentTarget).parents(".category").nextAll().remove()
    $(evt.currentTarget).addClass("selected")
    $(evt.currentTarget).siblings().removeClass("selected")
    this.setSpuOrLeaf()
    let data = $(evt.currentTarget).data('children')
    if (data.length > 0) {
      $(".js-submit-spu").prop("disabled", true)
      let html = categoryTemplate({data})
      this.$categoryList.append(html)
      this.$categoryList.attr('style', 'width:600px')
    }
    else{
      if (this.ptype != 5 && $(evt.currentTarget).data('bzlm')) {//标准类目需要选择关键属性才能发布（发布SPU时除外）
        $(".js-submit-spu").prop('disabled', true)
        let categoryId = $(evt.currentTarget).data('categoryId')
        this.showKeyAttrs(categoryId)
      }
      else {
        $(".js-submit-spu").prop('disabled', false)
      }
    }
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
    let selectedItemsCache = [],selectedString, categoryPath,
      $selectedPath = $('.selected-path')
    $('.js-category-component .selected').each((i, e)=>{
      selectedItemsCache[i] = $(e).data('category').name
    })
    categoryPath = selectedItemsCache.join("-")
    $selectedPath.attr('data-category-path',categoryPath)
    $('.js-attribute-list-component .selected').each((i, e)=>{
      selectedItemsCache.push($(e).data('attrVal'))
    })
    selectedString = selectedItemsCache.join("-")
    $selectedPath.html(selectedString)
  }

  keyPressSearch (evt) {
    if (!evt) {
      evt = window.event;
    }
    let keyCode = evt.keyCode || evt.which;
    if (keyCode == 13) {
      this.searchCategory();
    }
  }

  clickSearch (evt) {
    $(evt.currentTarget).prop('disabled', true)
    this.searchCategory()
    $(evt.currentTarget).prop('disabled', false)
  }

  searchCategory () {
    let keyword = $('input[name=keyword]').val().trim()
    if (keyword.length > 0) {
      let result = []
      _.each(this.allNodes, (obj)=> {
        if(obj.node.name.indexOf(keyword) >= 0) {
          result.push(obj)
        }
      })
      let nodePaths = this.getNodePaths(result)
      this.$el.find('.search-result-area').html(searchResultTemplate({data:nodePaths}))
      this.$el.find('.search-result-area').show()
    }
  }

  hideSearch () {
    this.$el.find('.search-result-area').empty().hide()
  }

  getNodePaths (nodes) {
    let self = this, nodePaths = []
    _.each(nodes, (obj) => {
      let nodePath = [obj.node], pIndex = obj.pIndex
      while ( pIndex >= 0) {
        let pNode = self.allNodes[pIndex]
        nodePath.push(pNode.node)
        pIndex = pNode.pIndex
      }
      nodePath.reverse()
      nodePaths.push(nodePath)
    })
    return nodePaths
  }

  travelTree (tree, allNodes, pIndex) {
    if(tree.length > 0) {
      _.each(tree, (obj) => {
        allNodes.push({node:obj.node, pIndex})
        if (obj.node.hasChildren) {
          let index = allNodes.length - 1
          this.travelTree(obj.children, allNodes, index)
        }
      })
    }
  }

  selectSearchRow (evt) {
    let nodePath = $(evt.currentTarget).data('path')
    console.log(nodePath)
    if (nodePath) {
      this.openCategoryPath(nodePath)
    }
  }

  openCategoryPath (nodePath) {
    let self = this, $li = undefined
    _.each(nodePath, (node) => {
      $li = $(`.divide-li[data-category-id=${node.id}]`)
      $li.parents(".category").nextAll().remove()
      $li.addClass("selected")
      $li.siblings().removeClass("selected")
      self.setSpuOrLeaf()
      let data = $li.data('children')
      if (data.length > 0) {
        $(".js-submit-spu").prop("disabled", true)
        let html = categoryTemplate({data})
        self.$categoryList.append(html)
        self.$categoryList.attr('style', 'width:600px')
      }
      else{
        $(".js-submit-spu").prop('disabled', false)
      }
    })
    $li.trigger('click')
  }

  submitSpuClick() {
    let categoryId, categoryPath, spuPath, status, categoryData, self = this

    if (this.$el.find(".attibute-list .selected").length > 0) {
      categoryData = this.$el.find(".category .selected:last").data("category")
      categoryId = categoryData.id
      status = categoryData.status
      spuPath = this.$el.find(".selected-path").html()
      let keyPropertyText = ''
      $('.js-attribute-list-component .selected').each((i, e)=>{
        let attrKey = $(e).data('attrKey'),
          attrVal = $(e).data('attrVal')
        keyPropertyText += `${attrKey}:${attrVal};`
      })
      if (!status || status === 0) {
        new Modal({
          icon: "info",
          title: "温馨提示",
          content: "已冻结类目无法发布商品"
        }).show()
      } else {
        $('body').spin('medium')
        $.ajax({
          url: '/api/spu/getSimpleByCategory',
          type: 'get',
          data: {categoryId, keyPropertyText}
        }).done((result) => {
          let spuId = result.spuId
          if (!spuId) {
            categoryPath = this.$el.find(".selected-path").data('categoryPath')
            new Modal({
              icon: "info",
              title: "温馨提示",
              htmlContent: `找不到符合条件的SPU<br><a href='/seller/spus/spu-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=5'>点击申请SPU</a>`
            }).show()
            return
          }
          sessionStorage.setItem(`spu-${spuId}`, JSON.stringify(result))
          if (self.ptype == 3) {
            window.location.href = `/seller/item-issue?categoryId=${categoryId}&spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}&isVaccine=1`
          } else if (self.ptype == 4) {
            window.location.href = `/seller/item-issue?categoryId=${categoryId}&spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}&isBlocktrade=1`
          } else if (self.ptype == 7) {
            window.location.href = `/agreement/item-publish?categoryId=${categoryId}&spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&tag=${self.urlTag}`
          }  else {
            window.location.href = `/seller/item-issue?categoryId=${categoryId}&spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}`
          }
        }).always(() => {
          $('body').spin(false)
        })
      }
    } else if (!this.$el.find(".selected:last").data("category").hasChildren) {
      categoryPath = this.$el.find(".selected-path").html()
      categoryId = this.$el.find(".selected:last").data("category").id
      status = this.$el.find(".selected:last").data("category").status
      if (!status || status === 0) {
        new Modal({
          icon: "info",
          title: "温馨提示",
          content: "已冻结类目无法发布商品或spu"
        }).show()
      } else {
        if (self.ptype == 3) {
          window.location.href = `/seller/item-issue?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}&isVaccine=1`
        } else if (self.ptype == 4) {
          window.location.href = `/seller/item-issue?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}&isBlocktrade=1`
        } else if (self.ptype == 5) {
          window.location.href = `/seller/spus/spu-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=5`
        } else if (self.ptype == 7) {
          window.location.href = `/agreement/item-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&tag=${self.urlTag}`
        }else {
          window.location.href = `/seller/item-issue?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}`
        }
      }
    }
  }
}


module.exports = SelectCategory