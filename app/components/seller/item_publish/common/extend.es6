const Modal = require("pokeball/components/modal");
const deliveryListTemplate = Handlebars.templates["seller/item_publish/common/templates/delivery_list"];
const skuTableTemplate = Handlebars.wrapPartial("seller/item_publish/common/all_templates/_sku_table");
const OriginItemPublish = require("seller/item_publish/common/view");
const priceExamineTemplate = Handlebars.templates["seller/item_publish/common/templates/price_examine"];
const attributeTemplate = Handlebars.templates["seller/item_publish/common/templates/attribute_template"];

let examine, auditCheck;

class ItemPublish extends OriginItemPublish {

  constructor($) {
    super($)
    this.beforeRender()
    this.renderMultiInput()
    this.selectSkuAttribute()
    this.popoverEvents()
  }

  beforeRender(){
    if($.query.keys.ptype == 4){
      $(".js-sku-origin-price").val("");
      $(".sku-price-input").val("");
      $(".js-sku-platform-price").val("");
    }
  }

  //多选---勾选已选择内容
  renderMultiInput(){
    let $multiInput = $('.js-multi-input')
    if($multiInput.length>0){
      $.each($multiInput,function(i,n){
        let multiValue = $(n).data('multiValue')
        if(multiValue != '' && multiValue.trim() != ''){
          let valList = multiValue.split('#')
          if(valList.length>0){
            $.each(valList,function(j,m){
              $(n).find(`label[name="${m.replace(/\\/g,"\\\\")}"]`).find('input').prop('checked',true)
            })
          }
        }
      })
      //添加自定义属性值
      $multiInput.on('click', '.multi-add', (evt) => {
        let $multiInputAppend = $(evt.currentTarget).siblings('.multi-input-append')
        $multiInputAppend.show()
        $multiInputAppend.find('.js-attr-val-input').focus()
      })
      $multiInput.on('click', '.js-multi-item-append', (evt) => {
        let $content = $(evt.currentTarget).closest('.multi-content'),
          $addPoint = $content.find('.multi-add'),
          valStr = $content.find('.js-attr-val-input').val().trim(),
          newVal = $('<span/>').text(valStr).html()
        if (newVal.length > 0) {
          $addPoint.before(`<label name="${newVal}"><input type="checkbox" name="multiCheckbox"><span>${newVal}</span></label>`)
        }
        $content.find('.js-attr-val-input').val('')
        $content.find('.multi-input-append').hide()
      })
      $multiInput.on('blur', '.js-attr-val-input', (evt) => {
        setTimeout(() => {
          $(evt.currentTarget).closest('.multi-input-append').hide()
        }, 500)
      })
    }
  }

  bindEvent() {
    let that = this
    this.$originLimit = $('[name="limit"]', that.$el)
    this.$selectBrand = $('#js-item-brand')
    that.initRegionSelects()

    this.$jsExtendAttribute = $(".js-attribute-new").not("#js-extend-sku-attribute");
    $("select").not(".noselectric").selectric();
    let $select_brand = $("[name='select-brand']");

    //普通商品、疫苗商品品牌请求不一样
    let urlStr,
        isVaccine = $('input[name="isVaccine"]').val(),
        categoryId = $('input[name="categoryId"]').val();
    if(isVaccine == '1'){
      urlStr = '/api/brands/v2/category?categoryId=' + categoryId;
    }
    else{
      urlStr = '/api/brands/v2';
    }
    $select_brand.select2({
      language: {
        "noResults": function () {
          return '未找到品牌信息,<a href="/seller/brand-creat">点击申请</a>';
        }
      },
      placeholder: "请选择",
      escapeMarkup: function (markup) {
        return markup
      },
      ajax: {
        url: urlStr,
        dataType: "json",
        delay: 500,
        data: function (params) {
          if (params.term == undefined) {
            return "";
          }
          return {
            name: params.term.trim() // search term
            // page: params.page
          }
        },
        error: function (e) {
          console.log(e);
        },
        processResults: function (data) {
          var brandNames = [];
          if (data.length == 0) {
            return {results: brandNames};
          }
          $.each(data, function (i, n) {
            var option = {};
            option.id = n.id;
            option.text = n.fullName;
            brandNames.push(option);
          });
          return {
            results: brandNames
          }
        },
        cache: true
      }
    }).on("change", function () {
      let $selectedOption = $('select[name="select-brand"] option:selected');
      let id = $selectedOption.val();
      let name = $selectedOption.text();
      $select_brand.data("id", id);
      $select_brand.data("name", name);
      $(".xhbox input").val("");
      $(".xhbox input").attr("value", "");
      // that.linkXH(); 型号获取接口已弃用
    });
    let id = $select_brand.data("id");
    if (id != undefined) {
      $select_brand.append("<option value=" + id + ">" + $select_brand.data("name") + "</option>");
      var _value = $(".xhbox input").val();
      $select_brand.trigger("change");
      if (_value) {
        $(".xhbox input").val(_value);
        $(".xhbox input").attr("value", _value);
      }

    }
    // this.jsDeliveryList = $("#js-delivery-list")
    // this.getDeliveryTemplates()
    super.bindEvent();

    $("body").on("keyup", "#js-examine-reason", function () {
      $(this).val() != "" && $(".js-examine-submit").attr("disabled", false);
      $(this).val() == "" && $(".js-examine-submit").attr("disabled", true);

    });

    $(".xhbox input").on("focus", function () {
      $(".xhbox .search_box").show();
    }).on("blur", function () {
      $(".xhbox input").attr("value", $(this).val());
      let pp = $('select[name="select-brand"] option:selected').text(),
        xh = $(this).val();
      let isVaccine = $('input[name="isVaccine"]').val();
      if(isVaccine != '1'){//疫苗商品不自动生成商品标题
        $("input[id='input-name']").val(pp + xh);
      }
      setTimeout(function () {
        $(".xhbox .search_box").hide();
      }, 500);
    }).on("input", function () {
      let id = $(this).data("brandid");
      let _content = $(this).val();
      let _categoryId = $("input[name=categoryId]").val();
      let param = {
        categoryId: _categoryId,
        brandId: id,
        content: _content
      };
      if (!_categoryId) {
        param = {
          categoryId: $("input[name=spuId]").val(),
          brandId: id,
          content: _content
        };
      }
      if (!param.brandId) {
        that.inputSearch([]);
      } else {
        $.ajax({
          url: "/api/zcy/specifications/list",
          contentType: "application/json",
          data: param,
          success: (data) => {
            that.inputSearch(data);
          }
        });
      }
    });

    $(".xhbox").on("click", "li", function () {
      if ($(this).hasClass("noneli")) {
        return;
      }
      $(".xhbox input").val($(this).text());
      $(".xhbox input").attr("value", $(this).text());
      $(".xhbox .error").removeClass("error empty").addClass("success");
    });

    that.$originLimit.on('click', function () {
      let limit = that.$originLimit.filter(':checked').val();
      let $limitBlocks = that.$el.find('.limit-0,.limit-1');
      $limitBlocks.css('display', 'none');
      that.$el.find('.limit-' + limit).css('display', 'block');
    });

    try {
      let editor = new wysihtml5.Editor("wysihtml5-editor", {
        toolbar: "wysihtml5-editor-toolbar",
        parserRules: wysihtml5ParserRules
      })
      editor.on("load", () => editor.composer)
    } catch (e) {
      console.log(e)
    }

    $(".wysihtml5-sandbox").addClass("text-tool-iframe").attr("id", "iframe-whsihtml5")

    this.fileUpload()

    if (this.$itemForm.data("id")) {
      this.registerSkuInfo()
      this.renderSkuSelectedAttribute()
    }

  }

  // 重写获取一开始可作为销售属性的key
  getOriginCanSkuKey (attrs) {
    return _.without(_.flatten(_.map(attrs, (i) => {
      let attrRule = i.attributeRule?i.attributeRule:i.categoryAttribute
      if (attrRule && attrRule.attrMetasForK) {
        return attrRule.attrMetasForK.PROPERTY_TYPE === "SKU_CANDIDATE" ? attrRule.attrKey : 0
      } else if (i.attrMetasForK){
        return i.attrMetasForK.PROPERTY_TYPE === "SKU_CANDIDATE" ? i.attrKey : 0
      } else {
        return 0
      }
    })), 0)
  }

  //重写图片上传
  itemImagesUpload (evt) {
    super.itemImagesUpload(evt);
    $("#js-image-upload").attr("accept","image/png,image/jpg");
    $("input.image-address.js-image-address").hide();
  }

  linkXH() {
    let that = this;
    let dom = $("[name='select-brand']");
    let id = dom.data("id");
    let _categoryId = $("input[name=categoryId]").val();
    var _url = "/api/zcy/specifications/list";
    let _data = {
      categoryId: _categoryId,
      brandId: id,
      content: ""
    };
    if (!_categoryId) {
      _data = {
        categoryId: $("input[name=spuId]").val(),
        brandId: id,
        content: ""
      };
    }
    $(".xhbox input").data("brandid", id);
    if (!_data.brandId) {
      that.inputSearch([]);
      return;
    }
    $.ajax({
      url: _url,
      contentType: "application/json",
      data: _data,
      success: (data) => {
        that.inputSearch(data);
      }
    });
  }

  inputSearch(d) {
    let input = $("#input-specification");
    var box = "<div class='search_box' style='display: none'><ul>" +
      "</ul>" +
      "</div>";
    input.parent().find(".search_box").length == 0 && input.parent().append(box);
    input.parent().find(".search_box ul").empty();
    if (d.length == 0) {
      let listr = "<li class='noneli'>无此型号...</li>";
      input.parent().find(".search_box ul").append(listr);
      return;
    }
    $.each(d, function (i, v) {
      let listr = "<li>" + v.content + "</li>";
      input.parent().find(".search_box ul").append(listr);
    })
  }

  // 复写展开属性添加面板
  extendNewAttributes(evt) {
    if ($(evt.currentTarget).next().length === 0) {
      $(evt.currentTarget).addClass("hide");
      let attributeItem = $(attributeTemplate());
      $(evt.currentTarget).after(attributeItem);
      this.bindAttributeEvent(attributeItem)
    }
    return false
  }

  // 复写提交属性数据
  submitAttribute(evt) {
    evt.preventDefault();
    let data = $(evt.currentTarget).serializeObject();

    data.attrVals = _.flatten([data.attrVal]);

    let $attributeItem = $(attributeTemplate(data));
    $(evt.currentTarget).parents(".js-attribute-area").find("#js-category-attribute-list").append($attributeItem);
    $attributeItem.dropdown();
    $(evt.currentTarget).parents(".new-attribute-area").find(".js-attribute-new").removeClass("hide");
    this.closeAttribute(evt)
  }

  // 复写表单时间、validate绑定
  bindFormEvent() {
    let vm = this;
    this.$itemForm.off();
    this.$itemForm.validator({
      identifier: "input.js-need-validated,[required]:not(.js-attr-sku-val)",
      isErrorOnParent: true,
      errorCallback: this.tryNavToError,
      after: function (event) {
        return vm.checkPriceChange(vm, event);
      }
    });

//  this.$itemForm.on("submit", evt => this.submitItem(evt))
  }

  // 尝试定位到第一个输入出错的地方
  tryNavToError(unvalidFields) {
    let errors = $(".error");
    if (_.size(errors) > 0) {
      let firstError = _.first(errors);
      // 低 90 像素
      let pos = $(firstError).offset().top - 90;
      $("body").animate({scrollTop: pos}, 400);
    }
  }

  // 获取物流模板
  getDeliveryTemplates() {
    $.ajax({
      url: "/api/deliverTemplate/findDeliverTemplateBySupplierId",
      type: "GET",
      success: (data)=> {
        let deliveryId = this.jsDeliveryList.data("id");
        this.jsDeliveryList.html(deliveryListTemplate({data, deliveryId}));
        $(".js-get-delivery", this.jsDeliveryList).on("click", evt => this.getDeliveryTemplates(evt))
      },
      error: (data)=> {
        if (data.status === 401) {
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
      needInstalled = form.find("select[name=needInstalled]").val(),
      weight = form.find("[name='weight']").val(),
      birthday = form.find("[name='birthday']").val(),
      firm = form.find("[name='firm']").val()

    return {unit, selfPlatformLink, needInstalled, weight, birthday, firm}
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
    return {limit, countryId, provinceId, cityId, regionId}
  }

  // 复写获取item信息
  organizeItemBaseInfo(form) {
    let item = $(form).serializeObject();
    item.originPrice = centFormat(item.originPrice);
    if (this.$selectBrand.data("id")) {
      item.brandId = this.$selectBrand.data("id");
      item.brandName = this.$selectBrand.data("name")
    }
    switch (item.ptype) {
      case '1':
        item.status = 0
        item.isNetSuper = false
        item.isProtocol = false
        break

      case '2':
        item.status = -1
        item.isNetSuper = true
        item.isProtocol = false
        break

      case '3':
        item.status = -1
        item.isNetSuper = false
        item.isProtocol = false
        break
      //大宗
      case '4':
        item.status = -1
        item.isNetSuper = false
        item.isProtocol = false
        break

      case '6':
        item.status = -1
        item.isNetSuper = false;
        item.isProtocol = false
        break;

      default:
        break;
    }
    item.extra = this.organizeItemExtra(form)
    item.origin = this.organizeItemOrigin(form)
    return item
  }

  // 复写选择销售属性
  selectSkuAttribute(evt) {
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
      if($.query.keys.ptype == 4){
        $("#js-price-and-stock").find(".js-sku-platform-price").attr("disabled", "disabled");
      }else if($.query.keys.ptype == 2 || $.query.keys.ptype == 6){
        $("#js-price-and-stock").find(".js-sku-platform-price").attr("required", "required");
      }
      $("#js-price-and-stock").removeClass("hide");
      $("#js-price-and-stock").find(".js-sku-code").prop("required", true);
      this.$jsSkuTableArea.empty()
    }

    this.bindFormEvent()
  }

  // 复写append价格库存输入框
  renderSkuTable(data) {
    $("#js-price-and-stock").find(".js-sku-platform-price").removeAttr("required");
    $("#js-price-and-stock").addClass("hide");
    $("#js-price-and-stock").find('input').prop("required", false);
    $("#js-price-and-stock").find(".js-sku-code").prop("required", false);
    let isVaccine = $('input[name="isVaccine"]').val();
    let skuTable = $(skuTableTemplate({data, isVaccine}));
    this.$jsSkuTableArea.html(skuTable);
    $("input", skuTable).on("focusout", evt => this.addSkuInfo(evt))
  }

  renderSkuSelectedAttribute() {
    let skus = this.$jsSkuTableArea.data("sku"),
      hasSpu = this.$jsSkuAttributeArea.data("spu");

    _.each(skus, i => {
      _.each(i.attrs, (v) => {
        let input = $(`.js-select-sku-attr[name='${v.attrKey}'][value='${v.attrVal}']:not(:checked)`, this.$itemForm)
        input.trigger("click")
      })
    })

    if (hasSpu) {
      $(".js-select-sku-attr", this.$itemForm).attr("disabled", "disabled")
    }
  }

  organizeStocks(form) {
    let stocks = _.without(_.map($(".js-sku-table-area:not(.hide) .js-sku-tr", form), i => {
      let warehouseCode = $(i).find("#input-warehouse-code").val(),
        skuCode = $(i).find("input.js-sku-code").val(),
        quantity = $(i).find("input.js-stock-quantity").val();
      if(!quantity){
        quantity = 0;
      }
      return {skuCode, warehouseCode, quantity};
    }), 0)
    return stocks
  }

  organizeRichText(form) {
    let detail = $("#iframe-whsihtml5").contents().find("body").html();
    return detail;
  }

  organizeSkuInfo (form) {
    let isVaccine = $('input[name="isVaccine"]').val();
    let skuInfo = _.without(_.map($(".js-sku-table-area:not(.hide) .js-sku-tr", form), i => {
      let data = $(i).data("attr"),
        id = $(i).data("id"),
        priceValue = $.trim($(i).find("input.js-sku-price").val()),
        price = priceValue == "" ? 0 : centFormat(priceValue),
        stockQuantityValue = $.trim($(i).find("input.js-sku-quantity").val()),
        stockQuantity = stockQuantityValue == "" ? 0 : stockQuantityValue,
        originPriceValue = $.trim($(i).find("input.js-sku-origin-price").val()),
        originPrice = originPriceValue == "" ? 0 : centFormat(originPriceValue),
        platformPriceValue = $.trim($(i).find("input.js-sku-platform-price").val()),
        platformPrice = platformPriceValue == "" ? 0 : centFormat(platformPriceValue),
        skuCode = $(i).find("input.js-sku-code").val(),
        attrs = data ? _.map(data, d => ({"attrKey": d.attr, "attrVal": d.value})) : null,
        extraPrice = {platformPrice, originPrice},
        sku = {price, stockQuantity, skuCode, id, attrs, extraPrice};
      if(isVaccine == '1'){
        let tmp = $('#js-sku-table-area').data('sku');
        if(tmp){
          sku.stockQuantity = tmp[0].stockQuantity;
        }
      }
      if($.query.keys.ptype==4){
        return sku;
      }
      return sku.price ? sku : 0;
    }), 0);
    return skuInfo
  }

  organizeOtherAttributeInfo (form) {
    let attrs, isVaccine = $('input[name="isVaccine"]').val();
    if(isVaccine == '1'){
      attrs = _.without(_.map($('.js-group-item', form), i => {
        if($(i).data('tag') != 'vaccine' && $(i).prop('disabled')){
          return 0;
        }
        let $input = $(i),
          attrKey = $input.data("key"),
          attrVal = $.trim($input.val()),
          group = $input.data("group"),
          unit = $input.data("unit")

        if (attrVal) {
          return {attrKey, attrVal, group, unit}
        } else {
          return 0
        }
      }), 0)
    }
    else{
      attrs = _.without(_.map($(".js-group-item:not(:disabled)", form), i => {
        let $input = $(i),
          attrKey = $input.data("key"),
          group = $input.data("group"),
          unit = $input.data("unit"),
          propertyId = $input.data("propertyId"),
          inputType = $input.data('inputType')
        let attrVal = null
        if(inputType && inputType == 'multi'){
          let multiInput = $input.find('label')
          if(multiInput.length>0){
            let vals = []
            $.each(multiInput,function(i,n){
              if($(n).find('input').prop('checked')){
                vals.push($(n).find('span').text())
              }
            })
            attrVal = vals.join('#')
          }
        }else{
          attrVal = $.trim($input.val())
        }

        if (attrVal) {
          return {attrKey, attrVal, group, unit,propertyId}
        } else {
          return 0
        }
      }), 0)
    }
    let groupAttrs = _.groupBy(attrs, (i) => i.group)
    return _.map(groupAttrs, (otherAttributes, group) => ({group, otherAttributes}))
  }

  organizeItemDto(form) {
    let item = this.organizeItemBaseInfo(form),
      itemDetail = this.organizeItemDetailImages(form),
      groupedSkuAttributes = this.organizeSkuAttributeInfo(form),
      skus = this.organizeSkuInfo(form),
      stocks = this.organizeStocks(form),
      richText = this.organizeRichText(form),
      groupedOtherAttributes = this.organizeOtherAttributeInfo(form);
    return {item, itemDetail, groupedSkuAttributes, skus, stocks, richText, groupedOtherAttributes}
  }

  //提交复写
  submitItem(evt) {
    evt.preventDefault();
    let isVaccine = $('input[name="isVaccine"]').val(),
      $form = this.$itemForm,
      FullItem = this.organizeItemDto($form),
      type = FullItem.item.id ? "PUT" : "POST";
    if($.query.get("ptype") == 6){
      FullItem.item.tags={"net_pre_publish":"1"};
    }
    if (this.validateDispath($form, FullItem)) {
      let _url = '/api/seller/items';
      if($.query.keys.ptype == 4){
        _url = $.query.keys.updata ? '/api/seller/items/block/update' : '/api/seller/items/block/create';
        type='POST';
        let $privateProtocol = $('input[name="privateProtocol"]:checked');
        if(!$.query.keys.updata && $privateProtocol.length === 0){
          new Modal({
            "icon": "info",
            "title": "请补全信息",
            "content": "请选择是否为私有协议商品"
          }).show(()=>{
            let pos = $('input[name="privateProtocol"]').offset().top - 90;
            $("body").animate({scrollTop: pos}, 400);
          });
          return;
        }
        else if(!$.query.keys.updata){
          let isPrivate = $('input[name="privateProtocol"]:checked').val();
          if(isPrivate == 1){
            _url += '?isPrivate=true'
          }
          else{
            _url += '?isPrivate=false'
          }
        }
      } else if ($.query.keys.ptype == 8) {//制造馆商品发布
        _url = FullItem.item.id ? "/api/seller/items/mfacture/update" : "/api/seller/items/mfacture/create";
      }
      if(isVaccine == '1'){
        _url = FullItem.item.id ? "/api/seller/items-vaccine/update" : "/api/seller/items-vaccine/create";
      }
      $("#js-item-submit").prop("disabled", true);
      $("body").spin("medium");
      $.ajax({
        url: _url,
        type: type,
        contentType: "application/json",
        data: JSON.stringify(FullItem),
        success: () => {
          this.confirmLeave();
          let userType = $('#userCategory').val();
          if(isVaccine == '1'){
            if(userType == '12'){
              window.location.href = "/seller/product-manage-vaccine?step=5";
            }
            else{
              window.location.href = "/seller/product-manage?step=1";
            }
          }
          else{
            window.location.href = "/seller/stock-manage";
          }
        },
        complete: () => {
          $("body").spin(false);
          $("#js-item-submit").prop("disabled", false)
        }
      })
    }
  }

  //提交前检查价格
  checkPriceChange(vm, event) {
    if ($("input[name=status]").val() != "1") {//判断商品是否上架,1为上架
      vm.submitItem(event);
      return false;
    }
    vm.checkItemdiscont([$("input[name=id]").val()]);
    if (!examine) {
      vm.submitItem(event);
      return false;
    }
    var flag = true;
    let name = $("#input-name").val();
    $(".js-sku-price").each(function (i) {
      if (parseFloat($(this).data("price")) < parseFloat($(this).val())) {
        vm.checkItemAudit($("input[name=id]").val());
        if (auditCheck) {
          new Modal({
            "icon": "error",
            "title": "操作失败",
            "content": "该商品您已提交价格申请,待审核"
          }).show();
          flag = false;
        } else {
          let priceExamine = $(priceExamineTemplate({name}));
          let _modal = new Modal(priceExamine);
          _modal.show();
          $(".js-examine-submit").on("click", function () {
            $(".js-examine-submit").prop("disabled", true);
            $("#auditComment").val($("#js-examine-reason").val());
            _modal.close();
            vm.submitItem(event);
          });
          flag = false;
        }
        return flag;
      }
    });

    if (flag) {
      vm.submitItem(event);
    }
    return false;
  }

//检查商品是否已经申请过价格上涨(价格上涨)
  checkItemAudit(itemId) {
    $("body").spin("medium");
    $.ajax({
      async: false,
      url: "/api/seller/items/check-audit",
      type: "GET",
      data: {"itemId": itemId, "type": 1},
      success: (data) => {
        auditCheck = data;
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

//检查商品是否是协议商品(价格上涨)
  checkItemdiscont(itemIds) {
    $("body").spin("medium");
    $.ajax({
      async: false,
      url: "/api/seller/items/check-discount",
      type: "POST",
      data: {"itemIds": itemIds},
      success: (data) => {
        examine = data;
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

  // 复写获取当前可以作为销售属性的属性值
  getRealCanSkuKey() {
    let $skuArea = $(".js-sku-area", this.$target),
      skuKeys = _.map($skuArea, (i) => $(i).data("key") + "");
    let a = [];
    $(".attribute-data").each(function (index, element) {
      let attrs = $(element).data("attr")
      if(attrs){
        a = $.merge(a, attrs)
      }
    });
    this.canSkuAttrs = this.getOriginCanSkuKey(a);
    return _.difference(this.canSkuAttrs, skuKeys)
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
    self.$province.on('change', function () {
      let provinceId = $(this).val()
      self.$city.data('pid', provinceId)
      self.initRegionSelect(self.$city)
    })
    self.$city.on('change', function () {
      let cityId = $(this).val()
      self.$region.data('pid', cityId)
      self.initRegionSelect(self.$region, '', 'region')
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
    if (data && Array == data.constructor) {
      let item
      let len = data.length
      let i
      for (i = 0; i < len; i++) {
        item = data[i]
        if (item.id == id) {
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
   * @param pId {String}
   */
  initCountrySelect($select, callback) {
    let self = this
    let pId = $select.data('pid')
    let url = `/api/address/streets?regionId=${pId}`
    $.ajax({
      url: url,
      dataType: 'json',
      delay: 500,
      success: function (data) {
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
        if (id) {
          id = parseInt(id)
          selectedIndex = self.getSelectedIndex(countries, id)
        }
        $select.html(options)
          .prop('selectedIndex', selectedIndex)
          .selectric('refresh')
        if ('function' === typeof callback) {
          callback.call($select[0], $select.val())
        }
      },
      error: function (e) {
        console.log(e)
      }
    })
  }

  /**
   * 初始化单个行政区划选择下拉框
   * @param $select {jQuery}
   * @param pId {String}
   * @chenji at 170122 fix bug
   *  @type region有'请选择'这个option，index要加1
   */
  initRegionSelect($select, callback, type) {
    let self = this
    let pId = $select.data('pid')
    let url = `/api/address/streets?regionId=${pId}`
    $.ajax({
      url: url,
      dataType: 'json',
      delay: 500,
      success: function (data) {
        let options = self.initOptions(data)
        let selectedIndex = 0
        let id = $select.data('id')
        if (id) {
          id = parseInt(id)
          selectedIndex = self.getSelectedIndex(data, id)
          if('region' == type){
            selectedIndex++
          }
        }
        $select.html(options)
          .prop('selectedIndex', selectedIndex)
          .selectric('refresh')
        $select.trigger('change')
        if ('function' === typeof callback) {
          callback.call($select[0], $select.val())
        }
      },
      error: function (e) {
        console.log(e)
      }
    })
  }

  initOptions(options) {
    let v = [], t;
    if(options[0].level == 3){
      t = `<option value ="">请选择区/县</option>`
      v.push(t)
     }
    $.each(options, function (i, n) {
      t = `<option value ="${n.id}">${n.name}</option>`
      v.push(t)
    })
    return v.join('')
  }

  initCountryOptions(options) {
    let v = [], t
    let id = 1
    $.each(options, function (i, n) {
      if (id != n.id) {
        t = `<option value ="${n.id}">${n.name}</option>`
        v.push(t)
      }
    })
    return v.join('')
  }

  fileUpload() {
    let $self = $("#wysihtml5-editor-toolbar input[name=file]"),
      $imageInput = $("#wysihtml5-editor-toolbar .image-input")

    $self.fileupload({
      url: "/api/user/files/upload",
      dataType: "html",
      done: (evt, data) => {
        let url = JSON.parse(data.result)[0].userFile.path
        $imageInput.val(url)
      }
    })
  }

  registerSkuInfo() {
    let skus = this.$jsSkuTableArea.data("sku"),
      skuObject = {};
    _.each(skus, i => {
      if(i.attrs){
        let keys = i.attrs.slice();
        keys.sort((a,b)=> a.attrKey < b.attrKey );
        i.skuAttributeKeyAndValue = _.map(keys, (v) => v.attrKey && v.attrVal ? `${v.attrKey}:${v.attrVal}` : 0).join(";")
        skuObject[`${i.skuAttributeKeyAndValue}`] = i
      }
    })

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

  /**
   * 初始化popover显示
   * */
  popoverEvents(){
    let $info = '<div>商品代码是商家定义商品唯一性的编码，便于管理</div>'
    $('.js-item-code-popover').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      content: $info,
      delay: {
        hide: 100
      }
    })
  }

}

module.exports = ItemPublish;
