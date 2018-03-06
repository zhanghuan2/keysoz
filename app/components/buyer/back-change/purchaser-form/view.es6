let Server = require('buyer/back-change/server');
let Address = require('common/address/view');
let FormChecker = require('common/formchecker/view');
let UploadFile = require('common/uploadFile/view');
let Modal = require('pokeball/components/modal');
let Pagination = require('pokeball/components/pagination');

class Buyer_BackChange_PurchaserForm {

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

    let that = this;

    // 表单验证
    that.checker = new FormChecker({

      container : '.buyer_back-change_purchaser-form .component.form',
      ctrlTarget : '.submit'

    });

    // 附件上传
    UploadFile.bindChange(

      '/api/zcy/attachment/credentials',
      '/api/zcy/attachment/downloadUrl'

    );

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
        t;

    $('.buyer_back-change_purchaser-form').on('click', function (/* event */ e) {

      switch (t = $(e.target), true) {

        // 订单详情
        case t.is('.order-info') :
          return that.bindEventsOrderInfo(e);

        // 选择商品
        case t.is('.selection-goods') :
          return that.bindEventsSelectionGoods(e);

        // 删除商品
        case t.is('.delete-goods') :
          return that.bindEventsDeleteGoods(e);

        // 退货方式
        case t.is('.return-method') :
          return that.bindEventsReturnMethod(e);

        // 添加地址
        case t.is('.add-address') :
          return that.bindEventsAddAddress(e);

        // 提交
        case t.is('.submit') :
          return that.bindEventsSubmit(e);

        // 取消
        case t.is('.cancel') :
          return that.bindEventsCancel(e);

      }

    });

    $(window).on('focusout', function (/* event */ e) {

      switch (t = $(e.target), true) {

        // 修改数量
        case t.is('.number') :
          return that.bindEventsNumber(e);

      }

    });

  }

  bindEventsOrderInfo(/* event */ e) {

    window.location.href = '/buyer/orders/detail?orderId=' + ($(e.target).html());

  }

  bindEventsSelectionGoods(/* event */ e) {

    let that = this;

    // 初始化渲染
    let a = function (/* JSON */ j) {

      that.handlerSelectionGoods(j, b);

    };

    // 翻页渲染
    let b = function (/* index */ i) {

      Server.purchaserFormReturnGoods(that.handlerSelectionGoodsParam(++i), that.handlerSelectionGoodsRefresh.bind(that));

    };

    // 执行请求
    Server.purchaserFormReturnGoods(that.handlerSelectionGoodsParam(), a);

  }

  bindEventsDeleteGoods(/* event */ e) {

    $(e.target).parents('tr').remove();

    if ($('.field.return-goods tbody tr').length === 0) {

      // 隐藏
      $('.fieldset.return-goods').addClass('hide');

      // 赋值
      $('.field.return-goods input:eq(0)').val('').trigger('blur');

    }

  }

  bindEventsReturnMethod(/* event */ e) {

    $('.field.receipt-address label:eq(0)').html('<span class="required">*</span>' + ($(e.target).val() === '1' ? '收货地址' : '取件地址'));

  }

  bindEventsAddAddress(/* event */ e) {

    let that = this;

    // 回调（添加）
    let c = function () {

      Server.purchaserFormAddAddress(that.handlerAddAddressParam(), that.handlerAddAddressDone.bind(that));

    };

    // 执行
    that.handlerAddAddress(c);

  }

  bindEventsSubmit(/* event */ e) {

    let that = this;

    // 回调
    let c = function (/* power */ p) {

      if (p) {

        ZCY.success('成功', '“提交”成功'); window.location.href = document.referrer;

      }

      else {

        ZCY.error('错误', '“提交”失败');

      }

    };


    // 执行
    Server.purchaserFormSubmit(that.handlerSubmitData(), c);

  }

  bindEventsCancel(/* event */ e) {

    window.location.href = document.referrer;

  }

  bindEventsNumber(/* event */ e) {

    let that = this,
        t;

    // 取整
    that.handlerNumberParseInt(t = $(e.target));

    // 计算和
    that.handlerNumberSum(t);

  }

  /**
   * 处理程序，选择商品
   */
  handlerSelectionGoods(/* data */ d, /* callback */ c) {

    let that = this,
        e;

    // 实例化对话框
    (that.handlerSelectionGoods._$_modal_$_ = new Modal(

      Handlebars.templates['buyer/back-change/purchaser-form/templates/modal_return-goods'] ({

        total : d.total,
        data : Handlebars.templates['buyer/back-change/purchaser-form/templates/modal_return-goods_tbody'] (d)

      })

    )).show();

    // 实例化分页
    new Pagination(e = $('.modal.buyer_back-change_purchaser-form.return-goods .list-pagination'))

      .total(e.data('total'))
      .show(e.data('size'), {num_display_entries : 5, jump_switch : true, callback : c})

    ;

    // 绑定事件
    $('.modal.buyer_back-change_purchaser-form.return-goods').on('click', that.handlerSelectionGoodsAction.bind(that));

  }

  handlerSelectionGoodsRefresh(/* data */ d) {

    // 渲染内容
    $('.modal.buyer_back-change_purchaser-form.return-goods tbody').html(Handlebars.templates['buyer/back-change/purchaser-form/templates/modal_return-goods_tbody'] (d));

    // 重置全选
    $('.modal.buyer_back-change_purchaser-form.return-goods .action-select-all').prop('checked', false);

  }

  handlerSelectionGoodsAction(/* event */ e) {

    let that = this,
        t;

    switch (t = $(e.target), true) {

      // 全选
      case t.is('.action-select-all') :
        return that.handlerSelectionGoodsActionSelectAll(t.is(':checked'));

      // 单选
      case t.is('.action-select') :
        return that.handlerSelectionGoodsActionSelect(t.parents('tbody').find('.action-select:not(:checked)').length === 0);

      // 提交
      case t.is('.action-submit') :
        return that.handlerSelectionGoodsActionSubmit();

    }

  }

  handlerSelectionGoodsActionSelectAll(/* power */ p) {

    $('.modal.buyer_back-change_purchaser-form.return-goods .action-select-all, .modal.buyer_back-change_purchaser-form.return-goods .action-select').prop('checked', p);

  }

  handlerSelectionGoodsActionSelect(/* power */ p) {

    $('.modal.buyer_back-change_purchaser-form.return-goods .action-select-all').prop('checked', p);

  }

  handlerSelectionGoodsActionSubmit() {

    let that = this;

    $('.modal.buyer_back-change_purchaser-form.return-goods .action-select:checked').each(function (/* index */ i, /* target */ t) {

      // 克隆
      t = $(t).parents('tr').clone();

      // 移除第一列
      t.find('td:eq(0)').remove();

      // 添加后一列
      t.append('<td><a class="delete-goods" href="javascript:;">删除</a></td>')

      // 添加
      t.appendTo('.field.return-goods tbody');

    });

    if ($('.field.return-goods tbody tr').length) {

      // 显示
      $('.fieldset.return-goods').removeClass('hide');

      // 赋值
      if ($('.field.return-goods .number.error').length === 0) $('.field.return-goods input:eq(0)').val('true').trigger('blur');

    }

    // 关闭对话框
    that.handlerSelectionGoods._$_modal_$_.close();

  }

  handlerSelectionGoodsParam(/* page-index */ i) {

    let that = this,
        a;

    return {

      "orderId"     : ($('.field.return-goods input:eq(2)').val()),
      "excludeIds"  : (a = [], $('.field.return-goods tbody tr').each(function (i, t) {a.push($(t).data('sku-id'))}), a),
      "pageNo"      : (i || 1),
      "pageSize"    : (4)

    };

  }

  /**
   * 处理程序，添加地址
   */
  handlerAddAddress(/* callback */ c) {

    let that = this;

    // 实例化对话框
    (that.handlerAddAddress._$_modal_$_ = new Modal(Handlebars.templates['buyer/back-change/purchaser-form/templates/modal_address'] ())).show();

    // 实例化地址
    new Address('.modal.address');

    // 下拉列表
    $('.modal.address select').selectric();

    // 绑定事件
    $('#createSave').on('click', c);

    // 表单验证
    new FormChecker({container : '.modal.address .table-create', ctrlTarget : '#createSave'});

  }

  handlerAddAddressDone(/* power */ p) {

    let that = this,
        d;

    if (p && (d = that.handlerAddAddress._$_data_$_)) {

      // 添加到列表
      $('.field.receipt-address select:eq(0)').append(

        '<option value="' + p + '" selected="selected">' +
          d.province + ' ' +
          d.city + ' ' +
          d.region + ' ' +
          d.street + ' ' +
          d.details + '（' +
          d.receiverName + ' 收）' +
          d.mobile +
        '</option>'

      ).selectric('refresh').trigger('change');

      // 关闭对话框
      that.handlerAddAddress._$_modal_$_.close();

    }

    else {

      ZCY.error('错误', '“添加地址”失败');

    }

  }

  handlerAddAddressParam() {

    let that = this,
        a;

    return that.handlerAddAddress._$_data_$_ = {

      "host"          : ($('.field.return-goods input:eq(6)').val()),
      "receiverName"  : ($('#receiverName').val()),
      "province"      : ($('#creatProvince').find('option:selected').text()),
      "provinceCode"  : ($('#creatProvince').val()),
      "city"          : ($('#creatCity').find('option:selected').text()),
      "cityCode"      : ($('#creatCity').val()),
      "region"        : ($('#creatRegion').find('option:selected').text()),
      "regionCode"    : ($('#creatRegion').val()),
      "street"        : ($('#creatStreet').val() && $('#creatStreet').find('option:selected').text()),
      "streetCode"    : ($('#creatStreet').val()),
      "details"       : ($('#details').val()),
      "zip"           : ($('#zip').val()),
      "mobile"        : ($('#mobile').val()),
      "areaCode"      : ($('#areaCode').val()),
      "phone"         : ($('#phone').val()),
      "phoneExt"      : ($('#phoneExt').val()),
      "isDefault"     : (false)

    };

  }

  /**
   * 处理程序，提交，数据
   */
  handlerSubmitData() {

    let that = this,
        a;

    return {

      "id"                    : ($('.field.return-goods input:eq(1)').val()),
      "orderId"               : ($('.field.return-goods input:eq(2)').val()),
      "supplierContact"       : ($('.field.return-goods input:eq(3)').val()),
      "supplierContactMobile" : ($('.field.return-goods input:eq(4)').val()),
      "createrContactMobile"  : ($('.field.return-goods input:eq(5)').val()),
      "returnType"            : ($('.field.return-type input:checked').val()),
      "returnOrderType"       : ($('.js-return-order-type').val()),
      "returnReason"          : ($('.field.return-reason select:eq(0)').val()),
      "deliveryId"            : ($('.field.receipt-address select:eq(0)').val()),
      "remark"                : ($('.field.remark textarea').val()),
      "returnItems"           : (a = [], $('.fieldset.return-goods tbody tr').each(function (i, t) {a.push(that.handlerSubmitDataReturnItem($(t)))}), a),
      "returnFiles"           : (UploadFile.getFiles())

    };

  }

  handlerSubmitDataReturnItem(/* target */ t) {

    let that = this,
        a;

    return {

      "itemId"                : (t.data('item-id')),
      "skuId"                 : (t.data('sku-id')),
      "swapQuantity"          : (t.find('.swap-quantity').val()),
      "pplanRelations"        : (a = [], t.find('.back-quantity').each(function (i, t) {a.push(that.handlerSubmitDataPPlanRelation($(t)))}), a)

    };

  }

  handlerSubmitDataPPlanRelation(/* target */ t) {

    let that = this,
        a;

    return {

      "orderPayId"            : (t.data('pay-id')),
      "backQuantity"          : (t.val())

    };

  }

  /**
   * 处理程序，修改数量
   */
  handlerNumberParseInt(/* target */ t) {

    let v;

    // 非数字
    if (isNaN(v = parseInt(t.val()))) t.val(t.data('value'));

    // 大于最大值
    else if (v > t.data('value-max')) t.val(t.data('value-max'));

    // 小于零
    else if (v < 0) t.val(0);

    // 赋值
    else t.val(v);

  }

  handlerNumberSum(/* target */ t) {

    let v;

    if (v = 0, (t = t.parents('tr')).find('.number').each(function (i, t) {v += Number($(t).val())}), v > Number(t.find('.number-sum').html())) {

      // 高亮
      t.find('.number').addClass('error');

      // 提示
      t.find('.number-tip').removeClass('hide');

      // 赋值
      if ($('.field.return-goods .number.error').length) $('.field.return-goods input:eq(0)').val('').trigger('blur');

    }

    else {

      // 取消高亮
      t.find('.number').removeClass('error');

      // 取消提升
      t.find('.number-tip').addClass('hide');

      // 赋值
      if ($('.field.return-goods .number.error').length === 0) $('.field.return-goods input:eq(0)').val('true').trigger('blur');

    }

  }

}

module.exports = Buyer_BackChange_PurchaserForm;
