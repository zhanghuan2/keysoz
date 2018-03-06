const brandListTemplate = Handlebars.templates["education/brandsFloor/templates/list"]

class brandsFloor {
  constructor ($) {
    this.$brands = $('.brands')
    let brandStr = $('.js-brands-id').val()
    try {
      this.envHref = JSON.parse($('.js-env-href').val())
    } catch (e) {}
    if (brandStr) {
      this.brandIds = brandStr
      this.getBrandList()
    }
  }

  getBrandList () {
    $.ajax({
      url: '/api/brands/list',
      type: 'get',
      data: {brandIds: this.brandIds}
    }).done((result) => {
      if (this.envHref) {
        result.domain = this.envHref.front
      }
      this.$brands.empty().append(brandListTemplate(result))
    })
  }
}

module.exports = brandsFloor
