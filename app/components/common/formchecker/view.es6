var defaultConfig = {
  iconError: "icon-shurujinggaotishi",
  iconSuccess: "icon-shuruzhengquetishi"
};
var defaultChecks = [
  {
    type: "email",
    errorText: "这是无效的邮箱。",
    check: function (self, object) {
      return (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "mobile",
    errorText: "这是无效的手机号。",
    check: function (self, object) {
      return (/^(13|14|15|17|18)\d{9}$/i).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "phone",
    errorText: "这是无效的电话。",
    check: function (self, object) {
      return (/^\d{3}-\d{8}|\d{4}-\d{7,8}|^1[3|4|5|7|8]\d{9}$/i).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "url",
    errorText: "无效的URL地址。",
    check: function (self, object) {
      return (/(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/i).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "idNumber",
    errorText: "无效的身份证号。",
    check: function (self, object) {
      return (/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "account",
    errorText: "无效的银行账号。",
    check: function (self, object) {
      return (/^([0-9]{12,25})?$/g).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "uploadFile_required",
    errorText: "必输项。",
    check: function (self, object) {
      console.debug($(object).attr("data-size"));
      return $(object).attr("data-size") !== "0" ? true : self.errorText;
    }
  },
  {
    type: "password",
    errorText: "密码为8至16位, 且不能为全数字。",
    check: function (self, object) {
      return (/(?![0-9]+$)[\x21-\x7e]{8,16}/i).test($(object).val()) ? true : self.errorText;
    }
  },
  {
    type: "maxMoney",
    errorText: "金额超出限制",
    check: function (self, object) {
      var currentMoney = $(object).val();
      if (!(/^(\d*|\d*.\d{1,2})$/).test(currentMoney)) {
        return "金额格式错误";
      }
      var maxMoney = $(object).data("unpayamount");
      if (parseFloat(currentMoney) > parseFloat(maxMoney)) {
        return self.errorText;
      }
      return true;
    }
  },
  {
    type: "nonblank",
    errorText: "非空白输入",
    check: function (self, object) {
      let value = $(object).val();
      if (value.trim().length > 0){
        return true;
      }
      else{
        return '输入不能为空白';
      }
    }
  }
];

class formChecker {
  constructor(config) {
    var that = this;
    this.maps = {
      data: [],
      get: function (key) {
        return this.data[key];
      }
    };
    this._config = {
      container: undefined, // 指定容器
      precheck: false, // 马上检查一遍
      ctrlTarget: undefined, // 控制对象
      extendChecks: undefined
    };
    console.debug('formChecker init:', this);
    $.extend(this._config, config);
    var _config = this._config;
    if (undefined !== _config.extendChecks) {
      $.merge(defaultChecks, _config.extendChecks);
    }

    this.mapping();
    $(_config.ctrlTarget).attr('disabled', true);

    /* 可以作为配置 */
    var $all, $targets, $required, $selectRequired, $checkbox, $length, $compare, $uploadFile_required, $groupReuired;
    if (!_config.container) {
      console.debug('container is empty!');
      return;
    }

    $all = $(_config.container).find('input,textarea,select');
    $length = $(_config.container).find('input[min-length],input[max-length],textarea[min-length],textarea[max-length]');
    $targets = $(_config.container).find('input[checker-type],input[checker-pattern],' +
      'textarea[checker-type],textarea[checker-pattern]');
    $required = $(_config.container).find('input[required],textarea[required],select[required]');
    $selectRequired = $(_config.container).find('select[required]');
    $checkbox = $(_config.container).find('input[type=checkbox]');
    $compare = $(_config.container).find('input[checker-compare]');
    $uploadFile_required = $(_config.container).find('input[checker-type][type=file]');
    $groupReuired = $(_config.container).find('input[checker-group]');
    $length.bind('change', function () {
      that.lengthCheck(this);
      that.doCheck();
    });

    /* 校验类时间对象绑定 */
    $targets.bind('change', function () {
      /* 必输项检查 */
      if (undefined !== $(this).attr('required')) {
        var required = that.requiredCheck(this);
        if (false === required) {
          that.doCheck();
          return;
        }
      }

      /* 如果不是必输项，且为空，就不检查了 */
      $(this).siblings('span[name="check-result"]').remove();
      $(this).removeClass('checker-color-invalid');
      /*from sx-9067 sx-wangc@dtdream.com*/
      if ($(this).val().length === 0 && $(this).attr("type") !== "file") {
        $(this).removeClass('tool-invalid').addClass('unrequired-valid');
      }
      else {
        var result = that.patternCheck(this);
        if (true === result) {
          $(this).removeClass('tool-invalid').addClass('valid');
        }
        else {
          $(this).addClass('tool-invalid').removeClass('valid');
          that.tips(this, '<span name="check-result" class="text-danger pl">' + result + '</span>');
        }
      }

      that.doCheck();
    });

    /* 必选项校验事件绑定 */
    $required.bind('blur', function () {
      /* 如果有checker-type的话require就不在这里检查了  */
      if (undefined !== $(this).attr('checker-type')) {
        $(this).unbind('blur');
        return;
      }
      that.requiredCheck(this);
      that.doCheck();
    });
    $selectRequired.bind('change', function () {
      $(this).trigger('blur');
    });
    $targets.bind('blur', function () {
      $(this).trigger('change');
    });
    $groupReuired.bind('blur', function () {
      $(this).trigger('change');
    });

    /* 比较项校验事件绑定 */
    $compare.bind('change', function () {
      var who = $(this).attr('checker-compare');
      var $compares = $('input[checker-compare=' + who + ']');
      var base = $compares[0];

      $compares.map(function () {
        $(this).removeClass('compare-invalid').addClass('valid');
        /* 如果不是第一个 && 如果值不相等  */
        if ($(this).get(0) !== base && ($(this).val().length !== 0) && (base.value !== $(this).val())) {
          $(this).siblings('span[name="check-result"]').remove();
          $(this).addClass('compare-invalid').removeClass('valid');
          that.tips(this, '<span name="check-result" class="text-danger pl">输入不一致</span>');
        }
        else if ($(this).get(0) !== base && ($(this).val().length !== 0) && (base.value === $(this).val())) {
          /* 如果不是第一个 && 如果值相等  */
          $(this).siblings('span[name="check-result"]').remove();
        }
        else if ($(this).val().length === 0) {
          $(this).removeClass('compare-invalid').removeClass('valid');
        }
      });
      that.doCheck();
    });
    /*校验组*/
    $groupReuired.bind('change', function () {
      let who = $(this).attr('checker-group');
      let $group = $('input[checker-group=' + who + ']');
      let valid = false;
      let hasOne = false;
      _.each($group, (el)=> {
        let value = $(el).val();
        if (value !== undefined && value !== '') {
          let result = that.patternCheck(el);
          $(el).siblings('span[name="check-result"]').remove();
          if (result === true) {
            valid = true;
            hasOne = true;
          }
          else {
            that.tips(el, '<span name="check-result" class="text-danger pl">' + result + '</span>');
            $(el).addClass('group-invalid').removeClass('valid');
            valid = false;
          }
        }
      });
      if (valid && hasOne) {
        _.each($group, (el)=> {
          $(el).removeClass('group-invalid').addClass('valid');
        })
      }
      else if (!hasOne) {
        _.each($group, (el)=> {
          $(el).addClass('group-invalid').removeClass('valid');
        })
      }
      that.doCheck();
    });

    /* 初始化时遍历所有需要检查的项，如果是非必填项，则默认加上unrequired-valid */
    that.doRevert($all);

    var doCheckbox = function (obj) {
      /* 如果没有required的话，checkbox就放过了  */
      if (undefined === $(obj).attr('required')) {
        $(obj).unbind('click');
        return;
      }
      that.requiredCheck(obj);
      that.doCheck();
    };
    /* checkbox类型特殊处理 */
    $checkbox.bind('click', function () {
      doCheckbox(this);
    });

    if (true === this._config.precheck) {
      $targets.trigger('change');
      $required.trigger('blur');
      $length.trigger('change');
      $groupReuired.trigger('change');
      $checkbox.map(function () {
        doCheckbox(this);
      });
    }
  }

  mapping() {
    var that = this;
    var map = [];
    for (var i = 0; i < defaultChecks.length; i++) {
      var check = defaultChecks[i];
      map[check.type] = check;
    }
    this.maps.data = map;
  }

  tips(obj, strings, show) { /* 错误提示接口 */
    if ("false" !== $(obj).attr('checker-text')) {
      /* select特殊处理 select不提示错误，只显示红色边框 */
      if (!($(obj).is('select') || $(obj).parent().hasClass('selectric-hide-select'))) {
        var $append = $(obj).parent().find('.input-append');
        $append = (0 === $append.length) ? $(obj) : $append;
        $append.after(strings);
      }
    }
    else {
      console.debug('text-error!');
      /*$(obj).hasClass()*/
    }
  }

  icon(obj, status) { /* 图标状态提示接口 */
    /* 如果需要图标提示 */
    if ("false" !== $(obj).attr('icon')) {
      if ('error' === status) {
        $(obj).after(
          '<span name="check-icon" ' +
          'class="checker-icon text-danger icon-zcy ' + defaultConfig.iconError + '"></span>'
        );
      }
      else if ('success' === status) {
        $(obj).after(
          '<span name="check-icon" ' +
          'class="checker-icon text-success icon-zcy ' + defaultConfig.iconSuccess + '"></span>'
        );
      }
    }
  }

  /* border上加上颜色 */
  colorBorder(obj, status) {
    var $obj = $(obj);
    /* select特殊处理 */
    if ((true === $(obj).is('select')) && (true === $(obj).parent().hasClass('selectric-hide-select'))) {
      var $selectricWrapper = $(obj).parents('.selectric-wrapper');
      $obj = $selectricWrapper.children('.selectric');
    }

    if ('error' === status) {
      $obj.addClass('checker-color-invalid').removeClass('checker-color-valid');
    }
    else if ('success' === status) {
      $obj.removeClass('checker-color-invalid').addClass('checker-color-valid');
    }
    else {
      $obj.removeClass('checker-color-invalid').removeClass('checker-color-valid');
    }
  }

  /* 规则检查接口 */
  patternCheck(obj) {
    var type = $(obj).attr('checker-type');
    var pattern = $(obj).attr('checker-pattern');
    if ((undefined === type)
      && (undefined === pattern)) {
      return true;
    }

    var checker = this.maps.get(type);
    if (undefined === checker) {
      var errorText = $(obj).attr('checker-text');
      if (undefined === errorText) {
        errorText = '输入错误！';
      }
      var Reg = new RegExp(pattern);
      return (Reg.test($(obj).val())) ? true : errorText;
    }
    else {
      return checker.check(checker, obj);
    }
  }

  /* 必填项检查接口 */
  isRequired(obj) {
    if ('checkbox' === $(obj).attr('type')) {
      return $(obj).prop("checked");
    }
    else if (true === $(obj).is('select')) {
      return ( (null === $(obj).val()) || ($(obj).val().length === 0)) ? false : true;
    }
    else {
      return ($(obj).val().length === 0) ? false : true;
    }
  }

  /* 必填规则检查接口 */
  requiredCheck(obj) {
    var that = this;
    var result = that.isRequired(obj);
    $(obj).siblings('span[name="check-requirederr"]').remove();

    /* 看看require标签还有没 这个时候如果没有required 说明初始化后标签有修改 */
    /* 看看是不是disabled 如果是disabled 那就不检查了 */
    if (undefined === $(obj).attr('required') || $(obj).is(':disabled')) {
      $(obj).removeClass('required-invalid').addClass('valid');
      return;
    }

    {
      /* 如果检查不通过 */
      if (false === result) {
        $(obj).addClass('required-invalid').removeClass('valid');
        /* 如果必输项不为空检查不通过了，那其他的提示肯定是失败的 */
        $(obj).siblings('span[name="check-result"]').remove();
        $(obj).siblings('span[name="check-lengtherr"]').remove();
        that.tips(obj, '<span name="check-requirederr" class="text-danger pl">必输项</span>');
      }
      else {
        /* 如果需要图标提示 */
        $(obj).removeClass('required-invalid').addClass('valid');
      }
    }
    return result;
  }

  /* 长度检查接口 */
  lengthCheck(obj) {
    var that = this;
    var length = $(obj).val().length;
    var maxLen = $(obj).attr('max-length');
    var minLen = $(obj).attr('min-length');
    console.debug($(obj), maxLen, length, minLen);
    $(obj).siblings('span[name="check-lengtherr"]').remove();
    $(obj).removeClass('length-invalid').addClass('valid');
    if ((undefined !== maxLen) && (length > maxLen)) {
      /* 过长 */
      $(obj).addClass('length-invalid').removeClass('valid');
      that.tips(obj, '<span name="check-lengtherr" class="text-danger pl">输入不能超过' + maxLen + '长度</span>');
    }
    if ((undefined !== minLen) && (length < minLen)) {
      /* 过短 */
      $(obj).addClass('length-invalid').removeClass('valid');
      that.tips(obj, '<span name="check-lengtherr" class="text-danger pl">输入不能短于' + minLen + '长度</span>');
    }
  }

  /* 做一次遍历检查 */
  doCheck() {
    var that = this;
    var _config = this._config;
    if (!_config.container) {
      return;
    }
    if (!_config.$targets) {
      _config.$targets = $(_config.container).find('input[required],input[checker-type],input[min-length],input[max-length],input[checker-pattern],' +
        'textarea[required],select[required],textarea[checker-type],textarea[min-length],textarea[max-length],textarea[checker-pattern],' +
        'input[checker-group]');
    }
    var $targets = _config.$targets;
    $(_config.ctrlTarget).attr('disabled', false);
    $targets.map(function () {
      $(this).siblings('span[name="check-icon"]').remove();
      if ($(this).hasClass('required-invalid') || $(this).hasClass('length-invalid') ||
        $(this).hasClass('tool-invalid') || $(this).hasClass('compare-invalid') || $(this).hasClass('group-invalid')) {
        $(_config.ctrlTarget).attr('disabled', true);
        console.debug('false by', $(this));
        /* 如果需要图标提示 */
        that.icon(this, 'error');
        that.colorBorder(this, 'error');
      }
      else if ($(this).hasClass('valid')) {
        /* 如果需要图标提示 */
        that.icon(this, 'success');
        that.colorBorder(this, 'success');
      }
      else if ($(this).hasClass('unrequired-valid') && $(this).attr("checker-type") != "uploadFile_required") {
        /* 非必输入的情况 */
        that.colorBorder(this, 'unrequired');
      }
      else {
        $(_config.ctrlTarget).attr('disabled', true);
      }
    });
  }

  /* 恢复到未经过检查的状态 */
  doRevert($obj) {
    $obj.map(function () {
      console.debug('doRevert:', this);
      $(this).removeClass('required-invalid')
        .removeClass('unrequired-valid')
        .removeClass('length-invalid')
        .removeClass('tool-invalid')
        .removeClass('compare-invalid')
        .removeClass('checker-color-valid')
        .removeClass('checker-color-invalid');
      $(this).siblings("span[name='check-icon']").remove();
      $(this).siblings("span[name='check-requirederr']").remove();
      $(this).siblings('span[name="check-result"]').remove();
      if (undefined === $(this).attr('required') && undefined === $(this).attr('checker-group')) {
        $(this).addClass('unrequired-valid');
      }
    });
  }
}

module.exports = formChecker;
