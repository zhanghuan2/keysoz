let vm;
class GoodInfo {
  constructor() {
    vm = this;
    this.initLoadMore();
  }

  initLoadMore() {
    vm.showLoadMore();
    let $loadMoreGood = $("#loadMoreGood");
    $loadMoreGood.on("click", function(e) {
      e.preventDefault();
      let page = Number($(this).data("page")) + 1;
      let url = `${$(
        "input[name=lasvegasPath]"
      ).val()}/ctax/api/protocol/hall/pagingProtocolAnNouncementGoodItem?pageNo=${page}&anNouncementId=${$(
        this
      ).data("announcement-id")}`;
      console.log(`url:${url}`)
      // $.get(url, function(data) {
      //   vm.appendMoreGood(
      //     data.result.data,
      //     $loadMoreGood.data("bindding-method")
      //   );
      //   $loadMoreGood.data("page", page);        
      //   if (data.result.total / 10 <= page) {
      //     $loadMoreGood
      //       .parent()
      //       .parent()
      //       .hide();
      //   }
      // });
      $.ajax({
        url: url,
        type: "GET",
        dataType: 'jsonp',
        success: function(data) {
          console.log(`${JSON.stringify(data)}`);
          vm.appendMoreGood(data.data, $loadMoreGood.data("bindding-method"));
          $loadMoreGood.data("page", page);
          if (data.total / 10 <= page) {
            $loadMoreGood
              .parent()
              .parent()
              .hide();
          }
        },
        error:function(xhr,status,error){
          console.log(`error message xhr:${xhr};status:${status};error:${error}`);
        }
      });
    });
  }

  showLoadMore() {
    let $loadMoreGood = $("#loadMoreGood");
    let pageTotal = $loadMoreGood.data("total") / 10;
    if (pageTotal > 1) {
      $loadMoreGood
        .parent()
        .parent()
        .removeClass("hide");
    }
  }

  appendMoreGood(dataList, biddingMethod) {
    if (!dataList) {
      return;
    }
    let $goodNode = $("#goodList");
    let $goodCatalog = $("#goodCatalog");
    let count = Number($goodCatalog.attr("rowspan")) + dataList.length;
    console.log(`count:${count}`);
    $goodCatalog.attr("rowspan", count);
    $.each(dataList, (index, item) => {
      if (biddingMethod != "直接订购") {
        $goodNode.append(`<tr>
          <td>${item.requireItemBrand}/${item.requireItemModel}</td>
          <td>${item.quantity}</td>
          <td>${(item.protocolPrice / 100).toFixed(2)}</td>
          <td>${item.supplierName || ""}</td>
        </tr>`);
      } else {
        $goodNode.append(`<tr>
          <td>${item.requireItemBrand}/${item.requireItemModel}</td>
          <td>${item.quantity}</td>
          <td>${item.protocolPrice}</td>
          <td>${(item.quotePrice / 100).toFixed(2)}</td>
          <td>${item.supplierName || ""}</td>
        </tr>`);
      }
    });
  }
}

module.exports = GoodInfo;
