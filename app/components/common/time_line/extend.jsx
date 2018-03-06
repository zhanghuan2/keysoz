class TimeLine {

  constructor (_selector, _config) {
    const config = $.extend(TimeLine.config, _config);
    const $_selector = $(_selector);
    const trList = $(_selector + " tr");

    /* 样式调整 */
    $_selector.addClass("sr-timeline");

    /* 更多按钮 */
    if (trList.length > 10) {
      const moreHtml = "<div class=\"mb-lg\"><a href=\"javascript:;\" onclick=\"$(this).parents('.sr-timeline').find('tr').show();$(this).parent().remove()\">展开更多流转日志</a><i class=\"icon-zcy icon-xiangxiazhedie ml\" style=\"font-size: 10px;color: #999;\"></i></div>";
      $_selector.prepend(moreHtml);
    }

    /* 每一行的左圈，以及显示控制 */
    for (let i = 0; i < trList.length; i++) {
      var rowHtml;
      if (i !== trList.length - 1) {
        /* 非后10个隐藏 */
        if (trList.length - i > 10) {
          $(trList[i]).hide();
        }

        rowHtml = "<td><div class='sr-dot dot-muted'></div><div class='sr-line'></div></td>";
      } else {
        /* 最后一个，根据操作文字颜色样式 */
        const $operate = $(trList[i]).find(" td:eq(" + config.operateListIndex + ")");
        const spanList = $operate.find("span");
        if (spanList.length < 1) {
          rowHtml = "<td><div class='sr-dot dot-primary'></td>";
        } else {
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
TimeLine.config = {
  operateListIndex: 3
};
module.exports = TimeLine;
