const OriginSpuPublish = require("seller/spu_detail/common/view");
const Modal = require("pokeball/components/modal");
const attributeTemplate = Handlebars.templates["seller/spu_detail/common/templates/attribute_template"];

export default class SpuPublish extends OriginSpuPublish {
  constructor($) {
    super($)
  }

  // 事件绑定和委托
  bindEvent () {
    let that = this;
    this.$jsExtendAttribute = $(".js-attribute-new").not("#js-extend-sku-attribute");
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

    let $select_brand = $("[name='select-brand']");
    $select_brand.select2({
      language: {
        "noResults": function(){
          return "未找到品牌信息";
        }
      },
      placeholder: "请选择",
      ajax: {
        url: "/api/brands/admin/v2",
        dataType: "json",
        delay: 500,
        data: function(params){
          if(params.term == undefined){
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
        processResults: function(data){
          var brandNames = [];
          if(data.length == 0){
            return {results: brandNames};
          }
          $.each(data, function(i,n){
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
    }).on("change", function(){
      let $selectedOption = $('select[name="select-brand"] option:selected');
      let id = $selectedOption.val();
      let name = $selectedOption.text();
      $select_brand.data("id", id);
      $select_brand.data("name", name);
      $(".xhbox input").val("");
      $(".xhbox input").attr("value","");
      that.linkXH();
    });
    let id = $select_brand.data("id");
    if(id != undefined){
      $select_brand.append("<option value=" + id + ">" + $select_brand.data("name") + "</option>");
      var _value = $(".xhbox input").val();
      $select_brand.trigger("change");
      if(_value){
        $(".xhbox input").val(_value);
        $(".xhbox input").attr("value",_value);
      }

    }

    $(".xhbox input").on("focus",function(){
      $(".xhbox .search_box").show();
    }).on("blur",function(){
      $(".xhbox input").attr("value",$(this).val());
      setTimeout(function(){
        $(".xhbox .search_box").hide();
      },500);
    }).on("input",function(){
      let id = $(this).data("brandid");
      let _content = $(this).val();
      let _categoryId = $("input[name=categoryId]").val();
      let param = {
        categoryId:_categoryId,
        brandId : id,
        content:_content
      };
      if(!_categoryId){
        param = {
          categoryId:$("input[name=spuId]").val(),
          brandId : id,
          content:_content
        };
      }
      if(!param.brandId){
        that.inputSearch([]);
      }else{
        $.ajax ({
          url: "/api/zcy/specifications/admin/list",
          contentType: "application/json",
          data: param,
          success: (data) => {
            that.inputSearch(data);
          }
        });
      }
    });

    $(".xhbox").on("click","li",function(){
      if($(this).hasClass("noneli")){
        return;
      }
      $(".xhbox input").val($(this).text());
      $(".xhbox input").attr("value",$(this).text());
      $(".xhbox .error").removeClass("error empty").addClass("success");
    });
  }
  linkXH () {
    let that = this;
    let dom = $("[name='select-brand']");
    let id = dom.data("id");
    let _categoryId = $("input[name=categoryId]").val();
    var _url = "/api/zcy/specifications/admin/list";
    let _data = {
      categoryId:_categoryId,
      brandId : id,
      content:""
    };
    if(!_categoryId){
      _data = {
        categoryId:$("input[name=spuId]").val(),
        brandId : id,
        content:""
      };
    }
    $(".xhbox input").data("brandid",id);
    if(!_data.brandId){
      that.inputSearch([]);
      return;
    }
    $.ajax ({
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
    input.parent().find(".search_box").length==0 && input.parent().append(box);
    input.parent().find(".search_box ul").empty();
    if(d.length==0){
      let listr = "<li class='noneli'>无此型号...</li>"
      input.parent().find(".search_box ul").append(listr);
      return;
    }
    $.each(d,function(i,v){
      let listr = "<li>"+v.content+"</li>"
      input.parent().find(".search_box ul").append(listr);
    })
  }

  // 展开属性添加面板
  extendNewAttributes (evt) {
    if ($(evt.currentTarget).next().length === 0) {
      $(evt.currentTarget).addClass("hide")
      let attributeItem = $(attributeTemplate())
      $(evt.currentTarget).after(attributeItem)
      this.bindAttributeEvent(attributeItem)
    }
  }

  // 提交属性数据
  submitAttribute (evt) {
    evt.preventDefault()
    let data = $(evt.currentTarget).serializeObject()

    data.attrVals = _.flatten([data.attrVal])

    let $attributeItem = $(attributeTemplate(data))
    $(evt.currentTarget).parents(".js-attribute-area").find("#js-category-attribute-list").append($attributeItem)
    $attributeItem.dropdown()
    $(evt.currentTarget).parents(".new-attribute-area").find(".js-attribute-new").removeClass("hide")
    this.closeAttribute(evt)
  }

  submitSpu (evt) {
    evt.preventDefault()
    let $form = this.$itemForm,
        fullSpu = this.organizeItemDto($form),
        type = fullSpu.spu.id ? "PUT" : "POST"
    if (this.validateDispath($form, fullSpu)) {
      $("body").spin("medium")
      $.ajax ({
        url: "/api/zcy/spu",
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

  // 获取当前可以作为销售属性的属性值
  getRealCanSkuKey () {
    let $skuArea = $(".js-sku-area", this.$target),
        skuKeys = _.map($skuArea, (i) => $(i).data("key"))
    let a = [];
    $(".attribute-data").each(function(index,element){
      let attrs = $(element).data("attr")
      if(attrs){
        a = $.merge(a, attrs)
      }
    })
    this.canSkuAttrs = this.getOriginCanSkuKey(a)
    return _.difference(this.canSkuAttrs, skuKeys)
  }

}