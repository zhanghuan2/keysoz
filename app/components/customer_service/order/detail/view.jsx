const Modal = require('pokeball/components/modal')
const itemsTpl = Handlebars.templates['customer_service/order/detail/templates/items']
const ItemServices = require('common/item_services/view')

class CustomerOrderDetail {
  constructor () {

    // 渲染采购目录列
    $('.js-item-catalog').each((i, td) => {
      try {
        let catalogs = $(td).data('catalog'),
          catalogText = catalogs.join(' ');
        $(td).html('<span class="item-catalog" title="' + catalogText + '">' + catalogText + '</span>');
      } catch (e) {
        console.log(e);
      }
    })

    // 渲染商品评分
    const skuEvaluationMapStr = $('#skuEvaluationMap').val();
    if (skuEvaluationMapStr) {
      try {
        const skuEvaluationMap = JSON.parse(skuEvaluationMapStr)
        if (skuEvaluationMap) {
          $('.js-item-score').each((i, el) => {
            let skuId = $(el).data('skuId'),
              score = skuEvaluationMap[skuId];
            if (score) {
              $(el).text(score)
            } else {
              $(el).text('－')
            }
          })
        } else {
          $('.js-item-score').text('－')
        }
      } catch (e) {
        console.log(e)
      }
    }
    this.popoverEvents();
    this.bindEvents();
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  bindEvents () {
    // 计算已发货数量
    const $shippedQuantity = $('[name="shippedQuantity"]');
    _.each($shippedQuantity, (el) => {
      const shippedQuantity = $(el).data('quantity') - $(el).data('unshippedquantity');
      $(el).text(shippedQuantity);
    })
    // 商品列表tab页切换
    $('.tab').on('click', 'li', (event) => {
      const $target = $(event.target);
      $('.tab-content').addClass('hidden');
      $('[name="' + $target.data('target') + '"]').removeClass('hidden');
      $('.item-nav').removeClass('active');
      $target.parent().addClass('active');
    });

    // 获取发货单关联商品
    $('#delivery-table').on('click', '[name="item-list"]', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const deliveryId = $target.data('deliveryid');

      if (itemQuantity > 0) {
        $.ajax({
          url: '/api/customer/queryItemsByShipmentId?shipmentId=' + deliveryId + '&pageNo=1&pageSize=' + itemQuantity,
          type: 'GET',
          success: (items) => {
            this.fillItemTable(items, '发货单关联商品列表');
          }
        });
      } else {
        this.fillItemTable([], '发货单关联商品列表');
      }
    });


    // 获取发票关联商品
    $('#invoice-table').on('click', '[name="item-list"]', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const invoiceId = $target.data('invoiceid');

      if (itemQuantity > 0) {
        $.ajax({
          url: '/api/customer/customerFindOrderInvoiceItems?invoiceId=' + invoiceId + '&pageNo=1&pageSize=' + itemQuantity,
          type: 'GET',
          success: (items) => {
            this.fillItemTable(items, '发票关联商品列表');
          }
        });
      } else {
        this.fillItemTable([], '发票关联商品列表');
      }
    });

    // 获取采购计划关联商品
    $('#purchaseplan-table').on('click', '[name="item-list"]', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const payId = $target.data('purchaseplanid');

      if (itemQuantity > 0) {
        $.ajax({
          url: `/api/customer/customerFindOrderPayItems?payId=${payId}&pageNo=1&pageSize=${itemQuantity}`,
          type: 'GET',
          success: (items) => {
            this.fillItemTable(items, '采购计划关联商品列表');
          }
        });
      } else {
        this.fillItemTable([], '采购计划关联商品列表');
      }
    });

    // 获取采购计划计划外金额关联商品
    $('#other-item-list').on('click', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const purchaseId = $target.data('purchaseid');

      if (itemQuantity > 0) {
        $.ajax({
          url: '/api/customer/customerFindOrderPayItems?payId=' + purchaseId + '&pageNo=1&pageSize=' + itemQuantity,
          type: 'GET',
          success: (items) => {
            this.fillItemTable(items, '计划外资金关联商品列表');
          }
        });
      } else {
        this.fillItemTable([], '计划外资金关联商品列表');
      }
    });

    // 下载附件
    $('#order-preview-table').on('click', '[name="acceptance-file"]', (event) => {
      const $target = $(event.target);
      downloadFile($target.data('path'));

      function downloadFile (url) {
        try {
          const elemIF = document.createElement("iframe");
          elemIF.src = url;
          elemIF.style.display = "none";
          document.body.appendChild(elemIF);
        } catch (e) {
          console.log(e);
        }
      }
    });
    $('.image-show-block img').on('click', evt => this.showOrderFile(evt));
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

  showOrderFile (evt) {
    const url = $(evt.currentTarget).attr('src')
    if (url) {
      window.open(url)
    }
  }

  fillItemTable (items, title) {
    const $modal = $('#item-modal');

    $modal.find('.modal-title').text(title);
    $modal.find('tbody').html(itemsTpl({ items }));

    new Modal('#item-modal').show();
  }
}

module.exports = CustomerOrderDetail;
