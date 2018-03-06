import Modal from "pokeball/components/modal";
import Pagination from "pokeball/components/pagination";
import ChangeConfirm from "buyer/change_confirmbook/view";
import OrderList from "buyer/order_form_list/view";
const changeConfirmBookTemplates = Handlebars.templates["buyer/order_form_detail/templates/change-confirm-book"];
const rejectOrderTemplates = Handlebars.templates["buyer/order_form_list/templates/reject_order"];
const confirmCancelOrderTemplates = Handlebars.templates["buyer/order_form_list/templates/confirmCancelOrder"];
const batchNumberTpl = Handlebars.templates["buyer/order_form_shipment_create/templates/addBatchNumber"];
const batchNumberRow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberRow"];
const batchNumberShow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberShow"];
const FormChecker = require('common/formchecker/view');
const refusePriceView = Handlebars.templates["buyer/block_trade/order_form_detail/templates/refusePriceView"];
const ConfirmShipmentReceipt = require('buyer/confirm_shipment_receipt/view');

class BlockTradeOrderFormDetail {
  constructor($) {
    this.itemsForReceiverShow = $('.js-show-receiver-item-list');
    this.acceptanceShow = $('.js-show-acceptance-file');
    this.itemsForInvShow = $('.js-show-inv-item-list');
    this.itemsForPayShow = $('.js-show-pay-item-list');
    this.itemsForOtherPayShow = $('.js-show-other-pay-item-list');
    this.confirmReceive = $('.js-confirm-receiving');
    //补发货
    this.reissueShpimentCreate = $('.js-create-reissue-shipment');
    this.$jsChangeConfirmModal = $(".js-change-confrim-modal");
    this.initChangeConfirmBook();
    new ChangeConfirm();
    let $orderFormDetail = $(".order-form-detail-body");
    this.orderId = $orderFormDetail.data("order-id");
    this.orderType = $orderFormDetail.data("order-type");
    //过滤仓库发货
    this.$jsSelectWarehouse = ".js-all-select-warehouse";
    this.$jsSelectSingleWarehouse = ".js-single-select-warehouse";

    this.confirmCancelOrderBtn = $('[name="confirm-cancel-order"]');
    this.bindEvent();
    this.moreHandle();
    this.shipmentTypehandle();//收货弹框单选按钮
    this.popoverEvents()

    //疫苗商品附件展示
    $('.batchNumber .js-ossFile').uploadFile({bizCode: 1042, showOnly: true});

    //大宗商品定价
    this.renderDecreaseRate();
    this.renderOrderPriceSet();
    this.autoScrollToLastPosition();
  }
  bindEvent() {
    this.itemsForReceiverShow.on('click', (evt) => this.showItemsForReceiver(evt));
    //确认收货
    this.confirmReceive.on('click', (evt) => {
      let shipmentId = $(evt.target).closest('tr').data("shipmentId"),
        confirmReceiving = $('.js-confirm-receiving'),
        _orderStatus = $('#_orderStatus').html(),
        showAccept = true;
      //只有一张发货单并且是全部发货状态才可以同步验收
      if(confirmReceiving.length > 1 || _orderStatus != 3){
        showAccept = false;
      }
      new ConfirmShipmentReceipt(shipmentId, showAccept).show();
    });
    this.acceptanceShow.on('click', (evt) => this.showAcceptanceFile(evt));
    //发票信息绑定事件
    this.itemsForInvShow.on('click', (evt) => this.showItemsForInv(evt));
    //预算信息绑定事件
    this.itemsForPayShow.on('click', (evt) => this.showItemsForPay(evt));
    this.itemsForOtherPayShow.on('click', (evt) => this.showItemsForOtherPay(evt));

    $(document).on("confirm:order-check", (evt, data) => this.checkOrder(data));
    //补发货
    this.reissueShpimentCreate.on('click', (evt) => this.createReissueShipment(evt));
    this.iniTab();
    this.$jsChangeConfirmModal.on("click", (evt) => this.changeConfirmModal(evt));
    //供应商确认是否取消订单
    this.confirmCancelOrderBtn.on("click", (evt) => this.confirmCancelOrder(evt))
    $(document).on('change', this.$jsSelectWarehouse, (evt) => this.selectWarehouseFilter(evt));
    $(document).on('change', this.$jsSelectSingleWarehouse, (evt) => this.selectSingleWarehouse(evt));
    $(document).on("confirm:receive-order", (evt, data) => this.receiveOrder(evt, data));
    this.$el.on("click", ".js-reject-order", (evt) => this.rejectOrder(evt))

    this.bindItemFileUpload();
    $('.acceptance-files .upload-file').on('click', (evt) => this.uploadAcceptanceFile(evt));
    $('.qualification-certificate-files .upload-file').on('click', (evt) => this.uploadQualificationFile(evt));
    $('.js-price-input').on('blur', (evt)=>this.setPrice(evt));
    $('.js-upload-file').on('click', (evt)=>this.uploadItemFile(evt));
    $('.delete-btn').on('click', (evt)=>this.deleteOrderFile(evt));
    $('.image-show-block img').on('click', (evt)=>this.showOrderFile(evt));
    $('.price-set-form').delegate('.deleteFile', 'click', (evt)=>this.deleteItemFile(evt));
    $('.js-submit-price').on('click', ()=>this.submitPrice());
    $('.js-check-price').on('click', (evt)=>this.acceptPrice(evt));
    $('.js-refuse-price').on('click', ()=>this.refusePrice());
  }

  /**
   * 初始化popover显示
   * */
  popoverEvents(){
    let $info = '<div>如果您的单位没有纳税人识别号码，可输入统一社会信用代码代替</div>'
    $('.js-invoice-popover').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      content: $info,
      delay: {
        hide: 100
      }
    })
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

  receiveOrder(evt, orderId) {
    $.ajax({
      url: "/api/zcy/orders/supplierReceiveOrder",
      type: "POST",
      data: {
        orderId
      },
      success: () => {
        window.location.reload()
      }
    })
  }

  rejectOrder(evt) {
    let orderId = $(evt.currentTarget).data("id");
    new Modal(rejectOrderTemplates({
      orderId
    })).show();
    $("#js-reject-order-form").validator();
    $("#js-reject-order-form").on("submit", (e) => {
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

  //显示验收单
  showAcceptanceFile(evt) {
      let acceptanceFiles = $(evt.target).data('files');
      if (acceptanceFiles != null && acceptanceFiles != undefined && acceptanceFiles != "" && acceptanceFiles != "[]") {
        this.showUploadFiles(acceptanceFiles);
      } else {
        new Modal({
          title: "温馨提示",
          icon: "info",
          htmlContent: "无数据"
        }).show();
      }
    }
    //弹出文件列表对话框
  showUploadFiles(data) {
    if (data != null && data != undefined && data != "") {
      let _showUploadFiles = Handlebars.wrapTemplate("buyer/order_form_list/templates/showUploadFiles");
      let _modal = new Modal(_showUploadFiles({
        _DATA_: data
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

  //订单模块：查看已经绑定发货单的商品列表
  showItemsForReceiver(evt, pageNo, templates) {
    let shipmentId = $(evt.target).closest('.orderShipments-item-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    $.ajax({
      url: '/api/zcy/orders/pagingShipmentItems',
      type: 'GET',
      data: {
        shipmentId,
        pageNo,
        pageSize
      },
      success: (result) => {
        result.orderType = this.orderType;
        if (templates == undefined) {
          let _showItemsForReceiver = Handlebars.templates["buyer/order_form_detail/templates/showDeliveryItems"];
          templates = _showItemsForReceiver;
          let _modal = new Modal(_showItemsForReceiver({
            _DATA_: result
          }));
          _modal.show();
          this.bindShowItemFormOnce();
        } else {
          $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({
            _DATA_: result
          }))[0]).find('.modal-body'));
          $('.pur-modal').find('#select-batch').prop("checked", false);
        }
        this.bindShowItemForm(0);
        new Pagination(".selected-pagination").total(result.total).show(pageSize, {
          current_page: pageNo - 1,
          callback: (pageNo) => {
            //_modal.close();
            this.showItemsForReceiver(evt, pageNo + 1, templates);
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

  /////////////////////订单发票信息模块脚本开始//////////////////////////

  //订单模块：查看已经绑定发票信息的商品列表
  showItemsForInv(evt, pageNo, templates) {
      let invoiceId = $(evt.target).closest('.item-tr').data("id");
      pageNo = pageNo || 1;
      let pageSize = 20;
      $.ajax({
        url: '/api/zcy/orders/pagingInvoiceItems',
        type: 'GET',
        data: {
          invoiceId,
          pageNo,
          pageSize
        },
        success: (result) => {
          result.orderType = this.orderType;
          if (result.total == 0) {
            new Modal({
              title: "温馨提示",
              icon: "info",
              htmlContent: "该发票暂无商品，请先添加商品。"
            }).show();
          } else {
            _.each(result.data, (el, index) => {
              let subItemCount = el.currentCount + el.unbindInvoiceCount;
              el.subItemCount = subItemCount;
            });
            //result.itemId=itemId;
            if (templates == undefined) {
              let _showItemsForReceiver = Handlebars.templates["buyer/order_form_detail/templates/showInvoiceItems"];
              templates = _showItemsForReceiver;
              let _modal = new Modal(_showItemsForReceiver({
                _DATA_: result
              }));
              _modal.show();
              this.bindShowItemFormOnce();
            } else {
              $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({
                _DATA_: result
              }))[0]).find('.modal-body'));
              $('.pur-modal').find('#select-batch').prop("checked", false);
            }
            this.bindShowItemForm(0);
            new Pagination(".selected-pagination").total(result.total).show(pageSize, {
              current_page: pageNo - 1,
              callback: (pageNo) => {
                //_modal.close();
                this.showItemsForInv(evt, pageNo + 1, templates);
              }
            });
          }
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
    /////////////////////采购单发票信息模块脚本结束//////////////////////////

  /////////////////////采购单预算信息模块脚本开始//////////////////////////
  //订单模块：显示已关联确认书的商品列表
  showItemsForPay(evt, pageNo, templates) {
    let payId = $(evt.target).closest('.itme-tr').data("id");
    let itemId = $(evt.target).closest('.itme-tr').data("id");
    pageNo = pageNo || 1;
    let pageSize = 20;
    //获取选中的确认书信息，以便在显示商品列表中看到
    let paymentsInfo = {};
    paymentsInfo.confirmationId = $(evt.target).closest('.itme-tr').find('.js-confirmationname').data("confirmationid");
    paymentsInfo.confirmationName = $(evt.target).closest('.itme-tr').find('.js-confirmationname').html();
    //paymentsInfo.gpCatalogId  = $(evt.target).closest('.itme-tr').find('.js-gpcatalogname').data("gpcatalogid");
    paymentsInfo.gpCatalogName = $(evt.target).closest('.itme-tr').find('.js-gpcatalogname').html();
    paymentsInfo.availableAccount = $(evt.target).closest('.itme-tr').find('.js-availableaccount').html();
    paymentsInfo.availableQuantity = $(evt.target).closest('.itme-tr').find('.js-availablequantity').html();
    paymentsInfo.fee = $(evt.target).closest('.itme-tr').find('.js-fee').html();
    paymentsInfo.quantity = $(evt.target).closest('.itme-tr').find('.js-quantity').html();

    $.ajax({
      url: '/api/zcy/orders/pagingPayItems',
      type: 'GET',
      data: {
        payId,
        pageNo,
        pageSize
      },
      success: (result) => {
        if (result.total == 0) {
          new Modal({
            title: "温馨提示",
            icon: "info",
            htmlContent: "该确认书暂无商品，请先添加商品。"
          }).show();
        } else {
          _.each(result.data, (el, index) => {
            let subItemCount = el.currentCount + el.unbindPayCount;
            el.subItemCount = subItemCount;
          });
          result.itemId = itemId;
          result.paymentsInfo = paymentsInfo;
          if (templates == undefined) {
            let _showItemsForReceiver = Handlebars.templates["buyer/order_form_detail/templates/showPaymentItems"];
            templates = _showItemsForReceiver;
            let _modal = new Modal(_showItemsForReceiver({
              _DATA_: result
            }));
            _modal.show();
            this.bindShowItemFormOnce();
          } else {
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({
              _DATA_: result
            }))[0]).find('.modal-body'));
            $('.pur-modal').find('#select-batch').prop("checked", false);
            let selectItems = $('.js-select-item');
          }
          this.bindShowItemForm();
          new Pagination(".selected-pagination").total(result.total).show(pageSize, {
            current_page: pageNo - 1,
            callback: (pageNo) => {
              //_modal.close();
              this.showItemsForPay(evt, pageNo + 1, templates);
            }
          });
        }
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

  //订单模块：现在自有资金支付的商品列表
  showItemsForOtherPay(evt, pageNo, templates) {
      let payId = $('.js-other-pay-item-id').data('id');
      let itemId = $(evt.target).closest('.itme-tr').data("id");
      let purchaseid = $(evt.target).closest('.confirm-order-body').data("purchaseid");
      pageNo = pageNo || 1;
      let pageSize = 20;
      if (payId == "" || payId == undefined) {
        new Modal({
          title: "温馨提示",
          icon: "info",
          htmlContent: "该支付方式暂无商品。"
        }).show();
        return false;
      }
      $.ajax({
        url: '/api/zcy/orders/pagingPayItems',
        type: 'GET',
        data: {
          payId,
          pageNo,
          pageSize
        },
        success: (result) => {
          if (result.total == 0) {
            new Modal({
              title: "温馨提示",
              icon: "info",
              htmlContent: "该支付方式暂无商品。"
            }).show();
          } else {
            _.each(result.data, (el, index) => {
              let subItemCount = el.currentCount + el.unbindPayCount;
              el.subItemCount = subItemCount;
            });
            result.itemId = itemId;
            if (templates == undefined) {
              let _showItemsForReceiver = Handlebars.templates["buyer/order_form_detail/templates/showOtherPaymentItems"];
              templates = _showItemsForReceiver;
              let _modal = new Modal(_showItemsForReceiver({
                _DATA_: result
              }));
              _modal.show();
              this.bindShowItemFormOnce();
            } else {
              $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({
                _DATA_: result
              }))[0]).find('.modal-body'));
              $('.pur-modal').find('#select-batch').prop("checked", false);
            }
            this.bindShowItemForm();
            new Pagination(".selected-pagination").total(result.total).show(pageSize, {
              current_page: pageNo - 1,
              callback: (pageNo) => {
                //_modal.close();
                this.showItemsForOtherPay(evt, pageNo + 1, templates);
              }
            });
          }
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
    /////////////////////采购单预算信息模块脚本结束//////////////////////////

  //显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowItemForm() {
      $("input.count-number").attr("readonly", "readonly");
      $('.js-select-item').css("display", "none");
    }
    //显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowItemFormOnce() {
    $('.js-batch-select').closest('label').css("display", "none");
    $('.js-invoice-items-submit').css("display", "none");
    $('.js-delivery-items-submit').css("display", "none");
    $('.js-payment-items-submit').css("display", "none");
    $('.js-no-need-show-count').remove();
  }

    //验收
  checkOrder(orderId) {
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

  //设置配送地址的tab事件
  iniTab() {
    $('.tab').find('.tab-navs').find('li:first').addClass('active');
    $('.tab').find('.tab-contents').find('div[data-role="content"]:first').removeClass('hide');
    let tabId = 0;
    //如果url中有tab，则需要将tab切换到指定的序号
    if ($.query.get("tab") != "") tabId = $.query.get("tab");
    if (tabId != "") {

      $('.tab').find('.tab-navs').find('li:first').removeClass('active');
      $('.tab').find('.tab-contents').find('div[data-role="content"]:first').addClass('hide');
      $('.tab').find('.tab-navs').find('li.js-nav-' + tabId).addClass('active');
      $('.tab').find('.tab-contents').find('div[data-role="content"].js-tab-content-' + tabId).removeClass('hide');
    }
    $(".tab").tab({
      before: (index) => {},
      after: (index) => {
        this.tabId = index;
      },
      activeIndex: tabId
    });

  }

  ///////////////////////发货/补发货开始/////////////////////////
  //订单详情模块：创建补发货
  createReissueShipment(evt) {
    let orderId = $('.order-form-detail-body').data("orderId");
    let shipmentTemplates = null;
    let pageNo = 1;
    let type = 0;
    let mode = 1;
    let action = 'generateReissueShipmentInfo';
    this.createShipment(evt, pageNo, shipmentTemplates, type, orderId, action, mode);
  }

  //订单详情模块：弹出发货窗口：点击地址
  changekDelivery(evt, mode = 0) {
    //选中的订单收货信息id
    let orderDeliveryId = $('.select-address-item').find('input[type="radio"][name="chooseAddr"]:checked').val();
    let pageNo = 1;
    //用于保存选中的商品信息
    this.selectedShipmentSkuAndQuantity = {};
    //获取该配送地址下的商品信息
    let type = 1;
    let action = 'pagingDeliveryItemsByDeliveryId';
    if (mode == 1) {
      action = 'pagingReissueDeliveryItemsByDeliveryId';
    }
    OrderList.prototype.alSelectWarehouse(); //过滤所选仓库
    this.showSelectItemCount(mode);
    this.createShipment(evt, pageNo, this.ShipmentTemplates, type, orderDeliveryId, action, mode);
  }

  //订单详情模块：创建发货
  //type=0表示创建发货，type=1表示切换地址后改变商品
  //mode=0表示正常发货，mode=1表示补发货
  createShipment(evt, pageNo, templates, type, id, action, mode) {

    let backlogId = $.query.get("backlogId"),
      orderId = $('.order-form-detail-body').data("order-id"),
      orderType = $('.order-form-detail-body').data("order-type"),
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
    $.ajax({
      url: '/api/zcy/orders/' + action,
      type: 'POST',
      data: param,
      success: (result) => {
        let data = result;
        if (templates == undefined) {
          let _showItemsForReceiver;
          if (mode == 0) {
            data.isReissue = false;
            _showItemsForReceiver = Handlebars.wrapTemplate("buyer/order_form_list/templates/showShipmentItems");
          }
          if (mode == 1) {
            data.isReissue = true;
            _showItemsForReceiver = Handlebars.wrapTemplate("buyer/order_form_list/templates/showRessiueShipments")
          }
          templates = _showItemsForReceiver;
          this.ShipmentTemplates = _showItemsForReceiver;
          result = null;
          data.orderId = orderId;
          data.orderType = orderType;
          let _modal = new Modal(_showItemsForReceiver({
            _DATA_: data
          }));
          _modal.show();
          $("select", _showItemsForReceiver).selectric();
          //用于保存修改过的商品信息
          this.selectedShipmentSkuAndQuantity = {};
          if (mode == 1) {
            _.each($('.item-name-td'), (el, index) => {
              this.setOrderShipmentSkuAndQuantity(el);
            });
          }
          this.bindShowShipmentItemFormOnce(mode);
        } else {
          if (type == 0) {
            data.isReissue = false;
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
              data.orderId = orderId;
              data.deliveryItemWarehouses = result;
            }
          }
          result = null;
          $('.pur-modal').find('.js-item-list').replaceWith($($.parseHTML(templates({
            _DATA_: data
          }))[0]).find('.js-item-list'));
          $('.pur-modal').find('#select-batch').prop("checked", false);
          // if(type == 1 && mode ==1){
          //   //用于保存修改过的商品信息
          //   this.selectedSkuAndQuantity = {};
          //   _.each($('.item-name-td'),(el,index)=>{
          //     this.setOrderShipmentSkuAndQuantity(el);
          //   });
          // }
          // let selectItems = $('.js-select-item')
          // _.each(selectItems,(el,index)=>{
          //   let values = _.values(this.selectedShipmentSkuAndQuantity)
          //   _.each(values,(value)=>{
          //     if($(el).closest('.item-tr').data("id") === value.id){
          //       $(el).prop('checked', true);
          //       let input = $(el).closest('.item-tr').find('input.count-number');
          //     }
          //   })
          // });
        }
        this.bindShowShipmentItemForm();
        OrderList.prototype.alSelectWarehouse();
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

  //订单详情模块：显示商品列表窗口后绑定事件（窗口刷新之后都要重新绑定）
  bindShowShipmentItemForm() {
      //初始化数字增减控件
      $('.input-amount').amount({
        changeCallback: (options) => this.changeItmeCount(options)
      });
      $('.js-select-item').on("change", (evt) => this.checkOneItem(evt));
      //初始化选中的地址
      let deliveryid = $('.modal-items-lists').data('deliveryid');
      $('.select-address-item').find('.js-select-address[value="' + deliveryid + '"]').attr('checked', 'checked');
      //重新初始化全选按钮事件
      $('.js-batch-select').on("change", (evt) => this.batchSelectItems(evt));
    }
    //订单详情模块：显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowShipmentItemFormOnce(mode = 0) {
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

  //订单详情模块：手动更改商品数量（input控件修改）
  changeItmeCount(options) {
    let $input = $(".count-number", options.container),
      count = $input.val(),
      sum = this.addAndMinusItmeCount(options);
    if (count > sum) {
      $input.val(sum);
      $input.trigger("change");
      return false
    }
    this.changeCountAffect($input);
  }

  //订单详情模块：维护选中的商品信息（增加）
  setOrderShipmentSkuAndQuantity(el) {
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
    let vaccineItemExts = thisTr.find('input[name="batchNumbers"]').val();
    if(!shipWarehouseCode){
      shipWarehouseCode = $('.js-single-select-warehouse').data('code');
      shipWarehouseName = $('.js-single-select-warehouse').data('name');
    }

    let skuQuantityInfo = this.selectedShipmentSkuAndQuantity[id];
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
      this.selectedShipmentSkuAndQuantity[id] = {
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
      this.selectedShipmentSkuAndQuantity[id].vaccineItemExts = JSON.parse(vaccineItemExts);
    }
  }

  //订单详情模块：点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusItmeCount(options) {
    let $input = $(".count-number", options.container),
      count = $input.val(),
      $tr = $(options.container).closest("tr"),
      skuId = $tr.data("skuid"),
      trBox = ".js-item-tr-" + skuId,
      skuBox = ".js-quantity-" + skuId,
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

  //订单详情模块：修改商品数量后需要维护的变化
  changeCountAffect(input) {
    let _selectItem = $(input).closest('.item-tr').find('.js-select-item');
    if (_selectItem.prop("checked")) {
      this.dealShipmentSkuWarehouse(input)
    }
    this.showSelectItemCount();
  }

  //订单详情模块：选中单个商品
  checkOneItem(evt) {
      $(this).closest("tr").removeClass("fail-item");
      let Tr = $(evt.target).closest('.item-tr');
      if (!($(evt.target).prop("checked"))) {
        $(".js-batch-select").prop("checked", false);
        this.delShipmentSkuAndQuantityWarehouse(evt)
      } else {
        this.setOrderShipmentSkuAndQuantity(evt.target);
      }
      this.showSelectItemCount();
    }
    //订单详情模块：全选商品
  batchSelectItems() {
    let allWarehouse = $('.js-all-select-warehouse option:selected').val();
    this.selectedShipmentSkuAndQuantity = {};
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
          this.setOrderShipmentSkuAndQuantity(el);
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
    }
    $('.js-select-item-info').html("一共选中了" + _.size(this.selectedShipmentSkuAndQuantity) + "项");
  }

  //订单详情模块：窗口的确定按钮事件
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
    shipment.orderId = $('.modal-items-lists').data('orderId');
    //订单收货信息id
    shipment.orderDeliveryId = $('.select-address-item').find('input[type="radio"][name="chooseAddr"]:checked').val();
    //发货方式,从物流中冗余过来.目前为:物流或者快递
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
    /* 其它的物流代码是 空格，定义就是这样的－无奈的 */

    if($('.shipmentType2').prop('checked') == false && shipment.expressCode != "" && shipment.shipmentNo == ""){
      this.myalert("请填写运单号");
      $('.js-shipmentNo').focus();
      return false;
    }

    // 订单类型
    let orderType = $('.modal-items-lists').data('ordertype');

    //处理数据的最后一关。将quantity为0的全去掉
    let shipmentItemExts = [];
    let selectedItems = _.values(this.selectedShipmentSkuAndQuantity);
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
        title: "请选择发货仓库",
        content: data.responseText
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
        let ressiueItemExts = _.map($(".js-reissue-item-tr"), (el, index) => {
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
        $(i).closest('tr').find('.input-amount').val(0)
      } else {
        $(i).closest('tr').find('.input-amount').removeClass('disabled')
      }
    });
    this.batchSelectItems()
  }

  selectSingleWarehouse(evt) {
    let singleSelect = $(evt.currentTarget),
      allSelect = $(".js-all-select-warehouse option:selected").val(),
      input = $(evt.currentTarget).closest("tr").find(".js-select-item");
    if (allSelect == "") {
      new Modal({
        icon: "warning",
        title: "提醒",
        content: "请先过滤发货仓库"
      }).show(() => {
        singleSelect.val("");
        singleSelect.selectric("refresh")
      })
    } else {
      if (singleSelect.val() !== allSelect) {
        input.prop("checked", false);
        input.prop('disabled', true);
        $(".js-select-item:checked").closest("tr").find(".minus").removeClass("disabled");
        $(".js-select-item:checked").closest("tr").find(".plus").removeClass("disabled");
        this.delShipmentSkuAndQuantityWarehouse(evt)
      } else {
        input.prop('disabled', false);
        input.prop("checked", true);
        this.setOrderShipmentSkuAndQuantity(evt.currentTarget)
      }
    }
  }

  delShipmentSkuAndQuantityWarehouse(evt) {
    let Tr = $(evt.target).closest('tr'),
      $input = Tr.find('input.count-number');
    $input.val(0);
    $input.trigger("change");

    this.dealShipmentSkuWarehouse($input)
  }


  dealShipmentSkuWarehouse($input) {
      let thisTr = $input.closest('tr'),
        id = thisTr.data('id'),
        quantity = parseInt($input.val()),
        skuId = thisTr.data('skuid'),
        lockWarehouseCode = thisTr.find(".js-lock-warehouse").data('code'),
        value = this.selectedShipmentSkuAndQuantity[id];
      if (value && value.skuId === skuId) {
        value.quantity = quantity;
        _.each(value.lockWarehouses, (el) => {
          if (el.lockWarehouseCode === lockWarehouseCode) {
            el.quantity = quantity
          }
        })
      }
    }
    ///////////////////////发货/补发货结束/////////////////////////

  changeConfirmModal(evt) {
    let orderId = this.orderId;
    $.ajax({
      url: "/api/zcy/getAndCheckOrderPayInfos",
      type: "GET",
      data: `orderId=${orderId}`,
      success: (data) => {
        let changeConfrimBookModal = new Modal(changeConfirmBookTemplates({
          data: data
        }));
        changeConfrimBookModal.show();
        $(".js-cancel-submit").on("click", (evt) => this.cancelSubmit(evt));
        this.initTrBlackOrNot()
      },
      error: (data) => {
        new Modal({
          icon: "error",
          title: "获取确认书失败",
          content: data.responseText
        }).show()
      }
    })
  }

  //tr的行是否变黑
  initTrBlackOrNot() {
    let totalMoney = 0;
    _.each($(".order-total-price").closest("td").siblings("td"), (i) => {
      totalMoney = totalMoney + $(i).find(".price").data("money")
    });
    _.each($(".js-effect-black-a"), (i) => {
      if ($(i).text() == "无效") {
        $(i).closest("tr").css("background-color", "#F7F7F7");
        $(i).closest("tr").find("a").css("color", "#666666");
        $(i).siblings(".js-control-black-a").find("a").unbind("click")
      } else {
        if ($(i).siblings(".js-status-black-a").text() == "老") {
          $(i).closest("tr").find("a").css("color", "#666666")
        }
        $(i).siblings(".js-control-black-a").find(".js-show-pay-item-list").bind("click", (evt) => new ChangeConfirm().showPayItemList(evt));
        $(i).siblings(".js-control-black-a").find(".js-show-pay-unbind-item-list").bind("click", (evt) => new ChangeConfirm().showPayUnbindItemList(evt))

      }
    });
    $(".order-total-price").append(totalMoney / 100 + '.00')
  }

  initChangeConfirmBook() {
    _.each($(".js-juge-confirm-stasus"), (i) => {
      if ($(i).text() == "无效") {
        $(".js-change-confirm").removeClass("hide")
      }
    });
  }

  //弹出窗口
  myalert(content) {
    new Modal({
      title: "提示",
      icon: "warning",
      content: content
    }).show();
  };

  cancelSubmit(evt) {
      let orderId = this.orderId;
      $.ajax({
        url: "/api/zcy/orders/orderPayBindItemsCancel",
        type: "GET",
        data: `orderId=${orderId}`,
        success: (data) => {
          window.location.reload()
        },
        error: (data) => {
          new Modal({
            icon: "warning",
            title: "确认失败",
            content: data.responseText
          }).show()
        }
      })
    }

  //更多hover
  moreHandle() {
      let that = this;
      let morepop = Handlebars.templates["buyer/order_form_detail/templates/morepopModal"];
      let expressCode = $('.more').prev('span').data('expresscode');
      let shipmentNo = $('.more').prev('span').data('shipmentno');
      $('.more').mouseenter(function() {
        if ($('.moreModal').html() == '') {
          $.ajax({
            url: `/api/zcy/orders/findExpressStepDetail?shipmentNo=${shipmentNo}&expressCode=${expressCode}`,
            type: 'get'
          }).done(function(result) {
            let msg = {
                "data": result
              }
              console.log(msg);
            $('.moreModal').html(morepop(msg));
            that.popoverhandle();
          });
        }
      });
    }
    //popover
  popoverhandle() {
    let $info = $('.moreModal').html();
    $('.more').popover({
      trigger: 'hover',
      placement: 'bottom',
      html: true,
      content: $info,
      delay: {
        hide: 100
      }
    }).on('shown.bs.popover', function(event) {
      var that = this;
      $(this).parent().find('div.popover').on('mouseenter', function() {
        $(that).attr('in', true);
      }).on('mouseleave', function() {
        $(that).removeAttr('in');
        $(that).popover('hide');
      });
    }).on('hide.bs.popover', function(event) {
      if ($(this).attr('in')) {
        event.preventDefault();
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
    if(this.selectedShipmentSkuAndQuantity[rowId]){
      this.selectedShipmentSkuAndQuantity[rowId].vaccineItemExts = batchs;
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

  //上传验收单
  uploadAcceptanceFile(evt) {
    let orderId = $(evt.currentTarget).data('orderId');
    /* 清空原本的值 */
    $('#upload-order-file-modal-acceptance .modal-image-list').empty();
    let uploadModal = new Modal('#upload-order-file-modal-acceptance');
    uploadModal.show();
    $('#upload-order-file-modal-acceptance .js-print-order-file').attr('href', '/api/zcy/reports/accept/' + orderId);

    $('#order-file-upload-acceptance').fileupload({
      url: '/api/user/files/upload',
      limitMultiFileUploads: 20,
      add: function(e, data) {
        let fileLen = $('#upload-order-file-modal-acceptance .modal-image-list li').length;
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
          $("#order-file-submit-acceptance").removeAttr("disabled");
          let resultJson = JSON.parse(result);
          let file = resultJson && resultJson.length && resultJson[0].userFile;
          let html = '<li><div class="modal-image"><img src="' + file.path + '"/><button class="btn btn-mini btn-trash js-image-delete" data-fileId="' + file.id + '">×</button><span class="item-name" data-path="' + file.path + '" title="' + file.name + '">' + file.name + '</span></div></li>'
          $('#upload-order-file-modal-acceptance .modal-image-list').append(html);
          $('#upload-order-file-modal-acceptance .js-image-delete').off('click').on('click', function() {
            let $button = $(this);
            let fileId = $button.data('fileid');
            $.ajax({
              method: 'DELETE',
              url: '/api/user/files/' + fileId + '/delete',
              success: function() {
                $button.parent().parent().remove();
                let list = $('#upload-order-file-modal-acceptance .modal-image-list li');
                if (list.length == 0) {
                  $("#order-file-submit-acceptance").attr("disabled", "disabled");
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
    $('#order-file-submit-acceptance').off('click').on('click', function() {
      let list = $('#upload-order-file-modal-acceptance .modal-image-list li');
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
          result && uploadModal.close();
          sessionStorage.setItem('pagePosition', $('.main-right').scrollTop())
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

  //上传检测报告
  uploadQualificationFile(evt) {
    let orderId = $(evt.currentTarget).data('orderId');
    /* 清空原本的值 */
    $('#upload-order-file-modal-qualification .modal-image-list').empty();
    let uploadModal = new Modal('#upload-order-file-modal-qualification');
    uploadModal.show();
    $('#upload-order-file-modal-qualification .js-print-order-file').attr('href', '/api/zcy/reports/accept/' + orderId);

    $('#order-file-upload-qualification').fileupload({
      url: '/api/user/files/upload',
      limitMultiFileUploads: 20,
      add: function(e, data) {
        let fileLen = $('#upload-order-file-modal-qualification .modal-image-list li').length;
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
          $("#order-file-submit-qualification").removeAttr("disabled");
          let resultJson = JSON.parse(result);
          let file = resultJson && resultJson.length && resultJson[0].userFile;
          let html = '<li><div class="modal-image"><img src="' + file.path + '"/><button class="btn btn-mini btn-trash js-image-delete" data-fileId="' + file.id + '">×</button><span class="item-name" data-path="' + file.path + '" title="' + file.name + '">' + file.name + '</span></div></li>'
          $('#upload-order-file-modal-qualification .modal-image-list').append(html);
          $('#upload-order-file-modal-qualification .js-image-delete').off('click').on('click', function() {
            let $button = $(this);
            let fileId = $button.data('fileid');
            $.ajax({
              method: 'DELETE',
              url: '/api/user/files/' + fileId + '/delete',
              success: function() {
                $button.parent().parent().remove();
                let list = $('#upload-order-file-modal-qualification .modal-image-list li');
                if (list.length == 0) {
                  $("#order-file-submit-qualification").attr("disabled", "disabled");
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
    $('#order-file-submit-qualification').off('click').on('click', function() {
      let list = $('#upload-order-file-modal-qualification .modal-image-list li');
      let itemFiles = $.map(list, function(li) {
        let filePath = $(li).find('.item-name').data('path');
        let fileName = filePath.split('/')[filePath.split('/').length - 1];
        return {
          fileName: fileName,
          filePath: filePath,
          orderId: orderId,
          type: 4
        };
      });

      $.ajax({
        url: '/api/zcy/orders/uploadItemFiles',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(itemFiles),
        success: (result) => {
          result && uploadModal.close();
          sessionStorage.setItem('pagePosition', $('.main-right').scrollTop())
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

  showOrderFile(evt) {
    let url = $(evt.currentTarget).attr('src')
    if(url){
      window.open(url)
    }
  }
  //删除文件
  deleteOrderFile(evt) {
    evt.stopPropagation()
    new Modal({
      title: '您是否确定删除该图片？',
      icon: 'warning',
      htmlContent: '提交后将不能撤回',
      isConfirm: true
    }).show(() => {
      let fileId = $(evt.currentTarget).data('fileId');
      let itemFiles = [];
      itemFiles.push(fileId);
      $.ajax({
        url: '/api/zcy/orders/deleteItemFiles',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(itemFiles),
        success: () => {
          sessionStorage.setItem('pagePosition', $('.main-right').scrollTop())
          window.location.reload()
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

  bindItemFileUpload(){
    $('.js-item-upload-file').fileupload({
      url: '/api/user/files/upload',
      limitMultiFileUploads: 1,
      add: function(e, data) {
        data.submit().success(function(result) {
          let resultJson = JSON.parse(result);
          let file = resultJson && resultJson.length && resultJson[0].userFile;
          let orderId = $('.order-form-detail-body').data('orderId');
          let skuId = $(e.target).data('skuId');
          let itemFiles = [{
            fileName: file.name,
            filePath: file.path,
            orderId: orderId,
            skuId: skuId,
            type: 3
          }];
          $.ajax({
            url: '/api/zcy/orders/uploadItemFiles',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(itemFiles),
            success: () => {
              // let html = '<span class="fileItem"><i class="icon-zcy icon-fujian mr"></i><span class="fileName">'+ file.name +'</span>' +
              //   '<a class="deleteFile" data-file-id="'+file.id+'">&times;</a></span>'
              // $(e.target).closest('td').find('.update-btn').hide()
              // $(e.target).after(html);
              sessionStorage.setItem('pagePosition', $('.main-right').scrollTop())
              window.location.reload()
            },
            error: (data) => {
              new Modal({
                title: "温馨提示",
                icon: "info",
                htmlContent: "操作失败：" + data.responseText
              }).show();
            }
          })
        });
      }
    });
  }

  deleteItemFile(evt) {
    let itemFiles = [],
      fileId = $(evt.currentTarget).data('fileId');
    itemFiles.push(fileId);
    $.ajax({
      url: '/api/zcy/orders/deleteItemFiles',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(itemFiles),
      success: () => {
        // $(evt.currentTarget).closest('td').find('.update-btn').show();
        // $(evt.currentTarget).closest('.fileItem').remove();
        sessionStorage.setItem('pagePosition', $('.main-right').scrollTop())
        window.location.reload()
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

  //商品定价
  setPrice(evt){
    let self = this,
      valid = true,
      orderId = $(evt.currentTarget).data('orderId'),
      price = $(evt.currentTarget).val(),
      Reg = new RegExp(/^(\d+|\d+.\d{1,2})$/),
      map = {};
    $('.js-price-input').each((i, input)=>{
      let skuId = $(input).data('skuId'),
          price = $(input).val();
      if(!Reg.test(price)) {
        valid = false
        return false
      }
      map[skuId] = price;
    })
    $.ajax({
      url: '/api/zcy/block/order/calPrice',
      method: 'get',
      dataType: 'json',
      data: {
        "orderId": orderId,
        "priceMap": JSON.stringify(map)
      },
      headers: {'X-AJAX-CALL': 'true'}
    }).done((resp)=>{
      // {"success":true,"result":{"calculatedPriceMap":{"1010085":11.0},"sum":11.0},"error":null}
      if(resp.success){
        let skuId = $(evt.currentTarget).data('skuId'),
            discountPrice = resp.result.calculatedPriceMap[skuId].toFixed(2),
            sum = resp.result.sum.toFixed(2);
        $(evt.currentTarget).closest('tr').find('.js-discount-price').text(discountPrice);
        $('.js-total-price').text(sum);
        self.temporarySavePriceSet(orderId, skuId, price, discountPrice, sum);
      }
    });
  }

  submitPrice(){
    let flag = $('.js-has-qualification').val();
    if(!flag){
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: "请先上传检测报告"
      }).show();
      return;
    }
    let map = {},
      orderId = $('.order-form-detail-body').data('orderId');
    $('.price-set-form tr').each((i, tr)=>{
      let skuId = $(tr).data('skuId'),
        price = $(tr).find('.js-price-input').val();
      map[skuId] = price;
    })

    $.ajax({
      url: '/api/zcy/block/order/setPrice',
      method: 'post',
      dataType: 'json',
      data: {
        "orderId": orderId,
        "priceMap": JSON.stringify(map)
      },
      headers: {'X-AJAX-CALL': 'true'}
    }).done(()=>{
      window.location.reload()
    }).fail(()=>{
      new Modal({
        title: "温馨提示",
        icon: "error",
        htmlContent: "定价失败"
      }).show();
    });
  }

  acceptPrice(evt) {
    let unPlanAmount = $(evt.currentTarget).data('unplanAmount');
    if(unPlanAmount > 0){
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: '请先将所有商品关联采购计划再确认定价'
      }).show();
      return;
    }
    let flag = $('.js-has-acceptance').val();
    if(!flag){
      new Modal({
        title: "温馨提示",
        icon: "info",
        htmlContent: "请先上传验收单"
      }).show();
      return;
    }
    let orderId = $('.order-form-detail-body').data('orderId');
    $.ajax({
      url:'/api/zcy/block/order/acceptPrice',
      method:'post',
      dataType: 'json',
      data: {orderId},
      headers: {'X-AJAX-CALL': 'true'}
    }).done((resp)=>{
      if(resp && resp.success){
        window.location.href = '/buyer/blocktrade-orders'
      }
      else{
        let msg = '确认定价失败'
        if(resp.msg){
          msg = resp.msg
        }
        new Modal({
          title: "温馨提示",
          icon: "error",
          htmlContent: msg
        }).show();
      }
    }).fail(()=>{
      window.location.reload()
    });
  }

  refusePrice() {
    let refuseModal = new Modal(refusePriceView())
    refuseModal.show()
    $(refuseModal.modal).find('.js-submit-refuse').on('click', ()=>{
      let orderId = $('.order-form-detail-body').data('orderId'),
          reason = $('.js-refuse-reason').val()
      refuseModal.close()
      $.ajax({
        url:'/api/zcy/block/order/rejectPrice',
        method:'post',
        dataType: 'json',
        data: {orderId, rejectReason: reason},
        headers: {'X-AJAX-CALL': 'true'}
      }).done(()=>{
        window.location.reload()
      })
    })
  }

  temporarySavePriceSet(orderId, skuId, price, discountPrice, sum){
    let itemsPriceMap = sessionStorage.getItem('orderPriceSet'+orderId)
    try {
      itemsPriceMap = JSON.parse(itemsPriceMap)
    }
    catch(e){
      console.log(e)
    }
    if(!itemsPriceMap){
      itemsPriceMap = {}
    }
    if (price && discountPrice) {
      let itemPrice = {price, discountPrice};
      itemsPriceMap[skuId] = itemPrice;
    }
    sessionStorage.setItem('orderPriceSet'+orderId, JSON.stringify(itemsPriceMap));
    sessionStorage.setItem('orderPriceSetSum'+orderId, sum);
  }

  //展示商品下浮率
  renderDecreaseRate(){
    $('.price-set-form tr .js-decreaseRate').each((i, td)=>{
      let json = $(td).data('extra');
      let decreaseRate = json.decreaseRate;
      if(decreaseRate >= 0){
        $(td).text((decreaseRate/100).toFixed(2) + '%');
      }
      else{
        $(td).text('--');
      }
    })
  }

  renderOrderPriceSet(){
    $('.js-price-file').popover({
      trigger: 'hover',
      placement: 'bottom',
      html: true,
      content: "请上传<a href='http://www.hzlysc.com/Item/list.asp?id=1445' target='_blank'>价格中心</a>网站的价格截图",
      delay: {
        hide: 500
      }
    })
    let orderId = $('.order-form-detail-body').data('orderId');
    let itemsPriceMap = sessionStorage.getItem('orderPriceSet'+orderId)
    let priceSum = sessionStorage.getItem('orderPriceSetSum'+orderId)
    if(priceSum){
      $('.js-total-price').text(priceSum);
    }
    try {
      itemsPriceMap = JSON.parse(itemsPriceMap)
    }
    catch(e){
      console.log(e)
    }
    if(!itemsPriceMap) {
      new FormChecker({container: '.price-set-form', ctrlTarget: '.js-submit-price', precheck: true});
      return
    }
    $('.price-set-form tr').each((i, tr)=>{
      let skuId = $(tr).data('skuId');
      let itemPrice = itemsPriceMap[skuId];
      if(itemPrice){
        $(tr).find('.js-price-input').val(itemPrice.price);
        $(tr).find('.js-discount-price').text(itemPrice.discountPrice);
      }
    })
    new FormChecker({container: '.price-set-form', ctrlTarget: '.js-submit-price', precheck: true});
  }

  //定位到上次操作位置
  autoScrollToLastPosition(){
    let lastPosition = sessionStorage.getItem('pagePosition')
    if(lastPosition){
      $('.main-right').scrollTop(parseInt(lastPosition));
      sessionStorage.removeItem('pagePosition');
    }
  }
}

module.exports = BlockTradeOrderFormDetail;