
/** *
  * 表格行选择的checkbox
  * @author sx-wangx@dtdream.com
  */

class TableCheckbox {
  constructor(selector, config) {
    var vm = this;
    // 读取配置
    var conf = {
      onTotalChange: undefined,
      onLineChange: undefined,
      onBeforeLineChange: undefined,
      hasBatch: true
    }
    if(config) {
      $.extend(conf, config);
    }
    this.selector = selector;
    this.config   = conf;
    // 选择器检查
    var $table = $(selector);

    if (0 == $table.length) return $table;
    if($table.length != 1) {
      throw new Error('[TableCheckbox] Only one element can be selected! Please check your selector.')
    }

    // 构造表格
    var totalElement = '<th width="30"><input type="checkbox" name="table-total-check"></th>';
    var lineElement = '<td width="30"><input type="checkbox" name="table-line-check"></td>';
    let emptyElement = '<td width="30"></td>';

    /* 存在，则添加 */
    let lines = $table.find('tbody tr:not(.no-check)');
    if (lines.length) {
      lines.prepend(lineElement);
      /* 没有添加过 */
      if (!$table.find('thead tr input[name="table-total-check"]').length) {
        $table.find('thead tr,tfoot tr').prepend(this.config.hasBatch ? totalElement : emptyElement);
      }
      /* 没有的需要添加空白td */
      $table.find('tbody tr.no-check').prepend('<td width="30"><input type="checkbox" name="table-line-check" disabled="disabled"></td>');
    }

    // 添加监听逻辑
    var $total = $(selector+' input[name="table-total-check"]');
    var $line = $(selector+' input[name="table-line-check"]');
    // 先判断是否需要这个batch选项
    $line.each(function(e) {
      if(conf.haveBatch){
        if(!conf.haveBatch($line[e])){
          $($line[e]).parent().find("input").remove();
        }
      }
    });
    $total.bind('click', function(event) {
      if($(this)[0].checked) {
        $total.prop("checked", true);
        $line.prop("checked", true);
        if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), true);
      } else {
        $total.prop("checked", false);
        $line.prop("checked", false);
        if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), false);
      }
    });
    $line.bind('click', function(event) {
      if (conf.onBeforeLineChange && !conf.onBeforeLineChange($(this).parents('tr'), $(this))) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }

      let result = true;
      $line.each(function(e) { result&=$(this)[0].checked });
      if(conf.onLineChange) conf.onLineChange($(this).parents('tr'), $(this)[0].checked);
      if(vm.config.hasBatch && !$total[0].checked) {
        $total.prop("checked", result);
        // if(conf.onTotalChange) conf.onTotalChange($(selector).find('tbody tr'), result);
      }
    });
  }

  reset() {
    $(this.selector+' input[name="table-line-check"]').prop('checked', true);
  }

  getCheckedLines() {
    return $(this.selector+' input[name="table-line-check"]:checked').parent().parent();
  }
}

module.exports = TableCheckbox;