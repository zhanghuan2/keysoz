const productListTemplate = Handlebars.templates["education/elevatorFloor/templates/productList"]

class ElevatorFloor {

  constructor ($) {
    this.$productFloor = $('.floor-products')
    let frontCategoryId = $('.js-front-category-id').val(),
      itemIds = $('.js-items-id').val()
    try {
      this.envHref = JSON.parse($('.js-env-href').val())
    } catch (e) {}
    // if (itemIds) {
    //   this.getItemsList(itemIds)
    // } else if (frontCategoryId) {
    //   this.getCategoryItems(frontCategoryId)
    // }
    this.getCategoryItems(frontCategoryId, itemIds)
    
    this.bindEvents()
  }

  bindEvents () {
    $('.js-keyword-search').on('click', (evt) => this.searchKeyword(evt))
  }

  getCategoryItems (frontCategoryId, itemIds) {
    let queryData = {}
    if (frontCategoryId) {
      queryData.frontCategoryId = frontCategoryId
    }
    if (itemIds) {
      queryData.itemWhiteList = itemIds
    }
    $.ajax({
      url: '/api/zcy/frontCategory/info',
      type: 'get',
      data: queryData
    }).done((result) => {
      if (this.envHref) {
        result.domain = this.envHref.front
      }
      this.$productFloor.empty().append(productListTemplate(result))
    })
  }

  // getItemsList (itemIds) {
  //   $.ajax({
  //     url: '/api/portal/mfacture/index/item',
  //     type: 'get',
  //     data: {addressCode: '330000', ids: itemIds}
  //   }).done((result) => {
  //     if (this.envHref) {
  //       result.domain = this.envHref.front
  //     }
  //     this.$productFloor.empty().append(productListTemplate(result))
  //   })
  // }


  searchKeyword (evt) {
    let keyword = $(evt.currentTarget).text()
    if (keyword) {
      window.location.href = `${this.envHref.front}/eevees/search?q=${keyword}`
    }
  }

}

module.exports = ElevatorFloor