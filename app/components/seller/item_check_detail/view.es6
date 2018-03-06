const Modal = require("pokeball/components/modal");
const deliveryListTemplate = Handlebars.templates["seller/item_publish/common/templates/delivery_list"];
const skuTableTemplate = Handlebars.wrapPartial("seller/item_publish/common/all_templates/_sku_table");
const Properties = require("extras/properties");
const OriginItemPublish = require("seller/item_publish/common/extend");
const itemManageDialog = Handlebars.templates["seller/item_check_detail/templates/item_manage_modal"];

class ItemPublish2 extends OriginItemPublish {
  constructor($) {
    super($);
    $(".new-attribute-area").hide();
    $(".js-attribute-image").addClass("hide");
    this.getItemDetail();
    this.getOperators();
    this.$selectBrand = $('#js-item-select-brand');
    this.renderRate();
    let $input = $('input[name=selfPlatformLink]');
    let inputVal = $input.val();
    if(inputVal) {
      let parent = $input.closest('.group-content');
      parent.html('<span style="line-height:32px;width: 305px;overflow: hidden;display: inline-block;text-overflow: ellipsis;"><a target="_blank" href="' + inputVal + '">' + inputVal + '</a></span>')
    }
    this.renderSkuAndStocks()
  }

  bindEvent() {
    //  $("select").not(".noselectric").selectric()
    let $select_brand = $("[name='select-brand']");
    //  $select_brand.select2({
    //    language: {
    //            "noResults": function(){
    //              return "未找到品牌信息";
    //            }
    //          },
    //    placeholder: "请选择",
    //    ajax: {
    //      url: "/api/brands",
    //      dataType: "json",
    //      delay: 500,
    //      data: function(params){
    //        if(params.term == undefined){
    //          return "";
    //        }
    //        return {
    //          name: params.term.trim() // search term
    //          // page: params.page
    //        }
    //      },
    //      error: function (e) {
    //        console.log(e);
    //      },
    //      processResults: function(data){
    //        var brandNames = [];
    //        if(data.length == 0){
    //          return {results: brandNames};
    //        }
    //        $.each(data, function(i,n){
    //          var option = {};
    //          option.id = n.id;
    //          option.text = n.name;
    //          brandNames.push(option);
    //        });
    //        return {
    //          results: brandNames
    //        }
    //      },
    //      cache: true
    //    }
    //  }).on("change", function(){
    //    let $selectedOption = $('select[name="select-brand"] option:selected');
    //    let id = $selectedOption.val();
    //    let name = $selectedOption.text();
    //    $select_brand.data("id", id);
    //    $select_brand.data("name", name);
    //  });
    let id = $select_brand.data("id");
    if(id != undefined) {
      $select_brand.append("<option value=" + id + ">" + $select_brand.data("name") + "</option>");
      $select_brand.trigger("change");
    }
    // this.jsDeliveryList = $("#js-delivery-list")
    // this.getDeliveryTemplates()
    super.bindEvent();

    $("body").on("keyup", "#js-examine-reason", function() {
      if($(this).val() != ""){
        $(".js-examine-submit").attr("disabled", false);
      }
      else{
        $(".js-examine-submit").attr("disabled", true);
      }
    });
    $("input").not(".no-disabled").prop("disabled", true);
    $("select").not(".no-disabled").prop("disabled", true);
    $(".selectric").off();
    this.$el.off("click", ".js-item-image");
    this.$el.off("click", ".js-delete-image");

    $('textarea.opinionText').on("input", (evt) => this.fontNumChange(evt));
    $('.js-submit-opinion').on("click", (evt) => this.submitOpinion(evt));
    $(window).off("beforeunload");

    // 初始化商品产地信息
    this.$originLimit = $('[name="limit"]', this.$el);
    this.$selectBrand = $('#js-item-brand');
    this.initRegionSelects();
    $("input.js-agree-radio").on('click', function() {
      if($("input.js-agree-radio:checked").data('passed')){
        $(".result-content").show();
      }
      else{
        $(".result-content").hide();
      }
    });

    $(".js-item-check-operation .js-btn-refuse").on('click', (evt)=>this.freezeItem(evt));
    $(".js-item-check-operation .js-btn-agree").on('click', (evt)=>this.unFreezeItem(evt));
  }

  // 获取物流模板
  getDeliveryTemplates() {
    $.ajax({
      url: "/api/deliverTemplate/findDeliverTemplateBySupplierId",
      type: "GET",
      success: (data) => {
        let deliveryId = this.jsDeliveryList.data("id");
        this.jsDeliveryList.html(deliveryListTemplate({ data, deliveryId }));
        $(".js-get-delivery", this.jsDeliveryList).on("click", evt => this.getDeliveryTemplates(evt))
      },
      error: (data) => {
        if(data.status === 401) {
          window.location.href = "/login"
        } else {
          new Modal({
            "icon": "error",
            "title": "出错啦",
            "content": data.responseText + "，点击确定重新获取运费模板"
          }).show();
          $(".close").on("click", evt => this.getDeliveryTemplates(evt))
        }
      }
    })
  }

  organizeItemExtra(form) {
    let unit = $.trim(form.find("input[name=unit]").val()) || "件",
      selfPlatformLink = $.trim(form.find("input[name=selfPlatformLink]").val()),
      // $deliverTemplate = $("input[name=delivery-template]:checked", form),
      // deliverTemplateId = $deliverTemplate.length ? $deliverTemplate.val() : null,
      needInstalled = form.find("select[name=needInstalled]").val();

    return { unit, selfPlatformLink, needInstalled }
  }

  registerSkuInfo() {
    let skus = this.$jsSkuTableArea.data("sku"),
      skuObject = {};
    _.each(skus, i => {
      if(i.attrs){
        let keys = i.attrs.slice();
        keys.sort((a,b)=> a.attrKey < b.attrKey );
        i.skuAttributeKeyAndValue = _.map(keys, (v) => v.attrKey && v.attrVal ? `${v.attrKey}:${v.attrVal}` : 0).join(";");
        skuObject[`${i.skuAttributeKeyAndValue}`] = i
      }
    });

    let stocks = this.$jsSkuTableArea.data("stocks"),
      stockObject = {};
    _.each(stocks, i => {
      if(i.sku.attrs){
        let keys = i.sku.attrs.slice();
        keys.sort((a,b)=> a.attrKey < b.attrKey );
        i.skuAttributeKeyAndValue = _.map(keys, (v) => v.attrKey && v.attrVal ? `${v.attrKey}:${v.attrVal}` : 0).join(";")
        stockObject[`${i.skuAttributeKeyAndValue}`] = i.stock
      }
    })

    window.stockObject = stockObject
    window.skuObject = skuObject
  }

  // 复写选择销售属性
  selectSkuAttribute() {
    let attrs = _.map($(".js-sku-area:has(:checked)"), i => {
        $(i).removeClass("error");
        return {key: $(i).data("key")}
      }),
      values = _.map($(".js-sku-area:has(:checked)"), j => {
        return (_.map($(".js-select-sku-attr:checked", j), i => {
            return {attr: $(i).attr("name"), value: $(i).val()}
          })
        )
      }),
      skus = this.$jsSkuTableArea.data("sku"),
      warehouses = this.$jsSkuTableArea.data("warehouses"),
      data = {attrs, values: this.combine(values), skus, warehouses};

    if (attrs.length) {
      this.renderSkuTable(data)
    } else {
      $("#js-price-and-stock").find(".js-sku-platform-price").attr("required", "required");
      $("#js-price-and-stock").removeClass("hide");
      $("#js-price-and-stock").find(".js-sku-code").prop("required", true);
      this.$jsSkuTableArea.empty()
    }

    this.bindFormEvent()
  }

  combine(arr) {
    arr.reverse();

    let r = [];
    (function fn(t, a, n) {
      if (n == 0) return r.push(t);
      for (let i = 0; i < a[n - 1].length; i++) {
        fn(t.concat(a[n - 1][i]), a, n - 1);
      }
    })([], arr, arr.length)

    let row = [],
      rowspan = r.length;
    for (let n = arr.length - 1; n > -1; n--) {
      row[n] = parseInt(rowspan / arr[n].length);
      rowspan = row[n];
    }
    row.reverse();

    let temp = $.extend(true, [], r),
      attrs = $.extend(true, [], r);
    _.each(r, (d, j) => {
      for (let index = 0; index < row.length; index++) {
        let list = temp[j];

        if (j % row[index] == 0) {
          list[index].rowspan = row[index]
        }

        let keys = list.slice();
        keys.sort((a,b)=> a.attr < b.attr );
        let sku = window.skuObject && window.skuObject[`${(_.map(keys, i => `${i.attr}:${i.value}`)).join(";")}`]
        let stock = window.stockObject && window.stockObject[`${(_.map(keys, i => `${i.attr}:${i.value}`)).join(";")}`]
        let ptype = this.$jsSkuTableArea.data("ptype")


        if (sku && stock) {
          attrs[j] = _.extend(sku, stock, {list})
        } else if (sku) {
          attrs[j] = _.extend(sku, {list})
        }
        else {
          attrs[j] = {list}
        }

        if(ptype){
          attrs[j]['ptype'] = ptype
        }
      }
    })
    return attrs;
  }

  //价格库存输入框
  renderSkuTable(data) {
    $("#js-price-and-stock").find(".js-sku-platform-price").removeAttr("required");
    $("#js-price-and-stock").addClass("hide");
    $("#js-price-and-stock").find(".js-sku-code").prop("required", false);
    let isVaccine = $('input[name="isVaccine"]').val();
    let skuTable = $(skuTableTemplate({data, isVaccine}));
    this.$jsSkuTableArea.html(skuTable);
    $("input", skuTable).on("focusout", evt => this.addSkuInfo(evt))
  }

  organizeItemBaseInfo(form) {
    let item = $(form).serializeObject()
    item.originPrice = centFormat(item.originPrice)
    if(this.$brandSearch.data("id")) {
      item.brandId = this.$brandSearch.data("id")
      item.brandName = this.$brandSearch.data("name")
    }
    switch(item.ptype) {
      case '1':
        item.status = 0
        item.isNetSuper = false
        item.isProtocol = false
        break

      case '2':
        item.status = -1
        item.isNetSuper = true
        item.isProtocol = false
        break;

      default:
        break;
    }
    item.extra = this.organizeItemExtra(form)
    item.origin = this.organizeItemOrigin(form)
    return item
  }

  /**
   * 组织产地信息
   * @param form
   * @returns {{limit: Number, countryId: Number, provinceId: Number, cityId: Number, regionId: Number}}
   */
  organizeItemOrigin(form) {
    let limit = parseInt(form.find('input[name="limit"]:checked').val() || 0),
      countryId = parseInt(form.find('select[name="countryId"]').val() || '0'),
      provinceId = parseInt(form.find('select[name="provinceId"]').val() || '0'),
      cityId = parseInt(form.find('select[name="cityId"]').val() || '0'),
      regionId = parseInt(form.find('select[name="regionId"]').val() || '0')
    return { limit, countryId, provinceId, cityId, regionId }
  }

  //提交复写
  submitItem(evt) {
    evt.preventDefault()
    let $form = this.$itemForm,
      FullItem = this.organizeItemDto($form),
      type = FullItem.item.id ? "PUT" : "POST"
    if(this.validateDispath($form, FullItem)) {
      $("body").spin("medium")
      $.ajax({
        url: "/api/seller/items",
        type: type,
        contentType: "application/json",
        data: JSON.stringify(FullItem),
        success: (data) => {
          this.confirmLeave()
          window.location.href = "/seller/stock-manage"
        },
        complete: () => $("body").spin(false)
      })
    }
  }

  //意见输入框动态检测字体数量
  fontNumChange(evt) {
    let fontNum = evt.target.textLength;
    $(".js-cur-num").html(fontNum);
  }

  //点击提交，提交审核
  submitOpinion(evt) {
    let isSub = $(evt.target).data("issub");
    if(isSub) return;
    $(evt.target).data("issub", true);
    let type = $(".js-auditing-title").data("type");
    let itemId = $(".js-auditing-title").data("itemid");
    let passed = $("input.js-agree-radio:checked").data("passed");
    let auditingType = type == "1" ? "FIRST_AUDIT" : "FINAL_AUDIT";
    let isPass = passed ? "APPROVE" : "REJECT";
    let nextOperatorId = $("select[name='zxr']").find("option:selected").data("id");
    let auditComment = $("textarea.opinionText").val();
    let submitData = {
      itemAuditId: itemId,
      passed: passed,
      nextOperatorId: nextOperatorId,
      auditComment: auditComment,
      auditResult: auditingType + "_" + isPass
    };
    //区分普通商品和疫苗商品和大宗商品
    let urlStr, isVaccine,isSupperPro;
    if($('.js-item-tags-vaccine').val() == '1'){
      urlStr = '/api/items-vaccine/audit';
      isVaccine = true;
    }
    else if($(".isSupperPro").val()){
      urlStr = '/api/item/block/supervise/audit';
      isSupperPro = true;
    }else{
      urlStr = '/api/items-manage/check';
      isVaccine = false;
    }
    $.ajax({
      url: urlStr,
      type: "POST",
      data: submitData,
      success: () => {
        $(evt.target).data("issub", false);
        if(isVaccine){
          window.location.href = "/seller/vaccine-item-check-list"
        }else if(isSupperPro){
          window.location.href = "/seller/supperPro/item-check-list"
        }else {
          window.location.href = "/seller/item-check"
        }
      },
      error: (data) => {
        $(evt.target).data("issub", false);
        if(data.status === 401) {
          window.location.href = "/login"
        } else {
          new Modal({
            "icon": "error",
            "title": "出错啦",
            "content": data.responseText
          }).show()
        }
      }
    })
  }

  //获取详情数据
  getItemDetail() {
      let itemId = $(".js-pro-itemid").data("itemid");
      $.ajax({
        url: `/api/seller/items/${itemId}/detail`,
        type: "GET",
        dataType: "html",
        success: (data) => {
          this.renderProductDetail(data)
        },
        error: () => {
          console.log("error!")
        }
      })
    }
    //渲染商品详情模块
  renderProductDetail(data) {
    if(data && data !== "") {
      $(".js-detail-box").html(data);
      $(".product-detail-warp").show();
    }
  }

  //获取审核人列表
  getOperators() {
      let type = $(".js-auditing-title").data("type");
      if(type == 1) {
        $.ajax({
          url: '/api/item-manage/next/operators',
          type: "GET",
          dataType: "json",
          success: (data) => {
            this.renderOperatorsList(data)
          },
          error: () => {
            console.log("error!")
          }
        })
      }
    }
    //渲染下拉列表
  renderOperatorsList(data) {
      if(!data) return;
      let $operatorList = $("select#operators");
      let option = '';
      $operatorList.empty();
      $.each(data, (i, n) => {
        option += '<option data-id="' + n.id + '">' + n.displayName + '</option>';
      });
      $operatorList.append(option);

      $operatorList.selectric();
    }
    //转换折扣率
  renderRate() {
    let oldRate = $(".js-wc-rate").data("rate");
    let newRate = parseFloat(oldRate) / 100;
    if(!isNaN(newRate)) {
      $(".js-wc-rate").html(newRate + "%");
    }
  }

  /**
   * 初始化行政区划选择
   */
  initRegionSelects() {
    let self = this
    self.$province = $('[name="provinceId"]', self.$el)
    self.$city = $('[name="cityId"]', self.$el)
    self.$region = $('[name="regionId"]', self.$el)
    self.$country = $('[name="countryId"]', self.$el)
    self.initCountrySelect(this.$country)
    self.initRegionSelect(this.$province)
    self.$province.on('change', function() {
      let provinceId = $(this).val()
      self.$city.data('pid', provinceId)
      self.initRegionSelect(self.$city)
    })
    self.$city.on('change', function() {
      let cityId = $(this).val()
      self.$region.data('pid', cityId)
      self.initRegionSelect(self.$region)
    })
  }

  /**
   * 判断是否存在特定id
   * @param data {Array}
   * @param id {String}
   * @returns {Number}
   */
  getSelectedIndex(data, id) {
    let v = 0
    if(data && Array == data.constructor) {
      let item
      let len = data.length
      let i
      for(i = 0; i < len; i++) {
        item = data[i]
        if(item.id == id) {
          v = i
          break
        }
      }
    }
    return v
  }

  /**
   * 初始化单个行政区划选择下拉框
   * @param $select {jQuery}
   * @param callback {func}
   */
  initCountrySelect($select, callback) {
    let self = this
    let pId = $select.data('pid')
    if(!pId){
      console.log('no CountryId!');
      return;
    }
    let url = `/api/address/streets?regionId=${pId}`
    $.ajax({
      url: url,
      dataType: 'json',
      delay: 500,
      success: function(data) {
        let chinaCountryId = 1
        let countries = []
        $.each(data, function (index, item) {
          if (chinaCountryId !== item.id) {
            countries.push(item)
          }
        })
        let options = self.initOptions(countries)
        let selectedIndex = 0
        let id = $select.data('id')
        if(id) {
          id = parseInt(id)
          selectedIndex = self.getSelectedIndex(countries, id)
        }
        $select.html(options)
          .prop('selectedIndex', selectedIndex)
          .selectric('refresh')
        if('function' === typeof callback) {
          callback.call($select[0], $select.val())
        }
      },
      error: function(e) {
        console.log(e)
      }
    })
  }

  /**
   * 初始化单个行政区划选择下拉框
   * @param $select {jQuery}
   * @param callback {func}
   */
  initRegionSelect($select, callback) {
    let self = this
    let pId = $select.data('pid')
    if(!pId){
      console.log('no regionId!');
      return;
    }
    let url = `/api/address/streets?regionId=${pId}`
    $.ajax({
      url: url,
      dataType: 'json',
      delay: 500,
      success: function(data) {
        let options = self.initOptions(data)
        let selectedIndex = 0
        let id = $select.data('id')
        if(id) {
          id = parseInt(id)
          selectedIndex = self.getSelectedIndex(data, id)
        }
        $select.html(options)
          .prop('selectedIndex', selectedIndex)
          .selectric('refresh')
        $select.trigger('change')
        if('function' === typeof callback) {
          callback.call($select[0], $select.val())
        }
      },
      error: function(e) {
        console.log(e)
      }
    })
  }

  initOptions(options) {
    let v = [],
      t;
    $.each(options, function(i, n) {
      t = `<option value ="${n.id}">${n.name}</option>`
      v.push(t)
    })
    return v.join('')
  }

  initCountryOptions(options) {
    let v = [],
      t
    let id = 1
    $.each(options, function(i, n) {
      if(id != n.id) {
        t = `<option value ="${n.id}">${n.name}</option>`
        v.push(t)
      }
    })
    return v.join('')
  }

  freezeItem(evt){
    let that = this;
    new Modal(itemManageDialog({title: '确认冻结吗', description: '冻结后该商品不能被正常访问及购买', operation: '冻结'})).show(()=> {
      let id = $(evt.target).data('id');
      that.updateItemStatus(id, '-2');
    })
  }

  unFreezeItem(evt){
    let that = this;
    new Modal(itemManageDialog({title: '确认解冻吗', description: '解冻后该商品可以被正常访问及购买', operation: '解冻'})).show(()=> {
      let id = $(evt.target).data('id');
      that.updateItemStatus(id, '-1');
    })
  }


  updateItemStatus(id, status){
    let comment = $('.modal-dialog .js-comment').val()
    $.ajax({
      url: "/api/items-manage/status",
      type: "POST",
      data: {itemIds:[id], status, comment},
      success:()=>{
        window.location.reload();
      }
    })
  }

  renderSkuAndStocks () {
    //渲染表格
    $('.js-sku-area-checked-value').each((i, el) => {
      let valStr = $(el).val(),
        attrVals = valStr.split('#'),
        $area = $(el).closest('.js-sku-area')
      _.each(attrVals, (attrVal) => {
        $area.find(`.js-select-sku-attr[value="${attrVal}"]`).prop('checked', true)
      })
    })
    this.selectSkuAttribute()
  }
}

module.exports = ItemPublish2;