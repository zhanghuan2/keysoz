const Modal = require("pokeball/components/modal"),
      ItemIssueTool = require('common/item_issue/view'),
      categoryPathTemplate = Handlebars.templates['seller/item_issue/templates/category_path'],
      baseInfoTemplate = Handlebars.templates['seller/item_issue/templates/base_info'],
      itemAttrsTemplate = Handlebars.templates['seller/item_issue/templates/item_attrs'],
      skuAttrsTemplate = Handlebars.templates['seller/item_issue/templates/sku_attrs'],
      priceStockTemplate = Handlebars.templates['seller/item_issue/templates/price_stock'],
      skuTableTemplate = Handlebars.templates['seller/item_issue/templates/sku_table'],
      attributeTemplate = Handlebars.templates['seller/item_issue/templates/attribute_template'],
      customAttrsTemplate = Handlebars.templates['seller/item_issue/templates/user_defined_attrs'],
      priceExamineTemplate = Handlebars.templates["seller/item_issue/templates/price_examine"],
      itemImageTemplate = Handlebars.templates["seller/item_issue/templates/image"],
      itemDetailEditorTemplate = Handlebars.templates["seller/item_issue/templates/rich_editor"],
      approveInfoTemplate = Handlebars.templates["seller/item_issue/templates/approve_info"],
      skuValueTemplate = Handlebars.partials["seller/item_issue/templates/_sku_value"],
      skuAttributeTemplate = Handlebars.templates["seller/item_issue/templates/sku_attribute"],
      remarkContentTemplate = Handlebars.templates["seller/item_issue/templates/remark_content"],
      spuAuditStatusTemplate = Handlebars.templates["seller/item_issue/templates/spu_audit_status"],
      spuChangedTipsTemplate = Handlebars.templates["seller/item_issue/templates/spu_changed_tips"],
      attributeImageTemplate = Handlebars.partials["seller/item_issue/templates/_attribute_image"],
      spuAuditFlowLogsTemplate = Handlebars.templates["seller/item_issue/templates/flow_logs"],
      attrErrorTipTemplate = Handlebars.templates["seller/item_issue/templates/attribute_error_tip"],
      enlargeImageTemplate = Handlebars.templates["seller/item_issue/templates/enlarge_image"]


const FormChecker = require('common/formchecker/view')
let examine, auditCheck
const $htmlBody = $('body')

class ItemIssueCommon {

  constructor($) {
    //页面参数初始化
    this.itemId = jQuery.query.get('itemId')
    this.spuAuditId = jQuery.query.get('spuAuditId')
    this.categoryId = jQuery.query.get('categoryId')
    this.spuId = jQuery.query.get('spuId')

    let $envParams = $('.js-env-params')
    try{
      this.envHref = $envParams.data('href')
      this.envUser = $envParams.data('user')
    }
    catch (e){
      console.log(e)
    }

    //ptype获取
    this.ptype = jQuery.query.get('ptype') || 1
    //内部选择器
    this.$baseInfo = $('.base-info')
    this.$normalAttrs = $('.normal-attribute')
    this.$otherAttrs = $('.other-attribute')
    this.$salesSpecification = $('.sales-specification')
    this.$priceStock = $('.price-stock')
    this.$customAttrs = $('.custom-attribute')
    this.$itemForm = $('#item-issue-form')
    this.$detailEditor = $('.item-detail-editor')
    this.$submitButton = $('#js-item-submit')
    this.$approveInfo = $('.approve-info')
    this.$remarkContent = $('.remark-content')
    this.$submitCheck = $('.js-submit-check')
    this.$spuAuditStatus = $('.spu-audit-status')
    this.$topTips = $('.top-tips')
    this.$selectedCategoryBox = $('.selected-category-box')

    this.preRender()
  }


  preRender(){
    $htmlBody.spin('medium')
    let categoryPath = this.$selectedCategoryBox.data('categoryPath')
    if (categoryPath) {
      this.$selectedCategoryBox.append(categoryPathTemplate({categoryPath, ptype: this.ptype, categoryId:this.categoryId, itemId: this.itemId, spuId: this.spuId}))
    }
    if (this.itemId) {//商品编辑
      this.getItemDetailInfo()
    } else if (this.spuAuditId && this.ptype == 5) {//查看SPU申请
      this.getSpuAuditInfo()
      this.getFlowLogs()
    } else if (this.spuId && this.ptype == 5) {//变更SPU申请
      this.getSpuDetailInfo()
    } else if (this.ptype == 5) {//发布SPU
      this.renderItemBaseInfo()
      this.getSpuAttribute()
    } else {//发布商品
      if (this.spuId) {//spu的标题和图片需要带过来
        let spuStr = sessionStorage.getItem(`spu-${this.spuId}`)
        try {
          let spuData = JSON.parse(spuStr),
            item = {
              name: spuData.name,
              mainImage: spuData.mainImage
            },
            images = [], imagesUrl
          if (spuData.extraImageUrls) {
            imagesUrl = spuData.extraImageUrls.split(',')
            _.each(imagesUrl, (url) => {
              images.push({url})
            })
          }
          this.renderItemBaseInfo(item, {images})
        } catch (e){
          this.renderItemBaseInfo()
        }
      } else {
        this.renderItemBaseInfo()
      }
      this.getCategoryAttributes()
    }
  }

  bindEvents () {

    this.$baseInfo.on('click', '.js-item-image', (evt) => this.itemImagesUpload(evt))
    this.$baseInfo.on('click', 'input[name=limit]', (evt) => this.showProductionPlace(evt))
    this.$baseInfo.on("click", ".js-delete-image", evt => this.deleteItemImage(evt))
    this.$baseInfo.on("click", ".js-move-image", evt => this.moveImagePosition(evt))
  
    if (this.$salesSpecification.length > 0){
      this.$salesSpecification.on("click", ".js-select-sku-attr", (evt) => this.selectSkuAttribute(evt))
      this.$salesSpecification.on('mousedown', '.js-sku-show-image', (evt) => this.willClickShowImage(evt))
      this.$salesSpecification.on('click', '.js-sku-show-image', (evt) => this.clickShowImage(evt))
      this.$salesSpecification.on("click", ".js-attribute-image", evt => this.attributeImagesUpload(evt))
    }
    if (this.$customAttrs.length > 0) {
      this.$customAttrs.on('click', '.js-attribute-new', (evt) => this.addNewAttribute(evt))
      this.$customAttrs.on("click", ".js-delete-user-attr", evt => this.deleteAttributeItem(evt))
    }
    if (this.$priceStock.length > 0) {
      this.$priceStock.on('click', '.js-batch-fill', (evt) => this.batchFillPriceAndStock(evt))
      this.$priceStock.on('change', '.js-sku-code', (evt) => {
        $(evt.currentTarget).removeClass('code-repeat')
      })
    }
    if (this.$salesSpecification.length > 0) {
      this.$salesSpecification.on("click", ".js-edit-sku-value", (evt) => this.editSkuAttributeValue(evt))
    }

    if (this.$approveInfo.length > 0) {
      this.$approveInfo.on('click', '.js-item-image', (evt) => this.itemImagesUpload(evt))
      this.$approveInfo.on("click", ".js-delete-image", evt => this.deleteItemImage(evt))
      this.$approveInfo.on("click", ".js-move-image", evt => this.moveImagePosition(evt))
    }

    if (this.$submitCheck.length > 0) {
      $('#js-item-submit').prop('disabled', true)
      this.$submitCheck.on('change', () => {
        $('#js-item-submit').prop('disabled', !this.$submitCheck.prop('checked'))
      })
    }

    $(window).on("beforeunload", (evt) => this.windowBeforeLoad(evt))

    $('.js-input-datepicker').datepicker()
    $('.dropdown').dropdown({
      onInitialize: ($el) => {
        this.initCategoryAttrValueType($el)
        return true
      },
      onAppend: (text, $el) => {
        return this.validateAttributeValue($.trim(text), $el)
      }
    })

    //勾选多选属性时，进行统计
    this.$normalAttrs.on('click', 'input[name="multiCheckbox"]', (evt) => this.countMultiCheck(evt))
    this.$otherAttrs.on('click', 'input[name="multiCheckbox"]', (evt) => this.countMultiCheck(evt))

    if(this.itemId){//商品编辑时，禁用不可修改属性
      $('input[data-modifiable=false]').prop('disabled', true)
    }

    if (this.$detailEditor.length > 0) {
      //富文本编辑器
      let editor = new wysihtml5.Editor("wysihtml5-editor", {
        toolbar: "wysihtml5-editor-toolbar",
        parserRules: wysihtml5ParserRules
      })
      editor.on("load", () => editor.composer)
      $(".wysihtml5-sandbox").addClass("text-tool-iframe").attr("id", "iframe-whsihtml5")
      let $editToolbar = $('#wysihtml5-editor-toolbar')
      $editToolbar.find("input[name=file]").fileupload({
        url: "/api/user/files/upload",
        dataType: "html",
        done: (evt, data) => {
          let url = JSON.parse(data.result)[0].userFile.path
          $editToolbar.find(".image-input").val(url)
        }
      })
    }

    $(window).on("scroll", () => this.dynamicRender())
  }

	bindEventsSmall(){
		this.$baseInfo.on('click', '.js-item-image', (evt) => this.itemImageEnlarge(evt))
		if (this.$approveInfo.length > 0) {
			this.$approveInfo.on('click', '.js-item-image', (evt) => this.itemImageEnlarge(evt))
		}
	}
  renderItemBaseInfo (item, itemDetail) {
    this.$baseInfo.append(baseInfoTemplate({item, itemDetail, ptype: this.ptype, categoryId:this.categoryId}))
	  this.popoverReferPrice()
	  new FormChecker({container : '.refer-price', ctrlTarget : false});
	  if (this.ptype != 5) {
	    this.popoverEvents()
      this.initRegionSelects()
    }
  }
	/**
	 * 商品图片点击放大
	 */
	itemImageEnlarge(evt){
		evt.preventDefault()
		if($(evt.target).attr("src")){
			let data = $(evt.target).attr("src")
			new Modal(enlargeImageTemplate(data)).show()
			return
		}
	}

  //获取品牌列表
  initBrandList(){
    let $brand = this.$itemForm.find('[name=select-brand]'),
      urlStr = '/api/brands/v2',   //获取品牌的ajax链接
      that = this;

    //搜索品牌
    $brand.select2({
      language: {
        "noResults": function () {
          return '未找到品牌信息,<a href="/seller/brand-creat" target="_blank">点击申请</a>'
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
            name: params.term.trim()
          }
        },
        error: function (e) {
          console.log(e)
        },
        processResults: function (data) {
          let brandNames = []
          if (data.length === 0) {
            return {results: brandNames};
          }
          $.each(data, function (i, n) {
            let option = {};
            option.id = n.id;
            option.text = n.fullName;
            brandNames.push(option);
          })
          return {
            results: brandNames
          }
        },
        cache: true
      }
    }).on('change', function () {
      let $selectedOption = that.$itemForm.find('select[name="select-brand"] option:selected'),
        name = $selectedOption.text()
        $('.js-item-brand-input').val(name)
    })

    let brand = $brand.data('brand')
    if (brand != undefined) {
      $brand.append("<option selected>" + brand + "</option>")
    }
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

	/**
	 * 初始化popover显示参考价提示
	 * */
	popoverReferPrice(){
		let $info = '<div>行业参考价为该品牌型号的普遍售价，主要用于价格参考，建议填写</div>'
		$('.js-refer-price-popover').popover({
			trigger: 'hover',
			placement: 'right',
			html: true,
			content: $info,
			delay: {
				hide: 100
			}
		})
	}
  //选择产地信息
  showProductionPlace (evt) {
    let limit = $(evt.currentTarget).val()
    this.$baseInfo.find('.limit-0,.limit-1').css('display', 'none')
    this.$baseInfo.find('.limit-' + limit).css('display', 'block')
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
   * @param callback {fun}
   */
  initCountrySelect($select, callback) {
    let self = this
    let pId = $select.data('pid')
    let url = `/api/zcy/address/streets?regionId=${pId}`
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
   * @param type {string}
   * @param callback {fun}
   *  @type region有'请选择'这个option，index要加1
   */
  initRegionSelect($select, callback, type) {
    let self = this
    let pId = $select.data('pid')
    let url = `/api/zcy/address/streets?regionId=${pId}`
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

  /****************** dropdown组件 ***********************/
  initCategoryAttrValueType ($target) {
    let valueType = $target.data("type")
    if (valueType === "DATE") {
      $(".js-attr-val-input", $target).attr("readonly", true).datepicker()
    } else if (/_/.test(valueType)) {
      $(".js-attr-val-input", $target).data("type", "NUMBER")
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
  /************************ end of dropdown ************/

  /**
   * 获取SPU信息
   */
  getSpuDetailInfo () {
    $.ajax({
      url: `/api/spu/${this.spuId}`,
      type: 'get',
      success: (result) => {
        let categoryPath = result.categoryPath
        if (categoryPath) {
          this.$selectedCategoryBox.append(categoryPathTemplate({categoryPath, ptype: this.ptype, categoryId:this.categoryId, itemId:true}))
        }
        let itemDetail = {images: result.zcySpu.images}
        this.renderItemBaseInfo(result.zcySpu, itemDetail)
        _.each(result.otherAttrs, (obj) => {
          this.$normalAttrs.append(itemAttrsTemplate(obj))
        })
        this.initBrandList()
        this.renderMultiInput()
        if($.query.get('update')){
          //申请SPU变更时需要重新上传证明材料
          this.$approveInfo.append(approveInfoTemplate())
          this.$remarkContent.append(remarkContentTemplate())
          this.bindEvents()
          this.bindFormEvent()
        } else if($.query.get('audit')){
          this.bindEvents()
          this.bindFormEvent()
        } else {
          $htmlBody.find('input,select').prop('disabled', true)
        }
        $htmlBody.spin(false)
      }
    })
  }

  /**
   * 获取SPU审核信息
   */
  getSpuAuditInfo () {
    let that = this
    $.ajax({
      url: `/api/spu/audit/${this.spuAuditId}`,
      type: 'get',
      success: (result) => {
        this.$spuAuditStatus.append(spuAuditStatusTemplate(result.zcyAuditWorkflow))
        let categoryPath = result.categoryPath
        if (categoryPath) {
          this.$selectedCategoryBox.append(categoryPathTemplate({categoryPath, ptype: this.ptype, categoryId:this.categoryId, itemId:true}))
        }
        let itemDetail = {images: result.zcySpu.images}
        this.renderItemBaseInfo(result.zcySpu, itemDetail)
        _.each(result.otherAttrs, (obj) => {
          this.$normalAttrs.append(itemAttrsTemplate(obj))
        })
        this.initBrandList()
        this.$approveInfo.append(approveInfoTemplate(result.zcySpu))
        this.$remarkContent.append(remarkContentTemplate(result.zcySpu))
        this.renderMultiInput()
        if($.query.get('update')){
          this.bindEvents()
          this.bindFormEvent()
        } else {
	        that.bindEventsSmall()
	        $htmlBody.find('input,select').prop('disabled', true)
        }
        $htmlBody.spin(false)
      }
    })
  }

  /**
   * 获取商品详细信息
   */
  getItemDetailInfo () {
    let queryData = {itemId: this.itemId, tag: ItemIssueTool.tagOfPtype(this.ptype)}
    if (this.spuId) {//有关联的spu
      queryData.spuId = this.spuId
    }
    $.when(
      $.ajax({
        url: '/api/zcy/items/findDetailById',
        type: 'get',
        data: queryData
      }),
      $.ajax({
        url: '/api/zcy/stocks/findAllValidWarehouses',
        type: 'get'
      })
    ).done((data1, data2) => {
      let itemInfo = data1[0],
          attrGroups = itemInfo.otherAttrs,
          skuAttrs = itemInfo.skuAttrs,
          richText = itemInfo.richText,
          userDefinedAttrs = null
      this.skuAndStocks = itemInfo.skuAndStocks
      this.warehouses = data2[0]
      _.each(attrGroups, (obj) => {
        if (obj.group == '普通属性') {
          this.$normalAttrs.append(itemAttrsTemplate(obj))
        } else if (obj.group == 'USER_DEFINED') {
          userDefinedAttrs = obj
        }else {
          this.$otherAttrs.append(itemAttrsTemplate(obj))
        }
      })
      this.renderItemBaseInfo(itemInfo.item, itemInfo.itemDetail)
      if (skuAttrs) {
        //销售属性进行排序
        _.each(skuAttrs, (obj) => {
          if (obj.skuAttributeWithRules && obj.skuAttributeWithRules.length > 0){
            obj.skuAttributeWithRules.sort((a, b) => {
              return a.attributeRule.attrKey < b.attributeRule.attrKey
            })
          }
        })
        this.$salesSpecification.append(skuAttrsTemplate({skuAttrs}))
        this.renderSkuImages()
      }
      this.$priceStock.html(priceStockTemplate({ptype: this.ptype, showStocks: false}))
      this.renderSkuTable()
      this.$customAttrs.append(customAttrsTemplate(userDefinedAttrs))
      this.$detailEditor.append(itemDetailEditorTemplate({data: richText}))
      this.initBrandList()
      this.bindEvents()
      this.renderSkuAndStocks()
      this.renderMultiInput()
      if (itemInfo.updatedBySpu) {
        this.$topTips.empty().append(spuChangedTipsTemplate())
      }
      let spuId = itemInfo.item.spuId
      if (spuId) {
        let categoryPath = this.$selectedCategoryBox.data('categoryPath')
        if (categoryPath) {
          this.$selectedCategoryBox.empty().append(categoryPathTemplate({categoryPath, ptype: this.ptype, categoryId:this.categoryId, itemId: this.itemId, spuId: spuId}))
        }
      }
      $htmlBody.spin(false)
      if (itemInfo.needRelateSpu) {//标准类目需要关联SPU
        new Modal({
          "icon": "info",
          "title": "温馨提示",
          "content": "该商品属于标品类目，需要关联SPU"
        }).show(() => {
          $(window).off("beforeunload")//取消离开时的弹窗提示
          let categoryPath = this.$selectedCategoryBox.data('categoryPath')
          window.location.href = `/seller/select-spu?ptype=${this.ptype}&categoryId=${itemInfo.item.categoryId}&itemId=${this.itemId}&categoryPath=${categoryPath}`
        })
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

  /**
   * 填充价格及库存数据
   */
  fillSkuAndStocks() {
    _.each(this.skuAndStocks, (obj) => {
      let sku = obj.sku,
        stock = obj.stock,
        attrArray = []
      if (sku && sku.attrs && sku.attrs.length > 0) {
        sku.attrs.sort((a, b) => {
          return a.attrKey < b.attrKey
        })
      }
      _.each(sku.attrs, (attr) => {
        attrArray.push(`${attr.attrKey}:${attr.attrVal}`)
      })
      let attrKey = attrArray.join(';'),
        $skuTr = this.$priceStock.find(`.js-sku-tr[data-key="${attrKey}"]`)
      $skuTr.attr('data-id', sku.id)
      $skuTr.find('.js-sku-code').val(sku.skuCode)
      $skuTr.find('.js-sku-code').data('key', sku.id || 'skuCode')
      $skuTr.find('.js-stock-quantity').val(sku.stockQuantity)
      $skuTr.find('.js-sku-platform-price').val((sku.extraPrice.platformPrice/100).toFixed(2))
      $skuTr.find('input[name=warehouseCode]').val(stock.warehouseCode)
      if (this.ptype == 4) {
        $skuTr.find('.js-sku-price').val('')
      } else if(sku.extraPrice.changedPrice) {
        $skuTr.find('.js-sku-price').replaceWith(`原价：<input type="text" class="sku-price-input" data-price="${(sku.price / 100).toFixed(2)}" value="${(sku.price / 100).toFixed(2)}">&nbsp;元
        变更后价：<input type="text" class="sku-price-input" data-price="${(sku.extraPrice.changedPrice / 100).toFixed(2)}" value="${(sku.extraPrice.changedPrice / 100).toFixed(2)}>`)
      } else {
        let skuPirce = (sku.price/100).toFixed(2)
        $skuTr.find('.js-sku-price').val(skuPirce)
        $skuTr.find('.js-sku-price').data('price', skuPirce)
      }
    })
  }

  //多选---勾选已选择内容
  renderMultiInput(){
    let $multiInput = $('.js-multi-input')
    if($multiInput.length>0){
      $.each($multiInput,function(i,n){
        let multiValue = $(n).data('multiValue') + ''//保证转换成字符串
        if(multiValue != '' && multiValue.trim() != ''){
          let valList = multiValue.split('#')
          if(valList.length > 0) {
            $.each(valList,function(j,m){
              $(n).find(`label[name="${m.replace(/\\/g,"\\\\")}"]`).find('input').prop('checked',true)
            })
            $(n).data('selectedCount', valList.length)
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

  /**
   * 类目属性获取
   */
  getCategoryAttributes () {
    let queryData = {categoryId: this.categoryId, tag: ItemIssueTool.tagOfPtype(this.ptype)}
    if (this.spuId) {
      queryData.spuId = this.spuId
    }
    $.when(
      $.ajax({
        url: '/api/zcy/attributes/groupAttributes',
        type: 'get',
        data: queryData
      }),
      $.ajax({
        url: '/api/zcy/stocks/findAllValidWarehouses',
        type: 'get'
      })
    ).done((data1, data2) => {
      let attrGroups = data1[0]
      this.warehouses = data2[0]
      _.each(attrGroups, (obj) => {
        if (obj.group == '销售规格') {
          this.$salesSpecification.append(skuAttrsTemplate(obj))
        } else if (obj.group == '普通属性') {
          this.$normalAttrs.append(itemAttrsTemplate(obj))
        } else {
          this.$otherAttrs.append(itemAttrsTemplate(obj))
        }
      })
      let showStocks = true
      if(this.ptype == 3) {
        showStocks = false
      }
      this.$priceStock.html(priceStockTemplate({ptype: this.ptype, showStocks}))
      this.renderSkuTable()
      this.$customAttrs.append(customAttrsTemplate())
      this.$detailEditor.append(itemDetailEditorTemplate())
      this.initBrandList()
      this.renderMultiInput()
      this.bindEvents()
      $htmlBody.spin(false)
    })
  }

  /**
   * SPU属性获取
   */
  getSpuAttribute () {
    this.categoryId = $.query.get('categoryId')
    $.ajax({
      url: '/api/zcy/attributes/groupAttributesForSpu',
      type: 'get',
      data: {categoryId: this.categoryId},
      success: (result) => {
        _.each(result, (obj) => {
          this.$normalAttrs.append(itemAttrsTemplate(obj))
        })
        this.$approveInfo.append(approveInfoTemplate())
        this.$remarkContent.append(remarkContentTemplate())
        this.initBrandList()
        this.renderMultiInput()
        this.bindEvents()
        this.bindFormEvent()
        $htmlBody.spin(false)
      }
    })
  }

  /**
   * 获取SPU流转日志
   */
  getFlowLogs () {
    let queryUrl = this.spuId ? `/api/spu/audit/logs?spuId=${this.spuId}` : `/api/spu/audit/${this.spuAuditId}/logs`
    $.ajax({
      url: queryUrl,
      type: 'get'
    }).done((result) => {
      $('.js-flow-log').empty().append(spuAuditFlowLogsTemplate({data: result}))
    })
  }


  /**
   * 添加自定义销售属性值
   * @param evt
   * @returns {boolean}
   */
  editSkuAttributeValue (evt) {
    let $skuArea = $(evt.currentTarget).closest(".js-sku-area"),
      attrKey = $skuArea.data("key"),
      sku = _.map($skuArea.find(".js-select-sku-attr"), (i) => {
        return {attrKey, attrVal: $(i).val(), checked: $(i).prop("checked")}
      }),
      type = $skuArea.data("type").split("_")[0],
      skuAttribute = $(skuAttributeTemplate({value: "true", data: sku, type, attrKey}))

    if (!$(".js-sku-value", $skuArea).length) {
      $skuArea.append(skuAttribute)
      this.bindSkuAttrValEvent(skuAttribute, $skuArea, type)
    }

    return false
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

  deleteSkuValue (evt) {
    $(evt.currentTarget).closest(".js-sku-value").remove()
  }
  /**
   * 允许取消选择显示sku图片
   * @param evt
   */
  willClickShowImage (evt) {
    evt.currentTarget.previousValue = $(evt.target).prop('checked')
  }
  clickShowImage (evt) {
    if (evt.currentTarget.previousValue) {
      $(evt.currentTarget).prop('checked', false)
      evt.stopPropagation()
    } else {
      if($(evt.currentTarget).closest('.js-sku-area').find('.js-select-sku-attr:checked').length === 0 ) {
        new Modal({
          "icon": "info",
          "title": "温馨提示",
          "content": "必须勾选此规格下一个以上的值才能显示此sku图片"
        }).show()
        $(evt.currentTarget).prop('checked', false)
      }
    }
  }

  /*渲染sku属性值图片*/
  renderSkuImages () {
    this.$salesSpecification.find('.js-sku-attr-vals').each((i, el) => {
      let images = $(el).data('images'),
        attrKey = $(el).data('key')
      if (images && images.length > 0) {
        _.each(images, (obj) => {
          $(el).find(`.attribute-image[data-value="${obj.attrVal}"]`)
               .replaceWith(`<img src="${obj.imageUrl}" 
                                  class="attribute-image js-attribute-image" 
                                  data-src="${obj.imageUrl}"
                                  data-key="${attrKey}" 
                                  data-value="${obj.attrVal}"/>`)
        })
      }
    })
  }

  //选中sku时渲染价格库存表格
  selectSkuAttribute (evt) {
    //没勾选任何值时，自动取消显示此sku图片
    if (evt && $(evt.currentTarget).closest('.js-sku-area').find('.js-select-sku-attr:checked').length === 0) {
      $(evt.currentTarget).closest('.js-sku-area').find('.js-sku-show-image').prop('checked', false)
    }
    let $checkedAttrs =  $(".js-sku-area:has(:checked)"),
      attrs = _.map($checkedAttrs, i => {
        $(i).removeClass("error")
        return {key: $(i).data("key")}
      }),
      values = _.map($checkedAttrs, j => {
        return(_.map($(".js-select-sku-attr:checked", j), i => {
            return {attr: $(i).attr("name"), value: $(i).val()}
          })
        )}),
      data = {attrs, values: this.combine(values)}
    
    this.renderSkuTable(data)
    this.fillSkuAndStocks()
  }

  renderSkuTable (data) {
    let showStocks = true
    //疫苗及编辑商品时不显示库存
    if (this.ptype == 3 || this.itemId) {
      showStocks = false
    }
    let skuTable = $(skuTableTemplate({data, warehouses: this.warehouses, ptype: this.ptype, showStocks}))
    this.$priceStock.find('.js-sku-table-area').empty().append(skuTable)
    //异步执行
    setTimeout(() => {
      _.each(this.$priceStock.find('select'), (e) => {
        if (ItemIssueTool.isElementInViewport(e)) {
          $(e).selectric()
        }
      })
    }, 0)
    this.$priceStock.on('change', '.js-warehouse-select', (evt) => {
      let opt = $(evt.currentTarget).find('option:selected')
      $(evt.currentTarget).closest('td').find('input[name=warehouseCode]').val(opt.val())
    })
    this.bindFormEvent()
  }

  dynamicRender () {
    _.each(this.$priceStock.find('select'), (e) => {
      if (ItemIssueTool.isElementInViewport(e)) {
        if (!$(e).is(':hidden')){
          $(e).selectric()
        }
      }
    })
  }

  //组合所有的sku属性，并序列化成可以渲染的结果
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

  bindFormEvent() {
    let vm = this
    this.$itemForm.off()
    this.$itemForm.validator({
      identifier: "input.js-need-validated,[required]:not(.js-attr-sku-val)",
      isErrorOnParent: true,
      errorCallback: this.tryNavToError,
      after: function (event) {
        return vm.checkPriceChange(vm, event);
      }
    })
  }

  //尝试定位到第一个输入出错的地方
  tryNavToError() {
    let errors = $(".error")
    if (_.size(errors) > 0) {
      let firstError = _.first(errors);
      // 低 90 像素
      let pos = $(firstError).offset().top - 90
      $('body,html').animate({scrollTop: pos}, 400)
    }
  }

  //提交前检查价格
  checkPriceChange(vm, event) {
    let itemId = $("input[name=id]").val(),
        itemStatus = $("input[name=status]").val(),
        itemName = $('#input-name').val();
    if (itemStatus != '1') {//判断商品是否上架,1为上架
      vm.submitItem(event)
      return false
    }

    vm.checkDiscount([itemId]);
    if (!examine) {
      vm.submitItem(event)
      return false
    }
    let flag = true
    $('.sku-price-input.js-sku-price').each(function () {
      if (parseFloat($(this).data("price")) < parseFloat($(this).val())) {
        vm.checkItemAudit(itemId)
        if (auditCheck) {
          new Modal({
            "icon": "error",
            "title": "操作失败",
            "content": "该商品您已提交价格申请,待审核"
          }).show();
          flag = false;
        } else {
          let priceExamine = $(priceExamineTemplate({itemName}))
          let examineModal = new Modal(priceExamine)
          examineModal.show()
          $(".js-examine-submit").on("click", function () {
            $(".js-examine-submit").prop("disabled", true);
            $("#auditComment").val($("#js-examine-reason").val());
            examineModal.close();
            vm.submitItem(event);
          })
          flag = false
        }
        return flag
      }
    })
    if (flag) {
      vm.submitItem(event)
    }
    return false
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
  checkDiscount(itemIds) {
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

  /**
   * 批量填写价格库存
   */
  batchFillPriceAndStock (evt) {
    evt.stopPropagation()
    let $batchFillArea = $(evt.currentTarget).closest('.batch-fill-area'),
      $tableArea = $batchFillArea.siblings('.js-sku-table-area'),
      price = $batchFillArea.find('.js-sku-price').val(),
      stock = $batchFillArea.find('.js-sku-stock').val(),
      platformPrice = $batchFillArea.find('.js-platform-price').val()
    if (price) {
      $tableArea.find('.js-sku-price').val(price).trigger('blur')
    }
    if (stock) {
      $tableArea.find('.js-stock-quantity').val(stock).trigger('blur')
    }
    if (platformPrice) {
      $tableArea.find('.js-sku-platform-price').val(platformPrice).trigger('blur')
    }
  }


  /**
   * 统计多选属性选中个数，方便校验必填时是否有值
   */
  countMultiCheck (evt) {
    let $multiInput = $(evt.currentTarget).closest('.js-multi-input'),
      count = $multiInput.find('input[name="multiCheckbox"]:checked').length
    $multiInput.data('selectedCount', count)
  }

  /**
   * 商品图片上传
   * @param evt
   */
  itemImagesUpload (evt) {
    evt.preventDefault()
    if($(evt.target).attr("src")){
      let data = $(evt.target).attr("src")
	    new Modal(enlargeImageTemplate(data)).show()
	    return
    }
    $(evt.currentTarget).removeClass('error')
    new Modal({toggle: "image-selector"}).show(imageUrl => {
      let $self = $(evt.currentTarget)
      if(!isImg(getUploadUrlSuffix(imageUrl))) {//不是图片格式
        ZCY.error('错误', '图片格式必须是PNG或JPG');
        return false
      }
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
    //限制上传文件格式
    $("#js-image-upload").attr("accept", "image/png,image/jpg,image/jpeg");

    function isImg(str)  {  
      if(str.search("[.]+(jpg|jpeg|png|JPG|JPEG|PNG)$"))  
      {  
          return false;
      }  
      return true;  
    }  
    // 截取url后面的文件类型
    function getUploadUrlSuffix(urlStr){
        var url = urlStr.substring(urlStr.lastIndexOf("\."),urlStr.length);
        return url;
    }
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

  /**
   * 添加销售属性图片
   * @param evt
   */
  attributeImagesUpload (evt) {
    evt.preventDefault()
    let $self = $(evt.currentTarget),
      attrKey = $self.data("key"),
      attrVal = $self.data("value")
    new Modal({toggle: "image-selector"}).show((image) => {
      $self.replaceWith(attributeImageTemplate({image, attrKey, attrVal}))
    })
  }

  /*
   * 添加自定义属性
   */
  addNewAttribute(evt) {
    if ($(evt.currentTarget).next().length === 0) {
      $(evt.currentTarget).addClass("hide");
      let attributeItem = $(attributeTemplate());
      $(evt.currentTarget).after(attributeItem);
      this.bindAttributeEvent(attributeItem)
    }
    return false
  }

  /**
   * 单项删除属性
   */
  deleteAttributeItem (evt) {
    $(evt.currentTarget).closest(".js-category-attr").remove()
    return false
  }

  /**
   * 绑定自定义属性事件
   * @param attributeItem
   */
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
      case "STRING":
        unitInput.addClass("hide")
        break
      case "DATE":
        unitInput.addClass("hide")
        break
      case "NUMBER":
        unitInput.removeClass("hide")
        break
      default:
        unitInput.addClass("hide")
    }
  }

  //关闭自定义属性面板
  closeAttribute (evt) {
    $(evt.currentTarget).closest(".js-attribute-area").find(".js-attribute-new").removeClass("hide")
    $(evt.currentTarget).closest(".js-extend-template").remove()
  }

  //复写提交属性数据
  submitAttribute(evt) {
    evt.preventDefault();
    let data = $(evt.currentTarget).serializeObject();

    data.attrVals = _.flatten([data.attrVal]);

    let $attributeItem = $(attributeTemplate(data));
    $(evt.currentTarget).parents(".js-attribute-area").find(".js-category-attribute-list").append($attributeItem);
    $attributeItem.dropdown();
    $(evt.currentTarget).parents(".new-attribute-area").find(".js-attribute-new").removeClass("hide");
    this.closeAttribute(evt)
  }

  /**
   * 提交商品信息
   * @param evt
   */
  submitItem(evt) {
    evt.preventDefault();
    let self = this,
      FullItem = this.organizeItemDto(this.$itemForm),
      type = FullItem.item.id ? "PUT" : "POST"//区分新增和编辑
 
    if (!this.checkSkuCodes()) {
      new Modal({
        icon: 'error',
        title: '温馨提示',
        content: 'skuCode不能重复'
      }).show(() => {
        let pos = $($('.code-repeat')[0]).offset().top - 90;
        $('body,html').animate({ scrollTop: pos }, 400);
      })
      return
    }  
    if (this.validateDispatch(this.$itemForm, FullItem)) {
      let requestUrl = '/api/seller/items';
      if (self.ptype == 2){
        type = "POST"//网超新增修改都使用post
        requestUrl = FullItem.item.id ? '/api/seller/items/netsuper/update' : '/api/seller/items/netsuper/create'
      } else if(self.ptype == 4){
        requestUrl = FullItem.item.id ? '/api/seller/items/block/update' : '/api/seller/items/block/create'
        type='POST';
        let $privateProtocol = $('input[name=privateProtocol]:checked')
        if(!FullItem.item.id && $privateProtocol.length === 0){
          new Modal({
            "icon": "info",
            "title": "请补全信息",
            "content": "请选择是否为私有协议商品"
          }).show(()=>{
            let pos = $('input[name=privateProtocol]').offset().top - 90;
            $('body,html').animate({scrollTop: pos}, 400);
          });
          return;
        } else if(!FullItem.item.id) {
          let isPrivate = $privateProtocol.val();
          if(isPrivate == 1){
            requestUrl += '?isPrivate=true'
          }
          else{
            requestUrl += '?isPrivate=false'
          }
        }
      } else if(self.ptype == 3){
        requestUrl = FullItem.item.id ? '/api/seller/items-vaccine/update' : '/api/seller/items-vaccine/create'
      } else if (self.ptype == 5) {
        requestUrl = '/api/zcy/spu'
        type = FullItem.item.spuId ? 'put' : 'post'
      } else if(self.ptype == 6){//网超预发布商品
        FullItem.item.tags={"net_pre_publish":"1"};
      } else if(self.ptype == 8){//制造馆商品
        type = 'post'
        requestUrl = FullItem.item.id ? '/api/seller/items/mfacture/update' : '/api/seller/items/mfacture/create'
      }
      this.$submitButton.prop("disabled", true)
      $("body").spin("medium");
      $.ajax({
        url: requestUrl,
        type: type,
        contentType: "application/json",
        data: JSON.stringify(FullItem),
        success: () => {
          $(window).off("beforeunload")//取消离开时的弹窗提示
          if(self.ptype == 3){
            //疫苗商品没有库存直接跳转到管理页面
            window.location.href = "/seller/product-manage-vaccine?step=5"
          } else if (self.ptype == 5) {
            if (this.envUser.currentCategory == '99'){
              window.location.href = `${this.envHref.tradeAdmin}/categories/spu-list-operate`
            }
            else{
              window.location.href = "/seller/spus/spus-list"
            }
          } else{
            window.location.href = "/seller/stock-manage"
          }
        },
        complete: () => {
          $htmlBody.spin(false)
          self.$submitButton.prop('disabled', false)
        }
      })
    }
  }

  /**
   * skuCode是否重复的校验
   */
  checkSkuCodes () {
    let pass = true
    if (this.$priceStock) {
      let map = {}
      _.each(this.$priceStock.find('.js-sku-code'), (el) => {
        let value = $(el).val()
        if (!map[`key-${value}`]) {
          map[`key-${value}`] = true
        } else {
          pass = false
          $(el).addClass('code-repeat')
        }
      }) 
    }
    return pass
  }

  /**
   * 组织商品信息
   * @param form
   * @returns {{item: *, itemDetail: ({images}|*), groupedSkuAttributes: *, skus: *, groupedOtherAttributes: *}}
   */
  organizeItemDto(form) {
    let item = this.organizeItemBaseInfo(form),
      itemDetail = this.organizeItemDetailImages(form),
      groupedSkuAttributes = this.organizeSkuAttributeInfo(form),
      skus = this.organizeSkuInfo(form),
      stocks = this.organizeStocks(form),
      richText = this.organizeRichText(form),
      groupedOtherAttributes = this.organizeOtherAttributeInfo(form)
    if (this.ptype == 5) {
      let authImages = this.organizeApproveInfo(form)
      if (authImages.length > 0) {
        item.authImages = authImages
      }
      item.images = itemDetail.images
      item.memo = this.$remarkContent.find('.js-remark-content-input').val()
      return {item, zcySpu: item, groupedOtherAttributes}
    }
    return {item, itemDetail, groupedSkuAttributes, skus, stocks, richText, groupedOtherAttributes}
  }

  organizeItemBaseInfo (form) {
    let item = $(form).serializeObject()
    item.originPrice = centFormat(item.originPrice)
    let $brandSearch = this.$baseInfo.find('[name=select-brand]')
    if ($brandSearch.data("id")) {
      item.brandId = $brandSearch.data("id")
      item.brandName = $brandSearch.data("name")
    }
    item.extra = this.organizeItemExtra(form)
    item.origin = this.organizeItemOrigin(form)
    return item
  }

  organizeItemExtra(form) {
    let selfPlatformLink = $.trim(form.find("input[name=selfPlatformLink]").val())
    return {selfPlatformLink}
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

  organizeItemDetailImages (form) {
    let $imagesContainers = $(".js-item-detail-images .js-item-image.item-image:not(#js-item-main-image)", form),
      images = _.map($imagesContainers, (d) => {
        let $image = $(d).find("img"),
          name = $image.data("name"),
          url = $image.data("src")
        return {url, name}
      })
    return {images}
  }

  organizeApproveInfo (form) {
    let $imagesContainers = $(".js-approve-info .js-item-image:not(.empty)", form)
      return _.map($imagesContainers, (d) => {
        let $image = $(d).find("img"),
          name = $image.data("name"),
          url = $image.data("src")
        return {url, name}
      })
  }

  organizeSkuInfo (form) {
    return _.without(_.map($(".js-sku-table-area:not(.hide) .js-sku-tr", form), i => {
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
        sku = {price, stockQuantity, skuCode, id, attrs, extraPrice}

      if(this.ptype == 4){
        return sku
      }
      return sku.price ? sku : 0;
    }), 0)
  }

  organizeStocks(form) {
    return _.without(_.map($(".js-sku-table-area:not(.hide) .js-sku-tr", form), i => {
      let warehouseCode = $(i).find('input[name=warehouseCode]').val(),
        skuCode = $(i).find("input.js-sku-code").val(),
        quantity = $(i).find("input.js-stock-quantity").val();
      if(!quantity){
        quantity = 0;
      }
      return {skuCode, warehouseCode, quantity};
    }), 0)
  }

  organizeOtherAttributeInfo (form) {
    let attrs = _.without(_.map($(".js-group-item", form), i => {
      let $input = $(i),
        attrKey = $input.data("key"),
        group = $input.data("group"),
        unit = $input.data("unit"),
        propertyId = $input.data('propertyId'),
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
        return {propertyId, attrKey, attrVal, group, unit}
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

  organizeRichText() {
    return $("#iframe-whsihtml5").contents().find("body").html()
  }

  /**
   * 数据校验
   * @param $form
   * @param data
   * @returns {boolean}
   */
  validateDispatch ($form, data) {
    if (this.ptype == 5 && this.validateMainImage(data.item) && this.validateOtherImage(data.item) && this.validateSkuAttr($form) && this.validateApproveInfo(data.item) && this.validateMultiCheckAttrs($form)){
      $(".js-form-error-tip", $form).addClass("hide")
      return true
    }else if (this.validateMainImage(data.item) && this.validateSkuAttr($form) && this.validateSkuInfo(data.skus) && this.validateMultiCheckAttrs($form)) {
      $(".js-form-error-tip", $form).addClass("hide")
      return true
    } else {
      $(".js-form-error-tip", $form).removeClass("hide")
      return false
    }
  }

  /**
   * 销售规格现在全部展开,必填的销售规格至少勾选一个
   * @param $form
   * @returns {boolean}
   */
  validateSkuAttr ($form) {
    let $skuAttr = $(".js-sku-area.required-sku", $form)
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

  validateSkuInfo (skus) {
    if (skus && skus.length) {
      return true
    } else {
      this.$salesSpecification.addClass("error")
      return false
    }
  }

  validateMainImage (item) {
    if (item.mainImage) {
      return true
    } else {
      this.$baseInfo.find('#js-item-main-image').addClass("error")
      return false
    }
  }

  validateOtherImage (item) {
    if (item.images.length > 0) {
      return true
    } else {
      this.$baseInfo.find('.js-add-other-image').addClass("error")
      return false
    }
  }

  validateApproveInfo (item) {
    if (this.$approveInfo.length === 0){
      return true
    }
    if (item.authImages) {
      return true
    } else {
      this.$approveInfo.find('.js-add-approve-info').addClass('error')
      return false
    }
  }

  validateMultiCheckAttrs ($form) {
    let $multiInput = $('.js-multi-input', $form),
      pass = true
    _.each($multiInput, (el) => {
      if ($(el).data('required') && $(el).data('selectedCount') == 0) {
        $(el).addClass('error')
        pass = false
        return false
      }
    })
    return pass
  }

  //未保存离开提示
  windowBeforeLoad () {
    return '您正要离开该页面，未保存更改将不被保存'
  }
}

module.exports = ItemIssueCommon
