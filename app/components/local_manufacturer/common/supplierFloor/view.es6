const suppliersTemplate = Handlebars.templates["local_manufacturer/common/supplierFloor/templates/suppliers"]


class SupplierFloor {
  constructor () {
    this.$supplierFloor = $('.manufacturer-supplier-floor')
    let ids = this.$supplierFloor.find('.js-suppliers-id').val(),
      imagesJson = this.$supplierFloor.find('.js-suppliers-image').val()
    if (ids) {
      let images = []
      try {
        images = JSON.parse(imagesJson)
      } catch (e) {

      }
      this.getSuppliers(ids, images)
    }
  }

  getSuppliers (ids, images) {

    $.ajax({
      url: '/api/portal/mfacture/index/shop',
      type: 'get',
      data: {addressCode: '330000', ids},
      success: (result) => {
        this.$supplierFloor.find('.floor-body').empty().append(suppliersTemplate(result))
        if (images) {
          this.$supplierFloor.find('img.bg').each((i, el) => {
            if (i < images.length){
              $(el).attr('src', images[i].image)
            }
          })
        }
      }
    })
  }
}

module.exports = SupplierFloor