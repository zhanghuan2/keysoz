const Pagination = require("pokeball/components/pagination"),
      Modal = require("pokeball/components/modal"),
      AreaSelect = require("seller/area_select/view"),
      addressUnits = require("extras/address_units"),
      serviceEmptyTemplate = Handlebars.templates['seller/service_protocol/service_item_manage/templates/serviceEmpty'],
      servicePickerTemplate = Handlebars.templates['seller/service_protocol/service_item_manage/templates/servicePicker'],
      searchBoxTemplate = Handlebars.templates['seller/service_protocol/service_item_manage/templates/searchBox'],
      itemsTemplate = Handlebars.templates['seller/service_protocol/service_item_manage/templates/itemsList'],
      serviceSettingTemplate = Handlebars.templates['seller/service_protocol/service_item_manage/templates/serviceProtocolSetting']

class serviceItemManage {

  constructor ($) {
    _.extend(this, AreaSelect.prototype)
    this.cityUnits = addressUnits.cityUnits
    this.provinceUnits = addressUnits.provinceUnits
    this.regionUnits = addressUnits.regionUnits
    this.$componentBody = $('.component-body')
    this.pageNo = 1
    this.pageSize = 10
    this.protocolId = null
    this.categoryId = null
    this.status = null
    this.pageRender()
  }

  pageRender () {
    this.loadServices()
    this.getAreas()
    this.getProvince()
  }

  loadServices () {
    $.ajax({
      url: '/api/service/simple',
      type: 'get'
    }).done((result) => {
      if (result && result.length > 0){
        let protocolId = $.query.get('protocolId')
        this.$componentBody.empty().append(servicePickerTemplate({data:result, protocolId}))
        this.protocolId = this.$componentBody.find('select[name="service"]').val()
        this.$itemsTable = this.$componentBody.find('.items-table')
        this.$searchBox = this.$componentBody.find('.search-box')
        this.renderSearchBox()
        this.bindEvents()
      } else {
        this.$componentBody.empty().append(serviceEmptyTemplate())
      }
      this.$componentBody.show()
    })
  }

  getTreeData () {
    this.$searchBox.spin('medium')
    $.ajax({
      url: `/api/service/${this.protocolId}/categoryTree`,
      type: "GET"
    }).done((result) => {
      let rootNode = {children: result}
      this.initTree(rootNode)
    }).always(() => {
      this.$searchBox.spin(false)
    })
  }

  //初始化tree
  initTree(content) {
    let that = this, firstNode = null
    let walk = function (pNode) {
      if (!firstNode && (!pNode.children || pNode.children.length === 0)) {//获取第一个叶子节点
        firstNode = pNode
      }
      if (!pNode.children || true === pNode.children || false === pNode.children) {
        pNode.children = false
      } else {
        for (let i = 0; i < pNode.children.length; i++) {
          let sNode = pNode.children[i]
          sNode.text = sNode.node.name
          sNode.id = sNode.node.id
          walk(sNode)
        }
      }
    }
    walk(content)

    let tree2 = $('#item-tree').jstree({
      "core": {
        "themes": {
          "icons": false
        },
        "data":content.children,
        "dblclick_toggle": false
      }
    }).on('loaded.jstree',function(){
      that.$categorySelect.closest('.category-select-input').css('display', 'inline-block')
      that.loadItems(1, that.pageSize)
      $('#item-tree').find('ul.jstree-container-ul').css('max-height', '190px').css('overflow', 'scroll')
      $('#item-tree').append('<div style="margin-top:10px; text-align: right;"><button class="btn-small btn-info js-tree-select">确定</button><button class="btn-small btn-info js-tree-clear">清空</button></div>')
      $('#item-tree').off('click', '.js-tree-select').on('click', '.js-tree-select', () => {
        let node = $('#item-tree').jstree().get_selected(true)[0]
        $(this).parent().find('.selectric p').text(node.text)
        $('#item-tree').hide()
        $(that.$categorySelect.children("option").eq(0)).attr("value", node.id)
        that.$categorySelect.trigger("change")
      })
      $('#item-tree').off('click', '.js-tree-clear').on('click', '.js-tree-clear', () => {
        $(this).parent().find('.selectric p').text('请选择')
        $('#item-tree').hide()
        $(that.$categorySelect.children("option").eq(0)).attr("value", '')
        that.$categorySelect.trigger("change")
      })
    })

    $('.selectric-category-select .selectric').unbind().bind('click', function(e) {
      e.stopPropagation()
      $('#item-tree').toggle()
      that.$categorySelect.selectric('close')
    })

    $(document).on('click', function(e) {
      if (!$('#item-tree')[0].contains(e.target)) {
        $('#item-tree').hide()
      }
    })
  }


  loadItems (pageNo, pageSize) {
    let that = this
    this.$itemsTable.spin('medium')
    pageNo = pageNo || 1
    pageSize = pageSize || 10
    let queryData = {
      pageNo,
      pageSize,
      protocolId: this.protocolId,
      itemName: this.$searchBox.find('input[name="itemName"]').val(),
      categoryId: this.$searchBox.find('select[name="categoryId"]').val(),
      status: this.$searchBox.find('select[name="status"]').val()
    }
    $.ajax({
      url: '/api/service/itemManage',
      type: 'get',
      data: queryData
    }).done((result) => {
      that.pageNo = pageNo
      that.pageSize = pageSize
      that.categoryId = queryData.categoryId
      that.status = queryData.status
      that.itemName = queryData.itemName
      that.$itemsTable.empty().append(itemsTemplate(result.itemServiceDTOPaging))
      that.$componentBody.find('.js-service-item-count').text(result.serviceItemCount)
      that.$componentBody.find('.js-service-item-rate').text(result.serviceItemSetRate)
      new Pagination('.js-pagination').total(result.itemServiceDTOPaging.total).show(pageSize, {
        current_page: pageNo - 1,
        num_display_entries: 5,
        jump_switch: true,
        maxPage: -1,
        page_size_switch: true,
        show_if_single_page: true,
        items_per_page: parseInt(pageSize),
        callback : function (page, size){
          that.loadItems(page + 1, size)
          return true
        }
      })
    }).always(() => {
      that.$itemsTable.spin(false)
    })
  }

  _formatState (state) {
    let icon = $(state.element).data('icon')
    if (!icon) {
      return $(`<span class="service-name">${state.text}</span>`)
    }
    return $(`<span class="service-name"><img style="width: 16px; height: 16px; vertical-align: text-top; margin-right: 2px;" src="${icon}">${state.text}</span>`)
  }

  renderSearchBox () {
    //清空服务信息数据
    this.$componentBody.find('.js-service-item-count').text('－')
    this.$componentBody.find('.js-service-item-rate').text('--')
    this.$searchBox.empty().append(searchBoxTemplate())
    this.$itemsTable.empty()
    this.$categorySelect = this.$searchBox.find('.category-select')
    this.$categorySelect.selectric()
    $('select[name=status]').selectric()
    this.getTreeData()
  }


  bindEvents () {
    $('select[name="service"]').select2({
      templateResult: this._formatState,
      templateSelection: this._formatState
    })
    this.$componentBody.on('change', 'select[name="service"]', () => this.changeService())
    this.$componentBody.on('click', '.js-search', () => this.searchItems())
    this.$componentBody.on('click', '.js-reset', () => this.resetSearch())
    this.$componentBody.on('click', '.js-batch-set', () => this.batchSetServiceProtocol())
    this.$itemsTable.on('click', '.js-service-set', (evt) => this.setServiceProtocol(evt))
    this.$componentBody.on('click', '.js-set-all', () => this.setAllItemsServiceProtol())
    //批量选择事件
    this.$itemsTable.on('click', '.js-batch-select-item', (evt) => this.batchSelectItem(evt))
    this.$itemsTable.on('click', '.js-select-item', () => this.selectItem())
  }

  changeService () {
    this.protocolId = this.$componentBody.find('select[name="service"]').val()
    this.renderSearchBox()
  }

  searchItems () {
    this.loadItems(1, this.pageSize)
  }

  resetSearch () {
    this.$searchBox.find('input[name="itemName"]').val('')
    this.$searchBox.find('select[name="status"]').val('')
    this.$searchBox.find('select[name="status"]').selectric('refresh')
    this.$searchBox.find('.selectric-category-select .selectric p').text('请选择')
    $(this.$categorySelect.children("option").eq(0)).attr("value", '')
    this.$categorySelect.trigger("change")
    this.loadItems(1, this.pageSize)
  }

  batchSelectItem (evt) {
    let checked = $(evt.currentTarget).prop('checked')
    this.$itemsTable.find('.js-batch-select-item').prop('checked', checked)
    this.$itemsTable.find('.js-select-item').prop('checked', checked)
  }

  selectItem () {
    let checked = true
    this.$itemsTable.find('.js-select-item').each((i, el) => {
      if(!$(el).prop('checked')) {
        checked = false
        return false
      }
    })
    this.$itemsTable.find('.js-batch-select-item').prop('checked', checked)
  }

  setServiceProtocol (evt) {
    let itemId = $(evt.currentTarget).closest('tr').data('itemId')
    this.getItemServiceRegion(itemId)
  }

  batchSetServiceProtocol () {
    let itemIds = []
    _.each($('.js-select-item:checked'), (e) => {
      let itemId = $(e).closest('tr').data('itemId')
      if (itemId) {
        itemIds.push(itemId)
      }
    })
    if (itemIds.length === 0) {
      new Modal({
        icon: 'info',
        title: '温馨提示',
        content: '请先选择要设置的商品'
      }).show()
      return
    }
    let modal = new Modal(serviceSettingTemplate({provinces: this.provinces, areas: this.unionRegions, itemIds}))
    modal.show()
    this.areaSelectBindEvent(modal)
  }

  setAllItemsServiceProtol () {
    let modal = new Modal(serviceSettingTemplate({provinces: this.provinces, areas: this.unionRegions}))
    modal.show()
    this.areaSelectBindEvent(modal)
  }

  areaSelectBindEvent ($modal) {
    let $warehouseContainer = $modal.modal,
      $areaContainer = $('.js-template-item', $warehouseContainer)
    $areaContainer.on("click", ".js-edit-template", evt => this.editTemplate(evt))
    $areaContainer.on("click", ".js-city-list", evt => this.getCity(evt))
    $areaContainer.on("change", ".js-select-province-item", evt => this.checkProvince(evt))
    $areaContainer.on("click", ".js-region-list", evt => this.getRegion(evt))
    $areaContainer.on("change", ".js-select-city-item", evt => this.checkCity(evt))
    $areaContainer.on("change", ".js-select-region-item", evt => this.checkRegion(evt))
    $areaContainer.on("click", ".js-pack-list", evt => this.packageList(evt))
    $areaContainer.on("change", ".js-check-all", evt => this.checkAllProvince(evt))
    $areaContainer.on("change", ".js-check-area", evt => this.checkArea(evt))
    $warehouseContainer.on('click', '.js-submit', (evt) => this.submitSettings(evt, $modal))
    $warehouseContainer.on('change', 'input[name="type"]', () => this.changeServiceSettingType($warehouseContainer))
  }

  changeServiceSettingType ($container) {
    let type = $container.find('input[name="type"]:checked').val()
    if (type == 1) {
      $container.find('.template-address-area').show()
    } else {
      $container.find('.template-address-area').hide()
    }
  }

  getItemServiceRegion (itemId) {
    let that = this
    that.$componentBody.spin('medium')
    $.ajax({
      url: '/api/service/itemServiceRegion',
      type: 'get',
      data: {itemId, protocolId: this.protocolId}
    }).done((result) => {
      let provinceInfo = $.extend(true, [], that.provinces),
        regions = result.regionJson ? JSON.parse(result.regionJson) : [],
        type = regions && regions.length > 0 ? 1 : 0
      _.each(provinceInfo, (i) => {
        _.each(regions, (j) => {
          if (j.province && (i.id == j.province.id)) {
            i.address = j
            i.check = j.province.selectAll ? "checked" : "indeterminate"
          }
        })
      })
      let modal = new Modal(serviceSettingTemplate({provinces: provinceInfo, areas: that.unionRegions, itemId, type}))
      that.$componentBody.spin(false)
      modal.show()
      that.areaSelectBindEvent(modal)
      that.setCheckbox($("input:checkbox[indeterminate=true]"), "indeterminate")
    }).fail(() => {
      that.$componentBody.spin(false)
    })
  }

  submitSettings (evt, $modal) {
    let that = this,
      regions = this.organizeAreas($modal.modal),
      $input = $modal.modal.find('.js-submit-input'),
      categoryId = this.categoryId,
      protocolId = this.protocolId,
      status = this.status,
      itemId = $input.data('itemId'),
      itemIds = $input.data('itemIds'),
      type = $modal.modal.find('input[name="type"]:checked').val(),
      postData = {protocolId, categoryId, status, type},
      itemName = this.itemName
    if (type == 1) {//自定义时
      if (regions.length > 0) {
        postData.regions = JSON.stringify(regions)
      } else {
        new Modal({
          icon: 'info',
          title: '温馨提示',
          content: '请指定生效地区'
        }).show()
        return
      }
    }
    if (itemId) {
      postData.itemId = itemId
    }
    if (itemIds) {
      postData.itemIds = itemIds
    }
    if (itemName) {
      postData.itemName = itemName
    }
    $(evt.currentTarget).prop('disabled', true)
    $.ajax({
      url: '/api/service/batchSetItem',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(postData),
      success: (result) => {
        $modal.close()
        new Modal({
          icon: 'success',
          title: '温馨提示',
          htmlContent: `<p>${result.msg}<br><div class="text-danger">您的服务商品约定内容生效会有1-30分钟的延迟，若您的设置没有发生变化，请稍等后刷新进行查看</div></p>`
        }).show(() => {
          setTimeout(() => {
            that.loadItems(that.pageNo, that.pageSize)
          }, 500)
        })
      },
      complete: () => {
        $(evt.currentTarget).prop('disabled', false)
      }
    })
  }
}

module.exports = serviceItemManage