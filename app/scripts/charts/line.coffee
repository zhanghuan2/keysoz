###*
 * 折线图
 * @param  {DOM} @target  目标
 * @param  {Object} @options 参数和数据
###
class Line

  constructor: (@target, @options) ->
    theme = require("charts/theme")
    hextorgb = require("charts/hextorgb")
    options = $.extend {
      grid: {
        x: 70
        x2: 30
        y: 40
        y2: 40
      }
      xAxis: [
        type: 'category'
        axisTick:
          show: false
      ]
      yAxis: [
        type: 'value'
      ]
      tooltip:
        show: true
        trigger: "axis"
        # formatter: (params) ->
        #   res = "<div>#{params[0].name}</div>"
        #   _.map params, (v, i) ->
        #     res += "<p><b style='background-color: #{theme.color[v.seriesIndex]}'></b>#{params[i].data || 0}</p>"
        #   return res
      legend:
        x: "right"
    }, @options
    options.title = {text: options.title} if options.title
    legended = options.legend.data
    _.map options.series, (v, i) ->
      v.type = "line"
      v.smooth = options.smooth if options.smooth
      v.itemStyle = {normal: {areaStyle: {color : ( ->
        return "rgba(#{hextorgb(theme.color[i])}, .8)"
      )()}}} if options.smooth && !v.itemStyle
      !legended && if options.legend.data
        options.legend.data.push v.name
      else
        options.legend.data = [v.name]
    _.map options.xAxis, (v, i) ->
      v.axisTick = {
        show: false
      }
    echart = echarts.init(@target, theme)
    echart.setOption(options)
    return echart

module.exports = Line
