###*
 * 柱形图
 * @param  {jQuery Object} @target  目标
 * @param  {Object} @options 参数和数据
###
class Bar

  constructor: (@target, @options) ->
    theme = require("charts/theme")
    options = $.extend {
      xAxis: [
        type: 'category'
      ]
      yAxis: [
        type: 'value'
      ]
      tooltip:
        show: true
        trigger: "item"
      legend:
        x: "right"
    }, @options
    options.title = {text: options.title} if options.title
    legended = options.legend.data
    _.map options.series, (v, i) ->
      v.type = "bar"
      v.barGap = 0
      !legended && if options.legend.data
        options.legend.data.push v.name
      else
        options.legend.data = [v.name]
    _.map options.xAxis, (v, i) ->
      v.axisTick = {
        show: false
      }
    echarts.init(@target, theme).setOption(options)

module.exports = Bar
