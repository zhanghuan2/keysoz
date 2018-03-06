const Modal = require("pokeball/components/modal")

const attributeTemplate = Handlebars.templates["seller/spu_detail/common/templates/attribute_template"],
      skuAttibuteTemplate = Handlebars.templates["seller/spu_detail/common/templates/sku_attribute"],
      skuTableTemplate = Handlebars.partials["seller/spu_detail/common/all_templates/_sku_table"],
      itemImageTemplate = Handlebars.templates["seller/spu_detail/common/templates/image"],
      skuValueTemplate = Handlebars.partials["seller/spu_detail/common/templates/_sku_value"],
      attributeImageTemplate = Handlebars.partials["seller/spu_detail/common/all_templates/_attribute_image"],
      skuInfoTemplate = Handlebars.partials["seller/spu_detail/common/all_templates/_sku_info"],
      attributeDropDownTemplate = Handlebars.partials["seller/spu_detail/common/all_templates/_attribte_dropdown"],
      attributeInputTemplate = Handlebars.partials["seller/spu_detail/common/all_templates/_attribute_input"],
      attrErrorTipTemplate = Handlebars.templates["seller/spu_detail/common/templates/attribute_error_tip"]

const Properties = require("extras/properties")

export default class SpuPublish {
  constructor ($) {
    this.$jsExtendAttribute = $("#js-extend-attribute")
    this.$jsExtendSkuAttribute = $("#js-extend-sku-attribute")
    this.$jsCategoryAttibuteList = $("#js-category-attribute-list")
    this.$jsSkuAttributeArea = $("#js-sku-attribute-area")
    this.$jsExtendSkuAttributeArea = $("#js-extend-sku-attribute-area")
    this.$jsItemMainImage = $("#js-item-main-image")
    this.$jsSkuInfoArea = $("#js-sku-info-area")
    this.$itemForm = $("#js-item-form")
    this.$jsSkuTableArea = $("#js-sku-table-area")
    this.$jsNewAttributeList = $("#js-new-attribute-list")
    this.$brandSearch = $("#js-item-brand")
    this.canSkuAttrs = this.getOriginCanSkuKey(this.$jsCategoryAttibuteList.data("attr"))
    this.bindEvent()
  }

  // 事件绑定和委托
  bindEvent () {
    this.$el.on("click", ".js-select-sku-attr", evt => this.selectSkuAttribute(evt))
    $(".js-input-datepicker").datepicker()
    $(() => $(".dropdown").dropdown({
      onInitialize: ($el) => {
        this.initCategoryAttrValueType($el)
        return true
      },
      onAppend: (text, $el) => {
        return this.validateAttributeValue($.trim(text), $el)
      },
    }))

    if (this.$itemForm.data("id")) {
      this.registerSkuInfo()
      this.renderSkuSelectedAttribute()
    }
    this.$jsExtendAttribute.on("click", evt => this.extendNewAttributes(evt))
    this.$jsExtendSkuAttribute.on("click", evt => this.extendSkuAttributes(evt))
//  this.$el.on("click", ".js-item-image", evt => this.itemImagesUpload(evt))
    this.bindFormEvent()
    this.$el.on("click", ".js-edit-sku-value", evt => this.editSkuAttributeValue(evt))
    this.$el.on("click", ".js-delete-sku", evt => this.deleteSku(evt))
//  this.$el.on("click", ".js-attribute-image", evt => this.attributeImagesUpload(evt))
    this.$el.on("click", ".js-delete-user-attr", evt => this.deleteAttibuteItem(evt))
    this.$el.on("click", ".js-delete-image", evt => this.deleteItemImage(evt))
    this.$el.on("click", ".js-move-image", evt => this.moveImagePosition(evt))
//  $(window).on("beforeunload", evt => this.windowBeforeLoad(evt))
//  this.$el.on("confirm:leaveWindow", evt => this.confirmLeave(evt))
    this.searchBrand()
  }

  bindFormEvent () {
    this.$itemForm.off()
    this.$itemForm.validator({
      identifier: "input.js-need-validated,[required]:not(.js-attr-sku-val)",
      isErrorOnParent: true
    })
    this.$itemForm.on("submit", evt => this.submitSpu(evt))
  }

  validateDispath ($form, data) {
    if (this.validateMainImage(data.spu) & this.validateSkuAttr($form)) {
      $(".js-form-error-tip", $form).addClass("hide")
      return true
    } else {
      $(".js-form-error-tip", $form).removeClass("hide")
      return false
    }
  }

  validateSkuAttr ($form) {
    let $skuAttr = $(".js-sku-area", $form)
    return _.every($skuAttr, (i) => {
      let $checkedAttr = $(".js-select-sku-attr:checked", i)

      if ($checkedAttr.length > 0) {
        return true
      } else {
        $(i).addClass("error")
        return false
      }
    })
  }

  validateMainImage (spu) {
    if (spu.mainImage) {
      return true
    } else {
      this.$jsItemMainImage.addClass("error")
      return false
    }
  }

  validateAttributeValue (text, $el) {
    this.tipValueErrorRemove($el)
    let type = $el.data("type")
    switch (type) {
      case "STRING":
        return /^((?![:_;#]).){1,30}$/.test(text) ? true : this.tipValueError("不包含:_;#的1-30个字符", $el)
      case "DATE":
        return /^\d{4}-\d{2}-\d{2}$/.test(text) ? true : this.tipValueError("请输入日期", $el)
      default:
        return /^[+-]?\d+(\.\d+)?$/.test(text) ? true : this.tipValueError("请输入数字", $el)
    }
  }

  tipValueErrorRemove ($el) {
    $(".js-attribute-error", $el).remove()
  }

  tipValueError (message, $el) {
    $(".dropdown-menu", $el).append(attrErrorTipTemplate({message}))
  }

  // 未保存离开提示
  windowBeforeLoad (evt) {
    return "您正要离开此页面，未保存的更改将不被保存"
  }

  confirmLeave () {
    $(window).off("beforeunload")
  }

  initCategoryAttrValueType ($target) {
    let valueType = $target.data("type")
    if (valueType === "DATE") {
      $(".js-attr-val-input", $target).attr("readonly", true).datepicker()
    } else if (/_/.test(valueType)) {
      $(".js-attr-val-input", $target).data("type", "NUMBER")
    }
  }

  // 获取一开始可作为销售属性的key
  getOriginCanSkuKey (attrs) {
    return _.without(_.flatten(_.map(attrs, (i) => {
      if (i.attributeRule && i.attributeRule.attrMetasForK) {
        return i.attributeRule.attrMetasForK.SKU_CANDIDATE === "true" ? i.attrKey : 0
      } else if (i.attrMetasForK){
        return i.attrMetasForK.SKU_CANDIDATE === "true" ? i.attrKey : 0
      } else {
        return 0
      }
    })), 0)
  }

  // 获取当前可以作为销售属性的属性值
  getRealCanSkuKey () {
    let $skuArea = $(".js-sku-area", this.$target),
        skuKeys = _.map($skuArea, (i) => $(i).data("key"))

    return _.difference(this.canSkuAttrs, skuKeys)
  }

  //品牌筛选
  searchBrand () {
    this.$brandSearch.suggest({
      url: "/api/brands?name=",
      dataFormat: (data) => _.map(data, (i) => i.name),
      callback: (text) => {
        $.each(this.$brandSearch.data("source"), (i, d) => {
          if (d.name === text) this.$brandSearch.data("id", d.id).data("name", d.name)
        })
      }
    })
  }

  renderSkuSelectedAttribute () {
    let skus = this.$jsSkuTableArea.data("sku")

    _.each(skus, i => {
      _.each(i.attrs, (v) => {
        let input = $(`.js-select-sku-attr[name='${v.attrKey}'][value='${v.attrVal}']:not(:checked)`, this.$itemForm)
        input.trigger("click")
      })
    })
  }

  registerSkuInfo () {
    let skus = this.$jsSkuTableArea.data("sku"),
        skuObject = {};
    _.each(skus, i => {
      i.skuAttributeKeyAndValue = _.map(i.attrs, (v) => v.attrKey && v.attrVal ? `${v.attrKey}:${v.attrVal}` : 0).join(";")
      skuObject[`${i.skuAttributeKeyAndValue}`] = i
    })

    window.skuObject = skuObject
  }

  itemImagesUpload (evt) {
    evt.preventDefault()
    new Modal({toggle: "image-selector"}).show(imageUrl => {
      let $self = $(evt.currentTarget)
      if ($self.hasClass("js-main-image")) {
        if ($("img", $self).length) {
          $("img", $self).remove()
        }
        $self.prepend(itemImageTemplate({imageUrl, type: "main"}))
        $self.removeClass("empty error")
        $self.find("input").val(imageUrl)
      } else if ($self.hasClass("js-item-image-container")){
        $self.find("img").attr("src", imageUrl).data("src", imageUrl)
      } else {
        let newImage = $(itemImageTemplate({imageUrl}))
        $self.before(newImage)
      }
    })
  }

  // 删除图片
  deleteItemImage (evt) {
    evt.stopPropagation()
    $(evt.currentTarget).closest(".js-item-image").remove()
  }

  // 移动辅图位置
  moveImagePosition (evt) {
    evt.stopPropagation()
    let direct = $(evt.currentTarget).data("direct"),
        image = $(evt.currentTarget).closest(".js-item-image"),
        prev = $(image).prev(),
        next = $(image).next();
    if (direct === "left") {
      prev.before(image)
    } else {
      next.after(image)
    }
  }

  // 展开属性添加面板
  extendNewAttributes (evt) {
    if (this.$jsExtendAttribute.next().length === 0) {
      $(evt.currentTarget).addClass("hide")
      let attributeItem = $(attributeTemplate())
      this.$jsExtendAttribute.after(attributeItem)
      this.bindAttributeEvent(attributeItem)
    }
  }

  bindAttributeEvent (attributeItem) {
    $("select", attributeItem).selectric()
    $(".js-select-attr-val-type", attributeItem).on("change", evt => this.changeAttrValType(evt, attributeItem))
    $(".close", attributeItem).on("click", evt => this.closeAttribute(evt))
    $("form", attributeItem).validator({isErrorOnParent: true})
    $("form", attributeItem).on("submit", evt => this.submitAttribute(evt))
  }

  changeAttrValType (evt, attributeItem) {
    let val = $(evt.currentTarget).val(),
        unitInput = $(".js-attr-unit-input", attributeItem)
    switch (val) {
      case "STRING", "DATE":
        unitInput.addClass("hide")
        break
      case "NUMBER":
        unitInput.removeClass("hide")
        break
      default:
        unitInput.addClass("hide")
    }
  }

  // 提交属性数据
  submitAttribute (evt) {
    evt.preventDefault()
    let data = $(evt.currentTarget).serializeObject()

    data.attrVals = _.flatten([data.attrVal])

    let $attributeItem = $(attributeTemplate(data))
    this.$jsCategoryAttibuteList.append($attributeItem)
    $attributeItem.dropdown()
    this.$jsExtendAttribute.removeClass("hide")
    this.closeAttribute(evt)
  }

  // 单项删除属性
  deleteAttibuteItem (evt) {
    $(evt.currentTarget).closest(".js-category-attr").remove()
  }

  // 关闭属性面板
  closeAttribute (evt, skuArea) {
    $(evt.currentTarget).closest(".js-attribute-area").find(".js-attribute-new").removeClass("hide")
    $(evt.currentTarget).closest(".js-extend-template").remove()
    if (skuArea) skuArea.removeClass("hide")
  }

  // 展开添加sku属性面板
  extendSkuAttributes (evt) {
    if (this.$jsExtendSkuAttribute.next().length === 0) {
      let attrs = this.getRealCanSkuKey(),
          skuAttribute = $(skuAttibuteTemplate({editable: true, attrs}))
      this.$jsExtendSkuAttribute.after(skuAttribute)
      $("select", skuAttribute).selectric()
      this.bindSkuAttributeEvent(skuAttribute)
    }
  }

  // 绑定sku属性的操作事件
  bindSkuAttributeEvent (skuAttribute, skuArea) {
    this.$jsExtendSkuAttribute.addClass("hide")
    $(".close", skuAttribute).on("click", evt => this.closeAttribute(evt, skuArea))
    $("form .js-select-new-sku-key", skuAttribute).on("click", evt => this.addNewSku(evt))
  }

  editSkuAttributeValue (evt) {
    let $skuArea = $(evt.currentTarget).closest(".js-sku-area"),
        attrKey = $skuArea.data("key"),
        sku = _.map($skuArea.find(".js-select-sku-attr"), (i) => {
          return {attrKey, attrVal: $(i).val(), checked: $(i).prop("checked")}
        }),
        type = $skuArea.data("type").split("_")[0],
        skuAttribute = $(skuAttibuteTemplate({value: "true", data: sku, type, attrKey}))

    if (!$(".js-sku-value", $skuArea).length) {
      $skuArea.append(skuAttribute)
      this.bindSkuAttrValEvent(skuAttribute, $skuArea, type)
    }
  }

  bindSkuAttrValEvent (skuAttribute, $skuArea, type) {
    $(".js-sku-value", $skuArea).validator({isErrorOnParent: true})
    if (type == "DATE") {
      $(".datepicker", $skuArea).attr("readonly", true).datepicker()
    }
    $(".js-close", skuAttribute).on("click", evt => this.deleteSkuValue(evt))
    $("form", $skuArea).on("submit", evt => this.addNewSkuValue(evt, $skuArea))
  }

  addNewSkuValue (evt, skuArea) {
    evt.preventDefault()
    let $form = $(evt.currentTarget),
        data = $form.serializeObject(),
        skuValue = skuValueTemplate(data)

    $(skuArea).find(".js-sku-attr-vals").append(skuValue)
    $(".js-attr-val-container", $form).removeClass("success")
    $("input:text", $form).val("")
  }

  getCanSkuAttributesAndDisabled (attrKey) {
    let $attr = $(`.js-category-attr-input[data-key='${attrKey}']`),
        $groupItem = $(".js-group-item", $attr),
        $attrIcon = $attr.closest(".js-category-attr").find("i"),
        attrData = $attr.closest(".js-category-attr").data("attr"),
        $options = $(".js-dropdown-item", $attr),
        attributeRules = _.without(_.map($options, i => {
          let value = $(i).hasClass("js-attr-val") ? $(i).data("val") : $(i).find("span").text()
          return value != "" ? {attrVal: value, attrKey: attrData.attrKey} : 0
        }), 0),
        dropdown = $attr.data("dropdown")

    $groupItem.closest($groupItem.data("parent")).removeClass("error empty")
    $groupItem.removeAttr("required")
    $attrIcon.toggleClass("hide")
    dropdown.disable()

    return _.extend(attrData, {attributeRules})
  }

  addNewSku (evt) {
    let $form = $(evt.currentTarget).closest("form"),
        attrKey = $("select[name=attrKey]", $form).val(),
        data = this.getCanSkuAttributesAndDisabled(attrKey)

    if ($(".js-sku-area", this.$jsSkuAttributeArea).length < Properties.resource.spu.skuMostDimension) {
      let newSku = $(skuAttibuteTemplate(data))
      this.$jsExtendSkuAttributeArea.before(newSku)
      this.closeAttribute(evt)
    }
  }

  addSkuAttributeValue (evt, skuArea) {
    evt.preventDefault()
    let $valueInput = $(evt.currentTarget).find("input[name=value]"),
        value = $valueInput.val(),
        skuValue = $(skuValueTemplate({attrVal: value}))

    if (value) {
      $valueInput.val(null)
      if (skuArea) skuArea.remove()
      $(evt.currentTarget).find(".value-area").append(skuValue)
      $(".js-close", skuValue).on("click", evt => this.deleteSkuValue(evt))
    }
  }

  deleteSku (evt) {
    let $sku = $(evt.currentTarget)
    new Modal({
      icon: "info",
      title: "确认删除",
      isConfirm: true,
      overlay: true,
      content: "是否确认删除整个规格分组？"
    }).show( () => {
      this.revertAttributeStatus($sku)
    })
  }

  revertAttributeStatus ($sku) {
    let $skuArea = $sku.closest(".js-sku-area"),
        attrKey = $skuArea.data("key"),
        $groupItem = $(".js-group-item", $attr),
        $attr = $(`.js-category-attr-input[data-key='${attrKey}']`),
        $attrIcon = $attr.closest(".js-category-attr").find("i")

    $skuArea.remove()
    this.selectSkuAttribute()
    $attrIcon.toggleClass("hide")
    $groupItem.attr("required", $attr.data("required"))
    $attr.data("dropdown").enable()
  }

  attributeImagesUpload (evt) {
    evt.preventDefault()
    let $self = $(evt.currentTarget),
        attrKey = $self.data("key"),
        attrVal = $self.data("value")
    new Modal({toggle: "image-selector"}).show((image) => {
      $self.replaceWith(attributeImageTemplate({image, attrKey, attrVal}))
    })
  }

  deleteSkuValue (evt) {
    $(evt.currentTarget).closest(".js-sku-value").remove()
  }

  selectSkuAttribute (evt) {
    let attrs = _.map($(".js-sku-area:has(:checked)"), i => {
          $(i).removeClass("error")
          return {key: $(i).data("key")}}),
        values = _.map($(".js-sku-area:has(:checked)"), j => {
          return(_.map($(".js-select-sku-attr:checked", j), i => {
            return {attr: $(i).attr("name"), value: $(i).val()}
          })
        )}),
        data = {attrs, values: this.combine(values)};

    if (attrs.length) {
      this.renderSkuTable(data)
    } else {
      $("#js-price-and-stock").removeClass("hide")
      this.$jsSkuTableArea.empty()
    }

    this.bindFormEvent()
  }

  // 组合所有的sku属性，并序列化成可以渲染的结果
  combine (arr) {
    arr.reverse();

    let r = [];
    (function fn(t, a, n) {
      if (n == 0) return r.push(t);
      for (let i = 0; i < a[n-1].length; i++) {
        fn(t.concat(a[n-1][i]), a, n - 1);
      }
    })([], arr, arr.length)

    let row = [],
        rowspan = r.length;
    for(let n = arr.length-1; n > -1; n--) {
        row[n] = parseInt(rowspan/arr[n].length);
        rowspan = row[n];
    }
    row.reverse();

    let temp = $.extend(true, [], r),
        attrs = $.extend(true, [], r);
    _.each(r, (d, j) => {
      for (let index = 0; index < row.length; index ++) {
        let list = temp[j];

        if (j % row[index] == 0) {
          list[index].rowspan = row[index]
        }

        let sku = window.skuObject && window.skuObject[`${(_.map(list, i => `${i.attr}:${i.value}`)).join(";")}`]

        if (sku) {
          attrs[j] = _.extend(sku, {list})
        } else {
          attrs[j] = {list}
        }
      }
    })
    return attrs;
  }

  renderSkuTable (data) {
    $("#js-price-and-stock").addClass("hide")
    let skuTable = $(skuTableTemplate({data}))
    this.$jsSkuTableArea.html(skuTable)
    $("input", skuTable).on("focusout", evt => this.addSkuInfo(evt))
  }

  addSkuInfo (evt) {
    let skuObject = window.skuObject || {},
        skus = _.flatten(_.values(skuObject)) || [],
        keys = _.keys(skuObject) || [],
        $jsSkuTr = $(evt.currentTarget).closest("tr"),
        originPrice = centFormat($jsSkuTr.find(".js-sku-origin-price").val()),
        platformPrice = centFormat($jsSkuTr.find(".js-sku-platform-price").val()),
        sku = {
          skuAttributeKeyAndValue: $jsSkuTr.data("key"),
          stockQuantity: $jsSkuTr.find("input.js-sku-quantity").val(),
          price: centFormat($jsSkuTr.find("input.js-sku-price").val()),
          outerSkuId: $jsSkuTr.find("input.js-sku-out-id").val(),
          extraPrice: {platformPrice, originPrice}
        }

    if (_.contains(keys, sku.skuAttributeKeyAndValue)) {
      _.each(skuObject, (i, j) => {
        if (i.skuAttributeKeyAndValue === sku.skuAttributeKeyAndValue) {
          _.extend(i, sku)
        }
      })
    } else {
      skuObject[`${sku.skuAttributeKeyAndValue}`] = sku
    }

    window.skuObject = skuObject
  }

  organizeItemBaseInfo (form) {
    let item = $(form).serializeObject()
    item.originPrice = centFormat(item.originPrice)
    if (this.$brandSearch.data("id")) {
      item.brandId = this.$brandSearch.data("id")
      item.brandName = this.$brandSearch.data("name")
    }
    item.extra = this.organizeItemExtra(form)
    return item
  }

  organizeItemExtra (form) {
    let unit = $.trim(form.find("input[name=unit]").val()) || "件",
        selfPlatformLink = $.trim(form.find("input[name=selfPlatformLink]").val())
    return {unit, selfPlatformLink}
  }

  organizeItemDetailImages (form) {
    let $imagesContainers = $(".js-item-image.item-image:not(#js-item-main-image)", form),
        images = _.map($imagesContainers, (d) => {
          let $image = $(d).find("img"),
              name = $image.data("name"),
              url = $image.data("src")
          return {url, name}
        })
    return {images}
  }

  organizeSkuInfo (form) {
    let skuInfo = _.map($(".js-sku-table-area:not(.hide) .js-sku-tr", form), i => {
      let data = $(i).data("attr"),
          id = $(i).data("id"),
          originPriceValue = $.trim($(i).find("input.js-sku-origin-price").val()),
          originPrice = originPriceValue == "" ? "" : centFormat(originPriceValue),
          attrs = data ? _.map(data, d => ({"attrKey": d.attr, "attrVal": d.value})) : null,
          extraPrice = {originPrice},
          sku = {id, attrs, extraPrice}

      return sku
    })
    return skuInfo
  }

  organizeOtherAttributeInfo (form) {
    let attrs = _.without(_.map($(".js-group-item:not(:disabled)", form), i => {
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

    let groupAttrs = _.groupBy(attrs, (i) => i.group)
    return _.map(groupAttrs, (otherAttributes, group) => ({group, otherAttributes}))
  }

  organizeSkuAttributeInfo (form) {
    let skus = _.flatten(_.map($(".js-sku-area:has(:checked)", form), i => {
      let showImage = $(".js-sku-show-image", i).prop("checked")

      return _.map($(".js-select-sku-attr", i), j => {
        let $input = $(j),
            attrKey = $input.attr("name"),
            attrVal = $input.val(),
            unit = $input.data("unit"),
            image = $input.closest(".js-sku-item").find(".js-attribute-image").data("src");
        return {attrKey, attrVal, image, showImage, unit}
      })
    }))

    let groupSku = _.groupBy(skus, (i) => i.attrKey)
    return skus.length ? _.map(groupSku, (skuAttributes, attrKey) => ({attrKey, skuAttributes})) : null
  }

  organizeItemDto ($form) {
    let spu = this.organizeItemBaseInfo($form),
        spuDetail = this.organizeItemDetailImages($form),
        groupedSkuAttributes = this.organizeSkuAttributeInfo($form),
        skuTemplates = this.organizeSkuInfo($form),
        groupedOtherAttributes = this.organizeOtherAttributeInfo($form)

    return {spu, spuDetail, groupedSkuAttributes, skuTemplates, groupedOtherAttributes}
  }

  submitSpu (evt) {
    evt.preventDefault()
    let $form = this.$itemForm,
        fullSpu = this.organizeItemDto($form),
        type = fullSpu.spu.id ? "PUT" : "POST"
    if (this.validateDispath($form, fullSpu)) {
      $("body").spin("medium")
      $.ajax ({
        url: "/api/spu",
        type: type,
        contentType: "application/json",
        data: JSON.stringify(fullSpu),
        success: (data) => {
          this.confirmLeave()
          $("body").spin(false)
          new Modal({icon: "success", content: "spu 保存成功！您可以关闭此窗口，继续其他操作。", title: "spu 保存成功！"}).show()
        }
      })
    }
  }
}
