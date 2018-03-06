const productListTemplate = Handlebars.templates["local_manufacturer/common/elevatorFloor/templates/productList"]
const brandListTemplate = Handlebars.templates["local_manufacturer/common/elevatorFloor/templates/brandList"]

class ElevatorFloor {

  constructor ($) {
    this.$productFloor = $('.floor-products')
    this.$brandFloor = $('.floor-brands')

    let itemIds = $('.js-items-id').val(),
      brandIds = $('.js-brands-id').val()

    if (itemIds) {
      this.getItemsList(itemIds)
    }

    if (brandIds) {
      this.getBrandList(brandIds)
    }

    this.bindEvents()
  }

  bindEvents () {
    $('.js-keyword-search').on('click', (evt) => this.searchKeyword(evt))
  }

  getItemsList (itemIds) {
    $.ajax({
      url: '/api/portal/mfacture/index/item',
      type: 'get',
      data: {addressCode: '330000', ids: itemIds}
    }).done((result) => {
      this.$productFloor.empty().append(productListTemplate(result))
    })
  }

  getBrandList (brandIds) {
    $.ajax({
      url: '/api/portal/mfacture/index/brand',
      type: 'get',
      data: {addressCode: '330000', ids: brandIds}
    }).done((result) => {
      this.$brandFloor.empty().append(brandListTemplate(result))
    })
  }

  searchKeyword (evt) {
    let keyword = $(evt.currentTarget).text()
    if (keyword) {
      window.location.href = `/search?q=${keyword}&normal=4`
    }
  }

}

module.exports = ElevatorFloor