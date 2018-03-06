let vm;
class BatchResult {
  constructor() {
    this.initLoadMore();
    vm = this;
  }

  initLoadMore() {
    let $loadMoreResult = $("#loadMoreResult");
    let page = $loadMoreResult.data("total") / 10;
    if (page > 1) {
      $loadMoreResult
        .parent()
        .parent()
        .removeClass("hide");
    }
    $loadMoreResult.on("click", function(e) {
      e.preventDefault();
      let page = Number($(this).data("page")) + 1;
      let lasvegasPath = $("input[name=lasvegasPath]").val();
      let announcementId = $(this).data("announcement-id");
      $.ajax({
        url: `${lasvegasPath}/ctax/api/protocol/hall/pagingProtocolAnNouncementDealResultItem?pageNo=${page}&anNouncementId=${announcementId}`,
        type: "GET",
        dataType: "jsonp",
        success: function(Paging) {
          console.log(`Paging:${JSON.stringify(Paging)}`);
          vm.appendMoreData(Paging.data);
          if (Paging.total / 10 <= page) {
            $loadMoreResult
              .parent()
              .parent()
              .hide();
            $("#loadMoreResult").data("page", page);
          }
        },
        error: function(xhr, status, thrown) {
          console.log(
            `error message xhr:${xhr};status:${status};thrown:${thrown}`
          );
        }
      });
    });
  }

  appendMoreData(data) {
    let $resultList = $("#resultList");
    let count = $resultList.find("tr").size() + 1;
    $.each(data, function(index, item) {
      let tradedUrl = `/lasvegas/protocolhall/result?anNouncementId=${item.detailLinkId}`; 
      console.log(`item:${JSON.stringify(item)}url:${tradedUrl}`);
      $resultList.append(`<tr>
                <td>${count + index}</td>
                <td>${item.purchaser}</td>
                <td>${item.dealItemBrand}/${item.dealItemModel}</td>
                <td>${item.dealQuantity}</td>
                <td>${item.requireStateName}</td>
                <td>${isNaN(item.dealPrice / 100) ? "" : (item.dealPrice / 100).toFixed(2)}</td>
                <td>${isNaN(item.dealTotalPrice / 100) ? "" : (item.dealPrice / 100).toFixed(2)}</td>
                <td>${item.discountRate || ""}</td>
                <td>${item.dealSupName || ""}</td>
                <td><a href="${tradedUrl}" class="${item.requireStateName == '确认中' ? 'hide' : ''}">详细</a></td>
              </tr>`);
    });
  }
}

module.exports = BatchResult;
