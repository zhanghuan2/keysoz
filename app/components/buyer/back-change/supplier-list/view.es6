let Server = require('buyer/back-change/server');
let ComplexSearch = require('common/complex_search/extend');
let Pagination = require('pokeball/components/pagination');
let Modal = require('pokeball/components/modal');

import checker from "common/formchecker/extend";

class Buyer_BackChange_SupplierList {

  /**
   * 构造函数
   */
  constructor() {

    this.beforeRander();
    this.bindEvents();
    this.bindEventconfirmReceipt(); //换货按钮事件
    this.receiptModalEvent(); //收货

  }

  /**
   * 渲染页面
   */
  beforeRander() {

    let e;

    // 搜索
    new ComplexSearch({
      searchElem: '.search',
      searchBtn: '#search-submit',
      clearBtn: '#search-reset',
      searchResetParams: ['pageNo']
    });

    // 分页
    new Pagination(e = $('.list-pagination')).total(e.data('total')).show(e.data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    });

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
      t;

    $('.buyer_back-change_supplier-list').on('click', function( /* event */ e) {

      switch (t = $(e.target), true) {

        // 查看详情
        case t.is('.info'):
          return that.bindEventsInfo(e);

          // 确认
        case t.is('.confirm'):
          return that.bindEventsConfirm(e);

          // 收货
        case t.is('.receipt'):
          return that.bindEventsReceipt(e);

          // 换货
        case t.is('.exchange'):
          return that.bindEventsExchange(e);

          // 发货
        case t.is('.deliver'):
          return that.bindEventsDeliver(e);

      }

    });

  }

  bindEventsInfo( /* event */ e) {

    window.location.href = '/buyer/back-change/supplier-info?returnOrderId=' + ($(e.target).parents('tr').data('return-id'));

  }

  bindEventsConfirm( /* event */ e) {

    window.location.href = '/buyer/back-change/supplier-form?returnOrderId=' + ($(e.target).parents('tr').data('return-id'));

  }

  bindEventsReceipt( /* event */ e) {

  }

  bindEventsExchange( /* event */ e) {

  }

  bindEventsDeliver( /* event */ e) {

  }

  /**
   * 处理程序，请求完成
   */
  handlerRequestDone( /* power */ p, /* text */ t) {

    // 成功（并刷新）
    if (p) {

      ZCY.success('成功', t);
      window.location.reload();

    }

    // 错误
    else {

      ZCY.error('错误', t);

    }

  }


  //换货弹框wo begin
  bindEventconfirmReceipt() {
    $('.exchange').on('click', (evt) => this.confirmReceipt(evt));
  }

  confirmReceipt(evt) {
    let that = this;
    let returnOrderId = $(evt.target).parent().parent('tr').data('return-id');
    let modal;
    let confirmReceiptModal = Handlebars.templates["buyer/back-change/supplier-list/templates/confirmReceipt"];
    $.when(
      $.ajax({ //列表
        url: `/api/zcy/returns/supplier/initShipment?returnOrderId=${returnOrderId}`,
        type: "post",
        contentType: 'application/json'
      }),
      $.ajax({ //物流公司
        url: `/api/zcy/returns/expresscompany/query`,
        type: 'get'
      })).done(function(data1, data2) {
      let msg = {
        _DATA_: data1[0]
      };
      let skuIdCode = [];
      let skuid = data1[0].deliveryItems;
      let leafRegion = data1[0].deliverys[0].regionId;
      console.log(skuid);
      for (let i = 0; i < skuid.length; i++) {
        skuIdCode.push(skuid[i].skuId);
      }
      $.ajax({ //仓库请求
        url: `/api/zcy/stocks/findReturnSameWarehouse?leafRegion=${leafRegion}`,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(skuIdCode)
      }).done(function(data) {
        let companyList = data2[0];
        let option = '';
        let companyoption = '';
        modal = new Modal(confirmReceiptModal(msg));
        modal.show();
        //仓库下拉表
        for (let i = 0; i < data.length; i++) {
          option += `<option value="${data[i].code}">${data[i].name}</option>`;
        }
        $('[name="warehouse"]').append(option);

        //物流公司option
        for (let i = 0; i < companyList.length; i++) {
          companyoption += `<option value="${companyList[i].code}" data-status="${companyList[i].status}">${companyList[i].name}</option>`;
        }
        $('[name="logisticsCompany"]').append(companyoption);
        $('select').selectric();
        // 检测
        checker.formChecker({
          container: ".confirmReceipt",
          ctrlTarget: ".js-confirmReceipt-submit",
          precheck: false
        });
        //change
        $('.warehouse').trigger('change');
        $('.shipmentNo').trigger('change');
        $('[name="logisticsCompany"]').trigger('change');
        //加减事件
        that.bindShowReceviedItemForm();
        that.inputhandleChange();
        //确认按钮事件
        that.confirmReceiptSave(modal);
      });
      //change
      $('.warehouse').trigger('change');
      $('.shipmentNo').trigger('change');
      $('[name="logisticsCompany"]').trigger('change');
      //加减事件
      that.bindShowReceviedItemForm();
      that.inputhandleChange();
      //确认按钮事件
      that.confirmReceiptSave(modal);
    });
  }

  //input 判断disabled wo
  inputhandleChange() {
    $('.confirmReceipt').find('.count-number').on('change', function() {
      let initquantity = $(this).parent().data('max');
      if ($(this).val() != 0) {
        $(this).closest('tr').find('.check input').prop('checked', true);
      } else {
        $(this).closest('tr').find('.check input').prop('checked', false);
      }
    });
  }

  // 确认收货弹框 发货确认按钮事件 wo
  confirmReceiptSave(modal) {
    $('.js-confirmReceipt-submit').on('click', function() {
      let data = {};
      let shipment = {
        "returnOrderId": $('.returnOrder').html(),
        "returnOrderDeliveryId": $('.confirmReceipt').find('.panel-body').data('deliverid'),
        "shipmentNo": $('.shipmentNo').val(),
        "expressCode": $('[name="logisticsCompany"]').val(),
        "expressName": $('[name="logisticsCompany"]').find('option:checked').text(),
        // "status": $('[name="logisticsCompany"]').find('option:checked').data('status')
      };
      let shipWarehouseCode = $('[name="warehouse"]').val();
      let shipWarehouseName = $('[name="warehouse"]').find('option:checked').text();
      let shipmentItems = [];
      $('.confirmReceipt').find('tbody').find('tr').each(function() {
        let id = $(this).data('id');
        let skuId = $(this).data('skuid');
        let itemId = $(this).data('itemid');
        let quantity = $(this).find('.count-number').val();
        let obj = {
          'id': id,
          'skuId': skuId,
          'itemId': itemId,
          'quantity': quantity
        };
        shipmentItems.push(obj);
      });
      data.shipment = shipment;
      data.shipWarehouseCode = shipWarehouseCode;
      data.shipWarehouseName = shipWarehouseName;
      data.shipmentItems = shipmentItems;
      console.log(data);
      $.ajax({
        url: '/api/zcy/returns/supplier/doShipment',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).done(function() {
        console.log('成功');
        modal.close();
        window.location.reload();
      });
    });
  }

  bindShowReceviedItemForm() {
    //console.log('显示确认收货商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）');
    $(".plus").on("click", (evt) => this.addAndMinusCount(evt));
    $(".minus").on("click", (evt) => this.addAndMinusCount(evt));
    $("input.count-number").on("keyup", (evt) => this.changeCount(evt));
    $("input.count-number").on("change", (evt) => this.changeCount(evt));
    //初始化数字增减控件
    $('.input-amount').amount();
  }

  //确定收货单模块：手动更改商品数量（input控件修改）
  changeCount(evt) {
    let input = $(evt.target),
      count = input.val(),
      sum = sum = this.addAndMinusCount(evt);
    if (count > sum) {
      input.val(sum);
      input.trigger("change");
      return false
    }
  }


  //点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount(evt) {
    let input = $(evt.target).siblings("input.count-number");
    let count = input.val();
    let sum = parseInt($(evt.target).closest(".item-tr").data("max"));
    if (count > sum) {
      input.val(sum);
      count = sum;
    }
  }

  // 点击收货
  receiptModalEvent() {
    $('.receipt').on('click', function() {
      let receiptModal = Handlebars.templates["buyer/back-change/supplier-list/templates/receiptModal"];
      let returnOrderId = $(this).parent().parent().data('return-id')
      let modal = new Modal(receiptModal());
      modal.show();
      $('#receiptSave').on('click', function() {
        let obj = {
          confirmComment: $('[name="receiptModalRemark"]').val(),
          returnOrderId: returnOrderId
        };
        console.log(JSON.stringify(obj));
        $.ajax({
          url: '/api/zcy/returns/supplier/receive',
          type: 'post',
          data: JSON.stringify(obj),
          contentType: 'application/json'
        }).done(function() {
          modal.close();
          window.location.reload();
        });
      });

    });
  }

}

module.exports = Buyer_BackChange_SupplierList;