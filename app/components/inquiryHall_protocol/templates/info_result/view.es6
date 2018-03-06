const Modal = require("pokeball/components/modal");
let accessoryInfoTpl =
  Handlebars.templates[
    "inquiryHall_protocol/templates/accessoryConfigInfo/templates/list"
  ];

class InfoResult {
  constructor() {
    this.initShowDetail();
  }

  initShowDetail(data) {
    $("#showDetail").on("click", function(e) {
      e.preventDefault();
      let requireId = $(this).data("require-id");
      let protocolId = $(this).data("protocol-id");
      let protocolPrice = $(this).data("protocol-price");
      let singleShopMoney = $(this).data("single-shop-money");
      if(!protocolId || !requireId){
        console.log(`protocolId:${protocolId};requireId:${requireId}`);
        return;
      }
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        contentType: "application/json;charset=utf-8",
        url: `${$('input[name=lasvegasPath]').val()}/ctax/api/protocol/announcement/findProtocolAccessoryList`,
        data: {
          protocolId: protocolId,
          requireId: requireId
        },
        success: function(data) {
          console.log(`json callback${JSON.stringify(data)}`);
          $("#itemInfo").html("");
          $("#itemInfo").append(
            accessoryInfoTpl({ _ACCESSORY_CONFIG_INFO_: data })
          );
          // countTotal($a);
          $(".standard-price-info").text((protocolPrice / 100).toFixed(2));
          $(".adjust-price-info").text((singleShopMoney / 100).toFixed(2));
          $("#accessory-config-info-modal").css('width','960px')
          let MM = new Modal("#accessory-config-info-modal");
          MM.show();
        }
      });
    });
  }
}

module.exports = InfoResult;
