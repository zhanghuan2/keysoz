const Pagination = require("pokeball/components/pagination"),
      Modal = require("pokeball/components/modal"),
      addressUnits = require("extras/address_units")

const AeraSelect = require("seller/area_select/view"),
      AddressSelect = require("common/address_select/view")

const areaTemplate = Handlebars.templates["seller/warehouse_manage/templates/area_template"],
      warehouseTemplate = Handlebars.wrapTemplate("seller/warehouse_manage/templates/warehouse_edit"),
      provinceTemplate = Handlebars.partials["seller/area_select/templates/_province_list"],
      cityTemplate = Handlebars.templates["seller/area_select/templates/city_list"],
      regionTemplate = Handlebars.templates["seller/area_select/templates/region_list"],
      areaShowTemplate = Handlebars.templates["seller/area_select/templates/area_show"],
      deliveryItemTemplate = Handlebars.templates["seller/area_select/templates/template_item"]

class WarehouseManage extends AddressSelect {
  constructor ($) {
    super($)
    _.extend(this, AeraSelect.prototype)
    this.cityUnits = addressUnits.cityUnits
    this.provinceUnits = addressUnits.provinceUnits
    this.regionUnits = addressUnits.regionUnits
    this.$target = this.$el
    this.pagination = $(".pagination")
    this.total = this.pagination.data("total")
    this.bindEvent()
  }

  bindEvent () {
    this.getAreas()
    this.getProvince()
    this.levels = 4
    new Pagination(this.pagination).total(this.total).show()
    this.$target.on("click", ".js-create-warehouse", evt => this.createWarehouse(evt))
    this.$target.on("click", ".js-view-area", evt => this.viewArea(evt))
    this.$target.on("click", ".js-change-status", evt => this.changeStatus(evt))
    this.$target.on("click", ".js-delete-warehouse", (evt) => this.deleteWarehouse(evt))
    this.$target.on("click", ".js-enable-warehouse", (evt) => this.enableWarehouse(evt))
    this.$target.on("click", ".js-disable-warehouse", (evt) => this.disableWarehouse(evt))
    this.$target.on("click", ".js-edit-warehouse", (evt)=> this.editWarehouse(evt))
  }

  viewArea (evt) {
    let $target = $(evt.currentTarget),
        data = $target.closest(".js-warehouse-item").data("info")
    data.regionsList = data.regions ? JSON.parse(data.regions) : []
    new Modal(areaTemplate(data)).show()
  }

  createWarehouse (evt) {
    if (this.provinces) {
      new Modal(warehouseTemplate({provinces: this.provinces, areas: this.unionRegions})).show()
    } else {
      new Modal
        icon: "info"
        title: "请稍后"
        content: "正在准备数据，请稍后"
      .show()
    }

    this.areaSelectBindEvent()
  }

  areaSelectBindEvent () {
    let $warehouseContainer = $(".js-warehouse-modal"),
        $areaContainer = $(".js-template-item", $warehouseContainer),
        $form = $(".js-warehouse-form", $warehouseContainer)
    $("select", $warehouseContainer).selectric()
    this.initAddress($(".js-warehouse-address"), this.levels)
    $areaContainer.on("click", ".js-edit-template", evt => this.editTemplate(evt))
    $areaContainer.on("click", ".js-city-list", evt => this.getCity(evt))
    $areaContainer.on("change", ".js-select-province-item", evt => this.checkProvince(evt))
    $areaContainer.on("click", ".js-region-list", evt => this.getRegion(evt))
    $areaContainer.on("change", ".js-select-city-item", evt => this.checkCity(evt))
    $areaContainer.on("change", ".js-select-region-item", evt => this.checkRegion(evt))
    $areaContainer.on("click", ".js-pack-list", evt => this.packageList(evt))
    $areaContainer.on("change", ".js-check-all", evt => this.checkAllProvince(evt))
    $areaContainer.on("change", ".js-check-area", evt => this.checkArea(evt))
    $form.validator({isErrorOnParent: true})
    $form.on("submit", evt => this.submitWarehouse(evt))
  }

  organizeWarehouseAddress ($form) {
    let $addressOption = $(".address-select option:selected", $form),
        address = _.map($addressOption, (i) => $(i).data("name")).join(":"),
        addressCode = _.map($addressOption, (i) => $(i).val()).join(":")

    return {address, addressCode}
  }

  organizeWarehouse ($form) {
    let warehouse = $form.serializeObject(),
        addressInfo = this.organizeWarehouseAddress($form),
        regions = this.organizeAreas($form)
    if (regions.length === 0) {
      new Modal({
        icon: 'info',
        title: '温馨提示',
        content: '请选择配送范围'
      }).show()
    } else{
      warehouse.regions = JSON.stringify(regions)
    }
    return _.extend(warehouse, addressInfo)
  }

  submitWarehouse (evt) {
    let $form = $(evt.currentTarget),
        warehouse = this.organizeWarehouse($form),
        url = warehouse.warehouseId ? "/api/zcy/stocks/changeWarehouseInfo" : "/api/zcy/stocks/addWarehouse"
    if (!warehouse.regions) {
      return 
    }
    $.ajax({
      url: url,
      type: "POST",
      data: warehouse,
      success: (data) => {
        window.location.reload()
      }
    })
  }

  // 删除仓库
  deleteWarehouse (evt) {
    let errMessage = "删除仓库失败"
    new Modal({
      title:'库存删除之后不可恢复',
      icon:'error',
      htmlContent:'确认删除?',
      isConfirm:true
    }).show(()=>
      this.changeStatusCommon(evt,-2,errMessage)
    );
  }

  // 恢复仓库
  enableWarehouse (evt) {
    let errMessage = "恢复仓库失败"
    this.changeStatusCommon(evt,1,errMessage)
  }

  // 暂停使用仓库失败
  disableWarehouse (evt) {
    let errMessage = "暂停使用仓库失败"
    this.changeStatusCommon(evt,-1,errMessage)
  }

  // 编辑仓库
  editWarehouse (evt) {
    let $self = $(evt.currentTarget),
        $tr = $self.closest("tr"),
        data = $tr.data("info"),
        provinceInfo = $.extend(true, [], this.provinces),
        regions = data.regions ? JSON.parse(data.regions) : []

    _.each(provinceInfo, (i) => {
      _.each(regions, (j) => {
        if (j.province && (i.id == j.province.id)) {
          i.address = j
          i.check = j.province.selectAll ? "checked" : "indeterminate"
        }
      })
    })

    new Modal(warehouseTemplate({data, provinces: provinceInfo, areas: this.unionRegions})).show()
    this.areaSelectBindEvent()
    this.setCheckbox($("input:checkbox[indeterminate=true]"), "indeterminate")

  }

  // 通用仓库状态改变ajax
  changeStatusCommon(evt,status,errMessage) {
    let warehouseId = $(evt.currentTarget).closest("tr").data("id")
    $.ajax({
      url: "/api/zcy/stocks/changeWarehouseStatus",
      type: "POST",
      data: `warehouseId=${warehouseId}&status=${status}`,
      success: (data)=> {
        window.location.reload()
      }
    })
  }

}

module.exports = WarehouseManage
