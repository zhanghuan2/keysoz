let Server = require('buyer/back-change/server');
let Download = require('common/uploadFile/extend');

class Buyer_BackChange_PurchaserInfo {

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

    let attrs = $('.table .js-sku-attrs');
    _.each(attrs, (el)=>{
      let attrMap = $(el).data('attrs');
      let htmlStr = '';
      for(let key in attrMap){
        htmlStr = htmlStr + key + ' : ' + attrMap[key] + '   ';
      }
      $(el).html(htmlStr);
    });

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
        t;

    $('.buyer_back-change_purchaser-info').on('click', function (/* event */ e) {

      switch (t = $(e.target), true) {

        // 订单详情
        case t.is('.order-info') :
          return that.bindEventsOrderInfo(e);

        // 确认收货
        case t.is('.confirm-receipt') :
          return that.bindEventsConfirmReceipt(e);

      }

    });

  }

  bindEventsOrderInfo(/* event */ e) {

    window.location.href = '/buyer/orders/detail?orderId=' + ($(e.target).html());

  }

  bindEventsConfirmReceipt(/* event */ a) {

    let that = this;

    ZCY.confirm({title : '确认', content : '确认收货？', confirm(/* event */ b) {

      // 关闭对话框
      b.close();

      // 发送请求
      Server.purchaserInfoConfirmReceipt($(a.target).data(), that.handlerRequestDone);

    }});

  }


  /**
   * 处理程序，请求完成
   */
  handlerRequestDone(/* power */ p, /* text */ t) {

    // 成功（并刷新）
    if (p) {

      ZCY.success('成功', t); window.location.reload();

    }

    // 错误
    else {

      ZCY.error('错误', t);

    }

  }

}

module.exports = Buyer_BackChange_PurchaserInfo;
