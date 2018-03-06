
class FuzzyQueryInputPurchaser {

  constructor (selector, options) {
    this.$el = $(selector)
    this.options = _.extend({
      tag: 'all',
      module: 'order',
      width: '160px'
    }, options)
    this.bindQuery()
  }

  bindQuery () {
    let _self = this

    let name = _self.$el.data('name'),
      userId = _self.$el.data('userId')
    if (name && userId) {
      _self.$el.append(`<option value="${userId}" selected>${name}</option>`)
    }

    this.$el.select2({
      placeholder: '请选择',
      allowClear: true,
      ajax: {
        url: '/api/fuzzyQuery/queryPurchasers',
        dataType: 'json',
        delay: 500,
        data: function (params) {
          if (params.term == undefined) {
            return {
              keyword: '',
              module: _self.options.module,
              tag: _self.options.tag
            }
          }
          return {
            keyword: params.term.trim(),
            module: _self.options.module,
            tag: _self.options.tag
          }
        },
        error: function (e) {
          console.log(e)
        },
        processResults: function (data) {
          let purchasers = []
          if (data.length == 0) {
            return {
              results: purchasers
            }
          }
          $.each(data, function (i, n) {
            let option = {}
            option.id = n.userId
            option.text = n.name
            purchasers.push(option)
          })
          return {
            results: purchasers
          }
        },
        cache: true
      },
      width: _self.options.width
    }).on('change', (evt) => {
      let name = $(evt.currentTarget).find('option:selected').text(),
        userId = $(evt.currentTarget).find('option:selected').val()
      _self.$el.data('name', name)
      _self.$el.data('userId', userId)
    })
  }

}

module.exports = FuzzyQueryInputPurchaser