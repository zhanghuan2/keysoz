
class itemMarkImport {
  constructor($) {
    this.renderDateComp()
    this.bindEvent()
  }

  bindEvent() {
    $("#import-o").on("click",(evt) => this.uploadAFunc(evt));
    $("#import-t").on("click",(evt) => this.uploadBFunc(evt));
  }

  //渲染日期控件
  renderDateComp(){
    $(".date-input").datepicker();
    let myDate = new Date();
    let y = myDate.getFullYear(),
        m = myDate.getMonth()+1,
        d = myDate.getDate();
    m = m<10?("0"+m):m;
    let today = y+"-"+m+"-"+d;
    $(".date-input").val(today);
  }

  //上传事件
  uploadAFunc(evt) {
    let $thisDom = $(evt.target);
    let topic = $thisDom.parents(".panel-body").find("[name='topic']").val(),
        effectDate = $thisDom.parents(".panel-body").find("[name='effectDate']").val(),
        invalidDate = $thisDom.parents(".panel-body").find("[name='invalidDate']").val();
    let subData = {"topic":topic,"effectDate":effectDate,"invalidDate":invalidDate};
    $thisDom.fileupload({
      url: "/api/item-mark/import",
      dataType: "html",
      formData: subData,
      add: function (e, data) {
        console.log("add file", data.formData);
        $(".js-import-o-btn").on("click",function(){
          data.submit();
        })
      },
      start: function() {
        console.log("starting...");
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        console.log(progress + "%");
      },
      done: function (e, data) {
        new Modal({
          icon: "success",
          title: "操作成功",
          content: "采购目录导入成功！"
        })
            .show(function () {
              window.location.reload();
            });
      },
      fail: function (e, data) {
        /*$('#import-gpcatalog-btn').attr('disabled', false);*/
      },
      always: function () {
        console.log("dont forget me");
      }
    })
  }

  uploadBFunc(evt){
    let $thisDom = $(evt.target);
    $thisDom.fileupload({
      url: "/api/item-mark/importRefer",
      dataType: "html",
      formData: {},
      add: function (e, data) {
        console.log("add file", data.formData);
        $(".js-import-o-btn").on("click",function(){
          data.submit();
        })
      },
      start: function() {
        console.log("starting...");
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        console.log(progress + "%");
      },
      done: function (e, data) {
        new Modal({
          icon: "success",
          title: "操作成功",
          content: "采购目录导入成功！"
        })
            .show(function () {
              window.location.reload();
            });
      },
      fail: function (e, data) {
        /*$('#import-gpcatalog-btn').attr('disabled', false);*/
      },
      always: function () {
        console.log("dont forget me");
      }
    })
  }
}

module.exports = itemMarkImport
