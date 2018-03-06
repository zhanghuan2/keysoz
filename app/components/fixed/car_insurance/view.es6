const Pagination = require('pokeball/components/pagination');
class carInsurance {

  constructor() {
    this.totalItems = $('.pagination').data('total') // 车辆保险定点供应商的总数量

    this.pagination = new Pagination('.pagination')
      .total(this.totalItems)
      .show($('.pagination')
      .data('size'), {
        num_display_entries: 5,
        jump_switch: true,
        maxPage: -1,
        page_size_switch: true,
        perpage: 10
    });
  }
}
module.exports = carInsurance;