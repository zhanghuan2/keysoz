const Pagination = require('pokeball/components/pagination');
const Modal = require('pokeball/components/modal');
const TimeLine = require('common/time_line/extend');

const itemsTpl = Handlebars.templates['customer_service/purchase/detail/templates/items'];
const ordersTpl = Handlebars.templates['customer_service/purchase/detail/templates/orders'];
const ItemServices = require('common/item_services/view')

class CustomerPurchaseDetail {
  constructor () {
    new TimeLine("#test-log", { operateListIndex: 3 });
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()

    const pageSize = 10;
    const purchaseId = $('[name="purchase-id"]').text();
    new Pagination(".item-pagination").total($('[name="item-total"]').val()).show(pageSize, {
      current_page: 0,
      callback (page) {
        const data = '';
        $.ajax({
          url: '/api/customer/findPurchaseItems?pageNo=' + (page + 1) + '&pageSize=' + pageSize + '&purchaseId=' + purchaseId,
          type: 'get',
          success (items) {
            if (items.empty) {
              return;
            }

            $('#item-table').find('tbody').html(itemsTpl({ items }));
          }
        });
      }
    });

    new Pagination(".order-pagination").total($('[name="order-total"]').val()).show(pageSize, {
      current_page: 0,
      show_if_single_page: true,
      callback (page) {
        const data = '';
        $.ajax({
          url: '/api/customer/customerPagingOrderInfosByPurchaseId?pageNo=' + (page + 1) + '&pageSize=' + pageSize + '&purchaseId=' + purchaseId,
          type: 'get',
          success (orders) {
            if (orders.empty) {
              return;
            }

            $('#order-table').find('tbody').html(ordersTpl({ orders }));
          }
        });
      }
    });

    // 渲染预算信息里面商品未关联金额
    $('.js-purchase-unbind-money').each((i, td) => {
      let count = $(td).data('count'),
        price = $(td).data('price');
      count = isNaN(count) ? 0 : parseInt(count);
      price = isNaN(price) ? 0 : parseInt(price);
      const total = count * price / 100.0;
      $(td).html(total.toFixed(2));
    });
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
    // 渲染采购计划关联状态列
    $('.js-bind-status').each((i, td) => {
      let count = $(td).data('count'),
        remain = $(td).data('remain');
      count = isNaN(count) ? 0 : parseInt(count);
      remain = isNaN(remain) ? 0 : parseInt(remain);
      if (remain == count) {
        $(td).html('<span class="red-text">未关联</span>');
      } else if (remain > 0) {
        $(td).html('<span class="red-text">部分关联</span>');
      } else {
        $(td).html('<span class="green-text">完成关联</span>');
      }
    })

    this.popoverEvents();
    this.bindEvents();
  }

  bindEvents () {
    // 获取发票关联商品
    $('#invoice-table').on('click', '[name="item-list"]', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const invoiceId = $target.data('invoiceid');

      $.ajax({
        url: '/api/customer/findPurchaseInvoiceItems?invoiceId=' + invoiceId + '&pageNo=1&pageSize=' + itemQuantity,
        type: 'GET',
        success: (items) => {
          this.fillItemTable(items, '发票关联商品列表');
        }
      });
    });

    // 获取采购计划关联商品
    $('#purchaseplan-table').on('click', '[name="item-list"]', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const purchaseplanId = $target.data('purchaseplanid');

      $.ajax({
        url: '/api/customer/findPurchasePayItems?paymentId=' + purchaseplanId + '&pageNo=1&pageSize=' + itemQuantity,
        type: 'GET',
        success: (items) => {
          this.fillItemTable(items, '采购计划关联商品列表');
        }
      });
    });

    // 获取采购计划计划外金额关联商品
    $('#other-item-list').on('click', (event) => {
      const $target = $(event.target);
      const itemQuantity = $target.find('[name="item-quantity"]').text();
      const purchaseId = $target.data('purchaseid');

      $.ajax({
        url: '/api/customer/findPurchaseOrgPayItems?purchaseId=' + purchaseId + '&pageNo=1&pageSize=' + itemQuantity,
        type: 'GET',
        success: (items) => {
          this.fillItemTable(items, '计划外资金关联商品列表');
        }
      });
    });
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

  fillItemTable (items, title) {
    const $modal = $('#item-modal');

    $modal.find('.modal-title').text(title);
    $modal.find('tbody').html(itemsTpl({ items }));

    new Modal('#item-modal').show();
  }
}

module.exports = CustomerPurchaseDetail;
