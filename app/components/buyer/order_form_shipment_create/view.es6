import Modal from "pokeball/components/modal";
const allWarehouseTemplates = Handlebars.templates["buyer/order_form_list/templates/all-warehouse"];
const invoiceContentDetailTemplates = Handlebars.templates["buyer/order_form_shipment_create/templates/invoiceDetail"];
const FormChecker = require('common/formchecker/view');
const batchNumberTpl = Handlebars.templates["buyer/order_form_shipment_create/templates/addBatchNumber"];
const batchNumberRow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberRow"];
const batchNumberShow = Handlebars.templates["buyer/order_form_shipment_create/templates/batchNumberShow"];

class OrderFromShipmentCreate {
  constructor ($){

    this.selectedSkuAndQuantity = {};
    this.$jsReGenerateContract = $('.js-reGenerateContract');
    this.$jsSelectWarehouse = ".js-all-select-warehouse";
    this.$jsSelectSingleWarehouse = ".js-single-select-warehouse";
    this.bindShowItemForm();
    this.bindShowItemFormOnce();
    this.alSelectWarehouse();
    this.shipmentTypehandle();//收货弹框单选按钮
    this.bindInvoiceContentDetail();
    this.bindEvent();
    this.popoverEvents();

  }

  bindEvent(){
    // 重新生成网超合同
    this.$jsReGenerateContract.on('click', (evt) => this.reGenerateContract(evt));

    $(document).on('change', this.$jsSelectWarehouse, (evt) => this.selectWarehouseFilter(evt));
    $(document).on('change', this.$jsSelectSingleWarehouse, (evt) => this.selectSingleWarehouse(evt));

    $('.js-invoice-image').uploadImage({bizCode: '1011'});
    $('.js-select-invoices').on('change', (evt)=>this.addFormChecker(evt));

    new FormChecker({container : '.order-form-shipment-create-page', ctrlTarget : '.js-delivery-items-submit'}).doCheck();

    $('.js-add-batch-number').on('click', (evt)=>this.addBatchNumber(evt));
  }

  // 重新生成网超合同
  reGenerateContract(evt) {
    evt.preventDefault();
    let id = $.query.keys.orderId;
    $.ajax({
      url: "/api/zcy/orders/generateContract",
      type: "POST",
      data: {
        orderId: id
      },
      success: () => {
        window.location.reload()
      },
      error: (data) => {
        new Modal({
          title:'温馨提示',
          icon:'info',
          content: data.responseText
        }).show();
      }
    });
  }

  /**
   * 初始化popover显示
   * */
  popoverEvents(){
    let $info = '<div>如果您的单位没有纳税人识别号码，可输入统一社会信用代码代替</div>'
    $('.js-invoice-popover').popover({
      trigger: 'hover',
      placement: 'left',
      html: true,
      content: $info,
      delay: {
        hide: 100
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
    //重新初始化全选按钮事件
    $('.js-batch-select').on("change", (evt) => this.batchSelectItems(evt));
  }
  //订单列表模块：显示商品列表窗口后绑定事件（只能绑定一次）
  bindShowItemFormOnce(mode = 0) {
    $('.select-address-item').on('change', (e) => this.changekDelivery(e,mode));
    $('.js-delivery-items-submit').on('click', () => this.itemsSubmitPreCheck(mode));
    //获取物流公司信息
    this.getExpressCompany();
  }

  //弹出发货窗口：点击地址
  changekDelivery(evt, mode = 0) {
    ////选中的订单收货信息id
    //let orderDeliveryId = $('.select-address-item').find('input[type="radio"][name="chooseAddr"]:checked').val();
    //let pageNo = 1;
    ////用于保存选中的商品信息
    //this.selectedSkuAndQuantity = {};
    ////获取该配送地址下的商品信息
    //let type = 1;
    //let action = 'pagingDeliveryItemsByDeliveryId';
    //if (mode == 1) {
    //  action = 'pagingReissueDeliveryItemsByDeliveryId';
    //}
    //this.showSelectItemCount(mode);
    //this.alSelectWarehouse()

    let id = $('.order-form-shipment-create-page').data('orderid');
    let orderType = $('.order-form-shipment-create-page').data('ordertype');
    let orderDeliveryId = $(evt.target).data('deliverid');
    window.location.href = '/buyer/order-shipment-create?orderId='+id+'&orderType='+orderType+'&orderDeliveryId='+orderDeliveryId;
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

  //订单列表模块：修改商品数量后需要维护的变化
  changeCountAffect(input) {
    let _selectItem = $(input).closest('.item-tr').find('.js-select-item');
    if (_selectItem.prop("checked")) {
      this.dealSkuWarehouse(input)
    }
    this.showSelectItemCount();
  }

  //显示选中的商品信息
  showSelectItemCount(mode) {
    if (mode == 1) {
      $('.js-select-item-info').addClass('hide');
    } else {
      $('.js-select-item-info').html("一共选中了" + _.size(this.selectedSkuAndQuantity) + "项");
    }
  }

  //得到所有发货仓库
  alSelectWarehouse() {
    let leafRegion, skuIds = [],
      orderDeliveryId,
      orderId = $(".order-form-shipment-create-page").data('orderid');
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

  //订单列表模块：维护选中的商品信息（增加）
  setPurchaseSkuAndQuantity(el) {
    let thisTr = $(el).closest('tr'),
      id = thisTr.data('id'),
      flag = 0,
      skuId = thisTr.data("skuid"),
      quantity = parseInt(thisTr.find('input.count-number').val()),
      selectWarehouse = thisTr.find(".js-single-select-warehouse option:selected"),
      shipWarehouseCode = selectWarehouse.val(),
      shipWarehouseName = selectWarehouse.data('name'),
      lockWareHouseTd = thisTr.find(".js-lock-warehouse"),
      lockWarehouseCode = lockWareHouseTd.data('code'),
      lockWarehouseName = lockWareHouseTd.data('name'),
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

  //删除单个sku的某个默认仓库
  delPurchaseSkuAndQuantityWarehouse(evt) {
    let Tr = $(evt.target).closest('tr'),
      $input = Tr.find('input.count-number');
    $input.val(0);
    $input.trigger("change");


    this.dealSkuWarehouse($input)
  }

  //显示发票内容详情
  bindInvoiceContentDetail(){
    setTimeout(function() {
      /* 绑定hover接口 */
      $('tbody .js-invoice-content-detail').map(function() {
        let content = $(this).data('invoiceContent');
        let detail = invoiceContentDetailTemplates(content);
          $(this).popover({
            trigger: 'hover',
            placement: 'right',
            html: true,
            content: detail
          });
      });
    }, 1000);
  }

  //弹出窗口
  myalert(content) {
    new Modal({
      title: "提示",
      icon: "warning",
      content: content
    }).show();
  };

  // 商品确认发货前，确认是否已经起草了合同
  itemsSubmitPreCheck(mode) {
    let contractInfo = $('.contract-info').data('contractinfo');

    if(contractInfo == null) {    // 采购方没有勾选网超合同
      this.itemsSubmit(mode, '');
    }
    else {
      if(contractInfo.contractStateStr == "待起草") { // 合同待起草状态
        new Modal({
          icon: "warning",
          title:"温馨提示",
          content: "您尚未提交合同, 是否确认发货？",
          isConfirm: true
        }).show(() => {
              this.itemsSubmit(mode);
            });
      }
      else {
        this.itemsSubmit(mode);
      }
    }
  }

  //订单列表模块：窗口的确定按钮事件
  //mode：0表示正常发货，1表示补发货
  itemsSubmit(mode) {
    mode = mode || 0;
    let shipment = {}, shipmentType, shipmentNo, expressCode, expressName;
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
    shipment.orderId = $('.order-form-shipment-create-page').data('orderid');
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
    //if(shipment.expressCode!= " " && shipment.shipmentNo == ""){
    //  this.myalert("请填写运单号");
    //  $('.js-shipmentNo').focus();
    //  return false;
    //}

    // 订单类型
    let orderType = $('.order-form-shipment-create-page').data('ordertype');

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
        _.each(item.lockWarehouses, (i) => {
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

    let url = "createOrderShipment",
      data = JSON.stringify({
      shipment,
      shipmentItemExts
    });

    // mode=1表示补发货，需要将quantity参数改为reissueQuantity
    if (mode == 1) {
      url = "createReissueOrderShipment";
      // 合同订单，仓库信息为空
      if (orderType != 1) {
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
    }

    $('body').spin('medium')
    $.ajax({
      url: '/api/zcy/orders/' + url,
      type: 'POST',
      contentType: "application/json",
      dataType: "json",
      data: data,
      success: () => {
        if(orderType == 3){
          window.location.href = '/buyer/blocktrade-orders';
        }
        else if(orderType == 2){
          window.location.href = '/buyer/vaccine-orders';
        }
        else{
          window.location.href = '/buyer/netsuper-orders';
        }
      },
      error: (data) => {
        $('body').spin(false)
        new Modal({
          title: "提示",
          icon: "warning",
          content: "提交商品失败！错误信息为：" + data.responseText
        }).show();
      }
    });
  }

  // 发货弹框按钮选择
  shipmentTypehandle() {
    $('body').on('change', '[name="shipmentType"]', function() {
      if ($('.shipmentType2').prop('checked') == true) {
        $(this).parent().find('.shipselect').css('display', 'none');
        $('.yundanhao').css('display', 'none');
        $('.js-shipmentNo').attr('required', false);
      } else {
        $(this).parent().find('.shipselect').css('display', 'inline-block');
        $('.yundanhao').css('display', 'inline-block');
        $('.js-shipmentNo').attr('required', true);
      }
      new FormChecker({container : '.order-form-shipment-create-page', ctrlTarget : '.js-delivery-items-submit'}).doCheck();

    });
  }

  addFormChecker(evt){
    let $tr = $(evt.target).closest('tr');
    let $input = $tr.find('input[type="text"]');

    if($(evt.target).prop('checked')){
      $input.attr('required', true);
      //$('input[type=file]').attr('required',true).attr('checker-type','uploadFile_required');
    }
    else{
      $input.attr('required', false);
      //$('input[type=file]').attr('required',false).attr('checker-type','uploadFile_required');
    }

    new FormChecker({container : '.order-form-shipment-create-page', ctrlTarget : '.js-delivery-items-submit'});
    $input.trigger('blur');
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
    let total = $(itemRow).data('total');
    if(count > total){
      new Modal({
        icon: 'warning',
        content: '商品数量超过待发货总数'+total
      }).show();
      return;
    }
    else{
      let $input = $(itemRow).find('input.count-number');
      $input.val(parseInt(count));
      this.dealSkuWarehouse($input);
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

}

module.exports = OrderFromShipmentCreate;