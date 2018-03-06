import Pagination from  "pokeball/components/pagination"
const listTemplate = Handlebars.templates["education/enquiryList/templates/list"]
let timer

class EnquiryList {

  constructor($) {
    this.$list = $('.list-body')
    this.$table = $('.enquiry-table')
    this.type = 1
    try {
      this.envHref = JSON.parse($('.js-env-href').val())
    } catch (e) {}
    this.preRender()
    this.bindEvents()
  }

  preRender () {
    this.getEnquiryData(1)
  }

  bindEvents () {
    this.$list.on('click', '.js-list-tab', (evt) => this.tabClick(evt))
  }

  getEnquiryData (pageNo) {
    let pageSize = 10, 
      self = this,
      queryData = {
        pageNo,
        pageSize,
        type: this.type
      },
      orgId = $('.js-org-id').val()
    if (orgId) {
      queryData.orgId = orgId
    }
    this.$list.spin('medium')
    $.ajax({
      url: '/api/zcy/edu/inquiryList',
      type: 'get',
      data: queryData
    }).done((result) => {
      self.$table.find('tbody,tfoot').remove()
      if (this.envHref) {
        result.domain = this.envHref.inquiry
        result.hallDomain = this.envHref.inquiryhall
      }
      self.$table.append(listTemplate(result))
      if (self.type == 1) {//询价结果列表不展示“离报价截止时间”字段
        this.$table.find('.js-recent-only').show()
      } else {
        this.$table.find('.js-recent-only').hide()
      }
      self.renderEndTime()
      self.$list.find('.js-total-count').text(result.total)
      new Pagination('.js-pagination').total(result.total).show(pageSize,
        {
          current_page: pageNo - 1,
          callback : function (pageNo) {
            self.getEnquiryData(pageNo+1)
          }
        })
    }).always(() => {
      this.$list.spin(false)
    })
  }

  tabClick (evt) {
    let $tab = $(evt.currentTarget)
    if ($tab.hasClass('active')) {
      return 
    }
    $tab.addClass('active')
    $tab.siblings('.js-list-tab').removeClass('active')
    let type = $tab.data('type')
    this.type = type
    if (type == 1) {//询价结果列表不展示“离报价截止时间”字段
      this.$table.find('.js-recent-only').show()
    } else {
      this.$table.find('.js-recent-only').hide()
    }
    this.getEnquiryData(1)
  }

  renderEndTime () {
    //倒计时刷新
    function timerCount() {
      $('.timer').each(function(i) {
        let timeEnd = $(this).data('time')
        if (timeEnd >= 1000) {
          var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数  
          var hh = parseInt(timeEnd / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数  
          var mm = parseInt(timeEnd / 1000 / 60 % 60, 10); //计算剩余的分钟数  
          dd = checkTime(dd)
          hh = checkTime(hh)
          mm = checkTime(mm)
          $(this).html(dd + "天:" + hh + "时" + mm + "分")
          $(this).data('time', timeEnd - 1000)
        } else {
          $(this).html("00天:00时00分")
        }
      })
    }

    //获取未报价页面状态截止时间
    function timeRest() {
      $('.time-rest').each(function(i) {
        let timeEnd = $(this).data('time')
        if (timeEnd >= 1000) {
          var dd = parseInt(timeEnd / 1000 / 60 / 60 / 24, 10); //计算剩余的天数  
          var hh = parseInt(timeEnd / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数  
          var mm = parseInt(timeEnd / 1000 / 60 % 60, 10); //计算剩余的分钟数  
          dd = checkTime(dd)
          hh = checkTime(hh)
          mm = checkTime(mm)
          $(this).html(dd + "天:" + hh + "时" + mm + "分")
        } else {
          $(this).html("00天:00时00分")
        }
      })
    }

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i
      }
      return i
    }

    //设置定时器
    function setTimer() {
      if (timer) {
        clearInterval(timer)
        timer = 0
      }
      timer = window.setInterval(function() {
        timerCount()
      }, 1000)
      timeRest()
    }

    setTimer()
  }
}

module.exports = EnquiryList