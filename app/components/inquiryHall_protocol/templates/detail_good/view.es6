class GoodDetail {
  constructor() {
    this.initLoadMore();
  }

  // 加载更多
  initLoadMore() {
    $('#loadMore').on('click', e => {
      e.preventDefault();
      $.ajax({
          url: `${$('input[name=lasvegasPath]').val()}/ctax/protocolhall/detail`,
          type: 'GET',
          dataType: 'jsonp',
          success: function(data) {
              console.log(data);
          }
      })
    });
  }

  getMoreData(data) {
    let $detailGoodCatalog = $('#detailGoodCatalog');
    let $detailGoodInfo = $('#detailGoodInfo');
    let rowspan = $detailGoodCatalog.attr('rowspan');

    $detailGoodCatalog.attr('rowspan', rowspan + 1);
    $.each(data, function(index, item) {
      $detailGoodInfo.append(`<tr>
              <td><a href=''>${item.requireItemBrand}/${item.requireItemModel}</a></td>
              <td>${item.protocolPrice}</td>
              <td>${item.minQuantity}~${item.quantity}</td>
            </tr>`);
    });
  }
}

module.exports = GoodDetail;
