import Modal from "pokeball/components/modal"
import Pagination from "pokeball/components/pagination"
const itemServices = require('common/item_services/view')
const PurchasePlanList = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/purchasePlanList"]
const OrderPlanItems = Handlebars.templates["buyer/order_form_detail/order_plan_manage/templates/showOrderPlanItems"]
const ItemsWithPlansList = Handlebars.templates["buyer/order_form_create/templates/itemsWithPlansList"]
const RequisitionItemsList = Handlebars.templates["buyer/order_form_create/templates/requisitionItemsList"]
const PlanPopover = Handlebars.templates["buyer/purchase_process/purchase_plan_manage/templates/planPopoverInfo"]

class OrderFromCreate {

  constructor() {
    this.preRender()
    this.bindEvents()
  }

  preRender() {
    this.$orderCreatePage = $('.order-form-create')
    this.$itemsPlans = $('.items-plans-list')
    this.$itemsList = $('.requisition-items-list')
    this.$additionInfo = $('.order-addition-info')
    this.isLoadingPlans = false
    //订单商品列表渲染
    let orderItems = sessionStorage.getItem('orderItems')

      try {
      orderItems = JSON.parse(orderItems)
    }
    catch (e){
      console.log(e)
      return
    }
    this.orderItems = orderItems
    if(this.orderItems.orderType == 3){
      this.$itemsPlans.closest('.trade-block').hide()
    }
    else{
      this.$itemsPlans.append(ItemsWithPlansList(orderItems))
    }

    this.$itemsList.append(RequisitionItemsList(orderItems))
    this.renderItemsWithPlans()
    this.renderRequisitionItemsList()
    this.renderOrderAdditionInfo()
  }
  bindEvents() {
    this.$orderCreatePage.delegate('.js-bind-purchase-plan', 'click', ()=>this.showPurchasePlanModal())
    this.$orderCreatePage.delegate('.js-submit-order', 'click', (evt)=>this.submitOrderDataPreCheck(evt))
    this.$itemsList.delegate('.delete-item', 'click', (evt)=>this.deleteItem(evt))
    this.$itemsPlans.delegate('.js-modify-purchase-plan-item', 'click', (evt)=>this.modifyPlanBindItem(evt))
    this.$itemsPlans.delegate('.js-cancel-purchase-plan-item', 'click', (evt)=>this.cancelPlanBindItem(evt))
    this.$itemsPlans.delegate('.js-open-purchaseplan', 'click', (evt)=>this.openPurchasePlan(evt))
    $(window).on("scroll", () => this.bodyScroll())
    this.$orderCreatePage.delegate('.js-back-to-cart', 'click', ()=>this.backToCart())
    this.$orderCreatePage.on('ZCYEvent.AddressPickerChanged ZCYEvent.AddressPickerSetup', '.delivery-address-picker', () => this.chaneDeliveryAddress())
  }

  //渲染商品列表
  renderItemsWithPlans(){
    //没有商品信息
    if(this.$itemsPlans.find('tbody tr').length === 0){
      this.$itemsPlans.find('tbody').html('<tr><td colspan="8" class="text-center">没有商品信息</td></tr>')
      return
    }
    //渲染采购计划关联状态列
    $('.js-bind-status').each((i, td)=>{
      let count = $(td).data('count'),
          remain = $(td).data('remain')
      count = isNaN(count) ? 0 : parseInt(count)
      remain = isNaN(remain) ? 0 : parseInt(remain)
      if(remain == count){
        $(td).html('<span class="red-text">未关联</span>')
      }
      else if(remain > 0){
        $(td).html('<span class="red-text">部分关联</span>')
      }
      else{
        $(td).html('<span class="green-text">完成关联</span>')
      }
    })

    //渲染采购目录列
    $('.js-item-catalog').each((i, td)=>{
      try{
        let catalogs = $(td).data('catalog'),
            catalogText = catalogs.join(' ')
        $(td).html('<span class="item-catalog" title="'+catalogText+'">'+catalogText+'</span>')
      }
      catch(e){
        console.log(e)
      }
    })

    $('.js-purchase-money').each((i, el)=>{
      let price = $(el).data('price')
      let count = $(el).data('count')
      let total = parseInt(count)*parseFloat(price)/100.0
      if(total){
        $(el).html(total.toFixed(2))
      }
      else{
        $(el).html('－')
      }
    })
    $('.js-purchase-unbind-money').each((i, el)=>{
      let price = $(el).data('price')
      let count = $(el).data('count')
      let total = parseInt(count)* parseFloat(price)/100.0
      if(total){
        $(el).html(total.toFixed(2))
      }
      else{
        $(el).html('－')
      }
    })
    //采购计划hover展示信息
    let confirmationMap = this.getPlanBindData()
    $('.js-purchase-plan-item .purchase-plan-no').each((i, el)=>{
      let plan = $(el).closest('.purchase-plan-box').data('plan')
      let item = $(el).closest('tr').data('item')
      let usedPlan = confirmationMap[plan.confirmationId]
      if(usedPlan) {
        let usedQuantity = 0, usedAccount = 0
        _.each(usedPlan.paySkuMap, (paySku) => {
          usedQuantity += parseInt(paySku.quantity)
          usedAccount += parseInt(paySku.account)
        })
        plan.planInfo.usedQuantity = usedQuantity
        plan.planInfo.usedAccount = usedAccount
        //展示原始数据
        if(plan.planInfo.originAvailableAccount){
          plan.planInfo.availableAccount = plan.planInfo.originAvailableAccount
        }
        if(plan.planInfo.originAvailableQuantity){
          plan.planInfo.availableQuantity = plan.planInfo.originAvailableQuantity
        }
        let htmlContent = PlanPopover(plan.planInfo)
        $(el).popover({
          trigger: 'hover',
          placement: 'left',
          html: true,
          content: htmlContent,
          delay: {
            hide: 100
          }
        })
      }
    })
  }

  renderRequisitionItemsList() {
    //没有商品信息
    if(this.$itemsList.find('.requisition-items-table').length === 0){
      this.$itemsList.append('<div class="text-center"><label>没有商品信息</label></div>')
      return
    }
    this.$itemsList.find('.total-money').each((i,el)=>{
      let price = $(el).data('price'),
          count = $(el).data('count'),
          total = parseInt(count)* parseFloat(price)/100.0
      if(total){
        $(el).html(total.toFixed(2))
      }
      else{
        $(el).html('－')
      }
    })
    this.itemServices = new itemServices('.js-item-service')
  }

  renderOrderAdditionInfo() {
    let unbindMoney = 0,totalMoney = parseFloat(this.orderItems.totalMoney)
    _.each(this.orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        unbindMoney += (item.unbindCount * item.sku.price / 100)
      })
    })
    if(isNaN(totalMoney) || isNaN(unbindMoney)){
      this.$additionInfo.find('.js-total-money').text('－')
      this.$additionInfo.find('.js-bind-money').text('－')
      this.$additionInfo.find('.js-unbind-money').text('－')
    }
    else{
      this.$additionInfo.find('.js-total-money').text(totalMoney.toFixed(2))
      this.$additionInfo.find('.js-bind-money').text((totalMoney - unbindMoney).toFixed(2))
      this.$additionInfo.find('.js-unbind-money').text(unbindMoney.toFixed(2))
    }
  }

  /*
   * 改变收货地址
   */
  chaneDeliveryAddress () {
    let address = this.$orderCreatePage.find('.address-block.active').data('address')
    if (address) {
      this.itemServices.loadServiceInfo(address.regionCode)
    }
  }

  showPurchasePlanModal(pageNo, templates){
    if (this.isLoadingPlans) {
      return
    } else {
      this.isLoadingPlans = true
    }
    let self = this,
        keyword = $.trim($("#planSearchText").val())
    pageNo = pageNo || 1

    let allCategoryIds = [],
        hasUnbindAllCategoryIds = [],
        minPriceMap = {}
    this.$itemsPlans.find('table tbody tr').each((i, tr)=>{
      let item = $(tr).data('item')
      if(item && item.categoryId){
        let categoryId = parseInt(item.categoryId)
        allCategoryIds.push(categoryId)
        if(item.unbindCount > 0){
          hasUnbindAllCategoryIds.push(categoryId)
        }
        let minPrice = minPriceMap[categoryId],
            skuPrice = parseInt(item.sku.price)
        if(!minPrice || minPrice > skuPrice ){
          minPrice = skuPrice
        }
        minPriceMap[categoryId] = minPrice
      }
    })
    if(allCategoryIds.length === 0){
      this.isLoadingPlans = false
      new Modal({
        title:"温馨提示",
        icon:"info",
        htmlContent:"您没有选购任何商品，请先去选购商品"
      }).show()
      return
    }

    $.ajax({
      url: '/api/zcy/orders/pagingPaymentPlans',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify({keyword, pageNo, pageSize: 10, allCategoryIds, hasUnbindAllCategoryIds, minPrice:minPriceMap}),
      timeout: 5000
    }).done((result)=>{
      this.isLoadingPlans = false
      if(result.total === 0){
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"您采购的商品没有合适的采购计划可使用"
        }).show()
      } else {
        self.processPlanList(result)
        if(templates === undefined){
          templates = PurchasePlanList
          let purchasePlanModal = new Modal(templates({_DATA_:result}))
          purchasePlanModal.show()
          self.bindPurchasePlanModalEvent(templates, purchasePlanModal)
        } else {
          let htmlContent = $.parseHTML(templates({ _DATA_: result }))[0]
          $('.pur-modal.js-purchase-plan-modal').find('.modal-body').replaceWith($(htmlContent).find('.modal-body'))
        }
        new Pagination(".selected-pagination").total(result.total).show(10, {
          current_page: pageNo - 1,
          callback: (pageNo) => {
            self.showPurchasePlanModal(pageNo + 1, templates)
          }
        })
      }
    }).fail(()=>{
      this.isLoadingPlans = false
    })
  }

  /**
   * 获取页面上商品与采购计划的绑定关系
   * @return confirmationMap
   */
  getPlanBindData(){
    let confirmationMap = {}
    _.each(this.orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        _.each(item.plans, (plan)=>{
          let outerConfirmation = confirmationMap[plan.confirmationId]
          if(!outerConfirmation){
            outerConfirmation = {
              outerConfirmId: plan.confirmationId,
              paySkuMap: {}
            }
            confirmationMap[plan.confirmationId] = outerConfirmation
          }
          outerConfirmation.paySkuMap[item.sku.id] = {
            quantity:plan.bindCount,
            account: plan.bindCount * item.sku.price
          }
        })
      })
    })
    return confirmationMap
  }

  /**
   * 将服务器返回的采购计划列表，与页面上已经与商品关联的采购计划进行数据合并，计算可用金额和可用数量
   * @param planList 服务器返回的采购计划列表数据
   */
  processPlanList(planList){
    let confirmationMap = this.getPlanBindData()
    //合并数据
    _.each(planList.data, (plan)=>{
      let usedPlan = confirmationMap[plan.confirmationId]
      if(usedPlan){
        let usedQuantity = 0, usedAccount = 0
        _.each(usedPlan.paySkuMap, (paySku)=>{
          usedQuantity += parseInt(paySku.quantity)
          usedAccount += parseInt(paySku.account)
        })
        //保留原始数据
        if(!plan.originAvailableAccount){
          plan.originAvailableAccount = plan.availableAccount
        }
        if(!plan.originAvailableQuantity){
          plan.originAvailableQuantity = plan.availableQuantity
        }
        plan.availableAccount -= usedAccount
        if(plan.availableQuantity > 0){
          plan.availableQuantity -= usedQuantity
        }
      }
    })
  }

  bindPurchasePlanModalEvent(templates, modal){
    let self = this
    //查询按钮
    $(modal.modal).delegate('.js-query-plan-list', 'click', (evt)=>this.showPurchasePlanModal(1,templates))

    //回车事件
    $('#planSearchText').keydown((evt)=>{
      if(evt.which === 13){
        this.showPurchasePlanModal(1, templates)
      }
    })

    //绑定确定按钮事件
    $(modal.modal).delegate('.js-new-payment-items-submit', 'click', (evt)=>{
      $(evt.target).prop('disabled', true)
      let $input = $('.js-select-item:checked')
      let planId = $input.attr('id')
      let planInfo = $input.closest('tr').data('payment')
      if (planId) {
        let self = this, skuIds
        this.$itemsPlans.find('table tbody tr').each((i, tr)=>{
          let item = $(tr).data('item')
          if(item.unbindCount > 0){
            if(skuIds){
              skuIds =  skuIds + ',' + item.sku.id
            }
            else {
              skuIds = item.sku.id
            }
          }
        })
        // 获取待绑定的需求商品
        $.ajax({
          url: '/api/zcy/orders/unbind/pay/'+planId+'/items',
          type: 'get',
          data: {pageNo:1, pageSize: 9999, planId, skuIds}
        }).done((result)=>{
          modal.close()
          if(result.total > 0){
            result.data = self.planBindState(result.data, planId)
          }
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
          // 暂存采购计划与商品绑定情况
          for(let val of bindedList){
              let skuId = val.skuId,
                  bindCount = val.unbindQuantity;
              if(bindCount > 0){
                  self.bindItemWithPlan(skuId, bindCount, planInfo)
              }
              else{
                  self.unbindItemWithPlan(skuId, planInfo)
              }
          }
          this.$itemsPlans.empty().append(ItemsWithPlansList(this.orderItems))
          this.renderItemsWithPlans()
          this.renderOrderAdditionInfo()
        }).fail(()=>{
          $('.js-new-payment-items-submit').prop('disabled', false)
        })
      } else {
        new Modal({
          title:"提示",
          icon:"warning",
          content:"未选中任何采购计划！请选择采购计划后提交"
        }).show()
        $('.js-new-payment-items-submit').prop('disabled', false)
      }
    })
  }

  /**
   * 采购计划修改关联
   */
  modifyPlanBindItem(evt){
    let self = this
    let planData = $(evt.target).closest('.js-purchase-plan-item').data('plan'),
        item = $(evt.target).closest('tr').data('item')
    if(!planData || !planData.planInfo) return
    //减去已经绑定的金额和数量
    let planInfo = $.extend({},planData.planInfo)
    let confirmationMap = self.getPlanBindData()
    let usedPlan = confirmationMap[planInfo.confirmationId]
    if(usedPlan){
      let usedQuantity = 0, usedAccount = 0
      _.each(usedPlan.paySkuMap, (paySku, skuId)=>{
        if(skuId != item.sku.id){
          usedQuantity += parseInt(paySku.quantity)
          usedAccount += parseInt(paySku.account)
        }
      })
      planInfo.availableAccount -= usedAccount
      if(planInfo.availableQuantity > 0){
        planInfo.availableQuantity -= usedQuantity
      }
    }
    let newItem = {
      skuId: item.sku.id,
      itemId: item.cartItem.itemId,
      itemName: item.itemName,
      skuPrice: item.sku.price,
      unbindQuantity: item.unbindCount,
      bindTotalQuantity: planData.bindCount
    }
    let planItemsModal = new Modal(OrderPlanItems({isModify:1, planInfo, items:{data:[newItem]}}))
    planItemsModal.show()
    self.renderItemsCount(planItemsModal.modal)
    //提交事件
    $(planItemsModal.modal).delegate('.js-plan-items-submit', 'click', ()=>{
      if (this.valiateBind(planItemsModal.modal, planInfo)) {
        $(planItemsModal.modal).find('.js-error-info').empty()
        planItemsModal.close()
        self.savePlanItemsBind(planItemsModal.modal, planInfo)
      } else {
        $(planItemsModal.modal).find('.js-error-info').html('<i class="icon-zcy icon-prompt"></i>商品关联数量或金额超过采购计划限制！')
      }
    })
  }

  /**
   * 校验关联是否合法
   */
  valiateBind(modal, originPlanInfo) {
    let availableAmount = originPlanInfo.availableAccount,
      availableAccount = originPlanInfo.availableQuantity,
      price = $(modal).find('.js-item-price').data('price'),
      count = $(modal).find('.count-number').val()
    if (availableAccount > 0 && availableAccount < count){
      return false
    }
    if (parseInt(availableAmount) < parseInt(price) * parseInt(count)) {
      return false
    }
    return true
  }

  //计算可操作的绑定数量
  renderItemsCount(modal){
    $(modal).find('.requisition-items-table .item-tr').each((i,tr)=>{
      let $count = $(tr).find('.js-unbind-item-count')
      let unbindCount = parseInt($count.data('unbindCount'))
      if(isNaN(unbindCount)){
        unbindCount = 0
      }
      let bindedCount = parseInt($count.data('bindedCount'))
      if(isNaN(bindedCount)){
        bindedCount = 0
      }
      $count.attr('data-count', unbindCount + bindedCount)
      $(tr).find('.input-amount').attr('data-max', unbindCount + bindedCount)
    })
    $(modal).find('.input-amount').amount()
  }

  //关联采购计划时自动勾选需求商品
  autoFillRequisitionItems(modal){
    let availableAmount = parseInt($(modal).find('.js-available-amount').attr('data-total'))
    let availableCount = parseInt($(modal).find('.js-available-count').attr('data-count'))
    //数量不限的情况
    if(availableCount < 0){
      $(modal).find('.requisition-items-table .item-tr').each((i, tr)=>{
        let unbindCount = parseInt($(tr).find('.js-unbind-item-count').attr('data-count'))
        let price = parseInt($(tr).find('.js-item-price').data('price'))
        if(unbindCount * price <= availableAmount){
          availableAmount = availableAmount - unbindCount * price
          $(tr).find('input.count-number').val(unbindCount)
          $(tr).find('.js-select-item').prop('checked', true)
        }
        else{
          let count = Math.floor(availableAmount / price)
          $(tr).find('input.count-number').val(count)
          availableAmount = availableAmount - count * price
          if(count > 0){
            $(tr).find('.js-select-item').prop('checked', true)
          }
        }
      })
    }
    //数量限制的情况
    else{
      $(modal).find('.requisition-items-table .item-tr').each((i, tr)=>{
        let unbindCount = parseInt($(tr).find('.js-unbind-item-count').attr('data-count'))
        let price = parseInt($(tr).find('.js-item-price').data('price'))
        if(unbindCount <= availableCount){
          if(unbindCount * price <= availableAmount){
            availableAmount = availableAmount - unbindCount * price
            $(tr).find('input.count-number').val(unbindCount)
            availableCount = availableCount - unbindCount
            $(tr).find('.js-select-item').prop('checked', true)
          }
          else{
            let count = Math.floor(availableAmount / price)
            $(tr).find('input.count-number').val(count)
            availableAmount = availableAmount - count * price
            availableCount = availableCount - count
            if(count > 0){
              $(tr).find('.js-select-item').prop('checked', true)
            }
          }
        }
        else{
          if(availableCount * price <= availableAmount){
            availableAmount = availableAmount - availableCount * price
            $(tr).find('input.count-number').val(availableCount)
            availableCount = 0
            $(tr).find('.js-select-item').prop('checked', true)
          }
          else{
            let count = Math.floor(availableAmount / price)
            $(tr).find('input.count-number').val(count)
            availableAmount = availableAmount - count * price
            availableCount = availableCount - count
            if(count > 0){
              $(tr).find('.js-select-item').prop('checked', true)
            }
          }
        }
      })
    }
  }

  cancelPlanBindItem(evt){
    let self = this
    new Modal({
      icon: 'warning',
      isConfirm: true,
      title: '确取消关联该采购计划？'
    }).show(()=>{
      let planData = $(evt.target).closest('.js-purchase-plan-item').data('plan'),
        item = $(evt.target).closest('tr').data('item'),
        planInfo = planData.planInfo
      self.unbindItemWithPlan(item.sku.id, planInfo)
      self.$itemsPlans.empty().append(ItemsWithPlansList(this.orderItems))
      self.renderItemsWithPlans()
      self.renderOrderAdditionInfo()
    })

  }

  //打开采购计划页面
  openPurchasePlan(evt){
    let domain = this.$itemsPlans.data('domain'),
      confirmationId = $(evt.currentTarget).data('id')
    window.open(`${domain}/purchaseplan/list/detail?id=${confirmationId}`)
  }

  showPurchasePlanItemsModal(confirmationId, planInfo, preModal){
    let self = this, skuIds
    this.$itemsPlans.find('table tbody tr').each((i, tr)=>{
      let item = $(tr).data('item')
      if(item.unbindCount > 0){
        if(skuIds){
          skuIds =  skuIds + ',' + item.sku.id
        }
        else {
          skuIds = item.sku.id
        }
      }
    })
    $.ajax({
      url: '/api/zcy/orders/unbind/pay/'+confirmationId+'/items',
      type: 'get',
      data: {pageNo:1, pageSize: 9999, confirmationId, skuIds}
    }).done((result)=>{
      preModal.close()
      if(result.total > 0){
        result.data = self.planBindState(result.data, confirmationId)
      }
      //console.log(result);

      let planItemsModal = new Modal(OrderPlanItems({planInfo, items:result}))
      planItemsModal.show()
      self.renderItemsCount(planItemsModal.modal)
      self.autoFillRequisitionItems(planItemsModal.modal)
      self.bindModalEvent(planItemsModal, planInfo)
    }).fail(()=>{
      $('.js-new-payment-items-submit').prop('disabled', false)
    })

  }

  bindModalEvent(planItemsModal, planInfo) {
    let self = this
    let modal = planItemsModal.modal
    //提交事件
    $(modal).delegate('.js-plan-items-submit', 'click', ()=>{
      self.savePlanItemsBind(modal, planInfo)
      planItemsModal.close()
    })
    //全选事件
    $(modal).delegate('#select-batch', 'change', (evt)=>{
      $(modal).find('.js-select-item').each((i,el)=>{
        let checked = $(evt.target).prop('checked')
        $(el).prop('checked', checked)
      })
    })
    $(modal).delegate('.js-select-item', 'change', ()=>{
      let checkAll = true
      $(modal).find('.js-select-item').each((i,el)=>{
        let checked = $(el).prop('checked')
        if(!checked) {
          checkAll = false
          return false
        }
      })
      $(modal).find('#select-batch').prop('checked', checkAll)
    })
    //触发一次全选检查
    $($(modal).find('.js-select-item')[0]).trigger('change')
  }

  //商品与采购计划绑定
  bindItemWithPlan(skuId, bindCount, planInfo){
    let self = this
    _.each(self.orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        if(item.sku.id === skuId){
          let thePlan,plans = item.plans
          _.each(plans, (plan)=>{
            if(plan.confirmationId === planInfo.confirmationId){
              thePlan = plan
              return false
            }
          })
          if(thePlan){
            item.unbindCount = item.unbindCount + thePlan.bindCount - bindCount
            thePlan.bindCount = bindCount
          }
          else{
            thePlan = {
              confirmationId: planInfo.confirmationId,
              confirmationName: planInfo.confirmationName,
              bindCount: bindCount,
              planInfo: planInfo
            }
            plans.push(thePlan)
            item.unbindCount = item.unbindCount - bindCount
          }
          return false
        }
      })
    })
  }
  //商品与采购计划解除绑定
  unbindItemWithPlan(skuId, planInfo){
    let self = this
    _.each(self.orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        if(item.sku.id === skuId){
          let index = -1,plans = item.plans,thePlan
          _.each(plans, (plan, i)=>{
            if(plan.confirmationId === planInfo.confirmationId){
              index = i
              thePlan = plan
              return false
            }
          })
          if(thePlan && index >= 0){
            item.unbindCount = item.unbindCount + thePlan.bindCount
            plans.splice(index, 1)
          }
          return false
        }
      })
    })
  }
  /**
   * 暂存采购计划与商品绑定状况
   */
  savePlanItemsBind(modal, planInfo) {
    let self = this
    $(modal).find('.js-select-item:checked').each((i, el)=>{
      let tr = $(el).closest('tr'),
          skuId = $(tr).data("skuId"),
          bindCount = parseInt($(tr).find('input.count-number').val())
      if(bindCount > 0){
        self.bindItemWithPlan(skuId, bindCount, planInfo)
      }
      else{
        self.unbindItemWithPlan(skuId, planInfo)
      }
    })
    this.$itemsPlans.empty().append(ItemsWithPlansList(this.orderItems))
    this.renderItemsWithPlans()
    this.renderOrderAdditionInfo()
  }

  /**
   * 获取选中采购计划已关联商品的情况
   */
  planBindState(skuIds, confirmationId) {
    let self = this, newItems = []
    _.each(skuIds, (skuId)=>{
      let $tr = self.$itemsPlans.find('tr[data-sku-id="'+skuId+'"]'),
          itemData = $tr.data('item')
      if(!itemData) return true
      let plans = itemData.plans,
          item = {
            skuId: skuId,
            itemId: itemData.cartItem.itemId,
            itemName: itemData.itemName,
            // skuAttr: itemData.sku.attrs,
            skuPrice: itemData.sku.price,
            unbindQuantity: itemData.unbindCount,
            bindTotalQuantity: 0
          }
      if(plans && plans.length > 0){
        _.each(plans, (plan)=>{
          if(plan.confirmationId === confirmationId){
            item.bindTotalQuantity = plan.bindCount
            return false
          }
        })
      }
      newItems.push(item)
    })
    return newItems
  }

  /**
   * 删除订单商品
   * 删除商品同时要更新采购计划关联列表、发票hover详情
   * @param evt
   */
  deleteItem(evt) {
    let self = this
    new Modal({
      icon: 'warning',
      isConfirm: true,
      title: '确认删除该商品？'
    }).show(()=>{
      let $tr = $(evt.target).closest('tr')
      let $totalMoney = $tr.find('.total-money'),
          price = $totalMoney.data('price'),
          count = $totalMoney.data('count'),
          itemId = $(evt.target).data('itemId')
      _.each(self.orderItems.data, (shopItem)=>{
        let deleteIndex = -1
        _.each(shopItem.items, (item, i)=>{
          if(item.cartItem.itemId === itemId){
            deleteIndex = i
            return false
          }
        })
        if(deleteIndex >= 0) {
          shopItem.items.splice(deleteIndex, 1)
        }
      })

      let totalMoney = parseFloat(self.orderItems.totalMoney)
      totalMoney -= parseFloat(price)/100.0 * parseInt(count)
      self.orderItems.totalMoney = totalMoney > 0 ? totalMoney : 0

      //更新订单商品
      sessionStorage.setItem('orderItems', JSON.stringify(self.orderItems))
      self.$itemsPlans.empty().append(ItemsWithPlansList(self.orderItems))
      self.$itemsList.empty().append(RequisitionItemsList(self.orderItems))
      self.renderItemsWithPlans()
      self.renderRequisitionItemsList()
      self.renderOrderAdditionInfo()
      $('body').trigger('zcy.itemsChanged')
    })
  }

  /**
   * 提交订单数据
   */

  submitOrderDataPreCheck(evt){
    //是否需要合同
    let needContract = $('.js-contract-checkbox').prop('checked')
    if(needContract){
      new Modal({
        icon: "info",
        title:"温馨提示",
        content: "选择需要网超合同后不允许修改采购计划书，是否确定下单？",
        isConfirm: true
      }).show(() => {
            this.submitOrderData(evt, needContract);
          });
    }
    else{
      this.submitOrderData(evt, needContract);
    }
  }

  submitOrderData(evt, needContract) {
    let orderData = {
      orderType: this.orderItems.orderType,
      pays: [],
      skuMap: {},
      commentForSupplier: {},
      fromCart: ($.query.get('fromCart') == 1)
    }
    //收货地址
    let address = this.$orderCreatePage.find('.address-block.active').data('address')
    if(!address){
      new Modal({
        title:"温馨提示",
        icon:"info",
        htmlContent:"您还没有选择收货地址，请先添加收货地址"
      }).show()
      return
    }
    orderData.outerAddrId = address.id
    //发票
    let invoice,invoiceMode = $('.invoice-mode-select input[name="invoice-mode"]:checked').val()
    if(invoiceMode === '1'){
      //集中开票
      orderData.outerInvoiceId = null
    }
    else{
      //货票同行
      invoice = this.$orderCreatePage.find('.invoice-block.active').data('invoice')
      if(!invoice){
        new Modal({
          title:"温馨提示",
          icon:"info",
          htmlContent:"您还没有选择发票，请先选择发票"
        }).show()
        return
      }
      orderData.outerInvoiceId = invoice.id
    }
    //采购计划
    let confirmationMap = {},isEmpty = true
    _.each(this.orderItems.data, (shopItem)=>{
      _.each(shopItem.items, (item)=>{
        _.each(item.plans, (plan)=>{
          let outerConfirmation = confirmationMap[plan.confirmationId]
          if(!outerConfirmation){
            outerConfirmation = {
              outerConfirmId: plan.confirmationId,
              paySkuMap: {}
            }
            confirmationMap[plan.confirmationId] = outerConfirmation
            orderData.pays.push(outerConfirmation)
          }
          outerConfirmation.paySkuMap[item.sku.id] = plan.bindCount
        })
        orderData.skuMap[item.sku.id] = item.itemCount
        isEmpty = false
      })
    })
    if(isEmpty){
      new Modal({
        title:"温馨提示",
        icon:"info",
        htmlContent:"您没有选购任何商品，请先去选购商品"
      }).show()
      return
    }

    //备注信息
    this.$itemsList.find('input.remark-input').each((i, input)=>{
      let sellerId = $(input).data('sellerId')
      orderData.commentForSupplier[sellerId] = $(input).val()
    })

    //是否需要合同
    orderData.needContract = needContract;

    // console.log(JSON.stringify(orderData))
    $(evt.target).prop('disabled', true)
    let self = this
    $.ajax({
      url: '/api/zcy/orders/directCreate',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(orderData)
    }).done(()=>{
      sessionStorage.setItem('deliveryAddress', JSON.stringify(address))
      if(invoice){
        sessionStorage.setItem('invoiceInfo', JSON.stringify(invoice))
      }
      sessionStorage.setItem('orderCost', JSON.stringify({
        total: self.$additionInfo.find('.js-total-money').text(),
        bind: self.$additionInfo.find('.js-bind-money').text(),
        unbind: self.$additionInfo.find('.js-unbind-money').text()
      }))
      window.location.href = '/buyer/create-order-success?orderType=' + self.orderItems.orderType
    }).fail(()=>{
      $(evt.target).prop('disabled', false)
    })
  }

  bodyScroll() {
    let rect = document.getElementById('info-placeholder').getBoundingClientRect()
    if(rect.bottom + 70 <= (window.innerHeight || document. documentElement.clientHeight)){
      this.$additionInfo.css({'position': 'static', 'border-width': '0'})
    }
    else{
      this.$additionInfo.css({'position': 'fixed', 'border-width': '1px'})
    }
  }

  backToCart(){
    if(this.orderItems.orderType == 3){
      window.location.href = '/carts/supperProCart'
    }
    else {
      window.location.href = '/cart'
    }
  }
}

module.exports = OrderFromCreate