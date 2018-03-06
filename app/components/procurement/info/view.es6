import Pagination from 'pokeball/components/pagination';
let server = require("procurement/info/server");
let Modal = require("pokeball/components/modal");
let AuditModal = Handlebars.templates["procurement/templates/temp"];
let modalObj;
let that;


class procurementInfo {

  // 构造函数
  constructor() {
    this.beforeRander();
    this.bindevents();

  }


  // 渲染
  beforeRander() {
    that = this;
    $('#attachment').uploadFile({
      showOnly: true
    });
  }


  // 绑定事件
  bindevents() {

    this.eventSupplierList();
    $(".reback").on("click", function () {
      that.modalEvent();
    });
    $("body").on("click", ".confirm", function () {
      that.sendConfirm();
    });
    $(".back").on("click", function () {
      window.location.href = "/procurement/list"
    });

  }

  sendConfirm() {
    //var data = {"content":2222,"contact":"adasdsa","cellphone":"13456756787","unitPrice":120,
    // "demandId":1,"status":1,"itemId":1432}
    let data = {};
    data.content = $(".confirm-modal input[name=content]").val();
    data.contact = $(".confirm-modal input[name=contact]").val();
    data.cellphone = $(".confirm-modal input[name=cellphone]").val();
    data.unitPrice = $(".confirm-modal input[name=unitPrice]").val();
    data.demandId = $.query.keys.demandId;
    data.productUrl = $(".confirm-modal input[name=productUrl]").val();
    data.itemId = $(".noselectric").val();
    data.status = $(".nopro").is(":checked") ? 2 : 1;
    data.unitPrice = (data.unitPrice - 0) * 100;
    if (data.status == 2) {
      delete data.unitPrice
      delete data.itemId
      delete data.productUrl
    }
    if(!data.contact){
      ZCY.error("联系人不能为空，请检查后输入！");
      return;
    }
    if(!data.cellphone){
      ZCY.error("联系方式不能为空，请检查后输入！");
      return;
    }
    if(!data.content){
      ZCY.error("回复内容不能为空，请检查后输入！");
      return;
    }
    if(data.status == 1){
      if(!data.itemId){
        ZCY.error("商品名称不能为空，请检查后输入！");
        return;
      }
      if(!data.unitPrice){
        ZCY.error("商品单价不能为空，请检查后输入！");
        return;
      }
      if(isNaN(data.unitPrice)){
        ZCY.error("商品单价只能为数字，请检查后输入！");
        return;
      }
      if(!data.productUrl){
        ZCY.error("商品链接不能为空，请检查后输入！");
        return;
      }
    }


    ZCY.post({
      url: "/api/demand/response",
      data: JSON.stringify(data),
      success: function (i) {
        if (i.success) {
          modalObj.close();
          ZCY.success('响应成功',"");
          window.location.reload();
        } else {
          ZCY.error(i.error,"");
        }

      }
    })
  }

  modalEvent() {
    modalObj = new Modal(AuditModal());
    modalObj.show();
    $(".gysname").html($(".reback").data("name"));
    $('#avoid-comp').select2({
      tags: true,
      language: 'zh-CN',
      ajax: {
        url: '/api/demand/item/search',
        dataType: 'json',
        delay: 300,
        cache: true,
        data: function (params) {
          console.log(params);
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
        $(".noptr").addClass("hide");
      } else {
        $(".noptr").removeClass("hide");
      }
    })
  }

  eventAJAXDone(/* power */ p, /* text */ t) {

    if (p) {

      window.location.reload(); // 缺少样式：ZCY.success('成功', t + '成功！', function() {window.location.reload()});

    }

    else {

      ZCY.error('失败', t);

      // 控制台输出
      console.log(t);

    }

  }

  eventSupplierList() {

    $('#supplier-list').click(function (/* event */ e) {

      var t,
        i;

      if ((t = $(e.target)).is('a') && (i = t.parents('tr').attr('data-id'))) switch (t.html()) {

        case '删除' :
          return this.eventSupplierListDelete(i);

      }

    }.bind(this));

  }

  eventSupplierListDelete(/* id */ i) {

    ZCY.confirm({
      title: '确定删除', content: '确认删除？', confirm: function (/* dom */ d) {

        // 关闭对话框
        d.close();

        // 执行请求
        server.ajaxDelete(i, this.eventAJAXDone);

      }.bind(this)
    });

  }

}


module.exports = procurementInfo;
