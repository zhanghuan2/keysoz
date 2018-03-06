module.exports = function(types) {
  if(typeof types === 'undefined') {
    initCheckbox();
    initAsideFooter();
  } else {
    if(types.indexOf('checkbox') !== -1) {
      initCheckbox();
    }
    if(types.indexOf('asideFooter') !== -1) {
      initAsideFooter();
    }
  }
  function initCheckbox() {
    $('input[name="table-total-check"]').on('change', function() {
      var checked = $(this).prop('checked');
      $('input[name="table-total-check"], input[name="table-line-check"]').prop('checked', checked);
    });
    $('input[name="table-line-check"]').on('change', function() {
      var checked = $(this).prop('checked');
      if(!checked) {
        $('input[name="table-total-check"]').prop('checked', false);
      } else {
        if($('input[name="table-line-check"]').not(':checked').length === 0) {
          $('input[name="table-total-check"]').prop('checked', true);
        }
      }
    });
  }

  function initAsideFooter() {

    /* 存入默认数据后，检测浏览器版本 */
    var userAgent = navigator.userAgent;
    console.log(userAgent);
    /* 是IE浏览器 */
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && userAgent.indexOf("Opera") <= -1) {
      var version = userAgent.substring(userAgent.indexOf("MSIE",0)+4, userAgent.indexOf(";",userAgent.indexOf("MSIE",0)));
      /* IE版本在10以下 */
      if(parseFloat(version)<10){
        return;
      }
    }

    var $table = $('table.aside-table');
    var $tbody = $('table.aside-table>tbody');
    var $tfoot = $('table.aside-table>tfoot');

    function processAside($window) {
      if($window.scrollTop() + $window.height() > $tbody.offset().top + $tbody.height() + $tfoot.height()) {
        $tfoot.removeClass('aside-tfoot');
        $table.removeAttr('style');
      } else {
        if($table.hasClass('drawer-table')) {
          $tfoot.find('tr').css({"width": $tbody.find('tr').outerWidth() + "px"});
        } else {
          $tfoot.find('tr').css({"width": ($tbody.find('tr').outerWidth()-1) + "px"});
        }

        if(!$tfoot.hasClass('aside-tfoot')) {
          $tfoot.addClass('aside-tfoot');
          $table.css({"margin-bottom": parseInt($tfoot.height()) + 'px'})
        }
      }
    }
    if($tfoot.length === 0) return;
    $(window).on('scroll resize', function() {
      processAside($(this));
    });
    processAside($(window));
  }
};
