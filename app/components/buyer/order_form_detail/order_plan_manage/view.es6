import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
const OrderPlanItems = Handlebars.templates["buyer/order_form_detail/order_plan_manage/templates/showOrderPlanItems"];
const PlanPopover = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/planPopoverInfo"];
const PurchasePlanList = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/purchasePlanList"];

class OrderPlanManage {

  constructor(){
    this.preRender();
    this.bindEvents();
  }

  preRender(){
    this.orderId = $('.js-order-id').val();
    this.renderRequisitionItems();
  }

  bindEvents(){
    let self = this;
    //替换采购计划按钮
    $('.js-bind-purchase-plan').on('click', (evt)=>self.showPurchasePlanModal(evt));
    //修改商品按钮
    $('.js-modify-purchase-plan-item').on('click', (evt)=>{
      let planData = $(evt.target).closest('div').data('plan');
      let itemData = $(evt.target).closest('tr').data('item');
      let usedQuantity = 0;
      _.each(itemData.orderPays, (v)=>{
        if(v.confirmationId  == planData.confirmationId && v.usedQuantity){
          usedQuantity = v.usedQuantity;
          return false;
        }
      })
      let orderItem = itemData.orderItem;
      orderItem.bindTotalQuantity = usedQuantity;
      orderItem.unbindQuantity = orderItem.bindRemainQuantity;
      self.modifyPurchasePlanBind(self.orderId, planData, orderItem);
    })
    //取消关联按钮
    $('.js-cancel-purchase-plan-item').on('click', (evt)=>{
      new Modal({
        title:"取消关联",
        icon:"warning",
        htmlContent:"确认取消关联该确认书？",
        isConfirm:true
      }).show(()=>{
        $(evt.target).prop('disabled', true);
        let planData = $(evt.target).closest('div').data('plan'),
            itemData = $(evt.target).closest('tr').data('item'),
            skuId = itemData.orderItem.skuId;
        self.cancelPurchasePlanBind(skuId, self.orderId, planData.confirmationId);
      })
    })
  }

  //渲染商品列表
  renderRequisitionItems(){
    let self = this;
    //渲染采购目录列
    $('.js-item-catalog').each((i, td)=>{
      try{
        let catalogs = $(td).data('catalog'),
          catalogText = catalogs.join(' ');
        $(td).html('<span class="item-catalog" title="'+catalogText+'">'+catalogText+'</span>');
      }
      catch(e){
        console.log(e);
      }
    })
    //查询页面渲染采购计划信息列
    let manageType = $('#order-plan-manage-type').val();
    if(manageType != 'edit'){
      $('.js-order-plans').each((index, td)=>{
        let orders = $(td).data('orders'),
          innerHtml = '', i = 0;
        while (i < orders.length){
          let v = orders[i];
          if(v.confirmationName){
            innerHtml = innerHtml + '<div class="purchase-plan-no">' + v.confirmationName + '</div>';
          }
          i++;
        }
        $(td).html(innerHtml);
      })
    }

    $('.js-purchase-money').each((i, el)=>{
      let price = $(el).data('price');
      let count = $(el).data('count');
      let decreaseRate = $(el).data('decreaseRate');
      let total = parseInt(count)*parseFloat(price)/100.0;
      if(decreaseRate){
        total = total*(1-parseInt(decreaseRate)/10000);
      }
      $(el).html(total.toFixed(2));
    })

    $('.js-purchase-plan-item').each((i, el)=>{
      let planData = $(el).data('plan');
      $(el).mouseenter(()=>{
        if($(el).attr('data-pop')){}
        else{
          $.ajax({
            url: '/api/zcy/orders/pay/'+ self.orderId + '/' +planData.confirmationId +'/detail',
            type: 'get'
          }).done((result)=>{
            $(el).attr('data-pop', true)
            $(el).find('.purchase-plan-no').popover({
              trigger: 'hover',
              placement: 'left',
              html: true,
              content: PlanPopover(result),
              delay: {
                hide: 100
              }
            }).popover('show');
          })
        }
      });
    })
  }

  showPurchasePlanModal(evt,pageNo,pageSize,templates){
    let self = this;
    pageNo = pageNo || 1;
    pageSize = pageSize || 10;
    let keyword = $.trim($("#planSearchText").val());
    $.ajax({
      url: '/api/zcy/orders/getPurchaserConfirmations',
      type: 'GET',
      data: {
        orderId: self.orderId,
        keyword,
        pageNo,
        pageSize
      },
      success:(result)=>{
        if(result.total === 0){
          new Modal({
            title:"温馨提示",
            icon:"info",
            htmlContent:"您采购单的商品没有合适的采购计划可使用"
          }).show(/*() => this.$noRelate.prop("checked", true).trigger("change")*/);
        }
        else{
          if(templates == undefined){
            templates = PurchasePlanList;
            let purchasePlanModal = new Modal(templates({_DATA_:result}));
            purchasePlanModal.show();
            self.bindPurchasePlanModalEvent(templates, purchasePlanModal);
          }else{
            $('.pur-modal').find('.modal-body').replaceWith($($.parseHTML(templates({ _DATA_: result }))[0]).find('.modal-body'));
          }
          new Pagination(".selected-pagination").total(result.total).show(pageSize,{
            current_page: pageNo - 1,
            callback: (pageNo)=>{
              self.showPurchasePlanModal(evt,pageNo+1,pageSize,templates);
            }
          });
        }
      }
    })
  }

  bindPurchasePlanModalEvent(templates, modal){
    let self = this;
    //查询按钮
    $(".js-purchase-plan-modal").on("click", ".js-query-plan-list", (evt) => this.showPurchasePlanModal(evt, 1, 10, templates))
    //回车事件
    $("#planSearchText").keydown((evt)=>{
      if(evt.which == '13'){
        this.showPurchasePlanModal(evt, 1, 10, templates);
      }
    })
    //绑定确定按钮事件
    $('.js-new-payment-items-submit').unbind().on('click', ()=>{
      $('.js-new-payment-items-submit').prop('disabled', true);
      let $input = $('.js-select-item:checked');
      let planId = $input.attr('id');
      let planInfo = $input.closest('tr').data('payment');
      if(planId){
        //self.showPurchasePlanItemsModal(self.orderId, planId, planInfo, modal);
        self.submitPurchasePlanMaxBind(self.orderId, planId, planInfo, modal);
      }
      else{
        new Modal({
          title:"提示",
          icon:"warning",
          content:"未选中任何采购计划！请选择采购计划后提交"
        }).show();
        $('.js-new-payment-items-submit').prop('disabled', false);
      }
    });
  }

  // 提交采购计划绑定 -- 自动进行最大数量关联
  submitPurchasePlanMaxBind(orderId, confirmId, planInfo, preModal) {
    let self = this;
    $.ajax({
      url: '/api/zcy/orders/pagingConfirmUnBindItems',
      type: 'GET',
      data:{pageNo:1, pageSize: 9999, orderId, confirmId}
    }).done((result)=>{
      preModal.close();
      // 最大程度关联采购计划
      let planAvailableAccount = planInfo.availableAccount,
          planAvailableQuantity = planInfo.availableQuantity,
          bindedList = [];
      if(planAvailableQuantity == -1){
        planAvailableQuantity = Number.MAX_VALUE;
      }
      _.each(result.data, (item) => {
        if(item.unbindQuantity <= planAvailableQuantity && item.skuPrice * item.unbindQuantity <= planAvailableAccount) {
            planAvailableQuantity -= item.unbindQuantity
            planAvailableAccount -= item.skuPrice * item.unbindQuantity
            bindedList.push(item)
        } else {
          let count = item.unbindQuantity
          do {
            count--
          } while((count > planAvailableQuantity || item.skuPrice * count > planAvailableAccount) && count > 0)
          if (count > 0) {
            planAvailableQuantity -= count
            planAvailableAccount -= item.skuPrice * count
            item.unbindQuantity = count
            bindedList.push(item)
          }
        }
      })
      //提交采购计划绑定
      let selectedSkuAndQuantity = {};
      for(let val of bindedList){
        let skuId = val.skuId,
            bindItemCount = val.unbindQuantity,
            OrderSkuAndQuantity = {skuId,bindItemCount};
        selectedSkuAndQuantity[skuId] = OrderSkuAndQuantity;
      }
      let skuAndQuantityList = [],
          size = _.size(selectedSkuAndQuantity),
          values = _.values(selectedSkuAndQuantity);
      if(size > 0){
        _.each(values, (value)=>{
          skuAndQuantityList.push(value);
        })
        $.ajax({
          url: '/api/zcy/orders/' + orderId  + '/' + confirmId + '/createOrderPayItems',
          type: 'POST',
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(skuAndQuantityList),
          success:()=>{
            window.location.reload();
          },
          error:(data)=>{
            let resultJson;
            try{
              resultJson = JSON.parse(data.responseText);
              if(resultJson.type == undefined){
                let _resultJson = JSON.parse(resultJson);
                if(_resultJson.type != undefined){
                  resultJson = _resultJson;
                }
              }
              if(resultJson.type != undefined){
                let errorMsg = resultJson.errorMsg;
                new Modal({
                  title:'温馨提示',
                  icon:'warning',
                  content:errorMsg
                }).show(()=>{
                      window.location.reload();
                    });
              }
            }catch(e){
              new Modal({
                title:'温馨提示',
                icon:'warning',
                content:"提交商品失败！错误信息为："+data.responseText
              }).show(()=>{
                    window.location.reload();
                  });
            }
          }
        });
      } else {
        new Modal({
          title:"温馨提示",
          icon:"info",
          content:"没有可关联的商品"
        }).show();
      }
    })
  }

  //计算可操作的绑定数量
  renderItemsCount(){
    let usedTotal = 0;
    let usedCount = 0;
    $('.requisition-items-table .item-tr').each((i,tr)=>{
      let $count = $(tr).find('.js-unbind-item-count');
      let unbindCount = parseInt($count.data('unbindCount'));
      if(isNaN(unbindCount)){
        unbindCount = 0;
      }
      let bindedCount = parseInt($count.data('bindedCount'));
      if(isNaN(bindedCount)){
        bindedCount = 0;
      }
      $count.attr('data-count', unbindCount + bindedCount);
      $(tr).find('.input-amount').attr('data-max', unbindCount + bindedCount);
      let price = parseInt($(tr).find('.js-item-price').data('price'));
      usedTotal += price * bindedCount;
      usedCount += bindedCount;
    })
    $(".input-amount",$('.pur-modal')).amount();
    let availableAmount = parseInt($('.pur-modal .js-available-amount').data('total'));
    let availableCount = parseInt($('.pur-modal .js-available-count').data('count'));
    $('.pur-modal .js-available-amount').attr('data-total', availableAmount+usedTotal);
    if(availableCount >= 0){
      $('.pur-modal .js-available-count').attr('data-count', availableCount+usedCount);
    }
  }

  showPurchasePlanItemsModal(orderId, confirmId, planInfo, preModal){
    let self = this;
    $.ajax({
      url: '/api/zcy/orders/pagingConfirmUnBindItems',
      type: 'GET',
      data:{pageNo:1, pageSize: 9999, orderId, confirmId}
    }).done((result)=>{
      preModal.close();
      new Modal(OrderPlanItems({planInfo, items:result})).show();
      self.renderItemsCount();
      self.autoFillRequisitionItems();
      $('.js-plan-items-submit').on('click', ()=>self.submitPurchasePlanBind(orderId, confirmId));
    }).fail(()=>{
      $('.js-new-payment-items-submit').prop('disabled', false);
    })
  }

  //修改商品关联采购计划信息
  modifyPurchasePlanBind(orderId, planInfo, orderItem){
    new Modal(OrderPlanItems({planInfo, items:{data:[orderItem]}, isModify:1})).show();
    this.renderItemsCount();
    $('.js-plan-items-submit').on('click', ()=>this.submitPurchasePlanBind(orderId, planInfo.confirmationId));
  }

  //取消采购计划关联
  cancelPurchasePlanBind(skuId, orderId, planId){
      $.ajax({
        url: '/api/zcy/orders/' + orderId  + '/' + planId + '/createOrderPayItems',
        type: 'POST',
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify([{skuId,bindItemCount:0}]),
        success:()=>{
          window.location.reload();
        }
      });
  }

  submitPurchasePlanBind(orderId, confirmId){
    $('.js-plan-items-submit').prop('disabled', true);
    let selectedSkuAndQuantity = {};
    $('.requisition-items-table .js-select-item:checked').each((i, el)=>{
      let $tr = $(el).closest('tr'),
          skuId = $tr.data("skuId"),
          bindItemCount = parseInt($tr.find('input.count-number').val()),
          OrderSkuAndQuantity = {skuId,bindItemCount};
      selectedSkuAndQuantity[skuId] = OrderSkuAndQuantity
    })

    let skuAndQuantityList = [],
        size = _.size(selectedSkuAndQuantity),
        values = _.values(selectedSkuAndQuantity)
    if(size > 0){
      _.each(values, (value)=>{
        skuAndQuantityList.push(value);
      })
      $.ajax({
        url: '/api/zcy/orders/' + orderId  + '/' + confirmId + '/createOrderPayItems',
        type: 'POST',
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(skuAndQuantityList),
        success:()=>{
          window.location.reload();
        },
        error:(data)=>{
          let resultJson;
          try{
            resultJson = JSON.parse(data.responseText);
            if(resultJson.type == undefined){
              let _resultJson = JSON.parse(resultJson);
              if(_resultJson.type != undefined){
                resultJson = _resultJson;
              }
            }
            if(resultJson.type != undefined){
              let errorMsg = resultJson.errorMsg;
              new Modal({
                title:'温馨提示',
                icon:'warning',
                content:errorMsg
              }).show(()=>{
                window.location.reload();
              });
              $('.js-plan-items-submit').prop('disabled', false);
            }
          }catch(e){
            new Modal({
              title:'温馨提示',
              icon:'warning',
              content:"提交商品失败！错误信息为："+data.responseText
            }).show(()=>{
              window.location.reload();
            });
            $('.js-plan-items-submit').prop('disabled', false);
          }
        }
      });
    }else{
      new Modal({
        title:"提示",
        icon:"warning",
        content:"未选中任何商品！请选择商品后提交"
      }).show();
      $('.js-plan-items-submit').prop('disabled', false);
    }

  }

  //关联采购计划时自动勾选需求商品
  autoFillRequisitionItems(){
    let availableAmount = parseInt($('.pur-modal .js-available-amount').attr('data-total'));
    let availableCount = parseInt($('.pur-modal .js-available-count').attr('data-count'));
    //数量不限的情况
    if(availableCount < 0){
      $('.requisition-items-table .item-tr').each((i, tr)=>{
        let unbindCount = parseInt($(tr).find('.js-unbind-item-count').attr('data-count'));
        let price = parseInt($(tr).find('.js-item-price').data('price'));
        if(unbindCount * price <= availableAmount){
          availableAmount = availableAmount - unbindCount * price;
          $(tr).find('input.count-number').val(unbindCount);
          $(tr).find('.js-select-item').prop('checked', true);
        }
        else{
          let count = Math.floor(availableAmount / price);
          $(tr).find('input.count-number').val(count);
          availableAmount = availableAmount - count * price;
          if(count > 0){
            $(tr).find('.js-select-item').prop('checked', true);
          }
        }
      })
    }
    //数量限制的情况
    else{
      $('.requisition-items-table .item-tr').each((i, tr)=>{
        let unbindCount = parseInt($(tr).find('.js-unbind-item-count').attr('data-count'));
        let price = parseInt($(tr).find('.js-item-price').data('price'));
        if(unbindCount <= availableCount){
          if(unbindCount * price <= availableAmount){
            availableAmount = availableAmount - unbindCount * price;
            $(tr).find('input.count-number').val(unbindCount);
            availableCount = availableCount - unbindCount;
            $(tr).find('.js-select-item').prop('checked', true);
          }
          else{
            let count = Math.floor(availableAmount / price);
            $(tr).find('input.count-number').val(count);
            availableAmount = availableAmount - count * price;
            availableCount = availableCount - count;
            if(count > 0){
              $(tr).find('.js-select-item').prop('checked', true);
            }
          }
        }
        else{
          if(availableCount * price <= availableAmount){
            availableAmount = availableAmount - availableCount * price;
            $(tr).find('input.count-number').val(availableCount);
            availableCount = 0;
            $(tr).find('.js-select-item').prop('checked', true);
          }
          else{
            let count = Math.floor(availableAmount / price);
            $(tr).find('input.count-number').val(count);
            availableAmount = availableAmount - count * price;
            availableCount = availableCount - count;
            if(count > 0){
              $(tr).find('.js-select-item').prop('checked', true);
            }
          }
        }
      })
    }
    //全选事件
    $('#select-batch').on('change', (evt)=>{
      $('.js-select-item').each((i,el)=>{
        let checked = $(evt.target).prop('checked');
        $(el).prop('checked', checked);
      })
    })
    $('.js-select-item').on('change', (evt)=>{
      let checkAll = true;
      $('.js-select-item').each((i,el)=>{
        let checked = $(el).prop('checked');
        if(!checked) {
          checkAll = false;
        }
        return false;
      })
      $('#select-batch').prop('checked', checkAll);
    })
    $($('.js-select-item')[0]).trigger('change');
  }
}


module.exports = OrderPlanManage;