const Modal = require("pokeball/components/modal");
const Pagination = require('pokeball/components/pagination');
const deliveryListTemplate = Handlebars.templates["seller/item_publish/common/templates/delivery_list"];
const OriginItemPublish = require("seller/item_publish/common/view");
const priceExamineTemplate = Handlebars.templates["seller/item_publish/common/templates/price_examine"];
const attributeTemplate = Handlebars.templates["seller/item_publish/common/templates/attribute_template"];
const productListModalTpl = Handlebars.templates["agreement/item_publish/common/templates/productListModal"];
const productListTpl = Handlebars.templates["agreement/item_publish/common/templates/productList"];
const imgTpl = Handlebars.templates["agreement/item_publish/common/templates/img"];

let examine, auditCheck, richEditor;

class ItemPublish extends OriginItemPublish {
  constructor(config) {
    super(config);
    this.isMedical = $.query.keys.tag === 'medical';
    console.log(this.isMedical);
    this.checkSpuRelated()
    this.renderMultiInput(true)
    this.bindFormEvent();
  }

  checkSpuRelated () {
    let $itemEditPanel = $('.item-publish-with-item')
    let needRelateSpu = $itemEditPanel.find('input[name="needRelateSpu"]').val()
    if (needRelateSpu) {
      new Modal({
        "icon": "info",
        "title": "温馨提示",
        "content": "该商品属于标品类目，需要关联SPU"
      }).show(() => {
        let categoryPath = $itemEditPanel.find('input[name="categoryPath"]').val(),
          goodId = $.query.get('goodId'),
          categoryId = $itemEditPanel.find('input[name="categoryId"]').val()
        $(window).off("beforeunload")//取消离开时的弹窗提示
        window.location.href = `/seller/select-spu?ptype=7&categoryId=${categoryId}&itemId=${goodId}&categoryPath=${categoryPath}`
      })
    }
  }
  //多选---勾选已选择内容
  renderMultiInput(firstRender){
    let $multiInput = $('.js-multi-input')
    if($multiInput.length>0){
      $.each($multiInput,function(i,n){
        let multiValue = $(n).data('multiValue')
        if(multiValue && multiValue != '' && multiValue.trim() != ''){
          let valList = multiValue.split('#')
          if(valList.length>0){
            $.each(valList,function(j,m){
              let $input = $(n).find(`label[name="${m.replace(/\\/g,"\\\\")}"]`).find('input')
              if (firstRender || !$input.prop('disabled')) {
                $input.prop('checked',true)
              }
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
    let that = this;
    this.isEdit = $("#goodsId").val() ? true : false;
    //shopId
    this.shopId = $("#shopId").val();
    //类目id
    this.categoryId = $("[name='categoryId']").val();

    //协议入围域名
    this.protocolEnv = $("#protocolEnv").val();

    //品牌
    this.$selectBrand = $('#js-item-brand');
    //关联协议
    this.$project = $('#js-item-project');
    //自定义属性 添加属性的按钮
    this.$jsExtendAttribute = $(".js-attribute-new").not("#js-extend-sku-attribute");

    $("select").not(".noselectric").selectric();
    if(!this.isEdit){
      //初始化品牌
      that.initBrandList();
    } else {
      $("[name='select-brand']").append("<option selected>" + $('.js-item-brand-input').val() + "</option>")
    }
    //初始化产地数据
    that.initRegionSelects();
    //初始化协议列表
    that.initAgreementList();

    $("body").on("keyup", "#js-examine-reason", function () {
      $(this).val() != "" && $(".js-examine-submit").attr("disabled", false);
      $(this).val() == "" && $(".js-examine-submit").attr("disabled", true);
    });

    //初始化型号，事件绑定
    this.initModal();

    //选择商品事件绑定
    this.showProdutBtnEventBind();

    this.priceEventBind();
    //产地 radiobox 事件绑定
    this.originRadioBoxEventBind();

    //编辑器初始化
    this.initEditor();

    if (this.$itemForm.data("id")) {
      this.registerSkuInfo();
      this.renderSkuSelectedAttribute();
    }

    super.bindEvent();

    //编辑页面无法编辑商品名称、品牌、型号
    if(this.isEdit){
      this.setInputReadonly();
    }
  }

  setInputReadonly(){
    let $modal = $(".xhbox input"),
        $brand = $("#js-item-brand");
    $modal.attr("disabled",true);
    $modal.unbind("focus").unbind("blur").unbind("input");
    //编辑时允许修改商品标题－20180226
    // $("#input-name").attr("disabled",true);
    let id = $brand.data("id");
    if (id != undefined) {
      $brand.attr("disabled", true);
      $brand.append("<option value=" + id + ">" + $brand.data("name") + "</option>");
    }
    $('input[data-key=型号]').attr("disabled", true)
  }

  //品牌初始化
  initBrandList(){
    let $brand = $("[name='select-brand']"),
        urlStr = '/api/brands/v2',   //获取品牌的ajax链接
        that = this;

    //搜索品牌
    $brand.select2({
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
          }
        },
        error: function (e) {
          console.log(e);
        },
        processResults: function (data) {
          var brandNames = [];
          if (data.length === 0) {
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
      let $selectedOption = $('select[name="select-brand"] option:selected'),
          id = $selectedOption.val(),
          name = $selectedOption.text();
      $('.js-item-brand-input').val(name);
      $brand.data("id", id);
      $brand.data("name", name);
      $(".xhbox input").val("");
      $(".xhbox input").attr("value", "");
      //通过接口获取型号数据列表
      // that.showSpecListBox();
    });

    let brand = $brand.data('brand')
    if (brand != undefined) {
      $brand.append("<option selected>" + brand + "</option>")
    }
  }

  //初始化型号，事件绑定
  initModal(){
    let $modal = $(".xhbox input"),
        that = this;
    $modal.on("focus", function () {
      $(".xhbox .search_box").show();
    }).on("blur", function () {
      $modal.attr("value", $(this).val());
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
      let id = $(this).data("brandid"),
          _content = $(this).val(),
          _categoryId = $("input[name=categoryId]").val(),
          param = {
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
        that.initSpeciList([]);
      } else {
        //从服务端获取型号列表
        $.ajax({
          url: "/api/zcy/specifications/list",
          contentType: "application/json",
          data: param,
          success: (data) => {
            that.initSpeciList(data);
          }
        });
      }
    });

    //选取型号列表 事件绑定
    $(".xhbox").on("click", "li", function () {
      if ($(this).hasClass("noneli")) {
        return;
      }
      let brand = $('select[name="select-brand"] option:selected').text(),
          xhName = $(this).text();
      $(".xhbox input").val(xhName);
      $(".xhbox input").attr("value", xhName);
      $(".xhbox .error").removeClass("error empty").addClass("success");
      $("#input-name").val(brand + xhName);
    });
  }

  //协议列表初始化
  initAgreementList(){
    let orgId = $("#orgId").val(),//供应商ID
        url = `/api/agrgoods/listProjects?supplierId=${orgId}`;
    this.$project.select2({
      language: {
        "noResults": function () {
          return '未找到协议信息';
        }
      },
      placeholder: "请选择",
      escapeMarkup: function (markup) {
        return markup
      },
      ajax: {
        url: url,
        dataType: "json",
        delay: 500,
        error: function (e) {
          console.log(e);
        },
        processResults: function (data) {
          let agreementNames = [];
          if (data.length === 0) {
            return {results: agreementNames};
          }
          $.each(data, function (i, item) {
            var option = {};
            option.id = item.proId;
            option.text =`${item.protocolName||""}(${item.bidContent})`;
            agreementNames.push(option);
          });
          return {
            results: agreementNames
          }
        },
        cache: true
      }
    }).on("select2:select", function(e){
      let $selectedOption = $('select[name="select-project"] option:selected'),
          proId = $selectedOption.val(),
          proName = $selectedOption.text();
      $("#js-item-project").data("id", proId).data("name", proName);
      $.ajax({
        url : "/api/agreement/listEffectiveDists",
        type : "GET",
        data : {
          proId: proId
        },
        success: function(res){
          let disCodeAttr=[],
              distNameAttr=[];
          for(var i in res){
            disCodeAttr.push(res[i].distCode);
            distNameAttr.push(res[i].distName);
          }
          $("#regionId").data("id",disCodeAttr.join(",")).html(distNameAttr.join(","));
        }
      });
    });

    let proId = this.$project.data("id");
    if (proId) {
      this.$project.append("<option value=" + proId + ">" + this.$project.data("name") + "</option>");
      this.$project.trigger("change");
    }
  }

  //选择商品事件绑定
  showProdutBtnEventBind(){
    let that = this;
    $("#js-showProductList-btn").on("click", function(e){
      $.ajax({
        url : "/api/agreement/selectItem",
        data : {
          shopId : that.shopId,
          categoryId : that.categoryId,
          pageNo : 1,
          pageSize : 10
        },
        success: function(data){
          let productListHtml = productListModalTpl(data);
          new Modal(productListHtml).show(function(){
            let id = $(".productListModal").find(":radio:checked").next("[name='itemId']").val();
            if(id){
              that.selectProduct(id);
              this.close();
            }else{
              this.close();
            }
          });
          that.initPagination(function(pageNo, pageSize){
            $.ajax({
              url : "/api/agreement/selectItem",
              data : {
                shopId : that.shopId,
                categoryId : that.categoryId,
                pageNo : pageNo+1,
                pageSize : pageSize
              },
              success: function(res){
                let productList = productListTpl(res);
                $(".productListModal .productList tbody").html(productList);
              }
            })
          });
          that.searchBtnEventBind();
        }
      });
    });
  }

  //搜索栏
  searchBtnEventBind(){
    let that = this;
    $("#searchBtn").on("click", function(){
      let goodsName = $.trim($(".productListModal").find("[name='goodsName']").val());
      if(goodsName){
        $.ajax({
          url : "/api/agreement/selectItem",
          data : {
            name : goodsName,
            shopId : that.shopId,
            categoryId : that.categoryId,
            pageNo : 1,
            pageSize : 10
          },
          success: function(res){
            let productList = productListTpl(res);
            $(".productListModal .productList tbody").html(productList);
            $(".pagination").data("size", 10).data("total", res.total);
            that.initPagination(function(pageNo, pageSize){
              $.ajax({
                url : "/api/agreement/selectItem",
                data : {
                  name : goodsName,
                  shopId : that.shopId,
                  categoryId : that.categoryId,
                  pageNo : pageNo+1,
                  pageSize : pageSize
                },
                success: function(res){
                  let productList = productListTpl(res);
                  $(".productListModal .productList tbody").html(productList);
                }
              });
            });
          }
        });
      }
    });
  }

  //选择商品渲染
  selectProduct(id){
    let that = this;
    $.ajax({
      url : "/api/agreement/editItem",
      data : {
        itemId : id
      },
      success: function(res){
        let spuId = $.query.get('spuId')
        //item属性
        if(res.item){
          //商品名字
          res.item.name && $("#input-name").val(res.item.name);
          //品牌
          if(!spuId && res.item.brandId){//有spu时不允许修改品牌
            // that.$selectBrand.data("id", res.item.brandId);

            that.$selectBrand.data("brand", res.item.brandName);
            that.$selectBrand.append("<option selected>" + res.item.brandName + "</option>");
            var _value = $(".xhbox input").val();
            that.$selectBrand.trigger("change");
            if (_value) {
              $(".xhbox input").val(_value);
              $(".xhbox input").attr("value", _value);
            }
            that.$selectBrand.trigger("change");
          }
          //型号
          if(!spuId) {//有spu时不允许修改型号
            res.item.specification && $("#input-specification").val(res.item.specification);
          }

          //主图
          if(res.item.mainImage){
            if($(".image-area .main-image img").length > 0){
              $(".image-area .main-image img").attr("src", res.item.mainImage);
            }else{
              $(".image-area .main-image").remove(".image-tip-add");
              $(".image-area .main-image").prepend("<img src=\""+res.item.mainImage+"\">");
            }
            $(".image-area").find("input[name='mainImage']").val(res.item.mainImage);
          }

          //副图
          if(res.itemDetail && res.itemDetail.images && res.itemDetail.images.length > 0){
            let imgListHtml = imgTpl(res.itemDetail.images);
            $(".image-area .js-images-list .js-item-image-container").remove();
            $(".image-area .js-images-list").prepend(imgListHtml);
          }

          //上市时间
          if(res.item.extra && res.item.extra.birthday){
            $("#input-birthday").val(res.item.extra.birthday);
          }

          //商品代码
          res.item.itemCode && $("#input-itemCode").val(res.item.itemCode);

          //计量单位
          if(res.item.extra && res.item.extra.unit){
            $("#input-unit").val(res.item.extra.unit);
          }

          //重量
          if(res.item.extra && res.item.extra.weight){
            $("#input-weight").val(res.item.extra.weight);
          }

          //生产厂商
          if(res.item.extra && res.item.extra.firm){
            $("#input-firm").val(res.item.extra.firm);
          }

          //是否需要安装
          if(res.item.extra && res.item.extra.needInstalled){
            $("#input-needInstalled").val( res.item.extra.needInstalled);
            $("#input-needInstalled")
              .prop('selectedIndex', res.item.extra.needInstalled == 1 ? 1 : 2)
              .selectric('refresh');
          }

          //自营平台
          if(res.item.extra && res.item.extra.selfPlatformLink){
            $("#input-selfPlatformLink").val(res.item.extra.selfPlatformLink);
          }

          //详情回填
          if (res.richText) {
            $(document.getElementById('iframe-whsihtml5').contentWindow.document.body).html(res.richText)
          }

          //产地
          if(res.item.origin){
            if(res.item.origin.limit == 0){
              $("[name='provinceId']").data("id", res.item.origin.provinceId);
              $("[name='provinceId']").data("name", res.item.origin.province && res.item.origin.province.name);
              $("[name='cityId']").data("pid", res.item.origin.provinceId);
              $("[name='cityId']").data("id", res.item.origin.cityId);
              $("[name='regionId']").data("pid", res.item.origin.cityId);
              $("[name='regionId']").data("id", res.item.origin.regionId);
              $("[name='limit']").eq(0).trigger("click");
            }else {
              $("[name='countryId']").data("id", res.item.origin.countryId);
              $("[name='limit']").eq(1).trigger("click");
            }
            //初始化产地数据
            that.initRegionSelects();
          }
        }

        //商品属性
        let attrs = [];
        for(let i in res.otherAttrs){
          let groups = res.otherAttrs[i],
              groupAttrs = groups.otherAttributeWithRules;
          for(let j in groupAttrs){
            let attr = groupAttrs[j],
                attrKey = attr.attributeRule && attr.attributeRule.attrKey,
                attrVal = attr.attrVal,
                valueType = attr.attributeRule.property ? attr.attributeRule.property.valueType : 1
            if (!spuId || (attrKey != '品牌' && attrKey != '型号')){//有spu时不允许修改品牌
              setGroupAttr(attrKey, attrVal, valueType);
            }
          }
        }

        //设置属性
        function setGroupAttr(attrKey, attrVal, valueType){
          let $wrap = $(".propertyContainer");
          if (valueType == 2) {
            $wrap.find("div[data-key='"+attrKey+"']").data('multiValue', attrVal)
            $wrap.find("div[data-key='"+attrKey+"']").attr('data-multi-value', attrVal)
          } else {
            let $input = $wrap.find("input[data-key='"+attrKey+"']")
            if (!$input.prop('disabled')){
              $wrap.find("input[data-key='"+attrKey+"']").val(attrVal)
            }
          }
        }

        /*输入框 按钮 重新绑定*/
        that.dropdownBind();
        that.bindFormEvent();
        $("#js-extend-attribute").bind("click", function(e){
          that.extendNewAttributes(e);
        });
        that.renderMultiInput(false);
      }
    });
  }

  //下拉框绑定
  dropdownBind(){
    let that = this;
    $(".dropdown").dropdown({
      onInitialize: function($el){
        that.initCategoryAttrValueType($el);
        return true;
      },
      onAppend: function(text, $el){
        return that.validateAttributeValue($.trim(text), $el)
      }
    });
  }

  //初始化分页控件
  initPagination(cbk){
    this.totalItems = $('.pagination').data('total')
    this.pagination = new Pagination('.pagination').total(this.totalItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true,
      callback : function (curr, pageSize){
        cbk && cbk(curr, pageSize);
      }
    });
  }

  //市场价、协议价事件绑定
  priceEventBind(){
    let $marketPrice = $("#js-marketPrice"),
        $agreementPrice = $("#js-agreementPrice"),
        $rate = $("#rate"),
        that = this,
        t = null;
    $marketPrice.on("keyup blur", function(){
      t && clearTimeout(t);
      t = setTimeout(()=>{
        let marketPrice = $(this).val() &&  Number($(this).val()),
            agreementPrice = $agreementPrice.val() && Number($agreementPrice.val());


        if(that.isPrice(marketPrice) && that.isPrice(agreementPrice)){
          if(marketPrice < agreementPrice){
            $(this).parent(".group-content").attr("class","group-content error unvalid");
          }else{
            that.setRate(marketPrice, agreementPrice);
          }
        }
      },500);
    });
    $agreementPrice.on("keyup blur", function(){
      t && clearTimeout(t);
      t = setTimeout(()=>{
        let agreementPrice = $(this).val() && Number($(this).val()),
            marketPrice = $marketPrice.val() && Number($marketPrice.val());
        if(that.isPrice(agreementPrice) && that.isPrice(marketPrice)){
          if(marketPrice < agreementPrice){
            $(this).parent(".group-content").attr("class","group-content error unvalid");
          }else{
            that.setRate(marketPrice, agreementPrice);
          }
        }
      },500);
    });
  }

  //设置优惠率
  setRate(marketPrice, agreementPrice){
    let rate = (marketPrice-agreementPrice)/marketPrice;
    rate = (rate*100).toFixed(2);
    let index = rate.indexOf("."),
        intNum,
        decNum;
    if(index > -1){
      intNum = rate.substring(0, index);
      decNum = parseInt(rate.substring(index+1,index+3));
      if(decNum ===0){
        rate = intNum;
      }else if(decNum < 10){
        rate = intNum + ".0" + decNum;
      }else if(!(decNum%10)){
        rate = intNum + "."+ decNum/10;
      }else{
        rate = intNum + "."+ decNum;
      }
    }

    $("#rate").text(rate+"%");
  }


  //产地radio时间绑定
  originRadioBoxEventBind(){
    //产地radio group值this
    let $originLimit = $('[name="limit"]', this.$el),
        that = this;

    $originLimit.on('click', function () {
      let limit = $originLimit.filter(':checked').val(),
          $limitBlocks = that.$el.find('.limit-0,.limit-1');
      $limitBlocks.css('display', 'none');
      that.$el.find('.limit-' + limit).css('display', 'block');
    });
  }

  //重写图片上传
  itemImagesUpload (evt) {
    super.itemImagesUpload(evt);
    $("#js-image-upload").attr("accept","image/png,image/jpg");
    $("input.image-address.js-image-address").hide();
  }

  //显示型号列表
  showSpecListBox() {
    let that = this,
        $brand = $("[name='select-brand']"),
        id = $brand.data("id"),
        _categoryId = $("input[name=categoryId]").val(),
        url = "/api/zcy/specifications/list";

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
      that.initSpeciList([]);
      return;
    }
    $.ajax({
      url: url,
      contentType: "application/json",
      data: _data,
      success: (data) => {
        that.initSpeciList(data);
      }
    });
  }

  //型号列表
  initSpeciList(data) {
    let $specInput = $("#input-specification"),
        box = "<div class='search_box' style='display: none'><ul>" +
      "</ul>" +
      "</div>";
    $specInput.parent().find(".search_box").length == 0 && $specInput.parent().append(box);
    $specInput.parent().find(".search_box ul").empty();

    if (data.length === 0) {
      let listr = "<li class='noneli'>无此型号...</li>";
      $specInput.parent().find(".search_box ul").append(listr);
      return;
    }

    $.each(data, function (i, v) {
      let listr = "<li>" + v.content + "</li>";
      $specInput.parent().find(".search_box ul").append(listr);
    })
  }

  //初始化编辑器
  initEditor(){
    richEditor = new wysihtml5.Editor("wysihtml5-editor", {
      toolbar: "wysihtml5-editor-toolbar",
      parserRules: wysihtml5ParserRules
    });
    richEditor.on("load", () => richEditor.composer)
    $(".wysihtml5-sandbox").addClass("text-tool-iframe").attr("id", "iframe-whsihtml5")
    this.fileUpload();
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


  // 复写表单事件、validate绑定
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
  }

  // 尝试定位到第一个输入出错的地方
  tryNavToError(unvalidFields) {
    console.log(unvalidFields);
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
      countryName = form.find('select[name="countryId"] option:selected').text(),
      provinceId = parseInt(form.find('select[name="provinceId"]').val() || '0'),
      provinceName = form.find('select[name="provinceId"] option:selected').text(),
      cityId = parseInt(form.find('select[name="cityId"]').val() || '0'),
      cityName = form.find('select[name="cityId"] option:selected').text(),
      regionId = parseInt(form.find('select[name="regionId"]').val() || '0'),
      regionName = form.find('select[name="regionId"] option:selected').text();
    if(regionName == "请选择区/县"){
      regionName = "";
    }
    return {limit, countryId, countryName, provinceId, provinceName, cityId, cityName, regionId, regionName}
  }

  // 复写获取item信息
  organizeItemBaseInfo(form) {
    let item = $(form).serializeObject();
    item.originPrice = centFormat(item.originPrice);
    item.shopId = $("#shopId").val();
    item.specification = $("#input-specification").val();
    item.name = $("#input-name").val();
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

      case '6':
        item.status = -1
        item.isNetSuper = false
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
    //发布协议商品无需显示销售属性

    // let attrs = _.map($(".js-sku-area:has(:checked)"), i => {
    //     $(i).removeClass("error");
    //     return {key: $(i).data("key")}
    //   }),
    //   values = _.map($(".js-sku-area:has(:checked)"), j => {
    //     return (_.map($(".js-select-sku-attr:checked", j), i => {
    //         return {attr: $(i).attr("name"), value: $(i).val()}
    //       })
    //     )
    //   }),
    //   skus = this.$jsSkuTableArea.data("sku"),
    //   warehouses = this.$jsSkuTableArea.data("warehouses"),
    //   data = {attrs, values: this.combine(values), skus, warehouses};
    //
    // if (attrs.length) {
    //   this.renderSkuTable(data)
    // } else {
    //   $("#js-price-and-stock").find(".js-sku-platform-price").attr("required", "required");
    //   $("#js-price-and-stock").removeClass("hide");
    //   $("#js-price-and-stock").find(".js-sku-code").prop("required", true);
    //   this.$jsSkuTableArea.empty()
    // }
    //
    // this.bindFormEvent()
  }

  // 复写append价格库存输入框
  renderSkuTable(data) {
    //协议商品无需展示价格库存信息


    // $("#js-price-and-stock").find(".js-sku-platform-price").removeAttr("required");
    // $("#js-price-and-stock").addClass("hide");
    // $("#js-price-and-stock").find(".js-sku-code").prop("required", false);
    // let isVaccine = $('input[name="isVaccine"]').val();
    // let skuTable = $(skuTableTemplate({data, isVaccine}));
    // this.$jsSkuTableArea.html(skuTable);
    // $("input", skuTable).on("focusout", evt => this.addSkuInfo(evt))
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
        quantity = $(i).find("input.js-stock-quantity").val(),
        stock = {skuCode, warehouseCode, quantity};
      return stock;
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
      return sku.price ? sku : 0;
    }), 0)
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
      attrs = _.without(_.map($(".js-group-item", form), i => {
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

  //普通信息封装
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

  //协议信息封装
  originAgreementItem($form){
    let agreementInfo = {},
        goodsId = $("#goodsId").val(), //商品id
        goodsItem = $("#categoryPath").val(), //商品类目
        supplierCode = $("#orgId").val(), //供应商Id
        agreementPrice = parseFloat($("#js-agreementPrice").val()), //协议价
        marketPrice = parseFloat($("#js-marketPrice").val()),       //市场价
        basePrice = marketPrice,                      //基准价
        projectId = $("#js-item-project").data("id"),  //协议id
        projectName = $("#js-item-project").data("name"),  //协议id
        isStockShort = $("input[name='supply']:checked").val(),//货源情况
        discountRate = agreementPrice/marketPrice,     //优惠率
        deliverId = $("#regionId").data("id"),  //销售区划
        deliverName = $("#regionId").text();    //销售区划

    if(goodsItem && goodsItem.indexOf("-")){
      let goodsAttr = goodsItem.split("-");
      goodsItem = goodsAttr[goodsAttr.length-1];
    }

    agreementInfo = {
      supplierCode: supplierCode,
      agreementPrice: agreementPrice,
      marketPrice: marketPrice,
      basePrice: basePrice,
      isStockShort: isStockShort,
      discountRate: discountRate,
      projectId: projectId,
      projectName: projectName,
      deliverId: deliverId,
      deliverName: deliverName
    };

    if(goodsItem){
      agreementInfo.goodsItem = goodsItem;
    }

    //编辑商品才会有goodsId
    if(goodsId){
      agreementInfo.id = goodsId;
    }

    // 医展馆特殊处理，会展示团购价和团购数量
    if (this.isMedical) {
      const groupPrice = parseFloat($("#js-groupPrice").val()); // 团购价格
      const groupQuantity = parseFloat($("#js-groupQuantity").val()); // 团购数量
      agreementInfo.groupPrice = groupPrice;
      agreementInfo.groupQuantity = groupQuantity;
      agreementInfo.source = 1; // 0是协议供货，1是医展馆
    }

    return agreementInfo;
  }

  //协议商品信息封装
  originzeAllItem($form){
    let product = {},
        agrGood = {},
        baseItem = {};
    agrGood = this.originAgreementItem($form);
    baseItem = this.organizeItemDto($form);

    product = {
      agrGood : agrGood,
      baseItem : baseItem
    };

    return product;
  }

  //提交复写
  submitItem(evt) {
    evt.preventDefault();
    let $form = this.$itemForm,
        FullItem = this.originzeAllItem($form),
        isEdit = FullItem && FullItem.agrGood && FullItem.agrGood.id ? true : false, //通过id来判断是发布商品还是编辑商品
        url = isEdit ? "/api/agreement/updateProduct" : "/api/agreement/publishProduct",
        that = this;
    if (this.validateDispath($form, FullItem.baseItem)) {
      $("#js-item-submit").prop("disabled", true);
      $("body").spin("medium");
      $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(FullItem),
        success: (res) => {
          that.confirmLeave();
          $("body").spin(false);
          console.log('====');
          console.log(that.isMedical)
          if (that.isMedical) {
            window.location.href = that.protocolEnv + "/medical/agreement/supplier-manage-list";
          } else {
            window.location.href = that.protocolEnv + "/agreement/supplier-manage-list";
          }
        },
        complete: () => {
          $("body").spin(false);
          $("#js-item-submit").prop("disabled", false)
        }
      });
    }
  }

  //重写表单校验
  validateDispath ($form, data) {
    if (this.validateMainImage(data.item)) {
      $(".js-form-error-tip", $form).addClass("hide")
      return true
    } else {
      $(".js-form-error-tip", $form).removeClass("hide")
      return false
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
      a = $.merge(a, $(element).data("attr"))
    });
    this.canSkuAttrs = this.getOriginCanSkuKey(a);
    return _.difference(this.canSkuAttrs, skuKeys)
  }

  /**
   * 初始化行政区划选择
   */
  initRegionSelects() {
    let self = this;
    self.$province = $('[name="provinceId"]', self.$el);
    self.$city = $('[name="cityId"]', self.$el);
    self.$region = $('[name="regionId"]', self.$el);
    self.$country = $('[name="countryId"]', self.$el);
    self.initCountrySelect(this.$country);
    self.initRegionSelect(this.$province);

    self.$province.on('change', function () {
      let provinceId = $(this).val();
      self.$city.data('pid', provinceId);
      self.initRegionSelect(self.$city);
    });
    self.$city.on('change', function () {
      let cityId = $(this).val();
      self.$region.data('pid', cityId);
      self.initRegionSelect(self.$region, '', 'region');
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

  //校验金额
  isPrice(price){
    let reg = /^[+-]?\d+(\.\d+)?$/;
    return reg.test(price);
  }
}

module.exports = ItemPublish;
