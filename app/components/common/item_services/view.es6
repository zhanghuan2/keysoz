const itemServicesTemplate = Handlebars.templates["common/item_services/templates/itemServices"]

class itemServices {

  constructor (selector, options) {
    this.$el = $(selector)
    this.itemIds = []
    _.each(this.$el, (e) => {
      let itemId = $(e).data('itemId')
      if (itemId) {
        this.itemIds.push(itemId)
      }
    })
    this.options = _.extend({
      showName: false
    }, options)
  }

  loadServiceInfo (regionId, callback) {

    $.ajax({
      url: '/api/service/getItemServices',
      type: 'get',
      data: {itemIds: this.itemIds, region: regionId}
    }).done((result) => {
      _.each(this.$el, (e) => {
        let itemId = $(e).data('itemId'),
          services = result[itemId]
        if (services && services.length > 0) {
          $(e).data('services', services)
          $(e).empty().append(itemServicesTemplate({data:services, style: this.options.style}))
          if(this.options.style == 'simple') {
            this.bindHoverEvent(e)
          }
        }
      })
      if (callback) {
        callback(result)
      }
    })
  }

  showServiceInfo () {
    _.each(this.$el, (e) => {
      try {
        let services = $(e).data('services')
        if (services && services.length > 0) {
          $(e).empty().append(itemServicesTemplate({data:services, style: this.options.style}))
          if(this.options.style == 'simple') {
            this.bindHoverEvent(e)
          }
        }
      } catch (error) {}
    })
  }

  bindHoverEvent (e) {
    $(e).find('.js-service-icon').popover({
      trigger: 'hover',
      placement: 'bottom',
      html: true,
      content: $(e).find('.js-services-content').html(),
      delay: {
        hide: 100
      }
    })
  }

}


module.exports = itemServices