const Pagination = require('pokeball/components/pagination');

export default class carMaintenance {
  constructor() {
    //分页
    let totalItems = $('.pagination').data('total') // 车辆维修定点供应商的总数量
    this.pagination = new Pagination('.pagination')
      .total(totalItems)
      .show($('.pagination')
        .data('size'), {
        num_display_entries: 5,
        jump_switch: true,
        maxPage: -1,
        page_size_switch: true,
        perpage: 10
      })

    this.fillParamToPage()
    $('#btn-reset').on('click', (e) => this.handlerReset(e))
  }

  /**
   * 回填表单字段
   * $.query没有值的字段默认为true，回填时需要过滤
   */
  fillParamToPage() {
    $.each($.query.keys, (key, value) => {
      if (typeof value == 'boolean') {
        return
      }

      if (key === 'group') {
        return
      }

      if (key === 'supplierType') {
        $.each($('.filter-form option'), (index, option) => {
          if ($(option).val() == value) {
            $(option).prop('selected', true);
            $('.filter-form select').selectric()
            return
          }
        })
      } else {
        $('.filter-form').find(`input[name=${key}]`).val(value)
      }
    })
  }

  handlerReset(e) {
    e.preventDefault()
    // $('.filter-form').trigger('reset') // 清空表单字段
    // $('select[name=supplierType]').selectric('refresh')
    return window.location.search = 'group=wxdwlx';
  }
}
