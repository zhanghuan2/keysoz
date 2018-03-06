Line = require "charts/line"
CommonDatepicker = require "extras/common_datepicker"
Lang = require "locale/locale"

class Chart

  constructor: ->
    @chart = $(".chart", @$el)
    @filter = $(".filter", @$el)
    @filterLi = $("li", @filter)
    @datepicker = $(".datepicker", @$el)
    @jsSelectChart = $(".js-select-chart", @$el)
    @particleSize = $(".particle-size", @$el)
    @bindEvent()

  bindEvent: ->
    @filterLi.on "click", @setFilter
    @jsSelectChart.on "change", @selectChart
    @particleSize.on "click", "li", @particleChange
    @setYear()
    @getYearRange()
    @filterLi.first().trigger("click")

  setYear: =>
    _this = @
    @datepicker.datepicker({
      onSelect: ->
        hash = _this.historyHandle {"#{$(@_o.trigger).attr("name")}": @getMoment().format("YYYY-MM-DD")}
        _this.renderChart hash
    })
    new CommonDatepicker()

  getYearRange: =>
    date = $.query.get()
    if !_.isEmpty(date) and date.end is moment().format("YYYY-MM-DD")
      @filter.find("li[data-value='#{(moment(date.end) - moment(date.start)) / 1000 / 60 / 60 / 24}']").addClass "active"
    else
      @filter.find("li:not([data-value])").addClass "active"

  setFilter: (event) =>
    $(event.currentTarget).addClass("active").siblings().removeClass "active"
    time = $(event.currentTarget).data("value")
    if time?
      time = - (-1 - moment().format("e")) if time is "wtd"
      time = moment().format("D")-1 if time is "mtd"
      time = moment().format("DDD")-1 if time is "ytd"
      @renderParticle time
      date = {start: moment().add(-time, "days").format("YYYY-MM-DD"), end: moment().format("YYYY-MM-DD")}
      hash = @historyHandle date
      @filter.find("[name='start']").val date.start
      @filter.find("[name='end']").val date.end
    else
      hash = @historyHandle null, ["start", "end"]
      @filter.find("[name='start'], [name='end']").val ""
    @renderChart hash

  selectChart: (event) =>
    @renderChart null, $(event.currentTarget).val()

  renderParticle: (time) =>
    @particleSize.find("li").each (i, v) =>
      if $(v).data("step") > time
        $(v).addClass("disabled")
        if $(v).hasClass "active"
          $(v).removeClass "active"
          @historyHandle({step: @particleSize.find("li:eq(0)").addClass("active").data("value")})
      else
        $(v).removeClass("disabled")

  particleChange: (event) =>
    el = $(event.currentTarget)
    return false if el.hasClass "disabled"
    el.addClass("active").siblings().removeClass "active"
    @renderChart @historyHandle({step: el.data("value")})

  historyHandle: (data, filter) =>
    if data || filter
      data = _.omit _.extend(@historyHandle() || $.query.get(), data), filter
      hash = "?" + (_.map data, (v, k) -> k + "=" + v).join("&")
      history.pushState data, null, hash
      hash
    else
      history.state

  renderChart: (hash, url) =>
    $.ajax
      url: (url || @jsSelectChart.val()) + (hash || location.search)
      type: "GET"
      success: (data) =>
        if _.isEmpty data
          @chart.html "<div class='empty'>#{Lang.emptyData}</div>"
        else
          new Line(@chart[0], @serializeData data)
      error: (data) =>
        @chart.html "<div class='empty'>#{data.responseText}</div>"

  serializeData: (data) =>
    time = []
    series = []
    _.each data.series, (v, i) ->
      item = []
      _.each v.data, (v) ->
        time.push moment(v.x).format("MM-DD") if !i
        item.push v.y
      series.push {
        name: v.name
        smooth: true
        data: item
      }
    {
      series: series
      xAxis : [{
        boundaryGap: false
        data : time
      }]
    }

module.exports = Chart
