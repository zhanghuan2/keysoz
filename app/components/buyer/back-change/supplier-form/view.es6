let Modal = require('pokeball/components/modal');
import Address from "common/address/view";
import checker from "common/formchecker/extend";
require('pokeball/components/datepicker');

class Buyer_BackChange_SupplierForm {

  /**
   * 构造函数
   */
  constructor() {

    this.beforeRander();
    this.bindEvents();
    this.returnGoodsEvents(); //退货单确认

  }

  /**
   * 渲染页面
   */
  beforeRander() {

  }

  /**
   * 绑定事件
   */
  bindEvents() {

    let that = this,
      t;

    $('.buyer_back-change_supplier-form').on('click', function( /* event */ e) {

      switch (t = $(e.target), true) {

        // 订单详情
        case t.is('.order-info') :
          return that.bindEventsOrderInfo(e);

        // 添加地址
        case t.is('.add-address'):
          return that.bindEventsAddAddress(e);

        // 提交
        case t.is('.submit'):
          return that.bindEventsSubmit(e);

        // 取消
        case t.is('.cancel'):
          return that.bindEventsCancel(e);

      }

    });

  }

  bindEventsOrderInfo(/* event */ e) {

    window.location.href = '/seller/orders/detail?orderId=' + ($(e.target).html());

  }

  bindEventsAddAddress( /* event */ e) {

  }

  bindEventsSubmit( /* event */ e) {

  }

  bindEventsCancel( /* event */ e) {

    window.location.href = document.referrer;

  }

  // -------------------------------------------------------------------------------------------------------------------

  returnGoodsEvents() {
      // 检测
    // checker.formChecker({
    //   container: ".returnBox",
    //   ctrlTarget: "#returnGoodsSubmit",
    //   precheck: false
    // });
    this.addAdressModal();
    this.addAdressModalSave();
    this.disagreeeChange();
    this.returnGoodsCancel();
    this.returnGoodsSubmit();
    $(".date-input").datepicker();
    $('#receiptAddress').trigger('change');
    $('[name="timeStart"]').trigger('change');
    $('[name="timeEnd"]').trigger('change');
  }

  //添加地址跳转到弹框的添加地址界面 wo
  addAdressModal() {
    let Createtable = Handlebars.templates["buyer/back-change/supplier-form/templates/createtable"];
    $("#createModal").on('click', function() {
      $("#create .modal-header").html("新增收货地址");
      $("#create .modal-body").html(Createtable());
      let address = new Address();
      $('select').selectric();
      checker.formChecker({
        container: '.table-create',
        ctrlTarget: '#createSave'
      });
    });
  }

  // 添加地址确认按钮事件 wo
  addAdressModalSave() {
    $("button#createSave").on('click', function() {
      // let post = $('.envhrfe').text();//meiyong
      let Obj = {
        receiverName: $("#receiverName").val(),

        province: $("#creatProvince").find("option:selected").text(),
        provinceCode: $("#creatProvince").val(),
        city: $("#creatCity").find("option:selected").text(),
        cityCode: $("#creatCity").val(),
        region: $("#creatRegion").find("option:selected").text(),
        regionCode: $("#creatRegion").val(),
        street: $("#creatStreet").val() && $("#creatStreet").find("option:selected").text(),
        streetCode: $("#creatStreet").val(),

        details: $("#details").val(),
        zip: $("#zip").val(),
        mobile: $("#mobile").val(),
        areaCode: $("#areaCode").val(),
        phone: $("#phone").val(),
        phoneExt: $("#phoneExt").val(),
        isDefault: $("#isDefault").prop("checked") == true
      }
      let returnOrderId = $.query.get('returnOrderId');
      console.log(Obj);
      $.ajax({
        type: "post",
        url: `/api/zcy/returns/addr/create`,
        contentType: "application/json",
        data: JSON.stringify(Obj),
        success: function() {
          new Modal({
            icon: "success",
            title: "新增收货地址成功"
          }).show(function() {
            location.href = `/buyer/back-change/supplier-form?returnOrderId=${returnOrderId}`;
          });
        },
        error: function() {
          console.log('post /api/user/receiver/create error.')
          new Modal({
            icon: "error",
            isConfirm: false,
            title: "新增收货地址失败",
            content: "请重新填写信息"
          }).show();
        }
      })
    });
  }

  // 退货单确认提交 wo
  returnGoodsSubmit() {
    $('#returnGoodsSubmit').off().on('click', function() {
      let $timeInput = $('.timeStartInput');
      let timeS = $timeInput.val(),
          timeE = $(".timeEndInput").val();
      let obj = {
        returnOrderId: $.query.get('returnOrderId'),

        checkResult: $('.agree').prop('checked') == true,

        deliveryId: $('#receiptAddress').val(),

        pickupTime: timeS == '' ? '' : timeS + "~" + timeE,
        checkComment: $('[name="remark"]').val()
      };
        if($timeInput.is(":visible")){
          if(timeS == ""||timeE==""){
              new Modal({
                  icon: "error",
                  title: "请填写完整时间",
                  content: ""
              }).show(function() {
              });
            return;
          }
        }else{
          obj.pickupTime="";
        }
      $.ajax({
        url: '/api/zcy/returns/supplier/audit',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(obj)
      }).done(function() {
        new Modal({
          icon: "success",
          title: "提交成功",
          content: ""
        }).show(function() {
          location.href = "/buyer/back-change/supplier-list";
        });
      });
    });
  }
  //退货取消按钮
  returnGoodsCancel(){
    $('#createCancel').on('click',function(){
      window.location.href = '/buyer/back-change/supplier-list';
    });
  }
  //是否显示地址,日期
  disagreeeChange() {
    $('[name="sureResult"]').on('change', function() {
      if ($('.disagreee').prop('checked') == true) {
        $('.addressSelect').css('display', 'none');
        $('#receiptAddress').val('');
        $('select').selectric('refresh');
        $('[name="timeStart"]').val('');
        $('[name="timeEnd"]').val('');
        $('.pickTime').css('display', 'none');
      } else {
        $('.addressSelect').css('display', 'block');
        $('select').selectric('refresh');
        $('.pickTime').css('display', 'block');
      }  
      // 检测
    // checker.formChecker({
    //   container: ".returnBox",
    //   ctrlTarget: "#returnGoodsSubmit",
    //   precheck: false
    // });   
      $('#receiptAddress').trigger('change');
      $('[name="timeEnd"]').trigger('change');
      $('[name="timeStart"]').trigger('change');


    });

  }

}

module.exports = Buyer_BackChange_SupplierForm;