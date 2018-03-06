let $pagination = $('.list-pagination');
let ComplexSearch = require("common/complex_search/extend");
let server = require("procurement/list/server");
let that;
class procurementList {
  constructor() {
    this.beforeRander();
    this.bindevents();
  }
 /**
  * 初始化
  * */
  beforeRander() {
    that = this;
    new ComplexSearch({
      tabElem: ".tab",
      searchElem: ".search",
      searchBtn: "#searchBtn",
      clearBtn: "#resetBtn",
      saveSearchStatus: false,
      searchResetParams: ['pageNo']
    });
    $('.date-input').datepicker();

  }
  // 绑定事件
  bindevents() {
    $('.panel-body .data-list').on("click.pub","a",function(){
      $(this).hasClass("pub-a")    &&  that.eventDataListPublish(this);
      $(this).hasClass("cancel-a") &&  that.eventDataListCancel(this);
      $(this).hasClass("del-a")    &&  that.eventDataListDelete(this);
      $(this).hasClass("ignor-a")    &&  that.eventDataListIgnore(this);
    });
  }
  /**
  * 点击发布
  * @param current  点击的当前元素
  * */
  eventDataListPublish(current) {
    let config = {
        title : '确定发布',
        content : '确认发布？',
        confirm : function (modal) {
          modal.close();
          // 执行请求
          server.ajaxPublish(current, that.eventAJAXDone);
        }
    };
    ZCY.confirm(config);
  }
  /**
   * 点击取消
   * @param current  点击的当前元素
   * */
  eventDataListCancel(current) {
    let config = {
        title : '确定取消',
        content : '确定取消？',
        confirm : function (modal) {
          modal.close();
           // 执行请求
          server.ajaxCancel(current, that.eventAJAXDone);
        }
    };
    ZCY.confirm(config);
  }
  eventDataListDelete(current) {
    let config = {
        title : '确定删除',
        content : '确定删除？',
        confirm : function (modal) {
            modal.close();
            // 执行请求
            server.ajaxDelete(current, that.eventAJAXDone);
        }
    };

      ZCY.confirm(config);

  }
  eventDataListIgnore(current) {
    let config = {
      title : '确定忽略',
      content : '确定忽略？',
      confirm : function (modal) {
          modal.close();
          // 执行请求
          server.ajaxIgnore(current, that.eventAJAXDone);
      }
    };
    ZCY.confirm(config);
  }
  eventAJAXDone(status,msg){
    if(status.success){
      window.location.reload();
    }else{
      ZCY.error('失败',msg);
    }
  }
}
module.exports = procurementList;
