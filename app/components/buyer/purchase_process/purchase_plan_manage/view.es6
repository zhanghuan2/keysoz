import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
const PurchasePlanItems = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/showPurchasePlanItems"];
const PlanPopover = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/planPopoverInfo"];
const PurchasePlanList = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/purchasePlanList"];

class PurchasePlanManage{
  constructor(){
    this.preRender();
    this.bindEvents();
  }

  preRender(){
    this.renderRequisitionItems();
  }

  bindEvents(){
    let self = this;
    //关联采购计划按钮
    $('.js-bind-purchase-plan').on('click', (evt)=>self.showPurchasePlanModal(evt));
    //修改商品按钮
    $('.js-modify-purchase-plan-item').on('click', (evt)=>{
      let planData = $(evt.target).closest('div').data('plan');
      let itemData = $(evt.target).closest('tr').data('item');
      let usedQuantity = itemData.currentCount;
      _.each(itemData.purchasePayMethods, (v)=>{
        if(v.confirmationId  == planData.confirmationId){
          usedQuantity = v.usedQuantity;
          return false;
        }
      })
      itemData.currentCount = usedQuantity;
      let purchaseId = $('.js-purchase-id').val();
      self.modifyPurchasePlanBind(purchaseId, planData, itemData);
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
        let purchaseId = $('.js-purchase-id').val();
        let planData = $(evt.target).closest('div').data('plan');
        let itemData = $(evt.target).closest('tr').data('item');
        self.cancelPurchasePlanBind(itemData.skuId, purchaseId, planData.confirmationId);
      })
    })
  }

  showPurchasePlanModal(evt,pageNo,pageSize,templates){
    let self = this;
    pageNo = pageNo || 1;
    pageSize = pageSize || 10;
    let keyword = $.trim($("#planSearchText").val()),
      purchaseId = $('.js-purchase-id').val();
    $.ajax({
      url: '/api/purchases/purchaser/payment/plans',
      type: 'GET',
      data: {purchaseId, keyword, pageNo, pageSize},
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
      let purchaseId = $('.js-purchase-id').val();
      let $input = $('.js-select-item:checked');
      let planId = $input.attr('id');
      let planInfo = $input.closest('tr').data('payment');
      if(purchaseId && planId){
        //self.showPurchasePlanItemsModal(purchaseId, planId, planInfo, modal);
        self.submitPurchasePlanMaxBind(purchaseId, planId, planInfo, modal);
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
  submitPurchasePlanMaxBind(purchaseId, planId, planInfo, preModal){
    let self = this;
    // 获取待绑定的需求商品
    $.ajax({
      url: '/api/purchases/'+purchaseId+'/unbind/pay/'+planId+'/items',
      type: 'GET',
      data:{pageNo: 1, pageSize: 9999}
    }).done((result)=>{
      preModal.close();
      // 最大程度关联采购计划
      let planAvailableAccount = planInfo.availableAccount,
          planAvailableQuantity = planInfo.availableQuantity,
          bindedList = [];
      if (planAvailableQuantity == -1) {
        planAvailableQuantity = Number.MAX_VALUE;
      }
      _.each(result.data, (item) => {
        if(item.unbindPayCount <= planAvailableQuantity && item.skuPrice * item.unbindPayCount <= planAvailableAccount) {
            planAvailableQuantity -= item.unbindPayCount
            planAvailableAccount -= item.skuPrice * item.unbindPayCount
            bindedList.push(item)
        } else {
          let count = item.unbindPayCount
          do {
            count--
          } while((count > planAvailableQuantity || item.skuPrice * count > planAvailableAccount) && count > 0)
          if (count > 0) {
            planAvailableQuantity -= count
            planAvailableAccount -= item.skuPrice * count
            item.unbindPayCount = count
            bindedList.push(item)
          }
        }
      })
      //提交采购计划绑定
      let selectedSkuAndQuantity = {};
      for(let val of bindedList){
        let skuId = val.skuId,
            itemId = val.itemId,
            quantity = val.unbindPayCount,
            PurchaseSkuAndQuantity = {skuId,itemId,quantity};
        selectedSkuAndQuantity[skuId] = PurchaseSkuAndQuantity;
      }
      let skuAndQuantityList = [],
          size = _.size(selectedSkuAndQuantity),
          values = _.values(selectedSkuAndQuantity);
      if(size > 0){
        _.each(values, (value)=>{
          skuAndQuantityList.push(value);
        })
        $.ajax({
          url: '/api/purchases/payment/'+ purchaseId + '/' + planId +'/items',
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

  //展示采购计划需求商品列表
  showPurchasePlanItemsModal(purchaseId, planId, planInfo, preModal){
    let self = this;
    $.ajax({
      url: '/api/purchases/'+purchaseId+'/unbind/pay/'+planId+'/items',
      type: 'GET',
      data:{pageNo: 1, pageSize: 9999}
    }).done((result)=>{
      preModal.close();
      new Modal(PurchasePlanItems({planInfo, items:result})).show();
      self.renderItemsCount();
      self.autoFillRequisitionItems();
      $('.js-plan-items-submit').on('click', ()=>self.submitPurchasePlanBind(purchaseId, planId));
    }).fail(()=>{
      $('.js-new-payment-items-submit').prop('disabled', false);
    })
  }

  //修改商品关联采购计划信息
  modifyPurchasePlanBind(purchaseId, planInfo, itemData){
    new Modal(PurchasePlanItems({planInfo, items:{data:[itemData]}, isModify:1})).show();
    this.renderItemsCount();
    $('.js-plan-items-submit').on('click', ()=>this.submitPurchasePlanBind(purchaseId, planInfo.confirmationId));
  }

  //取消采购计划关联
  cancelPurchasePlanBind(skuId, purchaseId, planId){
    $.ajax({
      url: '/api/purchases/payment/'+ purchaseId + '/' + planId +'/items',
      type: 'DELETE',
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify([skuId]),
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
            content:"提交失败！错误信息为："+data.responseText
          }).show(()=>{
            window.location.reload();
          });
        }
      }
    });
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

  // 提交采购计划绑定
  submitPurchasePlanBind(purchaseId, planId){
    $('.js-plan-items-submit').prop('disabled', true);
    let selectedSkuAndQuantity = {};
    $('.requisition-items-table .js-select-item:checked').each((i, el)=>{
      let $tr = $(el).closest('tr'),
          skuId = $tr.data("id"),
          itemId = $tr.data("itemId"),
          quantity = parseInt($tr.find('input.count-number').val()),
          PurchaseSkuAndQuantity = {skuId,itemId,quantity};
      selectedSkuAndQuantity[skuId] = PurchaseSkuAndQuantity
    })

    let skuAndQuantityList = [],
        size = _.size(selectedSkuAndQuantity),
        values = _.values(selectedSkuAndQuantity)
    if(size > 0){
      _.each(values, (value)=>{
        skuAndQuantityList.push(value);
      })
      $.ajax({
        url: '/api/purchases/payment/'+ purchaseId + '/' + planId +'/items',
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
  //渲染商品列表
  renderRequisitionItems(){
    //渲染采购计划关联状态列
    $('.js-bind-status').each((i, td)=>{
      let count = $(td).data('count'),
        remain = $(td).data('remain');
      count = isNaN(count)? 0 : parseInt(count);
      remain = isNaN(remain)? 0 : parseInt(remain);
      if(remain == count){
        $(td).html('<span class="red-text">未关联</span>');
      }
      else if(remain > 0){
        $(td).html('<span class="red-text">部分关联</span>');
      }
      else{
        $(td).html('<span class="green-text">完成关联</span>');
      }
    })
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

    $('.js-purchase-money').each((i, el)=>{
      let price = $(el).data('price');
      let count = $(el).data('count');
      let total = parseInt(count)*parseFloat(price)/100.0;
      $(el).html(total.toFixed(2));
    })
    $('.js-purchase-unbind-money').each((i, el)=>{
      let price = $(el).data('price');
      let count = $(el).data('count');
      let total = parseInt(count)* parseFloat(price)/100.0;
      $(el).html(total.toFixed(2));
    })

    let purchaseId = $('.js-purchase-id').val();
    $('.js-purchase-plan-item').each((i, el)=>{
      let planData = $(el).data('plan');
      $(el).mouseenter(()=>{
        if($(el).attr('data-pop')){}
        else{
          $.ajax({
            url: '/api/purchases/pay/'+ purchaseId + '/' +planData.confirmationId +'/detail',
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
}

module.exports = PurchasePlanManage;