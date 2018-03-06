var Pagination  = require("pokeball/components/pagination");

class ZcyPagination {
  constructor() {
    var $itemsPerPageSelector = $('#items-per-page-selector');
    $itemsPerPageSelector.val($.query.get('pageSize') || $itemsPerPageSelector.val()).selectric();
    /* 默认10条 */
    $.query.set('pageSize', 10);
    new Pagination(".pagination").total($('#pagination-total').data('total')).show($itemsPerPageSelector.val(),
      {
        maxPage: -1,
        callback : function (curr, pagesize)
        {
          window.location.search = $.query.set('pageNo', parseInt(curr) + 1).toString();
        }
      });
    $('#items-per-page-selector').on('change', function(event) {
      new Pagination(".pagination").total($('#pagination-total').data('total')).show($itemsPerPageSelector.val(),
        {
          maxPage: -1,
          callback : function (curr, pagesize)
          {
            window.location.search = $.query.set('pageNo', parseInt(curr) + 1).toString();
          }
        });
      window.location.search = $.query.set('pageSize', $itemsPerPageSelector.val()).set('pageNo', 1);
    });
  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = ZcyPagination;
