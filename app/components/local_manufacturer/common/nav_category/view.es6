const categoriesTemplate = Handlebars.templates["local_manufacturer/common/nav_category/templates/categories"]
const Cookie = require ("common/cookie/view")

class NavHeader {

  constructor($) {
    this.$navHeader = $('.nav-bar-header')
    this.$categoryNav = $('.categories-nav')
    let ids = $('.js-categories-id').val()
    if (ids) {
      this.getFrontCategories(ids)
    }
  }

  bindEvents () {
    $('.js-category-search').on('click', (evt) => this.searchCategory(evt))
  }

  bindShowEvent () {
    this.$navHeader.on('mouseenter', () => this.showCategory())
    this.$navHeader.parent().on('mouseleave', () => this.hideCategory())
  }

  getFrontCategories (pids) {
    $.ajax({
      url: '/api/frontCategories/multi/children',
      type: 'get',
      data: {pids}
    }).done((result) => {
      this.$categoryNav.empty().append(categoriesTemplate(result))
      if(this.checkIsIndex()){
        this.showCategory()
      }
      else{
        this.bindShowEvent()
      }
      this.bindEvents()
    })
  }

  checkIsIndex () {
    let currentPath = window.location.pathname,
      districtCode = Cookie.getCookie('districtCode')
    if (currentPath == '/' || currentPath == '/index' || currentPath == `/${districtCode}`) {
      return true
    }
    return false
  }

  showCategory () {
    this.$categoryNav.show()
  }

  hideCategory () {
    this.$categoryNav.hide()
  }

  searchCategory (evt) {
    let cid = $(evt.currentTarget).data('cid')
    if (cid) {
      window.location.href = `/search?fcid=${cid}&normal=4`
    }
  }
}

module.exports = NavHeader