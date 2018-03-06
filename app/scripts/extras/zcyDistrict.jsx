/**
 * 区划选择
 */

(function($) {

  let pluginName = 'zcyDistrict'

  let ZcyDistrict = function(element, opts) {
    let _this = this

    _this.element = element
    _this.$element = $(element)

    _this.init(opts)
  }

  const template = `
  <div class="dropdown clearfix zcy-district">
    <div class="zcy-district-select dropdown-selector">
      <div class="zcy-district-select-selection selectric">
        <span class="label"></span>
        <b class="button">▾</b>
      </div>
    </div>
    <div class="dropdown-content">
      <ul class="zcy-district-title row">
        <li class="col-md-4 zcy-district-title-tab" data-level="1">省份</li>
        <li class="col-md-4 zcy-district-title-tab" data-level="2">城市</li>
        <li class="col-md-4 zcy-district-title-tab" data-level="3">县区</li>
        <div class="clearfix"></div>
      </ul>
      <div class="zcy-district-selection-container">
        <div class="zcy-district-province-selection zcy-district-selection">
        </div>
        <div class="zcy-district-city-selection zcy-district-selection hide">
        </div>
        <div class="zcy-district-region-selection zcy-district-selection hide">
        </div>
        <div class="clearfix"></div>
      </div>
    </div>
  </div>`

  ZcyDistrict.prototype = {

    utils: {
      /**
       * Transform camelCase string to dash-case.
       *
       * @param  {string} str - The camelCased string.
       * @return {string}       The string transformed to dash-case.
       */
      toDash: function(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      },

      /**
       * Calls the events and hooks registered with function name.
       *
       * @param {string}    fn - The name of the function.
       * @param {number} scope - Scope that should be set on the function.
       */
      triggerCallback: function(fn, scope) {
        var elm = scope.element;
        var func = scope.options['on' + fn];
        var args = [elm].concat([].slice.call(arguments).slice(1));

        if ( $.isFunction(func) ) {
          func.apply(elm, args);
        }

        if ( $.fn[pluginName].hooks[fn] ) {
          $.each($.fn[pluginName].hooks[fn], function() {
            this.apply(elm, args);
          });
        }

        $(elm).trigger(pluginName + '-' + this.toDash(fn), args);
      },

      /**
       * 转换成string
       */
      toString(val) {
        if (!val) {
          return ''
        }
        if ($.isNumeric(val)) {
          return val + ''
        }
        return val
      },

      toArray(str) {
        if (!str) {
          return []
        }
        if ($.isArray(str)) {
          return str
        }
        if ($.isNumeric(str)) {
          return [str]
        }
        if ($.type(str) == 'string') {
          return str.split(',')
        }
      },

      removeOneByCode(array, code) {
        for(let i=0; i<array.length; i++) {
          if (array[i].code == code) {
            array.splice(i, 1)
            break
          }
        }
      },

      filterArray: function(arraySrc, arrayFilter) {
        arrayFilter && $.each(arrayFilter, (index, item) => {
          this.removeOneByCode(arraySrc, item)
        })
        return arraySrc
      },

      formatArrayAttr: function(array) {
        return array && $.map(array, (item) => {
          return {
            id: item.id,
            text: item.text,
            code: item.code,
            level: item.level,
            children: !!(item.children && item.children.length)
          }
        })
      }
    },

    showDropdown() {
      this.$dropdownContent.fadeIn()
    },

    hideDropdown() {
      this.$dropdownContent.fadeOut()
    },

    /**
     * dom点击事件
     */
    onClick() {
      let _this = this
      _this.$selectric.on('click', (event) => {
        this.showDropdown()
        event.stopPropagation()
        event.preventDefault()
        $(document).trigger('zcy.click', _this)
      })
      _this.$dropdownContent.on('click', 'li', function(event) {
        let $target = $(event.target)
        if ($target.hasClass('active')) {
          return false
        }

        let level = $target.data('level')
        // title切换
        if ($target.hasClass('zcy-district-title-tab')) {
          _this.switchTitle(level)
        } else if ($target.hasClass('zcy-district-selection-item')) {
          _this.selectDistrict($target, level)
        }
        event.stopPropagation()
      })

      $(document).on('zcy.click', function(event, scope) {
        if (_this != scope) {
          _this.hideDropdown()
        }
      })
      $(document).on('click', function(event) {
        if (!$(event.target).is('input')) {
          _this.hideDropdown()
        }
      })
    },

    /**
     * 查询本地数据中的子节点数据
     *
     * @param {any} parentId
     * @param {any} level
     * @returns
     */
    findItemByParentId(parentId, level) {
      let children = []
      if (level == 2) {
        $.each(this.options.data, (index, item) => {
          if (item.id == parentId) {
            children = item.children
          }
        })
      } else {
        $.each(this.options.data, (index, item) => {
          $.each(item.children, (innerIndex, innerItem) => {
            if (innerItem.id == parentId) {
              children = innerItem.children
            }
          })
        })
      }
      return children
    },

    /**
     * 获取本地单层级的数据
     *
     * @param {any} parentId
     * @param {any} level
     * @returns
     */
    getLocalData(parentId, level) {
      if (!parentId) {
        return this.utils.filterArray(
          this.utils.formatArrayAttr(this.options.data),
          this.options.filters
        )
      }
      return this.utils.filterArray(
        this.utils.formatArrayAttr(this.findItemByParentId(parentId, level)),
        this.options.filters
      )
    },

    /**
     * 获取区划数据
     *
     * @param {String} parentId
     */
    getDataOfLevel(parentId, level) {
      // 从本地数据获取
      if (this.options.data) {
        return $.Deferred().resolve(this.getLocalData(parentId, level))
      }

      let url = '/api/district/getDistrictTree?deep=1'
      if (parentId) {
        url += `&pid=${parentId}`
      }
      return $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8'
      })
      .then((result) => {
        let data = result.data
        let children = data && data.length && data[0].children || []
        return this.utils.filterArray(children, this.options.filters)
      })
    },

    /**
     * 生成隐藏的dropdown的内容
     *
     * @param {Number} level
     * @param {Array} data
     */
    generatorContent(level, data) {
      let tempDom = '<ul>'
      $.each(data, (index, item) => {
        tempDom += `<li class="zcy-district-selection-item" data-level="${level}" data-children="${item.children}" data-code="${item.code}" data-id="${item.id}">${item.text}</li>`
      })
      tempDom += '</ul><div class="clearfix"></div>'
      return tempDom
    },

    /**
     * 获取区域的dom结构
     *
     * @param {String} parentId
     * @returns
     */
    getDistrictDom(level, parentId) {
      return this.getDataOfLevel(parentId, level)
      .then((data) => {
        return data && this.generatorContent(level, data)
      })
    },

    /**
     * 获取层级的结构选择器
     *
     * @param {Number} level
     * @returns
     */
    getDistrictSelector(level) {
      switch (level) {
        case 1:
          return '.zcy-district-province-selection'
        case 2:
          return '.zcy-district-city-selection'
        default:
          return '.zcy-district-region-selection'
      }
    },

    /**
     * 初始化区域的结构
     *
     * @param {Number} level
     * @param {String} parentId
     * @returns
     */
    initDistrictDom(level, parentId) {
      return this.getDistrictDom(level, parentId)
      .then((content) => {
        let selector = this.getDistrictSelector(level)
        this.$dropdownContent.find(selector).html(content)
      })
    },

    /**
     * 获取区域值存储对象
     *
     * @param {Number} level
     * @returns
     */
    getDistrictObj(level) {
      switch (level) {
        case 1:
          return this.district.province
        case 2:
          return this.district.city
        default:
          return this.district.region
      }
    },

    /**
     * 清空区域的结构
     * 当重新选择省份的时候，需要清空城市和区县
     *
     * @param {Number} level
     */
    clearDistrictDom(level) {
      let districtName = level == 2 ? '省份' : '城市'
      let districtSelector = this.getDistrictSelector(level)
      let emptyContent = `<div class="text-center">请先选择${districtName}</div>`
      this.$dropdownContent.find(districtSelector).html(emptyContent)
    },

    /**
     * 清空区域的值
     *
     * @param {Number} level
     */
    clearDistrictValue(level) {
      let obj = this.getDistrictObj(level)
      $.extend(obj, {text: '', id: '', code: ''})
    },

    /**
     * 切换
     *
     * @param {Number} level
     */
    switchTitle(level) {
      // title进行切换
      let $title = $(`.zcy-district-title-tab[data-level="${level}"]`)
      $title.addClass('active')
      $title.siblings().removeClass('active')
      // 显示选中的区域，隐藏其他
      let $content = $(this.getDistrictSelector(level))
      $content.show()
      $content.siblings().hide()
    },

    /**
     * 渲染值
     */
    renderValue(isInit) {
      // let val = this.district.region.text ||
      //           this.district.city.text ||
      //           this.district.province.text || ''
      let val = this.district.province.text +
                this.district.city.text +
                this.district.region.text || ''
      $('.zcy-district-input').val(val).trigger('focusout.validate')
      let text = this.$selectricLabel.text()
      if (text != val) {
        this.$selectricLabel.text(val)
        !isInit && this.utils.triggerCallback('Change', this)
      }
    },

    getItemDataObj($target) {
      return {
        text: $target.text(),
        id: this.utils.toString($target.data('id')),
        code: this.utils.toString($target.data('code'))
      }
    },

    /**
     * 选中区县
     */
    selectDistrict($target, level, isInit) {
      level = level || $target.data('level')
      // 其他的取消选中
      $target.addClass('active')
      $target.siblings().removeClass('active')

      if (isInit) {
        return
      }
      $.extend(this.getDistrictObj(level), this.getItemDataObj($target))

      let hasChildren = $target.data('children') + '' == 'true'
      // 没有子节点，则为选中
      if (!hasChildren) {
        if(level==1){//针对中央本级
          this.clearDistrictValue(2)
          this.clearDistrictValue(3)
        }
        if (level == 2) {
          this.clearDistrictValue(3)
        }
        this.renderValue()
        this.hideDropdown()
        return
      }
      this.showDistrictDom(level + 1, $target.data('id'))
    },

    /**
     * 通过值选中元素
     * 并修正当前选中的text、code
     *
     * @param {Number} level
     * @param {String} districtCode
     * @returns
     */
    selectDistrictByValue(level, districtCode) {
      if (!districtCode) {
        return
      }
      let selector = this.getDistrictSelector(level)
      let $activeLi = $(selector).find('li.active')
      // 已经有选中，不需要再设值
      if ($activeLi.size()) {
        return
      }
      let $li = $(selector).find(`li[data-code="${districtCode}"]`)
      // 不存在符合项
      if (!$li.size()) {
        return
      }
      this.selectDistrict($li, level, true)
      // 设置text，code等值
      let districtObj = this.getDistrictObj(level)
      $.extend(districtObj, this.getItemDataObj($li))
      return districtObj.id
    },

    /**
     * 显示区域
     *
     * @param {Number} level
     * @param {String} parentId
     * @returns
     */
    showDistrictDom(level, parentId) {
      return this.initDistrictDom(level, parentId)
      .then(() => {
        this.switchTitle(level)
        // 切换显示城市，需要将区县的值清空
        if (level == 2) {
          this.clearDistrictDom(3)
          this.clearDistrictValue(2)
          this.clearDistrictValue(3)
        } else if(level == 3) {
          this.clearDistrictValue(3)
        }
      })
    },

    /**
     * 生成整个结构
     *
     * @returns
     */
    generator(callback) {
      // 初始化省级
      return this.initDistrictDom(1)
      .then(() => {
        this.switchTitle(1)
        this.clearDistrictDom(2)
        this.clearDistrictDom(3)

        let provinceCode = this.district.province.code
        return this.selectDistrictByValue(1, provinceCode)
      })
      .then((provinceId) => {
        let cityCode = this.district.city.code
        // 如果存在初始值，初始化选中
        if (cityCode) {
          return this.initDistrictDom(2, provinceId)
           .then(() => {
             return this.selectDistrictByValue(2, cityCode)
           })
        }
        return provinceId && this.initDistrictDom(2, provinceId)
      })
      .then((cityId) => {
        let regionCode = this.district.region.code
        // 如果存在初始值，初始化选中
        if (regionCode) {
          return this.initDistrictDom(3, cityId)
           .then(() => {
             this.selectDistrictByValue(3, regionCode)
           })
        }
        return cityId && this.initDistrictDom(3, cityId)
      })
      .then(() => {
        this.renderValue(true)
        this.utils.triggerCallback('InitDone', this)
        callback && callback()
      })
    },

    filterClass(elemClass) {
      if (!this.options.filterClass || !this.options.filterClass.length) {
        return ''
      }
      let filteredClass = []
      $.each(this.options.filterClass, (index, className) => {
        if (this.$element.hasClass(className)) {
          filteredClass.push(className)
          this.$element.removeClass(className)
        }
      })
      return filteredClass.join(' ')
    },

    /**
     * 重新排版input
     */
    detachElement() {
      let $dropdown = this.$element.next()
      // 将$element的class转移到外层
      let filteredClass = this.filterClass(elemClass)
      let elemClass = this.$element.attr('class')
      // 避免修改输入，固定显示
      this.$selectric = $dropdown.find('.zcy-district-select-selection')
      this.$selectric.addClass(elemClass)
      this.$selectricLabel = this.$selectric.find('.label')

      this.$dropdown = $dropdown
      this.$dropdownContent = $dropdown.find('.dropdown-content')
      // 添加最小宽度
      this.$dropdownContent.css('min-width', this.$element[0].offsetWidth)
      this.$dropdownSelectorUl = $dropdown.find('.dropdown-selector').append(this.$element.detach())
      this.$element.removeClass().addClass(filteredClass).addClass('zcy-district-input dropdown-input hide')
    },

    /**
     * 初始化组建
     * 如果数据datas存在，则初始化原有的行
     */
    init(opts) {
      let _this = this

      _this.options = $.extend(true, {}, $.fn[pluginName].defaults, _this.options, opts)

      _this.$element.after(template)
      _this.detachElement()

      // 初始化结构
      _this.district = {
        province: {
          text: '',
          id: '',
          code: ''
        },
        city: {
          text: '',
          id: '',
          code: ''
        },
        region: {
          text: '',
          id: '',
          code: ''
        }
      }

      let value = _this.options.code || _this.$element.data('code')
      value && this.setValue(value)

      this.options.filters = this.options.filters || this.utils.toArray(_this.$element.data('filters')) || []

      _this.generator()
      .then(function() {
        _this.onClick()
      })
    },

    /**
     * get district data
     *
     * @returns {Object}
     * {
     *   id: '',
     *   text: ''
     * }
     */
    getValue(param) {
      if (param) {
        if (param.full) {
          return this.district
        }
      }

      let districtId = this.district.region.code
        || this.district.city.code
        || this.district.province.code
      let text = this.district.province.text
        + this.district.city.text
        + this.district.region.text || ''
      return {
        code: this.utils.toString(districtId),
        text
      }
    },

    /**
     * 获取区划code
     *
     * @returns
     */
    getDistrictId() {
      let districtId = this.district.region.code || this.district.city.code || this.district.province.code
      return this.utils.toString(districtId)
    },

    /**
     * 设置districtId
     *
     * @param {String|Number} districtId
     */
    setValue(districtId, callback) {
      if (!districtId) {
        return false
      }
      // 转换成字符串
      districtId += ''
      if (districtId.length != 6) {
        return false
      }
      // 正则表达式拆解 省市区
      let districtArray = districtId.match(/(\d{2})(\d{2})(\d{2})/)
      let regionStr = districtArray[3]
      let cityStr = districtArray[2]
      let provinceStr = districtArray[1]
      // 中央本级
      if (provinceStr == '00') {
        this.district.province.code = districtId
      } else {
        // 省级
        if (cityStr == '00') {
          this.district.province.code = districtId
        } else {
          this.district.province.code = provinceStr + '0000'

          // 市级
          if (regionStr == '00') {
            this.district.city.code = districtId
          } else {
            // 区县
            this.district.city.code = provinceStr + cityStr + '00'
            this.district.region.code = districtId
          }
        }
      }
      this.generator(callback)
      return true
    },

    /**
     * 设置所有的区划数据
     *
     * @param {Object} data
     */
    setLocalData(data) {
      if (!data) {
        return
      }
      this.options.data = data
    }
  }

  $.fn[pluginName] = function(args) {
    return this.each(function() {
      let data = $.data(this, pluginName)
      $.data(this, pluginName, new ZcyDistrict(this, args))
    })
  }

  /**
   * Hooks for the callbacks
   *
   * @type {object}
   */
  $.fn[pluginName].hooks = {
    /**
     * @param {string} callbackName - The callback name.
     * @param {string}     hookName - The name of the hook to be attached.
     * @param {function}         fn - Callback function.
     */
    add: function(callbackName, hookName, fn) {
      if ( !this[callbackName] ) {
        this[callbackName] = {}
      }
      this[callbackName][hookName] = fn
      return this
    },

    /**
     * @param {string} callbackName - The callback name.
     * @param {string}     hookName - The name of the hook that will be removed.
     */
    remove: function(callbackName, hookName) {
      delete this[callbackName][hookName]
      return this
    }
  };

  $.fn[pluginName].defaults = {
    code: '',  // 默认选择的区划code
    filters: null,
    data: null // 所有的区划数据，树形结构
  }

})(jQuery)