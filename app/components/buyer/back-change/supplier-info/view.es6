let Download = require('common/uploadFile/extend');

class Buyer_BackChange_SupplierInfo {

  /**
   * 构造函数
   */
  constructor() {

    this.beforeRander();
    this.bindEvents();

  }

  /**
   * 渲染页面
   */
  beforeRander() {

    // 实例化下载附件
    new Download(

      '',
      '/api/zcy/attachment/downloadUrl',
      '#uploadFile'

    );

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
      t;

    $('.buyer_back-change_supplier-info').on('click', function (/* event */ e) {

      switch (t = $(e.target), true) {

        // 订单详情
        case t.is('.order-info') :
          return that.bindEventsOrderInfo(e);

      }

    });

  }

  bindEventsOrderInfo(/* event */ e) {

    window.location.href = '/seller/orders/detail?orderId=' + ($(e.target).html());

  }

}

module.exports = Buyer_BackChange_SupplierInfo;
