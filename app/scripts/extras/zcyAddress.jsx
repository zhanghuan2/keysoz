/**
 * 区划选择
 */

(function ($) {
  let pluginName = 'zcyAddress'

  let ZcyAddress = function (element, opts) {
    let _this = this

    _this.element = element
    _this.$element = $(element)

    _this.init(opts)
  }

  const template = `
  <div class="dropdown clearfix zcy-address">
    <div class="zcy-address-select dropdown-selector">
      <div class="zcy-address-select-selection selectric">
        <span class="label"></span>
        <b class="button btn-default">▾</b>
        <b class="btn-clear hide"><i class="icon-zcy icon-guanbi"></i></b>
      </div>
    </div>
    <div class="dropdown-content">
      <ul class="zcy-address-title row">
        <li class="col-md-4 zcy-address-title-tab" data-level="1">省份</li>
        <li class="col-md-4 zcy-address-title-tab" data-level="2">城市</li>
        <li class="col-md-4 zcy-address-title-tab" data-level="3">县区</li>
        <div class="clearfix"></div>
      </ul>
      <div class="zcy-address-selection-container">
        <div class="zcy-address-province-selection zcy-address-selection">
        </div>
        <div class="zcy-address-city-selection zcy-address-selection hide">
        </div>
        <div class="zcy-address-region-selection zcy-address-selection hide">
        </div>
        <div class="clearfix"></div>
      </div>
    </div>
  </div>`

  ZcyAddress.prototype = {

    utils: {
      /**
       * Transform camelCase string to dash-case.
       *
       * @param  {string} str - The camelCased string.
       * @return {string}       The string transformed to dash-case.
       */
      toDash: function (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      },

      /**
       * Calls the events and hooks registered with function name.
       *
       * @param {string}    fn - The name of the function.
       * @param {number} scope - Scope that should be set on the function.
       */
      triggerCallback: function (fn, scope) {
        var elm = scope.element
        var func = scope.options['on' + fn]
        var args = [elm].concat([].slice.call(arguments).slice(1))

        if ($.isFunction(func)) {
          func.apply(elm, args)
        }

        if ($.fn[pluginName].hooks[fn]) {
          $.each($.fn[pluginName].hooks[fn], function () {
            this.apply(elm, args)
          })
        }

        $(elm).trigger(pluginName + '-' + this.toDash(fn), args)
      },

      /**
       * 转换成string
       */
      toString (val) {
        if (!val) {
          return ''
        }
        if ($.isNumeric(val)) {
          return val + ''
        }
        return val
      }
    },

    showDropdown () {
      this.$dropdownContent.fadeIn()
    },

    hideDropdown () {
      this.$dropdownContent.fadeOut()
    },

    /**
     * dom点击事件
     */
    onClick () {
      let _this = this
      _this.$selectric.on('click', (event) => {

        const $target = $(event.target)
        if ($target.hasClass('btn-clear') || $target.parent().hasClass('btn-clear')) {
          this.clearValue()
          return
        }

        this.showDropdown()
        event.stopPropagation()
        event.preventDefault()
        $(document).trigger('zcy.click', _this)
      })
      _this.$dropdownContent.on('click', 'li', function (event) {
        let $target = $(event.target)
        let level = $target.data('level')
        // title切换
        if ($target.hasClass('zcy-address-title-tab')) {
          _this.switchTitle(level)
        } else if ($target.hasClass('zcy-address-selection-item')) {
          _this.selectAddress($target, level)
        }
        event.stopPropagation()
      })

      _this.$element.on('zcy-address-hide', () => {
        _this.clearAddressValue()
        _this.renderValue()
        _this.$selectric.addClass('hide')
      })
      _this.$element.on('zcy-address-show', () => {
        _this.$selectric.removeClass('hide')
      })

      $(document).on('click', function (event) {
        if (!$(event.target).is('input')) {
          // _this.renderValue()
          _this.hideDropdown()
        }
      })

      $(document).on('zcy.click', function (event, scope) {
        if (_this != scope) {
          _this.hideDropdown()
        }
      })
    },

    /**
     * 获取区划数据
     *
     * @param {String} parentId
     */
    getDataOfLevel (parentId) {
      let url = `/api/address/${parentId || 0}/children`
      return $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8'
      })
      .then((data) => {
        return data || []
      })
    },

    /**
     * 生成隐藏的dropdown的内容
     *
     * @param {Number} level
     * @param {Array} data
     */
    generatorContent (level, data) {
      let tempDom = '<ul>'
      $.each(data, (index, item) => {
        tempDom += `<li class="zcy-address-selection-item" data-level="${level}" data-id="${item.id}">${item.name}</li>`
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
    getAddressDom (level, parentId) {
      return this.getDataOfLevel(parentId)
      .then((data) => {
        return this.generatorContent(level, data)
      })
    },

    /**
     * 获取层级的结构选择器
     *
     * @param {Number} level
     * @returns
     */
    getAddressSelector (level) {
      switch (level) {
        case 1:
          return this.$dropdownContent.find('.zcy-address-province-selection')
        case 2:
          return this.$dropdownContent.find('.zcy-address-city-selection')
        default:
          return this.$dropdownContent.find('.zcy-address-region-selection')
      }
    },

    /**
     * 初始化区域的结构
     *
     * @param {Number} level
     * @param {String} parentId
     * @returns
     */
    initAddressDom (level, parentId) {
      return this.getAddressDom(level, parentId)
      .then((content) => {
        let $selector = this.getAddressSelector(level)
        $selector.html(content)
      })
    },

    /**
     * 获取区域值存储对象
     *
     * @param {Number} level
     * @returns
     */
    getAddressObj (level) {
      switch (level) {
        case 1:
          return this.address.province
        case 2:
          return this.address.city
        default:
          return this.address.region
      }
    },

    /**
     * 清空区域的结构
     * 当重新选择省份的时候，需要清空城市和区县
     *
     * @param {Number} level
     */
    clearAddressDom (level) {
      let addressName = level == 2 ? '省份' : '城市'
      let $addressSelector = this.getAddressSelector(level)
      let emptyContent = `<div class="text-center">请先选择${addressName}</div>`
      $addressSelector.html(emptyContent)
    },

    /**
     * 清空区域的值
     *
     * @param {Number} level
     */
    clearAddressValue (level) {
      if (!level) {
        this.address = {
          province: {
            name: '',
            id: ''
          },
          city: {
            name: '',
            id: ''
          },
          region: {
            name: '',
            id: ''
          }
        }
        return
      }
      let obj = this.getAddressObj(level)
      $.extend(obj, {name: '', id: ''})
    },

    /**
     * 切换
     *
     * @param {Number} level
     */
    switchTitle (level) {
      // title进行切换
      let $title = this.$dropdown.find(`.zcy-address-title-tab[data-level="${level}"]`)
      $title.addClass('active')
      $title.siblings().removeClass('active')
      // 显示选中的区域，隐藏其他
      let $content = this.getAddressSelector(level)
      $content.show()
      $content.siblings().hide()
    },

    /**
     * 渲染值
     */
    renderValue (isInit) {
      // let val = this.address.region.name ||
      //           this.address.city.name ||
      //           this.address.province.name || ''
      let val = (this.address.province.name || '') +
                (this.address.city.name || '') +
                (this.address.region.name || '')
      this.$dropdown.find('.zcy-address-input').val(val).trigger('focusout.validate')
      let text = this.$selectricLabel.text()
      if (!val) {
        this.$selectric.removeClass('valid')
      }
      if (text != val) {
        this.$selectricLabel.text(val)
        !isInit && this.utils.triggerCallback('Change', this)
      }
    },

    getItemDataObj ($target) {
      return {
        name: $target.text(),
        id: $target.data('id')
      }
    },

    /**
     * 选中区县
     */
    selectAddress ($target, level, isInit) {
      level = level || $target.data('level')
      // 其他的取消选中
      $target.addClass('active')
      $target.siblings().removeClass('active')

      if (isInit) {
        return
      }
      $.extend(this.getAddressObj(level), this.getItemDataObj($target))

      // 最后的地址
      if (level == 3) {
        this.renderValue()
        this.hideDropdown()
        return
      }
      this.showAddressDom(level + 1, $target.data('id'))
    },

    /**
     * 通过值选中元素
     * 并修正当前选中的name
     *
     * @param {Number} level
     * @param {String} addressId
     * @returns
     */
    selectAddressByValue (level, addressId) {
      if (!addressId) {
        return
      }
      let $selector = this.getAddressSelector(level)
      let $activeLi = $selector.find('li.active')
      // 已经有选中，不需要再设值
      if ($activeLi.size()) {
        return
      }
      let $li = $selector.find(`li[data-id="${addressId}"]`)
      // 不存在符合项
      if (!$li.size()) {
        return
      }
      this.selectAddress($li, level, true)
      // 设置name等值
      let addressObj = this.getAddressObj(level)
      $.extend(addressObj, this.getItemDataObj($li))
      return addressObj.id
    },

    /**
     * 显示区域
     *
     * @param {Number} level
     * @param {String} parentId
     * @returns
     */
    showAddressDom (level, parentId) {
      return this.initAddressDom(level, parentId)
      .then(() => {
        this.switchTitle(level)
        // 切换显示城市，需要将区县的值清空
        if (level == 2) {
          this.clearAddressDom(3)
          this.clearAddressValue(2)
          this.clearAddressValue(3)
        } else if (level == 3) {
          this.clearAddressValue(3)
        }

        // this.renderValue()
      })
    },

    /**
     * 生成整个结构
     *
     * @returns
     */
    generator () {
      // 初始化省级
      return this.initAddressDom(1)
      .then(() => {
        this.switchTitle(1)
        this.clearAddressDom(2)
        this.clearAddressDom(3)

        let provinceId = this.address.province.id
        return this.selectAddressByValue(1, provinceId)
      })
      .then((provinceId) => {
        let cityId = this.address.city.id
        // 如果存在初始值，初始化选中
        if (cityId) {
          return this.initAddressDom(2, provinceId)
           .then(() => {
             return this.selectAddressByValue(2, cityId)
           })
        }
      })
      .then((cityId) => {
        let regionId = this.address.region.id
        // 如果存在初始值，初始化选中
        if (regionId) {
          return this.initAddressDom(3, cityId)
           .then(() => {
             this.selectAddressByValue(3, regionId)
           })
        }
      })
      .then(() => {
        this.renderValue(true)
        this.utils.triggerCallback('Done', this)
      })
    },

    filterClass (elemClass) {
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
    detachElement () {
      let $dropdown = this.$element.next()
      // 将$element的class转移到外层
      let filteredClass = this.filterClass(elemClass)
      let elemClass = this.$element.attr('class')
      // 避免修改输入，固定显示
      this.$selectric = $dropdown.find('.zcy-address-select-selection')
      this.$selectric.addClass(filteredClass)
      this.$selectricLabel = this.$selectric.find('.label')

      this.$dropdown = $dropdown
      this.$dropdownContent = $dropdown.find('.dropdown-content')
      // 添加最小宽度
      this.$dropdownContent.css('min-width', this.$element[0].offsetWidth)
      this.$dropdownSelectorUl = $dropdown.find('.dropdown-selector').append(this.$element.detach())
      this.$element.addClass('zcy-address-input dropdown-input hide')
    },

    /**
     * 初始化组建
     * 如果数据datas存在，则初始化原有的行
     */
    init (opts) {
      let _this = this

      let provinceId = _this.$element.data('provinceId')
      let cityId = _this.$element.data('cityId')
      let regionId = _this.$element.data('regionId')

      // 初始化结构
      _this.address = {
        province: {
          name: '',
          id: provinceId || ''
        },
        city: {
          name: '',
          id: cityId || ''
        },
        region: {
          name: '',
          id: regionId || ''
        }
      }

      _this.options = $.extend(true, {}, $.fn[pluginName].defaults, _this.options, opts)

      _this.$element.after(template)
      _this.detachElement()

      _this.$element
      .on('focus', function () {
        _this.showDropdown()
      })

      _this.generator()
      .then(function () {
        _this.onClick()
      })
    },

    /**
     * get address data
     *
     * @returns {Object}
     * {
     *   id: '',
     *   name: ''
     * }
     */
    getValue () {
      return {
        province: this.address.province.name,
        provinceId: this.utils.toString(this.address.province.id),
        city: this.address.city.name,
        cityId: this.utils.toString(this.address.city.id),
        region: this.address.region.name,
        regionId: this.utils.toString(this.address.region.id)
      }
    },

    clearValue () {
      this.address = {
        province: {
          name: '',
          id: ''
        },
        city: {
          name: '',
          id: ''
        },
        region: {
          name: '',
          id: ''
        }
      }
      // 将值清空
      this.initAddressDom(1)
          .then(() => {
            this.switchTitle(1)
            this.clearAddressDom(2)
            this.clearAddressDom(3)
          }).then(() => {
            this.renderValue()
          })
    },

    /**
     * 设置
     *
     * @param {String|Number}
     */
    setValue (province, city, region) {
      this.address = $.extend(this.address, {
        province: {id: province},
        city: {id: city},
        region: {id: region}
      })

      this.generator()
    }
  }

  $.fn[pluginName] = function (args) {
    return this.each(function () {
      let data = $.data(this, pluginName)
      $.data(this, pluginName, new ZcyAddress(this, args))
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
    add: function (callbackName, hookName, fn) {
      if (!this[callbackName]) {
        this[callbackName] = {}
      }
      this[callbackName][hookName] = fn
      return this
    },
    /**
     * @param {string} callbackName - The callback name.
     * @param {string}     hookName - The name of the hook that will be removed.
     */
    remove: function (callbackName, hookName) {
      delete this[callbackName][hookName]
      return this
    }
  }

  $.fn[pluginName].defaults = {
  }
})(jQuery)
