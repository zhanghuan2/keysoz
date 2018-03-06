class CommonDatepicker
  constructor: (@container, interval)->
    @interval = interval || 0
    @startAt = $(".js-common-start-at", @container)
    @endAt = $(".js-common-end-at", @container)
    @endPika = @endAt.data("datepicker")
    @bindEvents()

  bindEvents: ->
    @startAt.on "change", @changeEndDate
    @endAt.on "change", @changeStartDate
    @initDate()

  initDate: =>
    startDate = @startAt.val()
    endDate = @endAt.val()
    if @interval
      # FIX: ‘_o’ 理应是内部参数，待找到替换方法。
      @endPika.setMinDate(moment(startDate || moment(@endPika._o.minDate).format("YYYY-MM-DD")).add(@interval, "days").toDate())
    @startAt.trigger("change") if startDate
    @endAt.trigger("change") if endDate

  changeEndDate: (evt) =>
    startDate = $(evt.currentTarget).val()
    @endPika.setMinDate(moment(startDate).add(@interval, "days").toDate())

  changeStartDate: (evt) =>
    endDate = $(evt.currentTarget).val()
    @startAt.data("datepicker").setMaxDate(moment(endDate).add( - @interval, "days").toDate())

module.exports = CommonDatepicker
