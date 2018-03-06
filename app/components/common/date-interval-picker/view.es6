const timeInput = Handlebars.templates['common/date-interval-picker/templates/input']

class dateIntervalPicker {
  constructor (selector, options) {
    this.$el = $(selector)
    this.options = _.extend({
      name: 'default',
      startHolder: '开始时间',
      endHolder: '结束时间'
    }, options)
    this.$el.empty().append(timeInput(this.options))
    this.$startInput = this.$el.find('.js-date-start')
    this.$endInput = this.$el.find('.js-date-end')
    this.bindEvents()
    this.$el.data('dateIntervalPicker', this)
  }

  bindEvents () {
    this.$el.find('.date-input').datepicker()
    this.$el.find('.date-input').attr('style', 'background-color: initial;border-color: #ccd0d6;')
    this.$endInput.on('change', () => this._setMaxDate())
    this.$startInput.on('change', () => this._setMinDate())
  }

  _setMaxDate () {
    let endDate = this.$endInput.val()
    this.$startInput.data('datepicker').setMaxDate(moment(endDate).toDate())
  }

  _setMinDate () {
    let startDate = this.$startInput.val()
    this.$endInput.data('datepicker').setMinDate(moment(startDate).toDate())
  }

  getStartDate () {
    let startDate = this.$startInput.val()
    return moment(startDate).toDate()
  }

  getEndDate () {
    let endDate = this.$endInput.val()
    if (endDate) {//取一天的最后时刻
      endDate += ' 23:59:59.999'
    }
    return moment(endDate).toDate()
  }

  setEndDate (date) {
    try {
      this.$endInput.data('datepicker').setDate(moment(date).toDate())
      this.$startInput.data('datepicker').setMaxDate(moment(date).toDate())
    } catch (e) {
      console.log(e)
    }
  }

  setStartDate (date) {
    try {
      this.$startInput.data('datepicker').setDate(moment(date).toDate())
      this.$endInput.data('datepicker').setMinDate(moment(date).toDate())
    } catch (e) {
      console.log(e)
    }
  }
}


module.exports = dateIntervalPicker