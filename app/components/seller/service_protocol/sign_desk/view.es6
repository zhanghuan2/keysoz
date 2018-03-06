const Modal = require("pokeball/components/modal")
const serviceListTemplate = Handlebars.templates['seller/service_protocol/sign_desk/templates/list']
const serviceDetailTemplate = Handlebars.templates['seller/service_protocol/sign_desk/templates/serviceDetail']
const qualificationCheckTemplate = Handlebars.templates['seller/service_protocol/sign_desk/templates/qualificationCheck']

let cols = 3  //每行展示的服务数量

class ServiceSignDesk {

  constructor ($) {
    this.$componentBody = $('.component-body')
    this.$baseService = $('.base.service-list')
    this.$specialService = $('.special.service-list')
    this.pageRender()
    this.bindEvents()
    if (document.body.clientWidth > 1500) {
      cols = 4
    }
  }
  pageRender() {
    this.loadServiceList()
  }

  bindEvents () {
    this.$baseService.on('click', '.js-check-detail', (evt) => this.checkServiceDetail(evt))
    this.$specialService.on('click', '.js-join-protocol', (evt) => this.checkServiceDetail(evt))
    this.$specialService.on('click', '.js-check-qualification', (evt) => this.checkQualification(evt))
    this.$specialService.on('click', '.js-quit-service', (evt) => this.quitServiceProtocol(evt))
  }

  checkServiceDetail (evt) {
    let serviceData = $(evt.currentTarget).closest('.service-block').data('service'),
      type = $(evt.currentTarget).hasClass('js-join-protocol') ? 1 : 0
    let detailModal = new Modal(serviceDetailTemplate({data:serviceData, type}))
    $(detailModal.modal).on('change', '.js-check-read', (evt) => {
      $(detailModal.modal).find('.js-join-service').prop('disabled', !$(evt.currentTarget).prop('checked'))
    })
    $(detailModal.modal).on('click', '.js-join-service', (evt) => {
      $(evt.currentTarget).prop('disabled', true)
      let protocolId = $(evt.currentTarget).data('protocolId')
      detailModal.close()
      this.joinServiceProtocol(protocolId)
    })
    detailModal.show()
  }

  checkQualification (evt) {
    this.$componentBody.spin('medium')
    let protocolId = $(evt.currentTarget).data('protocolId')
    $.ajax({
      url: '/api/service/org/check',
      type: 'get',
      data: {protocolId}
    }).done((result) => {
      new Modal(qualificationCheckTemplate(result)).show()
    }).always(() => {
      this.$componentBody.spin(false)
    })
  }

  quitServiceProtocol (evt) {
    let protocolId = $(evt.currentTarget).data('protocolId')
    new Modal({
      icon: 'warning',
      title: '退出服务后，服务商品数据会被全部清空，已下单的交易服务约定仍然生效，是否确定？',
      isConfirm: true
    }).show(() => {
        this.$componentBody.spin('medium')
        $.ajax(({
          url: `/api/service/org?protocolId=${protocolId}`,
          type: 'delete'
        })).done(() => {
          this.$componentBody.spin(false)
          this.loadServiceList()
        }).fail(() => {
          this.$componentBody.spin(false)
        })
      })
  }


  popoverEvent () {

    _.each($('.js-popover'), (el) => {
      let content = null
      if ($(el).hasClass('base')){
        content = `<div>成为正式供应商后会自动加入<br>去<a href="#">申请加入正式供应商</a></div>`
      } else {
       content = `<div>因违反相关规定，您的服务已经被禁止使用，原因是${$(el).data('reason')}。若有疑问可拨打客服电话</div>`
      }
      $(el).popover({
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: content,
        delay: {
          hide: 500
        }
      })
    })
  }

  loadServiceList () {
    this.$componentBody.spin('medium')
    $.ajax({
      url: '/api/service/org',
      type: 'get'
    }).done((result) => {
      this.$baseService.find('.list').empty().append(serviceListTemplate({data:result.baseServiceOrgs, base: true})).css('height',`${110*Math.ceil(result.baseServiceOrgs.length/cols)}px`)
      this.$specialService.find('.list').empty().append(serviceListTemplate({data:result.specialServiceOrgs, base: false})).css('height', `${110*Math.ceil(result.specialServiceOrgs.length/cols)}px`)
      this.popoverEvent()
    }).always(() => {
      this.$componentBody.spin(false)
    })
  }

  joinServiceProtocol (protocolId) {
    this.$componentBody.spin('medium')
    $.ajax({
      url: '/api/service/org',
      type: 'post',
      data: {protocolId},
      error: (result) => {
        this.$componentBody.spin(false)
        new Modal({
          icon: 'error',
          title: '温馨提示',
          htmlContent: `<pre>${result.responseText}</pre>`
        }).show()
      }
    }).done(() => {
      this.$componentBody.spin(false)
      this.loadServiceList()
    })
  }

}

module.exports = ServiceSignDesk