(function($) {
  const AliyunUpload = require('extras/aliyun-upload')

  let pluginName = 'uploadFileBox'

  let classList = 'Input UploadFileBtn Open Wrapper Focus Hover FileRow'

  /**
   * Create an instance of Selectric
   *
   * @constructor
   * @param {Node} element - The &ltselect&gt element
   * @param {object}  opts - Options
   */
  let UploadFileBox = function(element, opts) {
    let _this = this

    _this.element = element
    _this.$element = $(element)
    /* 存放所有的文件 */
    _this.files = []

    _this.init(opts)
  }

  UploadFileBox.prototype = {
    utils: {
      /**
       * Transform camelCase string to dash-case.
       *
       * @param  {string} str - The camelCased string.
       * @return {string}       The string transformed to dash-case.
       */
      toDash: function(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      },

      /**
       * Calls the events and hooks registered with function name.
       *
       * @param {string}    fn - The name of the function.
       * @param {number} scope - Scope that should be set on the function.
       */
      triggerCallback: function(fn, scope) {
        var elm = scope.element
        var func = scope.options['on' + fn]
        var args = [elm].concat([].slice.call(arguments).slice(1))

        if ( $.isFunction(func) ) {
          func.apply(elm, args)
        }

        if ( $.fn[pluginName].hooks[fn] ) {
          $.each($.fn[pluginName].hooks[fn], function() {
            this.apply(elm, args)
          })
        }

        $(elm).trigger(pluginName + '-' + this.toDash(fn), args)
      },

      toFloat: function(val) {
        return val%1 === 0 ? val : val.toFixed(1)
      },

      /**
       * Fromat file size to string
       *
       * @param {Integer} size - The size of file
       * @return {String}        The string of file size
       */
      formatFileSize: function(size) {
        let sizeKB = size/1024
        if (sizeKB < 1) {
          return this.toFloat(size) + 'B'
        }
        let sizeMB = sizeKB/1024
        if (sizeMB < 1) {
          return this.toFloat(sizeKB) + 'K'
        }
        let sizeGB = sizeMB/1024
        if (sizeGB < 1) {
          return this.toFloat(sizeMB) + 'M'
        }
        return this.toFloat(sizeGB) + 'G'
      },

      filterSpecialChar: function(str) {
        if (!str) {
          return ''
        }
        return str.replace(/\ /g, '').replace(/\>/g, '').replace(/\</g, '')
      },

      rowTemplate: function(file, showOnly, title) {
        return `<div class="fileRow" data-file-id="${file.fileId}">
                  ${showOnly? '' : '<a class="deleteFile"><i class="icon-zcy icon-close"></i></a>'}
                  <div class="fileMsg"><span class="fileName">${title}</span></div>
                </div>`
      }
    },

    /**
     * 计算文件数量，设置input 的data
     */
    recountFile: function() {
      let _this = this
      if (!_this.$input) {
        return
      }
      _this.$input.data('fileSize', _this.files.length)
    },

    /**
     * 渲染file到dom
     */
    addFileRow: function(file) {
      let _this = this
      let fileRow = _this.utils.rowTemplate(file, _this.options.showOnly, _this.options.title)
      _this.$wrapper.hide();
      _this.$element.append(fileRow);
      _this.$wrapper.find('input[name="requiredInput"]').val('1');
      _this.$wrapper.find('input[name="requiredInput"]').trigger('blur');
      _this.files.push(file)
    },

    beforeSuccess: function(fileId, file) {
      let _this = this
      let fileJson = {
        fileId: fileId,
        name: this.utils.filterSpecialChar(file.name),
        size: file.size
      }
      _this.addFileRow(fileJson)
      _this.recountFile()
    },

    findFileById: function(fileId) {
      let _this = this
      for (let index = 0; index < _this.files.length; index++) {
        if (_this.files[index].fileId == fileId) {
          return index
        }
      }
      return -1
    },

    findFileByName: function(fileName) {
      let _this = this
      for (let index = 0; index < _this.files.length; index++) {
        if (_this.files[index].name == fileName) {
          return index
        }
      }
      return -1
    },

    /**
     * 过滤文件
     *
     * 过滤文件大小超过限制的文件
     * 提供过滤函数
     */
    filterFiles: function(files, filterFn) {
      let _this = this
      let fileArray = []
      let isOverSize = false

      function filter(file) {
        /* 文件大小限制 */
        if (file.size > _this.options.maxSize) {
          isOverSize = true
          return false
        }
        if (!filterFn || filterFn(file)) {
          return file
        }
        return false
      }

      if (files instanceof FileList) {
        $.each(files, function(index, file) {
          let result = filter(file)
          result && fileArray.push(result)
        })
      } else {
        let file = filter(files)
        file && fileArray.push(file)
      }
      if (isOverSize) {
        _this.utils.triggerCallback('MaxSizeError', _this)
        _this.resetInput()
      }
      return fileArray
    },

    /**
     * 文件上传
     */
    upload: function(fileOrInput, mode) {
      let _this = this
      AliyunUpload.upload(_this.options.keyUrl, fileOrInput, _this.options.callbacks, {
        formData: {
          bizCode: _this.options.bizCode
        }
      })
    },

    /**
     * 获取现有的上传文件
     */
    getFiles: function(simple) {
      if (simple) {
        return this.files.length ? this.files[0].fileId : ''
      }
      return this.files
    },

    /**
     * 转换文件对象
     * 由于后端数据格式问题，需要调整，兼容多种格式
     * 1、只保存文件的fileId字符串
     * 2、保存文件的对象字符串
     * 3、保存文件的对象数组字符串
     * 4、返回格式为数组格式
     */
    transformFileData: function(filesStr) {
      if (!filesStr) {
        return
      }
      if ($.type(filesStr) === 'string') {
        // 存在fileId，则可能是多个，需要讲数据进行转换
        if (filesStr.indexOf('fileId') > -1) {
          let files = JSON.parse(filesStr)
          // 结果是数组
          if ($.isArray(files)) {
            return files
          }
          // 结果是单个文件对象
          return [files]
        }
        // 结果为文件的fileId
        return [{fileId: filesStr, name: '附件'}]
      }

      // 直接返回数组
      if ($.isArray(filesStr)) {
        return filesStr
      }
      return [filesStr]
    },

    initFileList: function() {
      let _this = this
      let fileData = _this.$element.data('file')
      let files = _this.transformFileData(fileData)
      files && files.length && $.each(files, function(index, file) {
        _this.addFileRow(file)
      })
    },

    /**
     * 文件删除
     */
    initDeleteProxy: function() {
      let _this = this
      _this.$element.on('click', '.deleteFile', function(event) {
        let $fileRow = $(event.target).closest('.fileRow')
        let fileId = $fileRow.data('fileId')
        if (!fileId || fileId == 'undefined') {
          return
        }
        let index = _this.findFileById(fileId)
        _this.files.splice(index, 1)
        /* 删除dom */
        $fileRow.remove()
        _this.$wrapper.find('input[name="requiredInput"]').val('');
        _this.$wrapper.find('input[name="requiredInput"]').trigger('blur');
        _this.$wrapper.show();
        _this.recountFile()
      })
    },

    /**
     * 文件下载
     */
    initDownloadProxy: function() {
      let _this = this
      _this.$element.on('click', '.fileName', function(event) {
        let $fileRow = $(event.target).closest('.fileRow')
        let fileId = $fileRow.data('fileId')
        if (!fileId || fileId == 'undefined') {
          return
        }
        AliyunUpload.download(_this.options.downUrl, fileId)
      })
    },

    /**
     * 重置
     */
    resetInput() {
      if (this.$input) {
        this.$input.val(undefined)
      }
    },

    /**
     * 初始化
     */
    init: function(opts) {
      let _this = this

      // Set options
      _this.options = $.extend(true, {}, $.fn[pluginName].defaults, _this.options, opts)
      _this.options.callbacks.done = function(fileId, file) {
        _this.beforeSuccess(fileId, file)
        // 清空
        _this.$input.val(undefined)
      }
      _this.utils.triggerCallback('BeforeInit', _this)

      // Preserve data
      // _this.destroy(true)

      if (_this.options.showOnly) {
        let wrapper = $('<div class="uploadFile"/>')
        _this.$element.append(wrapper)
        _this.$wrapper = wrapper

        _this.initFileList()
        _this.initDownloadProxy()
        return
      }

      _this.classes = _this.getClassNames()
      let input = $('<input type="file" name="zossfile" class="btn-upload"/>', {'class': _this.classes.input})
      // if (_this.options.multiple) {
      //   input.attr('multiple', true)
      // }

      let button;
      if(opts.required) {
        button = $('<button type="button" class="btn btn-ghost"><span class="required">*</span>上传<br>'+opts.title+'</button>', { 'class': _this.classes.UploadFileBtn})
      }
      else {
        button = $('<button type="button" class="btn btn-ghost">上传<br>'+opts.title+'</button>', { 'class': _this.classes.UploadFileBtn})
      }
      let wrapper = $('<div class="uploadFile"/>').append(input, button)
      if(opts.required){
        let requiredInput = $('<input type="hidden" name="requiredInput" checker-text="false" checker-icon="false" required/>')
        wrapper.append(requiredInput);
      }
      _this.$element.append(wrapper)
      _this.$wrapper = wrapper

      _this.$input = input
      input.off('change').on('change', function(event) {
        /* trigger触发，忽略 */
        if (!$(this).val() || event.isTrigger) {
          return
        }

        if (_this.options.multiple) {
          if (_this.files.length >= _this.options.multiple) {
            _this.utils.triggerCallback('MaxLimitError', _this)
            $(this).val(undefined)
            return false
          }
        } else {
          if (_this.files.length) {
            _this.utils.triggerCallback('MaxLimitError', _this)
            $(this).val(undefined)
            return false
          }
        }

        let fileOrInput
        if (window.FileReader) {
          fileOrInput = _this.filterFiles(this.files, function(file) {
            /* 重复文件不操作 */
            return _this.findFileByName(_this.utils.filterSpecialChar(file.name)) < 0
          })
        } else {
          fileOrInput = this
        }

        _this.upload(fileOrInput)
      })

      _this.initFileList()

      _this.initDeleteProxy()
      _this.initDownloadProxy()
    },

    /**
     * Generate classNames for elements
     *
     * @return {object} Classes object
     */
    getClassNames: function() {
      let _this = this
      let customClass = _this.options.customClass
      let classesObj = {}

      $.each(classList.split(' '), function(i, currClass) {
        let c = customClass.prefix + currClass
        classesObj[currClass.toLowerCase()] = customClass.camelCase ? c : _this.utils.toDash(c)
      })

      classesObj.prefix = customClass.prefix
      return classesObj
    },
  }

  $.fn[pluginName] = function(args) {
    return this.each(function() {
      let data = $.data(this, pluginName)

      if ( data && !data.disableOnMobile ) {
        (typeof args === 'string' && data[args]) ? data[args]() : data.init(args)
      } else {
        $.data(this, pluginName, new UploadFileBox(this, args))
      }
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
  }

  $.fn[pluginName].defaults = {
    keyUrl: '/api/zoss/getSTSToken', //'/zcy/experts/attachment/credentials',
    downUrl: '/api/zoss/getDownLoadUrl', //'/zcy/experts/download',
    bizCode: 1099,
    callbacks: {
      success: $.noop,
      progress: $.noop,
      error: $.noop,
      done: $.noop
    },
    showOnly: false,
    maxSize: 20*1024*1024,
    customClass: {
      prefix: pluginName,
      camelCase: false
    },
    multiple: false   /* IE8,9不支持此属性，配置无效 */
  }

  /**
   * example
   *
   * <div data-file="[]">
   * </div>
   *
   */

})(jQuery)