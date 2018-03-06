const Modal = require("pokeball/components/modal")
var UploadFile = require("common/uploadFile/extend");
var upload,uploadLimtit

class brandCreat {
  constructor($) {
    this.selectDom = $(".js-brand-type")
    this.categoryBtn = $(".category-btn")
    this.submitSpu = $(".js-submit-spu")
    this.pathSelect = $(".path-select")
    this.category = $(".fixed-category-bc")
    this.creatBtn = $(".js-creat-btn")
    this.cancelBtn = $(".js-cancel-btn")
    this.changeBtn = $(".js-change-btn")
    this.selectIcon = $(".js-select-icon")
    this.btnUpload = $(".btn-upload")
    this.abordChoose = $(".js-td-abroad").find("label")
    this.enNameDom = $("input[name='enName']")
    this.chNameDom = $("input[name='chName']")
    this.bindEvent()
    upload = new UploadFile("/api/zcy/attachment/credentials", "/api/zcy/attachment/downloadUrl",".upload")
    this.typeChangeCheck()
  }

  bindEvent() {
    this.selectDom.on("change", evt => this.typeChange(evt));
//  this.btnUpload.on("change", evt => this.uploadChange(evt));
    this.categoryBtn.on("click", evt => this.categoryShow(evt));
    this.submitSpu.on("click", evt => this.submitSpuSelect(evt));
    this.category.on("click", "li.divide-li-bc", evt => this.nextCategory(evt))
    this.category.on("keyup", ".js-search-item-bc", evt => this.categorySearchItem(evt))
    this.pathSelect.on("click", "button.select-delete", evt => this.selectDeleteItem(evt))

    this.creatBtn.on("click", evt => this.creatBrand(evt))
    this.cancelBtn.on("click", evt => this.cancelItem(evt))
//  this.changeBtn.on("click", evt => this.changeBrand(evt))

    this.selectIcon.on("click", evt => this.selectIconFunc());
    this.abordChoose.on("click",evt => this.abordChooseFunc(evt))
    this.enNameDom.on("blur",evt => this.showFullNameFunc(evt))
    this.chNameDom.on("blur",evt => this.showFullNameFunc(evt))

    $(document).on("submit","form.brand-creat", function(evt){
      evt.preventDefault();
      var applyCategory;
      var submitUrl = "/api/brands/supplier/add";//新建的提交url
      $(".path-select button").each(function(i){
        if(applyCategory==undefined){
          applyCategory = $(this).data("title")+"";
        }else{
          applyCategory = applyCategory+","+$(this).data("title");
        }
      })
      var param = {
        "fullName": $("input[name=fullName]").val(),
        "isAbroad": $("input[name=isAbroad]:checked").val(),
        "chName": $("input[name=chName]").val(),
        "enName": $("input[name=enName]").val(),
        "logo": $(".js-preview").attr("src"),
        "registrationNo": $("input[name=registrationNo]").val(),
        "brandOwner": $("input[name=brandOwner]").val(),
        "brandType": $("select[name=brandType]").val(),
        "applyCategory": applyCategory
      };
      param.attachments = upload.getFiles();
      if($.query.get("brandId")){
        param.changeDetailId = $("input[name=changeDetailId]").val();
        param.workflowId = $("input[name=workflowId]").val();
        param.id = $.query.get("brandId")
        submitUrl = "/api/brands/supplier/update";
      }
      if(!param.applyCategory){
        alert("请选择类目！");
        return;
      }
      if(!param.logo){
          alert("请上传图片！");
          return;
      }
      if(param.attachments.length < 1 && param.brandType != 'MAINTENANCE'){
        alert("请上传附件！");
        return;
      }
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: submitUrl,
        data: JSON.stringify(param),
        success: function(data) {
          new Modal({
            icon: "success",
            title: "保存成功"
          }).show(()=>{
            window.location.href = "/seller/brand-manage"
          })
        }
      });
    });
  }

  typeChangeCheck(){
    if(this.selectDom.data("select")){
      this.selectDom.trigger("change");
    }
  }

  //品牌类别选择
  typeChange(evt) {
    let brandType = ($(evt.target).find("option:checked").val());
    $(".brand-creat-warp").find("ul.attachment").hide();
    if(brandType !== "") {
      $(".brand-tag").hide();
      $(".upload-box").show();
      $(".brand-creat-warp").find("ul." + brandType).show();
    } else {
      $(".brand-tag").show();
      $(".upload-box").hide();
    }
    if (brandType == 'MAINTENANCE') {
      $('.js-require-file').hide()
    } else {
      $('.js-require-file').show()
    }

  }
  //上传个数限制
  uploadChange(evt){
    var uploadLimtit = 1;
    if($("select[name=brandType]").val()=="OWNER"){
      uploadLimtit = 3;
    }
    if(this.btnUpload.data("size")==uploadLimtit-1){
      this.btnUpload.prop("disabled",true);
      $(".update-btn").prop("disabled",true);
    }else{
      this.btnUpload.prop("disabled",false);
      $(".update-btn").prop("disabled",false);
    }

  }

  categoryShow(evt) {
    let itemCategory = $(".release-items-category-bc");
    itemCategory.toggle();
  }

  submitSpuSelect(evt) {
    let flag = true;
    $(".select-delete").each(function(){
      if($(this).data("title")==$(".selected-path-code").val()){
        flag = false;
        return flag;
      }
    })
    if(!flag){
      return false;
    }
    $(".path-select").append('<button class="btn btn-info select-delete" data-title="' + $(".selected-path-code").val() + '">' + $(".selected-path").val() + '<i class="icon-zcy icon-close"></i></button>')
  }
  selectDeleteItem(evt) {
    $(evt.currentTarget).remove();
  }

  categorySearchItem(evt) {
      $(evt.currentTarget).closest(".category-body").find(".divide-ul li").hide().filter(":contains('" + ($(evt.currentTarget).val()) + "')").show()
    }
    //设定选中样式
  setSelected(_this) {
      $(_this).addClass("selected")
      $(_this).siblings().removeClass("selected")
    }
    //下一级类目逻辑
  nextCategory(evt) {
    $(evt.currentTarget).parents(".category").nextAll().remove()
    let categoryData = $(evt.currentTarget).data("category")
    this.setSelected(evt.currentTarget)
    $(".js-submit-spu").attr("disabled", true)
    $(".category-list").spin("medium")
    $(".selected-path-id").val($(evt.currentTarget).attr("id"))
    $(".selected-path-code").val($(evt.currentTarget).attr("code"))
    if(categoryData.hasChildren) {
      $.ajax({
        url: "/api/zcy/backCategories/children",
        type: "GET",
        data: {
          pid: categoryData.id
        },
        success: (data) => {
          let categoryTemplate = Handlebars.templates["seller/brand_creat/templates/category"]({
            extras: {
              "level": parseInt(categoryData.level) + 1,
              "parentId": categoryData.id
            },
            data: data
          })
          $(".fixed-category-bc").append(categoryTemplate)
        },
        complete: () => {
          $(".category-list").spin(false)
        }
      })
    } else {
      this.setSpuOrLeaf(categoryData)
      $(".category-list").spin(false)
    }
  }

  //设置已选SPU
  setSpuOrLeaf(categoryData) {
    $(".js-submit-spu").attr("disabled", false)
    let selectedItemsCache = []
    let selectedString
    $.each($(".js-category-component .selected"), function(i, d) {
      selectedItemsCache[i] = $(this).data("category").name
      selectedString = selectedItemsCache.join("/")
    })
    $(".selected-path").val(selectedString)
  }

  selectIconFunc() {
    new Modal({
      toggle: "image-selector"
    }).show((image_url) => {
      $(".js-preview").attr("src", image_url)
    })
  }

  //是否国内品牌选择，控制中英文是否必填
  abordChooseFunc(evt) {
    let $thisDom = $(evt.target),
        $enName = $("input[name='enName']"),
        $chName = $("input[name='chName']");
    if($thisDom.attr("value") == "0"){
      $enName.prop("required",false);
      $enName.closest("tr").find(".star-info").hide();
      $chName.closest("tr").find(".star-info").show();
      $chName.prop("required",true);
    }else if($thisDom.attr("value") == "1"){
      $chName.prop("required",false);
      $chName.closest("tr").find(".star-info").hide();
      $enName.closest("tr").find(".star-info").show();
      $enName.prop("required",true);
    }
  }

  //中英名字失去焦点后触发
  showFullNameFunc(evt) {
    let fullName = "";
    let enName = $("input[name='enName']").val(),
        chName = $("input[name='chName']").val();
    if(enName == "" || chName == ""){
      fullName = chName + enName;
    }else{
      fullName = chName + "/" + enName;
    }
    $("input[name='fullName']").val(fullName);
  }
}

module.exports = brandCreat