import Modal from 'pokeball/components/modal'
import CategoryItem from 'seller/category_item/extend'
const categoryTemplate = Handlebars.templates["seller/category_item/templates/category"]

/* ptype定义
1 -> 普通商品
2 -> 网超商品
3 -> 疫苗商品
4 -> 大宗商品
5 -> spu
*/

class ReleaseItemsCategory {
  constructor () {
    this.$el = $('.release-items-category')
    this.ptype = this.$el.find('#ptype').val()
    this.preRender()
  }

  preRender () {
    $('body').spin('medium')
    let self = this,
      queryUrl = '/api/zcy/backCategories/children'
    if (self.ptype == 3) {
      queryUrl = '/api/zcy/spu/supplier/children?authType=1'
    } else if (self.ptype == 4) {
      queryUrl = '/api/zcy/seller/authored/category/children?tag=blocktrade'
    } else if (self.ptype == 5) {
      queryUrl = '/api/zcy/spu/supplier/children?authType=0'
    }
    $.ajax({
      url: queryUrl,
      type: "GET",
      success: (data) => {
        let html = categoryTemplate({
          extras: {
            "level": 1
          },
          data: data
        })
        self.$el.find(".category-list").append(html)
        self.$el.find(".js-submit-spu").on('click', (evt) => this.submitSpuClick(evt))
        new CategoryItem({queryUrl})
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }


  submitSpuClick() {
    let categoryId, categoryPath, spuId, spuPath, status

    if (this.$el.find(".category-spu .selected").length > 0) {
      spuId = this.$el.find(".category-spu .selected").data("category").id
      categoryId = this.$el.find(".category-spu .selected").data("category").categoryId
      status = this.$el.find(".category-spu .selected").data("category").status
      spuPath = this.$el.find(".selected-path").html()
      if (!status || status === 0) {
        new Modal({
          icon: "info",
          title: "温馨提示",
          content: "已冻结类目无法发布商品或spu"
        }).show()
      } else {
        if (self.ptype == 3) {
          window.location.href = `/seller/item-publish?spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}&isVaccine=1`
        } else if (self.ptype == 4) {
          window.location.href = `/seller/item-publish?spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}&isBlocktrade=1`
        } else if (self.ptype == 5) {
          window.location.href = `/seller/spus/spu-publish?spuId=${spuId}&cid=${categoryId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}`
        } else {
          window.location.href = `/seller/item-publish?spuId=${spuId}&categoryPath=${encodeURIComponent(spuPath)}&ptype=${self.ptype}`
        }
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
          window.location.href = `/seller/item-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}&isVaccine=1`
        } else if (self.ptype == 4) {
          window.location.href = `/seller/item-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}&isBlocktrade=1`
        } else if (self.ptype == 5) {
          window.location.href = `/seller/spus/spu-publish?categoryId=${categoryId}&cid=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}`
        } else {
          window.location.href = `/seller/item-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}&ptype=${self.ptype}`
        }
      }
    }
  }
}


module.exports = ReleaseItemsCategory