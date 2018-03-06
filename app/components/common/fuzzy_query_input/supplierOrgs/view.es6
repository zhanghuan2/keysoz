
class FuzzyQueryInputSupplierOrgs {

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

    let orgName = _self.$el.data('orgName'),
      orgId = _self.$el.data('orgId')
    if (orgName && orgId) {
      _self.$el.append(`<option value="${orgId}" selected>${orgName}</option>`)
    }

    _self.$el.select2({
      placeholder: '请选择',
      allowClear: true,
      ajax: {
        url: '/api/fuzzyQuery/querySupplierOrgs',
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
          let supplierOrgs = []
          if (data.length == 0) {
            return {
              results: supplierOrgs
            }
          }
          $.each(data, function (i, n) {
            let option = {}
            option.id = n.orgId
            option.text = n.orgName
            supplierOrgs.push(option)
          })
          return {
            results: supplierOrgs
          }
        },
        cache: true
      },
      width: _self.options.width
    }).on('change', (evt) => {
      let orgName = $(evt.currentTarget).find('option:selected').text(),
        orgId = $(evt.currentTarget).find('option:selected').val()
      _self.$el.data('orgName', orgName)
      _self.$el.data('orgId', orgId)
    })
  }

}

module.exports = FuzzyQueryInputSupplierOrgs