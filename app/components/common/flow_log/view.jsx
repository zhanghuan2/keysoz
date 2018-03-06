class FlowLog {

  constructor(_selector,_config){
    _selector = '.log'
    var config = $.extend(FlowLog.config, _config);
    var $_selector = $(_selector);
    var trList = $(_selector+" tr");
    
    /* 样式调整 */
    $_selector.addClass("sr-flowLog");

    /* 更多按钮 */
    if (trList.length > 10) {
      var moreHtml = "<div class=\"mb-lg\"><a href=\"javascript:;\" onclick=\"$(this).parents('.sr-flowLog').find('tr').show();$(this).parent().remove()\">展开更多流转日志</a><i class=\"icon-zcy icon-xiangxiazhedie ml\" style=\"font-size: 10px;color: #999;\"></i></div>";
      $_selector.prepend(moreHtml);
    }

    /* 每一行的左圈，以及显示控制 */
    for(var i=0;i<trList.length;i++){
      var rowHtml;
      if (i !== trList.length-1) {
        /* 非后10个隐藏 */
        if (trList.length - i > 10) {
          $(trList[i]).hide();
        }

        rowHtml = "<td><div class='sr-dot dot-muted'></div><div class='sr-line'></div></td>";
      }else{

        /* 最后一个，根据操作文字颜色样式 */
        var $operate = $(trList[i]).find(" td:eq(" + config.operateListIndex + ")");
        var spanList = $operate.find("span");
        if (spanList.length < 1) {
          rowHtml = "<td><div class='sr-dot dot-primary'></td>";
        }else{
          if ($(spanList[0]).hasClass("success")) {
            rowHtml = "<td><div class='sr-dot dot-success'></td>";
          }
          if ($(spanList[0]).hasClass("danger")) {
            rowHtml = "<td><div class='sr-dot dot-danger'></td>";
          }
        }
      }
      $(trList[i]).prepend(rowHtml);
    }

    $_selector.show();

  }

  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }

}
FlowLog.config={
  operateListIndex:3
};
module.exports=FlowLog;