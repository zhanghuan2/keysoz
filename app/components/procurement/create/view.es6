let that = "";
let brandTimer = null;
let server = require("procurement/list/server");
let UploadFile = require("common/uploadFile/view");
let Checker = require("common/formchecker/extend");
let Modal = require("pokeball/components/modal");
let AuditModal = Handlebars.templates["procurement/templates/temp"];
let SelectricTree = require('common/selectric_tree/view');
let modalObj;
let tree;
class procurement {
  constructor() {
    that = this;
    this.beforeRender();
    this.bindevents();
  }

  beforeRender() {
    tree = new SelectricTree('#bid', {
      closeBack: that.selectBack
    });

  }

  selectBack() {
    let data = this.getValue();
    if (!data.id) {
      $("input.getproduct").val("");
      return;
    }
    $("input.getproduct").data("tree", data);
    ZCY.get({
      url: "/api/procurement/getproduct",
      data: {"gpcategoryCode": data.id},
      success: function (d) {
        $("input.getproduct").val(d);
      }
    })
  }

  bindevents() {

    $("#reback").on("click", function () {
      that.modalEvent();

    });
    $('.date-input').datepicker();

    $('#uploadFile').uploadFile({multiple: 6})
    .on('uploadFile-max-limit-error', () => {
      new Modal({
        icon: "success",
        title: "最多上传6个文件",
      }).show()
    })

    $('#brandName').on('input propertychange', () => {
      clearTimeout(brandTimer);
      brandTimer = setTimeout(()=> {
        that.autocomplete($('#brandName').val())
      }, 500);
    });

    $(".js-btn-submit").on('click', ()=> {
      ZCY.confirm({
        title: "确认发布",
        content: "确认发布?",
        confirm: function (dom) {
          dom.close();
          that.formSubmit()
        }
      });
    });

    let form = Checker.formChecker({
      container: '.requirement-create',
      ctrlTarget: '.js-btn-submit'
    });
    //联系人、联系方式会自动填好，所以先主动触发检查
    $("#contact").val() && form.requiredCheck($("#contact"));
    $("#cellphone").val() && form.requiredCheck($("#cellphone"));
    $(".endtime").val() && form.requiredCheck($(".endtime"));
    form.doCheck();

    $("#pre-step").on('click', ()=> {
      window.location.href = "/procurement/list";
    });

    $("#cancel").on('click', ()=> {
      window.location.href = "/procurement/list";
    });

    $("body").on("click", ".confirm", function () {
      that.sendConfirm();
    });


  }

  modalEvent() {
    modalObj = new Modal(AuditModal());
    modalObj.show();
    $('#avoid-comp').select2({
      language: 'zh-CN',
      ajax: {
        url: '/api/demand/item/search',
        dataType: 'json',
        delay: 300,
        cache: true,
        data: function (params) {
          return {
            name: params.term || ""
          }
        },
        processResults: function (data) {
          return {
            results: $.map(data.result.entities.data, (item) => {
              return {id: item.id, text: item.name};
            })
          };
        }
      }
    });

    $('#avoid-comp').on('select2:selecting', function (evt) {

    }).on('select2:close', function () {
      $('#avoid-comp').parent().find('span[name="select2-length-error"]').remove();
    });
    $(".confirm-modal input[name=has]").on("change", function () {
      if ($(".nopro").is(":checked")) {
        $(".noselectric").prop("disabled", true);
        $(".disabledTD input").prop("disabled", true);
        $(".disabledTD").addClass("disabled-ele");
      } else {
        $(".noselectric").prop("disabled", false);
        $(".disabledTD").removeClass("disabled-ele");
        $(".disabledTD input").prop("disabled", false);
      }
    })
  }

  sendConfirm() {
    //var data = {"content":2222,"contact":"adasdsa","cellphone":"13456756787","unitPrice":120,
    // "demandId":1,"status":1,"itemId":1432}
    let data = {};
    data.content = $(".confirm-modal input[name=content]").val();
    data.contact = $(".confirm-modal input[name=contact]").val();
    data.cellphone = $(".confirm-modal input[name=cellphone]").val();
    data.unitPrice = $(".confirm-modal input[name=unitPrice]").val();
    data.demandId = $(".confirm-modal input[name=demandId]").val();
    data.productUrl = $(".confirm-modal input[name=productUrl]").val();
    data.itemId = $(".noselectric").val();
    data.status = $(".nopro").is(":checked") ? 0 : 1;
    ZCY.post({
      url: "/api/demand/response",
      data: JSON.stringify(data),
      success: function (i) {
        modalObj.close();
      }
    })
  }

  formSubmit() {
    let formData = $(".requirement-create").serializeObject();
    formData.imageDtos = $('#uploadFile').data('uploadFile').getFiles();
    let _tree = $("input.getproduct").data("tree");
    if(!$("#bid").find("input").val()){
      ZCY.error("采购目录不能为空，请检查后输入！");
      return;
    }
    formData.gpcategoryCode = _tree.id;
    formData.gpcategoryName = _tree.text;
    if(formData.quantity){
      if(isNaN(formData.quantity)){
        ZCY.error("购买数量为数字，请检查后输入！");
        return;
      }else{
        if(parseInt(formData.quantity)<0){
          ZCY.error("购买数量格式错误，不能小于0，请检查后输入！");
          return;
        }
        formData.quantity = parseInt(formData.quantity);
      }
    }
    $.ajax({
      type: "POST",
      url: "/api/demand/create",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (data) {
        if (data.success) {
          ZCY.success('发布成功',"");
          window.location.href = "/procurement/list";
        } else {
          ZCY.error(data.error,"");
        }
      },
      error: function (data) {
        ZCY.error(data,"");
      }
    });
  }

  autocomplete(input) {
    let listDom = $('.autocomplete-list');
    let inputDom = $("#brandName");
    if (input.length === 0) {
      listDom.css('display', 'none');
      return;
    }
    ;
    $.ajax({
      type: "GET",
      url: "/api/brands/v2?name=" + encodeURI(input),
      contentType: 'application/json',
      success: function (data) {
        listDom.html("");
        if (data.length <= 0) {
          listDom.css('display', 'none');
        }
        else {
          data.forEach(function (value) {
            let name = value.fullName;
            let id = value.id;
            if (name.length > 0) {
              let li = $("<li><a>" + name + "</a></li>").on('click', ()=> {
                inputDom.val(name);
                $('#brandId').val(id);
                listDom.css('display', 'none');
              });
              listDom.append(li);
            }
          });
          /*保证选择框的宽度不小于输入框*/
          let inputWidth = inputDom.css('width');
          let listWidth = listDom.css('width');
          if (parseInt(listWidth) < parseInt(inputWidth)) {
            listDom.css('width', inputWidth);
          }
          listDom.css('display', 'block');
        }
      }
    });
  }

}

module.exports = procurement;