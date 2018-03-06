var OriginHeader = require("common/header/view");

export default class commonHeader extends  OriginHeader {
  constructor($) {
    super($)
    if (!this.checkIsIndex()) {//非首页才显示搜全站按钮
      $('#search-button-all').show()
    }
  }

  bindEvent() {
    super.bindEvent()
    $('#search-button-all').on('click', () => this.searchWholeSite())
  }

  searchSubmit(evt) {
    evt.preventDefault();
    let searchInput = $(".search-input.active");
    let words = $.trim(searchInput.val())
    if(words) {
      window.location.href = `/search?q=${words}&normal=4`
    }
  }

  searchWholeSite () {
    let searchInput = $(".search-input.active");
    let words = $.trim(searchInput.val()),
      frontUrl = $('#env-config').data('front')
    if(words) {
      window.location.href = `${frontUrl}/eevees/search?q=${words}&isSupplier=0`
    }
  }

  checkIsIndex () {
    let currentPath = window.location.pathname
    if (currentPath == '/' || currentPath == '/index') {
      return true
    }
    return false
  }
}