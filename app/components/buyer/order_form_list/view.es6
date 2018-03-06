import Modal from "pokeball/components/modal";
import Pagination from "pokeball/components/pagination";
import GetPhone from "common/get_phone/view";
const allWarehouseTemplates = Handlebars.templates["buyer/order_form_list/templates/all-warehouse"];
const rejectOrderTemplates = Handlebars.templates["buyer/order_form_list/templates/reject_order"];
const cancelOrderTemplates = Handlebars.templates["buyer/order_form_list/templates/cancelOrder"];
const confirmCancelOrderTemplates = Handlebars.templates["buyer/order_form_list/templates/confirmCancelOrder"];
const batchNumberTpl = Handlebars.templates["buyer/order_form_shipment_create/templates/addBatchNumber"];
const batchNumberRow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberRow"];
const batchNumberShow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberShow"];
const FormChecker = require('common/formchecker/view');
const ConfirmShipmentReceipt = require('buyer/confirm_shipment_receipt/view');
const dateIntervalPicker = require('common/date-interval-picker/view');
const fuzzyQueryPurchaseOrgs = require('common/fuzzy_query_input/purchaseOrgs/view')
const fuzzyQuerySupplierOrgs = require('common/fuzzy_query_input/supplierOrgs/view')
const fuzzyQueryPurchaser = require('common/fuzzy_query_input/purchaser/view')
const ItemServices = require('common/item_services/view')
const ItemsInvalid = Handlebars.templates["buyer/order_form_list/templates/itemsInvalid"]

class OrderFormList {

  constructor($) {
    //当前页面业务标签
    this.tag = $('.js-order-tag').val()
    this.$searchTable = $('.search-table')
    this.pagination = $(".list-pagination")
    this.reissueShpimentCreate = $('.js-create-reissue-shipment');
    this.acceptanceUpload = $('.js-upload-acceptance-file');
    this.acceptanceShow = $('.js-show-acceptance-file');
    this.installFileUpload = $('.js-upload-install-file');
    this.isNeedReload = false;
    this.installFileShow = $('.js-show-install-file');
    this.orderCheck = $('.js-order-check');
    this.cancelOrderBtn = $('[name="cancel-order"]')
    this.confirmCancelOrderBtn = $('[name="confirm-cancel-order"]');
    this.setPriceBtn = $(".js-set-price");
    this.normalModal= null;
    this.needCheckUser = $(".js-check-user");
    this.confirmReceive = $('.js-confirm-receiving');

    new GetPhone();
    this.initQueryConditions();
    this.bindEvent();
    this.shipmentTypehandle();//收货弹框单选按钮
    this.getPagePrivilege();//获取页面权限
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  bindEvent() {

    $(".js-search").on("click", () => this.searchOrders());
    $('input,select').on('keypress', (evt) => this.searchContentKeyPress(evt));
    $('.js-search-reset').on('click', () => this.clickSearchReset());
    this.reissueShpimentCreate.on('click', (evt) => this.createReissueShipment(evt));
    this.acceptanceShow.on('click', (evt) => this.showAcceptanceFile(evt));
    this.acceptanceUpload.on('click', (evt) => this.uploadAcceptanceFile(evt));
    this.installFileUpload.on('click', (evt) => this.uploadInstallFile(evt));
    this.installFileShow.on('click', (evt) => this.showInstallFile(evt));

    this.orderCheck.on('click', (evt) => this.checkOrder(evt));
    this.needCheckUser.on("click", (evt) => this.checkUserLogin());
    this.cancelOrderBtn.on("click", (evt) => this.cancelOrder(evt))
    this.confirmCancelOrderBtn.on("click", (evt) => this.confirmCancelOrder(evt))
    $('.first-level-tr').on('click', (evt) => this.hideOrShowSecondLevel(evt));
    $(document).on('change', '.js-all-select-warehouse', (evt) => this.selectWarehouseFilter(evt));
    $(document).on('change', '.js-single-select-warehouse', (evt) => this.selectSingleWarehouse(evt));
    $(document).on("confirm:receive-order", (evt, data) => this.receiveOrder(evt, data));
    this.$el.on("click", ".js-reject-order", (evt) => this.rejectOrder(evt));
    //确认收货
    this.confirmReceive.on('click', (evt) => {
      let shipmentId = $(evt.target).closest('tr').data("shipmentId"),
        showAccept = true;
      new ConfirmShipmentReceipt(shipmentId, showAccept).show();
    });
    this.setPriceBtn.on('click',(evt)=> this.getPriceAjax(evt));
    $('.js-buy-again').on('click', (evt) => this.buyAgain(evt))
  }

  //获取页面权限
  getPagePrivilege(){
    $.ajax({
      url: '/api/zcy/getResourcePrivilege',
      type: 'get',
      data: {pageId:'orderSearch'}
    }).done((resp)=>{
      if(resp.uploadVerify){
        $('.js-upload-acceptance-file.js-check-purse').show()
      }
      else{
        $('.js-upload-acceptance-file.js-check-purse').unbind().hide()
      }

     if(resp.evaluate){
        $('.evaluateBtn').show()
      }
      else{
        $('.evaluateBtn').unbind().hide()
      }

      if(resp.confirmation){
        $('.js-confirm-receiving').show()
      }
      else{
        $('.js-confirm-receiving').unbind().hide()
      }
    })
  }
  setPrice(d){
    let that = this;
    this.normalModal = ZCY.utils.modal({
      button:["取消","确认改价"], //按钮文案
      templateUrl:"buyer/order_form_list/templates/price-comfirm",   //自定义模板路径
      data:d, //自定义模板的数据，
      title:'商品改价',
      cls:"price-modal",                                 // 自定义class
      confirm:function(){                             //确认的callback
        $(".price-modal-table").ZCYvalidate() && that.sendAjax()
      },
      afterRander:function(m,target){                 //弹出框渲染成功后的callback
        that.setAllPrice();
        that.getValidate()
      }
    })
  }
  getPriceAjax(evt){
    let param = {};
    let that = this;
    param.orderId = $(evt.target).data("id");
    param.pageNo = 1;
    param.pageSize = 999;

    $.ajax({
      'url':'/api/zcy/orders/pagingOrderItems',
      'type':'GET',
      'data':param,
      'success':function(d){
        let result = d;
        if(!d.empty){
          result.orderId = param.orderId;
          that.setPrice(result);
        }
      }
    });
  }
  sendAjax(){
    let that = this;
    let $table = $(".price-modal").find("table");
    let param = [];
    let url = '/api/zcy/orders/setOrderFixedPrice?orderId='+$table.data("id");
    let $tr = $table.find("tbody").find("tr");
    $.each($tr,function(i,v){
      let _price = Number($(this).find("input").val()).toFixed(2);
      let _param = {
        orderItemId:$(this).data('id'),
        fixedPrice:Number((_price*100).toFixed(0))
      };
      param.push(_param);
    });
    $.ajax({
      'url':url,
      'type':'POST',
      'data':JSON.stringify(param),
      'contentType': 'application/json',
      'success':function(d){
        that.normalModal.modal.close();
        location.reload();
      },
      'error':function(d){
        ZCY.error("错误",d.responseText);
      }
    });

  }
  getValidate(){
    let that = this;
    $(".price-modal-table").ZCYvalidate("render",{
      target:".requireds",                        //可不传 ，校验的元素标识，为选择器。 默认为 [data-zcy=validate]
      rules:{                          //规则
        "price":{
          errorText: "无效金额，必须为大于0的金额。",
          check : /^\d+(?:\.\d{1,})?$/,
          extend:function($tar){
            let v = $tar.val(),
                seftV = $tar.data("default"),
                num = $tar.parents("td").nextAll(".quantity").html();
            $tar.val(Number(v).toFixed(2));
            if(v-seftV>0){
              this.text = "金额不能大于标价"+seftV;
              return false;
            }else{
              $tar.parents("td").nextAll(".totle-fee").html((v*num).toFixed(2));
              that.setAllPrice();
              return true;
            }
          }
        }
      }
    });
  }
  setAllPrice(){
    let $table = $(".price-modal-table");
    let $tr = $table.find("tbody").find("tr"),
        sum = 0;
    $.each($tr,function(i,v){
      let value = $(this).find(".totle-fee").html();
      sum = (Number(sum) + Number(value)).toFixed(2);
    });
    $table.find("tfoot").find(".all-fee").html(sum);
  }

  receiveOrder(evt, orderId) {
    $.ajax({
      url: "/api/zcy/orders/supplierReceiveOrder",
      type: "POST",
      data: {
        orderId
      },
      success: (data) => {
        window.location.reload()
      }
    })
  }

  rejectOrder(evt) {
    let orderId = $(evt.currentTarget).data("id");
    new Modal(rejectOrderTemplates({
      orderId
    })).show();
    let orderForm = $("#js-reject-order-form");
    orderForm.validator();
    orderForm.on("submit", (e) => {
      e.preventDefault();
      let data = $(e.currentTarget).serializeObject();
      $.ajax({
        url: "/api/zcy/orders/supplierRejectOrder",
        type: "POST",
        data: data,
        success: () => {
          window.location.reload()
        }
      })
    })
  }

  // 采购人取消订单
  cancelOrder(evt) {
    let orderId = $(evt.currentTarget).data("id");
    new Modal(cancelOrderTemplates({
      orderId
    })).show();
    $("#js-cancel-order-form").on("submit", (e) => {
      e.preventDefault();
      let data = $(e.currentTarget).serializeObject();
      $.ajax({
        url: "/api/zcy/orders/purchaseApplyCnacelOrder",
        type: "POST",
        data: data,
        success: () => {
          window.location.reload()
        }
      });
    });
  }

  // 供应商确认是否取消订单
  confirmCancelOrder(evt) {
    let orderId = $(evt.currentTarget).data("id");
    new Modal(confirmCancelOrderTemplates({
      orderId
    })).show();
    $('[name="isAgree"]').on("change", (e) => {
      if ($('[name="isAgree"]:checked').val() == "true") {
        $('[name="commentTitle"]').removeClass("asterisk");
        $('[name="comment"]').prop("required", false);
      } else {
        $('[name="commentTitle"]').addClass("asterisk");
        $('[name="comment"]').prop("required", true);
      }
    });
    $("#js-confirm-cancel-order-form").on("submit", (e) => {
      e.preventDefault()
      let data = $(e.currentTarget).serializeObject()
      $.ajax({
        url: "/api/zcy/orders/supplierDoCancelOrder",
        type: "POST",
        data: data,
        success: () => {
          window.location.reload()
        }
      });
    });
  }

  //点击搜索
  searchOrders() {
    let url = window.location.pathname + '?pageNo=1'

    //下单时间
    let startTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getStartDate().getTime(),
      endTime = $('.time-interval-input.create-time').data('dateIntervalPicker').getEndDate().getTime()
    if (startTime) {
      url += "&startTime=" + startTime;
    }
    if (endTime) {
      url += "&endTime=" + endTime;
    }

    //确认收货时间
    let receivedAtStart = $('.time-interval-input.receive-time').data('dateIntervalPicker').getStartDate().getTime(),
      receivedAtEnd = $('.time-interval-input.receive-time').data('dateIntervalPicker').getEndDate().getTime()
    if (receivedAtStart) {
      url += "&receivedAtStart=" + receivedAtStart;
    }
    if (receivedAtEnd) {
      url += "&receivedAtEnd=" + receivedAtEnd;
    }

    //订单金额
    let minFee = $(".js-search-minFee").val(),
      maxFee = $(".js-search-maxFee").val()
    if(isNaN(minFee) || isNaN(maxFee)){
      ZCY.error("错误","最小价格和最大价格只能为数字！");
      return;
    } else if(maxFee && minFee && maxFee - minFee < 0){
      ZCY.error("错误","最大金额不能小于最小金额！");
      return;
    }
    if (minFee !== "" && minFee !== undefined) {
      url += "&minFee=" + minFee;
    }
    if (maxFee !== "" && maxFee !== undefined) {
      url += "&maxFee=" + maxFee;
    }

    let orderNo = $('input[name="orderNo"]').val();
    if (orderNo) {
      url += "&orderNo=" + orderNo;
    }

    let status = $(".js-select-status").val();
    if (status !== "") {
      url += "&status=" + status;
    }

    let itemName = $('input[name="itemName"]').val();
    if (itemName) {
      url += "&itemName=" + itemName;
    }

    let confirmationNo=$('input[name="confirmationNo"]').val();
    if (confirmationNo) {
      url += "&confirmationNo=" + confirmationNo;
    }

    let purchaserOrderId = $('input[name="purchaserOrderId"]').val();
    if(purchaserOrderId){
      url += "&purchaserOrderId=" + purchaserOrderId;
    }

    let $supplierOrgSelect = $('select[name="supplierOrg"]'),
      supplierOrgName = $supplierOrgSelect.data('orgName'),
      supplierOrgId = $supplierOrgSelect.data('orgId')
    if (supplierOrgName && supplierOrgId) {
      url += `&supplierOrgName=${supplierOrgName}&supplierOrgId=${supplierOrgId}`
    }

    let $purchaseOrgSelect = $('select[name="purchaseOrg"]'),
      purchaseOrgName = $purchaseOrgSelect.data('orgName'),
      purchaseOrgId = $purchaseOrgSelect.data('orgId')
    if (purchaseOrgName && purchaseOrgId) {
      url += `&purchaseOrgName=${purchaseOrgName}&orgId=${purchaseOrgId}`
    }

    let $purchaserSelect = $('select[name="purchaser"]'),
      purchaserName = $purchaserSelect.data('name'),
      purchaserId = $purchaserSelect.data('userId')
    if (purchaserName && purchaserId) {
      url += `&purchaserName=${purchaserName}&purchaserId=${purchaserId}`
    }


    window.location.href = url;
  }

  //点击重置按钮
  clickSearchReset() {
    window.location.href = window.location.pathname + '?pageNo=1';
  }

  //关键字按enter按钮事件
  searchContentKeyPress(evt) {
    if (!evt) {
      evt = window.event;
    }
    let keyCode = evt.keyCode || evt.which;
    if (keyCode == 13) {
      this.searchOrders();
    }
  }

  //订单列表：显示或者隐藏商品列表
  hideOrShowSecondLevel(evt) {
    if (evt.target.nodeName == 'INPUT' || evt.target.nodeName == 'A' || evt.target.nodeName == "SPAN" || evt.target.nodeName == "LABEL") {
      return;
    }
    let items = $(evt.target);
    let id = items.closest('.first-level-tr').data('id');
    let openMark = items.closest('.first-level-tr').find('.open-mark');
    let item = $('.item-tr[data-site="' + id + '"]');
    if ($(item).is(":hidden")) {
      $(item).slideDown('fast');
      $(openMark).html('<i class="icon-zcy icon-xiangshangzhedie1"></i>')
    } else {
      $(item).slideUp('fast');
      $(openMark).html('<i class="icon-zcy icon-shouqizhuangtai1"></i>')
    }
  }

  //显示验收单
  showAcceptanceFile(evt) {
    let acceptanceFiles = $(evt.target).data('files'),
      status = $(evt.target).data('status'),
      usertype = $(evt.target).data('type'),
      isOwner = $(evt.target).data('isowner'),
      id = $(evt.target).data('id');

    console.log(acceptanceFiles);
    if (acceptanceFiles != null && acceptanceFiles != undefined && acceptanceFiles != "" && acceptanceFiles != "[]") {
      this.showUploadFiles(acceptanceFiles, status, isOwner,usertype,id);
    } else {
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: "无数据"
      }).show();
    }
    $(".gallery").viewer({
      navbar: false
    })
  }

  //显示安装单
  showInstallFile(evt) {
    let installFiles = $(evt.currentTarget).data('files'),
      status = $(evt.currentTarget).data("status"),
      usertype = $(evt.target).data('type'),
      id = $(evt.target).data('id'),
      isOwner = $(evt.currentTarget).data("isowner");
    if (installFiles != null && installFiles != undefined && installFiles != "" && installFiles != "[]") {
      this.showUploadFiles(installFiles, status, isOwner,usertype,id);
    } else {
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: "无数据"
      }).show();
    }
  }

  //弹出文件列表对话框
  showUploadFiles(data, status, isOwner,usertype,id) {
    if (data != null && data != undefined && data != "") {
      let _showUploadFiles = Handlebars.wrapTemplate("buyer/order_form_list/templates/showUploadFiles");
      let _modal = new Modal(_showUploadFiles({
        _DATA_: data,
        status,
        isOwner,
        usertype,
        id
      }));
      _modal.show();
      this.bindShowUploadFilesForm();
    } else {
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: "无数据"
      }).show();
    }
  }

  //绑定显示文件的删除按钮
  bindShowUploadFilesForm() {
    $('.js-delete-select-file').on("click", (evt) => this.deleteUploadFile(evt));
    $('.js-select-ok').on("click", (evt) => this.clickOK(evt));
  }
  //点击确定按钮
  clickOK(evt) {
    if (this.isNeedReload)
      window.location.reload();
  }

  //删除文件
  deleteUploadFile(evt) {
    new Modal({
      title: '您是否确定删除该图片？',
      icon: 'warning',
      htmlContent: '提交后将不能撤回',
      isConfirm: true
    }).show(() => {
      let fileId = $(evt.target).closest('td').data('fileid');
      let itemFiles = [];
      itemFiles.push(fileId);
      $.ajax({
        url: '/api/zcy/orders/deleteItemFiles',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(itemFiles),
        success: (result) => {
          if (result) {
            this.isNeedReload = true;
            $(evt.target).closest('tr').remove();
          }
        },
        error: (data) => {
          new Modal({
            title: "温馨提示",
            icon: "info",
            htmlContent: "操作失败：" + data.responseText
          }).show();
        }
      })
    })
  }

  //上传验收单
  uploadAcceptanceFile(evt) {
    let orderId = $(evt.target).closest('.order-tr').data('id');
    /* 清空原本的值 */
    $('#upload-order-file-modal .modal-image-list').empty();
    let uploadMoal = new Modal('#upload-order-file-modal');
    uploadMoal.show();
    $('#upload-order-file-modal .js-print-order-file').attr('href', '/api/zcy/reports/accept/' + orderId);

    $('#order-file-upload').fileupload({
      url: '/api/user/files/upload',
      limitMultiFileUploads: 20,
      add: function(e, data) {
        let fileLen = $('#upload-order-file-modal .modal-image-list li').length;
        if (data.files && (data.files.length + fileLen > 20)) {
          e.preventDefault();
          new Modal({
            title: "温馨提示",
            icon: "info",
            htmlContent: "最多只能上传20张验收单！"
          }).show();
          return false;
        }

        data.submit().success(function(result) {
          $("#order-file-submit").removeAttr("disabled");
          let resultJson = JSON.parse(result);
          let file = resultJson && resultJson.length && resultJson[0].userFile;
          let html = '<li><div class="modal-image"><img src="' + file.path + '"/><button class="btn btn-mini btn-trash js-image-delete" data-fileId="' + file.id + '">×</button><span class="item-name" data-path="' + file.path + '" title="' + file.name + '">' + file.name + '</span></div></li>'
          $('#upload-order-file-modal .modal-image-list').append(html);
          $('#upload-order-file-modal .js-image-delete').off('click').on('click', function() {
            let $button = $(this);
            let fileId = $button.data('fileid');
            $.ajax({
              method: 'DELETE',
              url: '/api/user/files/' + fileId + '/delete',
              success: function() {
                $button.parent().parent().remove();
                let list = $('#upload-order-file-modal .modal-image-list li');
                if (list.length == 0) {
                  $("#order-file-submit").attr("disabled", "disabled");
                }
              },
              error: function() {
                $button.parent().parent().remove();
              }
            });
          });
        });
      }
    });
    $('#order-file-submit').off('click').on('click', function() {
      let list = $('#upload-order-file-modal .modal-image-list li');
      let itemFiles = $.map(list, function(li) {
        let filePath = $(li).find('.item-name').data('path');
        let fileName = filePath.split('/')[filePath.split('/').length - 1];
        return {
          fileName: fileName,
          filePath: filePath,
          orderId: orderId,
          type: 2
        };
      });

      $.ajax({
        url: '/api/zcy/orders/uploadItemFiles',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(itemFiles),
        success: (result) => {
          result && uploadMoal.close();
          window.location.reload();
        },
        error: (data) => {
          new Modal({
            title: "温馨提示",
            icon: "info",
            htmlContent: "操作失败：" + data.responseText
          }).show();
        }
      })
    })
  }

  //上传安装单
  uploadInstallFile(evt) {
    this.uploadFile(evt, 1);
  }

  //文件上传
  //type :1, "安装单" 2, "验收单"
  uploadFile(evt, type) {
    new Modal({
      toggle: "image-selector"
    }).show((image_file) => {

      let OrderItemFile = {};
      if (image_file.split('/').length > 0) {
        OrderItemFile.fileName = image_file.split('/')[image_file.split('/').length - 1];
        OrderItemFile.filePath = image_file;
        if (type == 2) {
          OrderItemFile.orderId = $(evt.target).closest('.order-tr').data('id');
        } else if (type == 1) {
          OrderItemFile.orderId = $(evt.target).closest('.item-tr').data('orderid');
          OrderItemFile.orderItemId = $(evt.target).closest('.item-tr').data('id');
          OrderItemFile.itemId = $(evt.target).closest('.item-tr').data('itemid');
          OrderItemFile.skuId = $(evt.target).closest('.item-tr').data('skuid');
        }
        OrderItemFile.type = type;
        let itemFiles = [];
        itemFiles.push(OrderItemFile);
        $.ajax({
          url: '/api/zcy/orders/uploadItemFiles',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify(itemFiles),
          success: (result) => {
            if (result) {
              window.location.reload();
            }
          },
          error: (data) => {
            new Modal({
              title: "温馨提示",
              icon: "info",
              htmlContent: "操作失败：" + data.responseText
            }).show();
          }
        })
      }
    })
  }

  //验收
  checkOrder(evt) {
    let orderId = $(evt.target).closest('.order-tr').data("id");
    $.ajax({
      url: '/api/zcy/orders/orderAcceptance',
      type: 'POST',
      dataType: 'json',
      data: {
        orderId: orderId
      },
      success: (result) => {
        window.location.reload();
      },
      error: (data) => {
        new Modal({
          title: "温馨提示",
          icon: "info",
          htmlContent: "操作失败：" + data.responseText
        }).show();
      }
    })
  }

  //创建补发货
  createReissueShipment(evt) {
    let orderId = $(evt.target).closest('.order-tr').data("id");
    let shipmentTemplates = null;
    let pageNo = 1;
    let type = 0;
    let mode = 1;
    let action = 'generateReissueShipmentInfo';
    this.createShipment(evt, pageNo, shipmentTemplates, type, orderId, action, mode);
  }

  //弹出发货窗口：点击地址
  changekDelivery(evt, mode = 0) {
    //选中的订单收货信息id
    let orderDeliveryId = $('.select-address-item').find('input[type="radio"][name="chooseAddr"]:checked').val();
    let pageNo = 1;
    //用于保存选中的商品信息
    this.selectedSkuAndQuantity = {};
    //获取该配送地址下的商品信息
    let type = 1;
    let action = 'pagingDeliveryItemsByDeliveryId';
    if (mode == 1) {
      action = 'pagingReissueDeliveryItemsByDeliveryId';
    }
    this.showSelectItemCount(mode);
    this.createShipment(evt, pageNo, this.ShipmentTemplates, type, orderDeliveryId, action, mode);
    this.alSelectWarehouse()
  }

  //订单列表模块：创建发货
  //type=0表示创建发货，type=1表示切换地址后改变商品
  //mode=0表示正常发货，mode=1表示补发货
  createShipment(evt, pageNo, templates, type, id, action, mode) {
    let $targetOrderTr = $(evt.target).closest('.order-tr');
    let backlogId = $.query.get("backlogId"),
      orderId = $targetOrderTr.data("id"),
      orderType = $targetOrderTr.data("ordertype"),
      pageSize = 500;
    type = type || 0,
      mode = mode || 0,
      action = action || 'generateShipmentInfo',
      id = id || orderId,
      pageNo = pageNo || 1;

    if (mode == 1) { //mode表示补发货
      pageSize = 500;
    }
    let param = {};
    if (type == 0) {
      orderId = id;
      param = {
        orderId,
        pageNo,
        pageSize,
        backlogId
      };
    } else if (type == 1) {
      let deliveryId = id;
      param = {
        deliveryId,
        pageNo,
        pageSize,
        backlogId
      };
    }
    console.log(param);
    $.ajax({
      url: '/api/zcy/orders/' + action,
      type: 'post',
      data: param,
      success: (result) => {
        let data = result;
        if (templates == undefined) {
          let _showItemsForReceiver;
          if (mode == 0) {
            data.isReissue = false;
            _showItemsForReceiver = Handlebars.wrapTemplate("buyer/order_form_list/templates/showShipmentItems");
          } else if (mode == 1) {
            data.isReissue = true;
            _showItemsForReceiver = Handlebars.wrapTemplate("buyer/order_form_list/templates/showRessiueShipments");
          }
          templates = _showItemsForReceiver;
          this.ShipmentTemplates = _showItemsForReceiver;
          data = result;
          result = null;
          data.orderId = orderId;
          data.orderType = orderType;
          let _modal = new Modal(_showItemsForReceiver({
            _DATA_: data
          }));
          _modal.show();
          $("select", _showItemsForReceiver).selectric();
          //用于保存修改过的商品信息
          this.selectedSkuAndQuantity = {};
          this.bindShowItemFormOnce(mode);
        } else {
          if (type == 0) {
            data.orderId = orderId;
          } else if (type == 1) {
            //mode=1表示补发货，补发货不分页，所以没有提供total和data，故手动加上
            if (mode == 1) {
              let tempData = {};
              tempData.data = result;
              tempData.total = result.length;
              data.orderId = orderId;
              data.deliveryItemWarehouses = tempData;
              data.isReissue = true;
            } else {
              data.isReissue = false;
              data.orderId = orderId;
              data.deliveryItemWarehouses = result;
            }
          }
          data.orderType = orderType;
          result = null;
          $('.pur-modal').find('.js-item-list').replaceWith($($.parseHTML(templates({
            _DATA_: data
          }))[0]).find('.js-item-list'));
          $('.pur-modal').find('#select-batch').prop("checked", false);
        }
        this.bindShowItemForm();
        this.alSelectWarehouse();
        new Pagination(".selected-pagination").total(data.deliveryItemWarehouses.total).show(pageSize, {
          current_page: pageNo - 1,
          callback: (pageNo) => {
            this.createShipment(evt, pageNo + 1, templates, type, id, action, mode);
          }
        });
      },
      error: (data) => {
        new Modal({
          title: "温馨提示",
          icon: "info",
          htmlContent: "获取信息失败：" + data.responseText
        }).show();
      }
    })
  }

  //订单列表模块：显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowItemForm() {
    //初始化数字增减控件
    $('.input-amount').amount({
      changeCallback: (options) => this.changeCount(options)
    });
    $('.js-select-item').on("change", (evt) => this.checkOneItem(evt));
    //初始化选中的地址
    let deliveryid = $('.modal-items-lists').data('deliveryid');
    $('.select-address-item').find('.js-select-address[value="' + deliveryid + '"]').attr('checked', 'checked');
    //重新初始化全选按钮事件
    $('.js-batch-select').on("change", (evt) => this.batchSelectItems(evt));
  }
  //订单列表模块：显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowItemFormOnce(mode = 0) {
    $('.select-address-item').on('change', (evt) => this.changekDelivery(evt, mode));
    $('.js-delivery-items-submit').on('click', (evt) => this.itemsSubmit(evt, mode));
    //获取物流公司信息
    this.getExpressCompany();

    //添加商品批号操作
    $('.js-add-batch-number').unbind().on('click', (evt)=>this.addBatchNumber(evt));
  }

  //获取快递公司信息
  getExpressCompany() {
    $('.js-select-logistics').empty();
    $(".js-select-logistics").selectric('refresh');

    //疫苗订单物流获取接口不一样
    let urlStr, orderType = $('.order-form-shipment-create-page').data('ordertype');
    if(orderType == 2){
      urlStr = '/api/zcy/express/vaccine-company';
    }
    else{
      urlStr = '/api/zcy/express/company';
    }

    $.ajax({
      url: urlStr,
      type: 'GET',
      dataType: 'json',
      success: (result) => {
        if (result.length > 0) {
          _.each(result, (el, index) => {
            $('.js-select-logistics').append("<option value='" + el.code + "'>" + el.name + "</option>");
          });
        }
        $(".js-select-logistics").selectric('refresh');
        $('.js-select-logistics').change(function() {
          let name = $(this).val();
          if (name == " ") {
            $('.select-shipment').find('.required:last').hide();
          } else {
            $('.select-shipment').find('.required:last').show();
          }
        });
      },
      error: (data) => {
        new Modal({
          title: '警告',
          icon: 'info',
          content: data.responseText
        }).show();
      }
    });
  }

  //订单列表模块：手动更改商品数量（input控件修改）
  changeCount(options) {
    let $input = $(".count-number", options.container),
      count = $input.val(),
      sum = this.addAndMinusCount(options);
    if (count > sum) {
      $input.val(sum);
      $input.trigger("change");
      return false
    }
    this.changeCountAffect($input);
  }

  //订单列表模块：点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount(options) {
    let $input = $(".count-number", options.container),
      count = $input.val(),
      $tr = $(options.container).closest("tr"),
      skuId = $tr.data("skuid"),
      skuBox = ".js-quantity-" + skuId,
      trBox = ".js-item-tr-" + skuId,
      quantitySkuTotal = 0,
      skuTotal = $input.data("init"),
      quantitySkuRemain,
      allWarehouse = $('.js-all-select-warehouse option:selected').val();

    _.each($tr.siblings(trBox), (el, index) => {
      if ($(el).find("js-select-item").checked) {
        let quantity = parseInt($(el).find(".count-number").val());
        quantitySkuTotal = quantitySkuTotal + quantity
      }
    });
    quantitySkuRemain = parseInt(skuTotal - parseInt(quantitySkuTotal));
    $(options.container).data("max", quantitySkuRemain);
    if (count < quantitySkuRemain) {
      $(".js-select-item:checked").closest("tr").find(".plus").removeClass("disabled");
    }
    return quantitySkuRemain
  }

  //订单列表模块：维护选中的商品信息（增加）
  setPurchaseSkuAndQuantity(el) {
    let thisTr = $(el).closest('tr'),
      id = thisTr.data('id'),
      flag = 0,
      skuId = thisTr.data("skuid"),
      quantity = parseInt(thisTr.find('input.count-number').val()),
      selectWarehouse = thisTr.find(".js-single-select-warehouse option:selected"),
      shipWarehouseCode = selectWarehouse.val(),
      shipWarehouseName = selectWarehouse.data('name');
    let lockWareHouseTd = thisTr.find(".js-lock-warehouse");
    let lockWarehouseCode = lockWareHouseTd.data('code');
    let lockWarehouseName = lockWareHouseTd.data('name');
    //疫苗商品
    vaccineItemExts = thisTr.find('input[name="batchNumbers"]').val();
    if(!shipWarehouseCode){
      shipWarehouseCode = $('.js-single-select-warehouse').data('code');
      shipWarehouseName = $('.js-single-select-warehouse').data('name');
    }

    let skuQuantityInfo = this.selectedSkuAndQuantity[id];
    if (skuQuantityInfo && skuQuantityInfo.skuId === skuId) {
      skuQuantityInfo.quantity = quantity;

      let list = _.map(skuQuantityInfo.lockWarehouses, (el) => {
        return el.lockWarehouseCode;
      });
      // 还不存在，则添加
      if ($.inArray(lockWarehouseCode, list) == -1) {
        skuQuantityInfo.lockWarehouses.push({
          lockWarehouseCode,
          lockWarehouseName,
          quantity,
          shipWarehouseCode,
          shipWarehouseName
        });
      } else {
        _.each(skuQuantityInfo.lockWarehouses, (i) => {
          if (i.lockWarehouseCode === lockWarehouseCode) {
            i.quantity = quantity
          }
        })
      }

      flag = flag + 1;
    }

    if (flag == 0) {
      let id = thisTr.data("id");
      let itemId = thisTr.data("itemid");
      this.selectedSkuAndQuantity[id] = {
        id,
        skuId,
        itemId,
        quantity,
        shipWarehouseCode,
        shipWarehouseName,
        lockWarehouses: [{
          lockWarehouseCode,
          lockWarehouseName,
          quantity,
          shipWarehouseCode,
          shipWarehouseName
        }]
      };
    }
    if(vaccineItemExts) {
      this.selectedSkuAndQuantity[id].vaccineItemExts = JSON.parse(vaccineItemExts);
    }
  }

  //订单列表模块：修改商品数量后需要维护的变化
  changeCountAffect(input) {
    let _selectItem = $(input).closest('.item-tr').find('.js-select-item');
    if (_selectItem.prop("checked")) {
      this.dealSkuWarehouse(input)
    }
    this.showSelectItemCount();
  }

  //订单列表模块：选中单个商品
  checkOneItem(evt) {
    $(this).closest("tr").removeClass("fail-item");
    let Tr = $(evt.target).closest('.item-tr');
    if (!($(evt.target).prop("checked"))) {
      $(".js-batch-select").prop("checked", false);
      this.delPurchaseSkuAndQuantityWarehouse(evt)
    } else {
      this.setPurchaseSkuAndQuantity(evt.target);
    }
    this.showSelectItemCount();
  }

  //订单列表模块：全选商品
  batchSelectItems() {
    let allWarehouse = $('.js-all-select-warehouse option:selected').val();
    this.selectedSkuAndQuantity = {};
    if (allWarehouse == "") {
      $(".js-select-item").prop("checked", false);
      $(".js-delivery-item-table").addClass("disabled");
      $(".js-select-note").addClass("error")
    } else {
      $(".js-delivery-item-table").removeClass("disabled");
      $(".js-select-note").removeClass("error");
      _.each($(".js-select-item"), (el, index) => {
        let $tr = $(el).closest('tr');
        if ($tr.find('.js-single-select-warehouse option:selected').val() == allWarehouse) {
          $tr.removeClass("disabled");
          $(el).removeAttr('disabled');
          $(el).prop("checked", true);
          this.setPurchaseSkuAndQuantity(el);
        } else {
          $tr.addClass("disabled");
          $(el).prop("checked", false);
        }
      });
      this.showSelectItemCount();
    }
  }

  //显示选中的商品信息
  showSelectItemCount(mode) {
    if (mode == 1) {
      $('.js-select-item-info').addClass('hide');
    } else {
      $('.js-select-item-info').html("一共选中了" + _.size(this.selectedSkuAndQuantity) + "项");
    }
  }

  //订单列表模块：窗口的确定按钮事件
  //mode：0表示正常发货，1表示补发货
  itemsSubmit(evt, mode) {
    mode = mode || 0;
    let shipment = {};
    let shipmentType;
    let shipmentNo;
    let expressCode;
    let expressName;
    if ($('.shipmentType2').prop('checked') == true) {
      shipmentType = 2;
      shipmentNo = '';
      expressCode = '';
      expressName = '';
    } else {
      shipmentType = 1;
      shipmentNo = $('.js-shipmentNo').val();
      expressCode = $('.js-select-logistics').find('option:selected').val();
      expressName = $('.js-select-logistics').find('option:selected').html();
    }

    //订单id
    shipment.orderId = $('.modal-items-lists').data('orderid');
    //订单收货信息id
    shipment.orderDeliveryId = $('.select-address-item').find('input[type="radio"][name="chooseAddr"]:checked').val();
    //发货方式,从物流中冗余过来.目前为:物流或者快递 单选框
    shipment.shipmentType = shipmentType;
    //运单号
    shipment.shipmentNo = shipmentNo;
    //发货物流代码
    shipment.expressCode = expressCode;
    //发货物流名称
    shipment.expressName = expressName;
    //收货状态 0-待收货, 1-已收货
    shipment.status = 0;
    if (shipment.orderDeliveryId == undefined) {
      this.myalert("请选择发货地址");
      return false;
    }
    ///* 其它的物流代码是 空格，定义就是这样的－无奈的 */

    if($('.shipmentType2').prop('checked') == false && shipment.expressCode != "" && shipment.shipmentNo == ""){
      this.myalert("请填写运单号");
      $('.js-shipmentNo').focus();
      return false;
    }

    // 订单类型
    let orderType = $('.modal-items-lists').data('ordertype');

    //处理数据的最后一关。将quantity为0的全去掉
    let shipmentItemExts = [];
    let selectedItems = _.values(this.selectedSkuAndQuantity);
    // 合同订单只有单行，不需要再统计
    if (orderType == 1) {
      shipmentItemExts = _.map(selectedItems, (item) => {
        return {
          id: item.id,
          itemId: item.itemId,
          quantity: item.quantity,
          lockWarehouses: [],
          shipWarehouseName: '',
          skuId: item.skuId
        };
      });
    } else {
      let flag = true;
      _.each(selectedItems, (item) => {
        let total = 0;

        _.each(item.lockWarehouses, (i, d) => {
          let itemQuantity = parseInt(i.quantity);
          if (itemQuantity > 0) {
            total += itemQuantity;
          }
        });
        //疫苗订单必须添加商品批号信息
        if(orderType== 2 && (!item.vaccineItemExts || item.vaccineItemExts.length <= 0)){
          flag = false;
          return false;
        }
        (total > 0) && shipmentItemExts.push(item);
      })
      if(!flag){
        new Modal({
          title: "提示",
          icon: "warning",
          content: "所有已选择商品必须添加商品批号!"
        }).show();
        return;
      }
    }

    let size = shipmentItemExts.length;
    // 补发货 时不检测是否选中
    if (size <= 0 && mode != 1) {
      new Modal({
        title: "提示",
        icon: "warning",
        content: "未选中任何商品！请选择商品后提交!"
      }).show();
      return false;
    }

    // 合同订单不选择仓库
    if (orderType != 1 && $(".js-all-select-warehouse").val() == "") {
      new Modal({
        icon: "warning",
        title: "提示",
        content: "请选择发货仓库"
      }).show();
      return false;
    }

    let url = "createOrderShipment";
    let data = JSON.stringify({
      shipment,
      shipmentItemExts
    });

    // mode=1表示补发货，需要将quantity参数改为reissueQuantity
    if (mode == 1) {
      url = "createReissueOrderShipment";
      // 合同订单，仓库信息为空
      if (orderType == 0 || orderType == 3) {
        let shipWarehouseCode = $(".js-all-select-warehouse option:selected").val();
        let shipWarehouseName = $(".js-all-select-warehouse option:selected").data('name');
        let ressiueItemExts = _.map($(".js-reissue-item-tr"), (el) => {
          return {
            id: $(el).data("id"),
            itemId: $(el).data("itemid"),
            shipWarehouseCode,
            shipWarehouseName,
            skuId: $(el).data("skuid"),
            reissueQuantity: $(el).data("ship-quantity")
          };
        });
        data = JSON.stringify({
          shipment,
          shipmentItemExts: ressiueItemExts
        });
      }
      //疫苗订单
      else if(orderType == 2) {
        let shipWarehouseCode = $('.js-single-select-warehouse').data('code');
        let shipWarehouseName = $('.js-single-select-warehouse').data('name');
        let legal = true;
        let ressiueItemExts = _.map($(".js-reissue-item-tr"), (el) => {
          let tmpStr = $(el).find('input[name="batchNumbers"]').val();
          let vaccineItemExts = tmpStr ? JSON.parse(tmpStr) : [];
          if(vaccineItemExts.length <= 0){
            legal = false;
            return false;
          }
          return {
            id: $(el).data("id"),
            itemId: $(el).data("itemid"),
            shipWarehouseCode,
            shipWarehouseName,
            skuId: $(el).data("skuid"),
            reissueQuantity: $(el).data("ship-quantity"),
            vaccineItemExts
          };
        });
        if(!legal){
          new Modal({
            title: "提示",
            icon: "warning",
            content: "所有商品必须添加商品批号!"
          }).show();
          return;
        }
        data = JSON.stringify({
          shipment,
          shipmentItemExts: ressiueItemExts
        });
      }
    }
    console.log(data);
    $.ajax({
      url: '/api/zcy/orders/' + url,
      type: 'POST',
      contentType: "application/json",
      dataType: "json",
      data: data,
      success: (data) => {
        window.location.reload();
      },
      error: (data) => {
        new Modal({
          title: "提示",
          icon: "warning",
          content: "提交商品失败！错误信息为：" + data.responseText
        }).show();
      }
    });
  }

  //删除单个sku的某个默认仓库
  delPurchaseSkuAndQuantityWarehouse(evt) {
    let Tr = $(evt.target).closest('tr'),
      $input = Tr.find('input.count-number');
    $input.val(0);
    $input.trigger("change");


    this.dealSkuWarehouse($input)
  }

  //订单列表界面：初始化url对应的过滤条件值
  initQueryConditions() {
    this.$searchTable.spin('medium')

    new dateIntervalPicker('.time-interval-input.create-time')
    new dateIntervalPicker('.time-interval-input.receive-time')


    new fuzzyQueryPurchaseOrgs('select[name="purchaseOrg"]', {
      tag: this.tag,
      module: 'order'
    })

    new fuzzyQuerySupplierOrgs('select[name="supplierOrg"]', {
      tag: this.tag,
      module: 'order'
    })

    new fuzzyQueryPurchaser('select[name="purchaser"]', {
      tag: this.tag,
      module: 'order'
    })


    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      show_if_single_page: true,
      jump_switch: true,
      page_size_switch: true
    })

    let pageNo = $.query.get("pageNo")
    if (pageNo == "NaN") {
      window.location.href = $.query.set("pageNo", 1)
    }

    let st = $.query.get("startTime"),
      et = $.query.get("endTime")
    if(st){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setStartDate(st)
    }
    if(et){
      $('.time-interval-input.create-time').data('dateIntervalPicker').setEndDate(et)
    }

    let receivedAtStart = $.query.get("receivedAtStart"),
      receivedAtEnd = $.query.get("receivedAtEnd")
    if(receivedAtStart){
      $('.time-interval-input.receive-time').data('dateIntervalPicker').setStartDate(receivedAtStart)
    }
    if(receivedAtEnd){
      $('.time-interval-input.receive-time').data('dateIntervalPicker').setEndDate(receivedAtEnd)
    }

    this.$searchTable.spin(false)
  }

  //得到所有发货仓库
  alSelectWarehouse() {
    let leafRegion, skuIds = [],
      orderDeliveryId,
      orderId = $(".modal-items-lists").data('orderid');
    _.each($(".js-get-regionid"), (el, index) => {
      let id = $(el).data('id');
      if ($(el).closest('label').siblings(`#select-address${id}`).is(":checked")) {
        leafRegion = $(el).data("regionid");
        orderDeliveryId = $(el).closest('label').siblings(`#select-address${id}`).data('deliverid')
      }
    });
    _.each($(".item-shipment-tr"), (el, index) => {
      skuIds.push($(el).data("skuid"))
    });
    $.ajax({
      url: `/api/zcy/stocks/findSameWarehouse?leafRegion=${leafRegion}&orderId=${orderId}&orderDeliveryId=${orderDeliveryId}`,
      type: "POST",
      data: JSON.stringify(skuIds),
      contentType: "application/json",
      dataType: "json",
      success: (data) => {
        $(".js-all-select-warehouse").empty();
        $(".js-all-select-warehouse").append(allWarehouseTemplates({
          data: data
        }));
        $(".js-all-select-warehouse").selectric("refresh")
      },
      error: (data) => {}
    })
  }

  //过滤总的发货仓库时，全选发货仓库匹配的商品
  selectWarehouseFilter(evt) {
    let warehouseAll = $(evt.currentTarget).val();

    _.each($(".js-single-select-warehouse"), (i, d) => {
      let warehouseList = [];

      _.each($(i).find("option"), (el, index) => {
        warehouseList.push($(el).val())
      });
      $(i).val(warehouseAll);
      $(".js-single-select-warehouse").selectric("refresh");
      if ($.inArray(warehouseAll, warehouseList) == -1) {
        $(i).closest('tr').find('.input-amount').addClass('disabled');
        $(i).closest('tr').find('.count-number').val(0)
      } else {
        $(i).closest('tr').find('.input-amount').removeClass('disabled')
      }
    });
    this.batchSelectItems()
  }

  //单选每行发货仓库时 。提示信息 与 数据处理
  selectSingleWarehouse(evt) {
    let singleSelect = $(evt.currentTarget),
      allSelectVal = $(".js-all-select-warehouse option:selected").val(),
      input = $(evt.currentTarget).closest("tr").find(".js-select-item");
    if (allSelectVal == "") {
      new Modal({
        icon: "warning",
        title: "提醒",
        content: "请先过滤发货仓库"
      }).show(() => {
        singleSelect.val("");
        singleSelect.selectric('refresh')
      })
    } else {
      if (singleSelect.val() !== allSelectVal) {
        input.prop("checked", false);
        input.prop('disabled', true);
        $(".js-select-item:checked").closest("tr").find(".minus").removeClass("disabled");
        $(".js-select-item:checked").closest("tr").find(".plus").removeClass("disabled");
        this.delPurchaseSkuAndQuantityWarehouse(evt)
      } else {
        input.prop('disabled', false);
        input.prop("checked", true);
        this.setPurchaseSkuAndQuantity(evt.currentTarget)
      }
    }
  }

  //数量改变 调用的方法
  dealSkuWarehouse($input) {
    let thisTr = $input.closest('tr'),
      id = thisTr.data('id'),
      quantity = parseInt($input.val()),
      skuId = thisTr.data('skuid'),
      lockWarehouseCode = thisTr.find(".js-lock-warehouse").data('code'),
      value = this.selectedSkuAndQuantity[id];
    if (value && value.skuId === skuId) {
      value.quantity = quantity;
      _.each(value.lockWarehouses, (el) => {
        if (el.lockWarehouseCode === lockWarehouseCode) {
          el.quantity = quantity
        }
      })
    }
  }

  //弹出窗口
  myalert(content) {
    new Modal({
      title: "提示",
      icon: "warning",
      content: content
    }).show();
  };

  checkUserLogin() {
    $.ajax({
      url: "/api/user",
      type: "GET",
      success: (data) => {
        if (!data.id) {
          window.location.href = "/login";
        }
      }
    });
  }
  // 发货弹框按钮选择
  shipmentTypehandle() {
    $('body').on('change', '[name="shipmentType"]', function() {
      if ($('.shipmentType2').prop('checked') == true) {
        $(this).parent().find('.shipselect').css('display', 'none');
        $('.yundanhao').css('display', 'none');
      } else {
        $(this).parent().find('.shipselect').css('display', 'inline-block');
        $('.yundanhao').css('display', 'inline-block');
      }

    });

  }

  //添加生产批号
  addBatchNumber(evt){
    let self = this;
    let itemRow = $(evt.target).closest('tr');
    let ModalView = new Modal(batchNumberTpl());
    ModalView.show();

    let value = $(itemRow).find('input[name="batchNumbers"]').val();
    if(value){
      let batchs = JSON.parse(value);
      _.each(batchs, (batch)=>{
        $('.js-batch-number-list').append(batchNumberRow(batch));
        let $tr = $('.js-batch-number-list').find('tr').last();
        initUploadBox($tr);
      })
    }

    //删除一行
    function deleteBatchNumber(el){
      new Modal({
        icon: 'warning',
        content: '确认删除该批号？',
        isConfirm: true
      }).show(()=>{
        let $tr = $(el.target).closest('tr');
        $tr.remove();
        new FormChecker({container : '.modal.add-batch-number', ctrlTarget : '.js-add-batch-number-submit', precheck: true});
      });
    };

    //初始化文件上传
    function initUploadBox($tr){
      $tr.find('.js-upload-file1').uploadFileBox({bizCode: 1042, title: '签发协议', required: true});
      $tr.find('.js-upload-file2').uploadFileBox({bizCode: 1042, title: '进口通关'});
      $tr.find('.js-upload-file3').uploadFileBox({bizCode: 1042, title: '其他文件'});
    }


    $('.js-delete-batch-number').unbind().on('click', (el)=>deleteBatchNumber(el));
    $('.js-add-one-batch').unbind().on('click', ()=>{
      $('.js-batch-number-list').append(batchNumberRow());
      $('.date-input').datepicker();
      $('.js-delete-batch-number').unbind().on('click', (el)=>deleteBatchNumber(el));
      let $tr = $('.js-batch-number-list').find('tr').last();
      initUploadBox($tr);
      new FormChecker({container : '.modal.add-batch-number', ctrlTarget : '.js-add-batch-number-submit', precheck: true});
    });

    $('.date-input').datepicker();
    new FormChecker({container : '.modal.add-batch-number', ctrlTarget : '.js-add-batch-number-submit', precheck: true});
    $('.js-add-batch-number-submit').unbind().on('click', ()=>self.submitBatchNumber(itemRow, ModalView));
    $('.js-add-batch-number-cancel').unbind().on('click', ()=>{
      new Modal({
        icon: 'info',
        isConfirm: true,
        title: '确认取消添加批号吗？',
        content: '取消将删除添加或修改的批号内容并关闭窗口'
      }).show(()=>{
        ModalView.close();
      })
    })
  }

  submitBatchNumber(itemRow, ModalView){
    let batchs = [];
    let count = 0;
    $('.js-batch-number-list tr').each((index, tr)=>{
      let batchItem = {
        batchNum: $(tr).find('input[name="batchNumber"]').val(),
        effectiveDateStart: $(tr).find('input[name="timeStart"]').val(),
        effectiveDateEnd: $(tr).find('input[name="timeEnd"]').val(),
        quantity: $(tr).find('input[name="goodsCount"]').val()
      };
      count += parseInt(batchItem.quantity);
      batchItem.ossFileIds = [];
      let file1 = $(tr).find('.js-upload-file1').data('uploadFileBox').getFiles()
      if(file1.length > 0){
        let ossFile = $.extend({}, file1[0]);
        ossFile.type = '0';
        batchItem.ossFileIds.push(ossFile);
      }
      let file2 = $(tr).find('.js-upload-file2').data('uploadFileBox').getFiles()
      if(file2.length > 0){
        let ossFile = $.extend({}, file2[0]);
        ossFile.type = '1';
        batchItem.ossFileIds.push(ossFile);
      }
      let file3 = $(tr).find('.js-upload-file3').data('uploadFileBox').getFiles()
      if(file3.length > 0){
        let ossFile = $.extend({}, file3[0]);
        ossFile.type = '2';
        batchItem.ossFileIds.push(ossFile);
      }
      //自动交换时间
      if(batchItem.effectiveDateEnd < batchItem.effectiveDateStart) {
        let tmp = batchItem.effectiveDateEnd;
        batchItem.effectiveDateEnd = batchItem.effectiveDateStart;
        batchItem.effectiveDateStart = tmp;
      }
      batchs.push(batchItem);
    })
    let total = $(itemRow).data('ship-quantity');
    if(count != total){
      new Modal({
        icon: 'warning',
        content: '商品数量与待发货总数('+ total +')不一致'
      }).show();
      return;
    }

    $(itemRow).find('input[name="batchNumbers"]').val(JSON.stringify(batchs));
    let rowId = $(itemRow).data('id');
    if(this.selectedSkuAndQuantity[rowId]){
      this.selectedSkuAndQuantity[rowId].vaccineItemExts = batchs;
    }

    let batchShow = $(itemRow).find('.js-batch-number');
    $(batchShow).html('');
    _.each(batchs, (batch)=>{
      //显示文件重命名
      _.each(batch.ossFileIds, (file)=>{
        if(file.type == '0'){
          file.name = '签发协议'
        }
        else if(file.type == '1'){
          file.name = '进口通关'
        }
        else if(file.type == '2'){
          file.name = '其他'
        }
      })
      $(batchShow).append(batchNumberShow(batch));
    })
    $(batchShow).find('.js-ossFile').uploadFile({bizCode: 1042, showOnly: true});

    ModalView.close();
  }

  /**
   * 再次购买订单商品
   */
  buyAgain(evt) {
    let orderId = $(evt.currentTarget).closest('tr').data('id'),
      orderType = parseInt($(evt.currentTarget).closest('tr').data('ordertype')) || 0
    $('body').spin('medium')
    $.ajax({
      url: '/api/zcy/carts/buyAgain',
      type: 'post',
      data: {orderId}
    }).done((resp) => {
      if (resp.result) {
        switch (orderType) {
          case 0:
            window.location.href = '/cart'
            break
          case 1:
            window.location.href = '/cart'
            break
          case 2: 
            window.location.href = '/cart'
            break
          case 3:/* 大宗购物车是独立的 */
            window.location.href = '/carts/supperProCart'
            break
          default:
            window.location.href = '/cart'
            break
        }
      } else {
        let modal = new Modal(ItemsInvalid())
        modal.show()
        modal.modal.find('.js-goto-buy').on('click', () => {
          let host = window.location.host,
            protocol = window.location.protocol
          switch (orderType) {
            case 0:
              window.location.href = '/'
              break
            case 1:
              window.location.href = '/'
              break
            case 2: 
              window.location.href = `${protocol}//block.${host}`
              break
            case 3:
              window.location.href = `${protocol}//vaccine.${host}`
              break
            default:
              window.location.href = '/'
              break
          }
        })
      }
    }).always(() => {
      $('body').spin(false)
    })
  }
}

module.exports = OrderFormList;