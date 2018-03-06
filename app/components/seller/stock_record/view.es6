const Pagination = require("pokeball/components/pagination"),
      CommonDatepicker = require("extras/common_datepicker")

class StockRecord {

  constructor($) {
    this.$jsSearch = $(".js-search-button")
    this.$jsSearchReset = $(".js-search-reset")
    this.commonDate = $(".js-common-date")
    this.bindEvent()
  }

  bindEvent() {
    let type = $(".stock-record-body").data("type")
    $(".input-datepicker").datepicker({maxDate: new Date()})
    new CommonDatepicker(this.commonDate)
    $(".js-select-type").val(type)
    new Pagination(".pagination").total($(".stock-record-body").data("total")).show($('.pagination').data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.$jsSearch.on("click", (evt)=>this.search(evt))
    this.$jsSearchReset.on("click", (evt)=>this.searchReset(evt))
  }

  search(evt) {
    evt.preventDefault()
    let type = $(evt.currentTarget).siblings(".span3").find("select option:selected").val(),
        createdStartAt = $(".js-start-date").val(),
        createdEndAt = $(".js-end-date").val()
    window.location = $.query.set("type",type).set("createdStartAt",createdStartAt).set("createdEndAt",createdEndAt)
  }

  searchReset(evt) {
    evt.preventDefault()
    window.location.search = $.query.remove("type").remove("createdStartAt").remove("createdEndAt")
  }
}
module.exports = StockRecord
