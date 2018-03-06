
const Chart = require("charts/chart"),
      LineChart = require("charts/line")

class ItemPriceCurve {
  constructor ($) {
    this.$jsCurveContainer = $(".js-price-curve-container")
    this.$jsPriceCurve = $(".js-price-curve")
    this.itemId = this.$jsPriceCurve.data("id")
    this.clicked = 0
    this.bindEvent()
  }

  bindEvent () {
    this.$el.on("click", evt => this.clickCurve(evt))
    this.$jsCurveContainer.on("mouseleave", evt => this.hideCurve(evt))
  }

  showCurve () {
    if (this.series) {
      this.$jsCurveContainer.addClass("active")
    }
  }

  clickCurve () {
    if (this.itemId && !this.clicked) {
      this.clicked = 1
      this.getPriceCurve()
    } else {
      this.showCurve()
    }
  }

  hideCurve () {
    this.$jsCurveContainer.removeClass("active")
  }

  serializeData (data) {
    let time = [],
        series = []
    _.each(data.series, (v) => {
      series.push(priceFormat(v.price))
      time.push(moment(v.day).format("MM-DD"))
    })

    let min = Math.min(...series) - 99,
        max = Math.max(...series),
        yMin = min < 0 ? 0 : min,
        mod = (max - yMin) % 3,
        yMax = max + 99 + 3 - mod

    return {
      series: [{
        name: "价格",
        smooth: true,
        itemStyle: {
          normal: {
            areaStyle: {
              type: 'default', color: 'rgba(253,249,230,0.5)'
            },
            lineStyle: {
              width: 2
            }
          }
        },
        data: series
      }],
      xAxis: [{
        boundaryGap: false,
        data: time
      }],
      yAxis: [{
        splitNumber: 3,
        scale: true,
        min: yMin < 0 ? 0 : yMin,
        max: yMax
      }]
    }
  }

  getPriceCurve () {
    $.ajax({
      url: `/api/zcy/orders/getRecentItemPriceCurve?itemId=${this.itemId}`,
      type: "GET",
      success: (data) => {
        this.series = data.itemDailyPrices
        new LineChart(this.$jsCurveContainer[0], this.serializeData({series: this.series}))
        this.showCurve()
      }
    })
  }
}

module.exports = ItemPriceCurve
