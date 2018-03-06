
let Server = (function () {

  /**
   * 采购人列表页
   */
  let purchaserListAfresh = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/resubmit',
      type        : 'post',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {if (r) {c(true, '“重新发起”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“重新发起”失败')}

    });

  };

  let purchaserListWithdraw = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/revoke',
      type        : 'post',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {if (r) {c(true, '“撤回”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“撤回”失败')}

    });

  };

  let purchaserListDelete = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/delete',
      type        : 'post',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {if (r) {c(true, '“删除”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“删除”失败')}

    });

  };

  let purchaserListExchangeEXP = function(/* data */ d, /* callback */ c) {

    let a, e;

    // address
    $.ajax({

      url         : '/api/zcy/returns/purchaser/initconfirm',
      type        : 'get',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {if ((a = r) && e) c({address : a, express : e})}

    });

    // express
    $.ajax({

      url         : '/api/zcy/returns/expresscompany/query',
      type        : 'get',
      contentType : 'application/x-www-form-urlencoded',

      // 成功
      success(/* response */ r) {if ((e = r) && a) c({address : a, express : e})}

    });

  };

  let purchaserListExchangeDTD = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/initconfirm',
      type        : 'get',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {c({address : r})}

    });

  };

  let purchaserListExchangeSubmit = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/confirm',
      type        : 'post',
      contentType : 'application/json',
      data        : JSON.stringify({returnDeliveryId : d.returnDeliveryId, returnOrderId : d.returnId, expressCode : d.expressCode, expressName : d.expressName, expressNo : d.expressNo}),

      // 成功
      success(/* response */ r) {if (r) {c(true, '“退换货”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“退换货”失败')}

    });

  };

  let purchaserListTake = function(/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/finish',
      type        : 'post',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId},

      // 成功
      success(/* response */ r) {if (r) {c(true, '“上门取件完成”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“上门取件完成”失败')}

    });

  };

  /**
   * 采购人详情页
   */
  let purchaserInfoConfirmReceipt = function (/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/receive',
      type        : 'post',
      contentType : 'application/x-www-form-urlencoded',
      data        : {returnOrderId : d.returnId, returnShipmentId : d.shipmentId},

      // 成功
      success(/* response */ r) {if (r) {c(true, '“确认收货”成功')} else {this.error()}},

      // 错误
      error(/* response */ r) {c(false, '“确认收货”失败')}

    });

  };

  /**
   * 采购人表单页
   */
  let purchaserFormReturnGoods = function (/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/items',
      type        : 'post',
      contentType : 'application/json',
      data        : JSON.stringify(d),

      // 成功
      success(/* response */ r) {c(r)}

    });

  };

  let purchaserFormAddAddress = function (/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/addr/create', // d.host + '/api/user/receivers/create',
      type        : 'post',
      contentType : 'application/json',
      data        : JSON.stringify(d),

      // 成功
      success(/* response */ r) {if (r) {c(r)} else {this.error()}},

      // 错误
      error(/* response */ r) {c()}

    });

  };

  let purchaserFormSubmit = function (/* data */ d, /* callback */ c) {

    $.ajax({

      url         : '/api/zcy/returns/purchaser/save',
      type        : 'post',
      contentType : 'application/json',
      data        : JSON.stringify(d),

      // 成功
      success(/* response */ r) {if (r) {c(r)}/* else {this.error()}*/},

      // 错误
      // error(/* response */ r) {c()}

    });

  };

  /**
   * 接口
   */
  return {

    purchaserListAfresh,
    purchaserListWithdraw,
    purchaserListDelete,
    purchaserListExchangeEXP,
    purchaserListExchangeDTD,
    purchaserListExchangeSubmit,
    purchaserListTake,
    purchaserInfoConfirmReceipt,
    purchaserFormReturnGoods,
    purchaserFormAddAddress,
    purchaserFormSubmit

  };

} ());

module.exports = Server;
