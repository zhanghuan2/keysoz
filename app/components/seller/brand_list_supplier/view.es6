const Pagination = require("pokeball/components/pagination"),
  Modal = require("pokeball/components/modal")

const Language = require("locale/locale")
var ComplexSearch = require("common/complex_search/extend");
let stateFlag = false

class brandListSuperlier {
  constructor($) {
    this.target = this.$el
    this.singel_flag; //当前选中item的类别
    var search = new ComplexSearch({
      tabElem: ".tab",
      searchElem: ".search",
      searchResetParams: ['pageNo'],
      param: {
        brandName: {
          inJson: false
        }
      }
    });

    this.pagination = $(".item-pagination")
    this.bindEvent()
  }

  bindEvent() {
    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })
  }

}

module.exports = brandListSuperlier