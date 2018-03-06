import Pagination from "pokeball/components/pagination"
const spusListTemplate = Handlebars.templates["seller/spus/spu_list/templates/list"]


class SpuList {

  constructor ($) {
    this.$itemList = $('.item-list')
    this.getSpusList()
    this.bindEvents()
  }

  bindEvents () {
    this.$itemList.on('click', '.js-submit-spu', (evt) => this.submitSpu(evt))
  }

  getSpusList (pageNo) {
    let queryData = {pageNo: 1, pageSize: 20}
    if (pageNo) {
      queryData.pageNo = pageNo
    }
    if ($.query.get('status') != undefined) {
      queryData.status = $.query.get('status')
    }
    let self = this
    $.ajax({
      url: '/api/spu/audit/page',
      type: 'get',
      data: queryData,
      success: (result) => {
        this.pageNo = pageNo
        this.$itemList.html(spusListTemplate(result))
        new Pagination(".item-pagination").total(result.total).show(20, {
          current_page: queryData.pageNo - 1,
          callback: (pageNo) => {
            self.getSpusList( pageNo + 1)
          }
        })
      }
    })
  }

  submitSpu (evt) {
    let spu = $(evt.currentTarget).closest('tr').data('spu')
    $.ajax({
      url: '/api/zcy/spu/supplier/submit-create',
      type: 'post',
      data: {auditResult: 'SUBMIT_AUDIT', bizId: spu.bizId},
    }).done(() => {
      this.getSpusList(this.pageNo)
    })
  }
}

module.exports = SpuList