var OriginHeader2 = require("goodsHall/header2/view");

class ClassName extends OriginHeader2 {
  constructor($) {
    super($)
  }

  bindEvent() {
    super.bindEvent()
  }

  searchSubmit(evt) {
    let searchInput = $(".search-input.active");
    if(!$.trim(searchInput.val())) {
      evt.preventDefault();
    }
  }
}