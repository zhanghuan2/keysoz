let Server = require('buyer/back-change/server');
let ComplexSearch = require('common/complex_search/extend');
let Modal = require('pokeball/components/modal');
let Pagination = require('pokeball/components/pagination');

class Buyer_BackChange_PurchaserList {

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

    let e;

    // 实例化搜索
    new ComplexSearch({

      searchElem : '.search',
      searchBtn : '#search-submit',
      clearBtn : '#search-reset',
      searchResetParams : ['pageNo']

    });

    // 实例化分页
    new Pagination(e = $('.list-pagination'))

      .total(e.data('total'))
      .show(e.data('size'), {num_display_entries : 5, jump_switch : true, page_size_switch : true})

    ;

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
        t;

    $('.buyer_back-change_purchaser-list').on('click', function (/* event */ e) {

      switch (t = $(e.target), true) {

        // 查看详情
        case t.is('.info') :
          return that.bindEventsInfo(e);

        // 重新发起
        case t.is('.afresh') :
          return that.bindEventsAfresh(e);

        // 撤回
        case t.is('.withdraw') :
          return that.bindEventsWithdraw(e);

        // 删除
        case t.is('.delete') :
          return that.bindEventsDelete(e);

        // 退换货
        case t.is('.exchange') :
          return that.bindEventsExchange(e);

        // 上门取件完成
        case t.is('.take') :
          return that.bindEventsTake(e);

      }

    });

  }

  bindEventsInfo(/* event */ e) {

    window.location.href = '/buyer/back-change/purchaser-info?returnOrderId=' + ($(e.target).parents('tr').data('return-id'));

  }

  bindEventsAfresh(/* event */ a) {

    let that = this;

    ZCY.confirm({title : '确认', content : '重新发起？', confirm(/* event */ b) {

      // 关闭对话框
      b.close();

      // 发送请求
      Server.purchaserListAfresh($(a.target).parents('tr').data(), that.handlerRequestDone);

    }});

  }

  bindEventsWithdraw(/* event */ a) {

    let that = this;

    ZCY.confirm({title : '确认', content : '撤回？', confirm(/* event */ b) {

      // 关闭对话框
      b.close();

      // 发送请求
      Server.purchaserListWithdraw($(a.target).parents('tr').data(), that.handlerRequestDone);

    }});

  }

  bindEventsDelete(/* event */ a) {

    let that = this;

    ZCY.confirm({title : '确认', content : '删除？', confirm(/* event */ b) {

      // 关闭对话框
      b.close();

      // 发送请求
      Server.purchaserListDelete($(a.target).parents('tr').data(), that.handlerRequestDone);

    }});

  }

  bindEventsExchange(/* event */ e) {

    let that = this,
        d;

    switch ((d = $(e.target).parents('tr').data()).returnType) {

      // 物流方式
      case 1 :
        return that.handlerExchangeEXP(d);

      // 上门取件方式
      case 2 :
        return that.handlerExchangeDTD(d);

    }

  }

  bindEventsTake(/* event */ a) {

    let that = this;

    ZCY.confirm({title : '确认', content : '上门取件完成？', confirm(/* event */ b) {

      // 关闭对话框
      b.close();

      // 发送请求
      Server.purchaserListTake($(a.target).parents('tr').data(), that.handlerRequestDone);

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

  /**
   * 处理程序，退换货，物流方式
   */
  handlerExchangeEXP(/* data */ d) {

    let that = this;

    // 渲染对话框
    let a = function (/* JSON */ j) {

      // 渲染
      (that.handlerExchangeEXP._$_modal_$_ = new Modal(Handlebars.templates['buyer/back-change/purchaser-list/templates/exchange-exp'] (j))).show();

      // 赋值
      if(j.address.supplierAddr) d.returnDeliveryId = j.address.supplierAddr.id;

      // 绑定事件
      $('.modal.buyer_back-change_purchaser-list.exchange').on('click', b);

    };

    // 提交
    let b = function (/* event */ e) {

      let t,
          a, b, c;

      if ($(e.target).is('.btn-primary')) {

        // 未选择快递公司
        if (c = !(a = (t = $(this).find('select')).val())) t.addClass('error');

        // 未输入快递单号
        if (c = !(b = (t = $(this).find('input[type="text"]')).val())) t.addClass('error');

        // 提交
        if (!c) Server.purchaserListExchangeSubmit((d.expressCode = (a = a.split(',')) [0], d.expressName = a[1], d.expressNo = b, d), that.handlerRequestDone);

      }

      else {

        $(this).find('.error').removeClass('error');

      }

    };

    // 执行请求
    Server.purchaserListExchangeEXP(d, a);

  }

  /**
   * 处理程序，退换货，上门取件方式
   */
  handlerExchangeDTD(/* data */ d) {

    let that = this;

    // 渲染对话框
    let a = function (/* json */ j) {

      // 渲染
      (that.handlerExchangeDTD._$_modal_$_ = new Modal(Handlebars.templates['buyer/back-change/purchaser-list/templates/exchange-dtd'] (j))).show();

      // 赋值
      if(j.address.supplierAddr) d.returnDeliveryId = j.address.supplierAddr.id;

      // 绑定事件
      $('.modal.buyer_back-change_purchaser-list.exchange').on('click', b);

    };

    // 提交
    let b = function (/* event */ e) {

      if ($(e.target).is('.btn-primary')) Server.purchaserListExchangeSubmit(d, that.handlerRequestDone);

    };

    // 执行请求
    Server.purchaserListExchangeDTD(d, a);

  }

}

module.exports = Buyer_BackChange_PurchaserList;
