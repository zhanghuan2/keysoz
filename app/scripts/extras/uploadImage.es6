(function($) {
  const AliyunUpload = require('extras/aliyun-upload');
  let Modal = require('pokeball/components/modal');

  let pluginName = 'uploadImage';

  let classList = 'Input UploadImageBtn Open Wrapper Focus Hover FileRow';

  /**
   * Create an instance of Selectric
   *
   * @constructor
   * @param {Node} element - The &lt;select&gt; element
   * @param {object}  opts - Options
   */
  let UploadImage = function(element, opts) {
    let _this = this;

    _this.element = element;
    _this.$element = $(element);
    /* 存放所有的文件 */
    _this.files = [];

    _this.init(opts);
  };

  UploadImage.prototype = {
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

      isIE9: function() {
        return window.ScriptEngineMinorVersion && window.ScriptEngineMinorVersion() == 0;
      },

      /**
       * Fromat file size to string
       *
       * @param {Integer} size - The size of file
       * @return {String}        The string of file size
       */
      formatFileSize: function(size){
        let sizeKB = size/1024;
        if (sizeKB < 1) {
          return size.toFixed(1) + 'B';
        }
        let sizeMB = sizeKB/1024;
        if (sizeMB < 1) {
          return sizeKB.toFixed(1) + 'KB';
        }
        let sizeGB = sizeMB/1024;
        if (sizeGB < 1) {
          return sizeMB.toFixed(1) + 'MB';
        }
        return sizeGB.toFixed(1) + 'GB';
      },

      indexOf: function(array, value, attr) {
        for (let index = 0; index < array.length; index++) {
          if (array[index][attr || 'name'] == value) {
            return index;
          }
        }
        return -1;
      }
    },

    templateBtn: function() {
      let _this = this;
      return $(`<li><div class="btn btn-ghost thumbnail">${_this.options.showOnly ? '' : '<div class="icon-zcy icon-plus-black add-btn">+</div>'}<img class="thumbnail thumbnail-single image-preview"></div></li>`, { 'class': _this.classes.UploadImageBtn});
    },

    templateInputFile: function() {
      let _this = this;
      let input = $('<input type="file" class="btn-upload" accept=".jpg,.png,.jpeg,.bmp"/>', {'class': _this.classes.input});
      if (_this.options.multiple) {
        input.attr('multiple', true);
      }
      return input;
    },

    /**
     * 删除图片
     */
    removeImage: function(fileId) {
      let _this = this
      let index = _this.utils.indexOf(_this.files, fileId, 'fileId')
      if (index < 0) {
        return true
      }
      _this.files.splice(index, 1)
      _this.recountFile()
    },

    /**
     * 添加图片预览
     */
    addImagePreview: function(fileId, url) {
      let _this = this;
      if (_this.options.multiple) {
        let $imageTpl = $(`<li data-file-id="${fileId}"><div class="thumbnail"><img class="image-preview" src="${url}">${_this.options.showOnly ? '' : '<a href="javascript:;" class="close del"><i class="icon-zcy icon-guanbi"></i></a>'}</div></li>`);
        _this.$wrapper.prepend($imageTpl);
        return $imageTpl;
      } else {
        let $imagePreview = _this.$wrapper.find('.image-preview');
        // $imagePreview.closest('li').show();
        url && $imagePreview.attr('src', url);
        return $imagePreview;
      }
    },

    /**
     * 预览本地图片
     */
    previewLocal: function(fileId, file, imgSrc) {
      let _this = this;
      if (window.FileReader) {
        _this.addImagePreview(fileId, window.URL.createObjectURL(file));
      } else {
        let image = _this.addImagePreview(fileId)[0];
        image.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
        image.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = imgSrc;
        document.selection.empty();
      }
    },

    /**
     * 计算文件数量，设置input 的data
     */
    recountFile: function() {
      let _this = this
      if (!_this.$input) {
        return;
      }
      _this.$input.data('fileSize', _this.files.length)
    },

    /**
     * 渲染file到dom
     */
    beforeSuccess: function(fileId, file) {
      let _this = this;
      let fileJson = {
        fileId: fileId,
        name: file.name,
        size: file.size
      };
      _this.files.push(fileJson);
      _this.recountFile()
    },

    hideUploadBtn: function(flag) {
      flag ? $(this.$btnButton).hide() : $(this.$btnButton).show()
    },

    /**
     * 过滤文件
     *
     * 过滤文件大小超过限制的文件
     * 提供过滤函数
     */
    filterFiles: function(files, filterFn) {
      let _this = this;
      let fileArray = [];
      let isOverSize = false;

      function filter(file) {
        /* 文件大小限制 */
        if (file.size > _this.options.maxSize) {
          isOverSize = true;
          return false;
        }
        if (!filterFn || filterFn(file)) {
          return file;
        }
        return false;
      }

      if (files instanceof FileList) {
        $.each(files, function(index, file) {
          let result = filter(file);
          result && fileArray.push(result);
        });
      } else {
        let file = filter(files);
        file && fileArray.push(file);
      }

      if (isOverSize) {
        _this.utils.triggerCallback('MaxSizeError', _this);
        _this.resetInput();
      }
      return fileArray;
    },

    previewModal: function($image) {
      let imageSrc = $image.attr('src');
      if (!imageSrc) {
        return false;
      }
      if ($('.image-modal-preview').length) {
        $('.image-modal-preview .modal-preview').attr('src', imageSrc);
      } else {
        let $modal = `<div class="modal image-modal-preview hide w-500">
                        <div class="modal-body">
                          <a href="javascript:;" class="close"><i class="icon-zcy icon-guanbi"></i></a>
                          <img class="modal-preview" src="${imageSrc}"/>
                        </div>
                      </div>`
        $('body').append($modal);
      }
      new Modal('.image-modal-preview').show();
    },

    /**
     * 文件上传
     */
    upload: function(fileOrInput, fileSrc) {
      let _this = this;
      _this.options.callbacks.done = function(fileId, file) {
        _this.beforeSuccess(fileId, file);
        _this.previewLocal(fileId, file, fileSrc);
        if (_this.options.multiple && _this.files.length >= _this.options.multiple) {
          _this.hideUploadBtn(true)
        }
      };
      _this.options.callbacks.error = function(err) {
        new Modal({
          title: '图片上传失败',
          icon: 'error',
          content: err
        }).show();
      };
      AliyunUpload.upload(_this.options.keyUrl, fileOrInput, _this.options.callbacks, {
        formData: {
          bizCode: _this.options.bizCode
        }
      });
    },

    /**
     * 获取现有的上传文件
     *
     * @param isSimple   // 是否是精简显示，暂时添加，后期文件上传统一在文档中心处理时删除掉
     */
    getFiles: function(isSimple) {
      if (!isSimple) {
        return this.files;
      }
      return this.options.multiple ? $.map(this.files, function(file) {
        return file.fileId;
      }).join(',') : (this.files.length ? this.files[0].fileId : '');
    },

    initImage: function() {
      let _this = this;

      if (_this.$input) {
        _this.$input.attr('name', _this.$element.data('name'))
      }

      let fileIds = _this.$element.data('files')
      if (!fileIds) {
        return;
      }
      let files = fileIds && fileIds.split(',')
      $.each(files, (index, fileId) => {
        AliyunUpload.getRealUrl(_this.options.downUrl, fileId)
          .then(function(realUrl) {
            _this.addImagePreview(fileId, realUrl)
            _this.files.push({fileId})

            if (_this.options.multiple && _this.files.length >= _this.options.multiple) {
              _this.hideUploadBtn(true)
            }
            _this.recountFile()
          })
      })
    },

    initImageEventProxy: function() {
      let _this = this;
      _this.$element.find('.thumbnail-list').off('click').on('click', function(event) {
        let $target = $(event.target);
        /* 点击图片，直接预览 */
        if ($target.hasClass('image-preview')) {
          _this.previewModal($target);
          return false;
        }
        if ($target.hasClass('btn-preview')) {  /* 点击上传，单图片 */
          _this.previewModal($container.find('.image-preview'));
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });
      _this.$element.find('.thumbnail-list').on('click', '.del', (event) => {
        let $target = $(event.target)
        let $li = $target.closest('li')
        _this.removeImage($li.data('fileId'))
        $li.remove()
        _this.$element.find('input[type="file"]').val(undefined)

        _this.hideUploadBtn(false)
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
      let _this = this;

      // Set options
      _this.options = $.extend(true, {}, $.fn[pluginName].defaults, _this.options, opts);
      _this.utils.triggerCallback('BeforeInit', _this);

      // Preserve data
      // _this.destroy(true);

      _this.classes = _this.getClassNames();

      if (_this.options.showOnly) {
        // 多个时查看就显示按钮
        _this.$btnButton = _this.options.multiple ? '' : _this.templateBtn();
      } else {
        let input = _this.templateInputFile();
        _this.$btnButton = _this.templateBtn().append(input);
        _this.$input = input
        input.off('change').on('change', function(event) {
          /* trigger触发，忽略 */
          if (!$(this).val() || event.isTrigger) {
            return false;
          }

          let fileOrInput;
          let fileSrc;
          if (window.FileReader) {
            fileOrInput = _this.filterFiles(this.files, function(file) {
              /* 重复文件不操作 */
              let index = _this.utils.indexOf(_this.files, file.name, 'name');
              return index < 0;
            });
            if (_this.options.multiple && (fileOrInput.length + _this.files.length > _this.options.multiple)) {
              _this.utils.triggerCallback('MaxLimitError', _this);
              $(this).val(undefined)
              return false;
            }
          } else {
            fileOrInput = this;
            /* IE8 */
            this.select();
            /* IE9 */
            _this.utils.isIE9() && this.blur();
            fileSrc = document.selection.createRange().text;
          }

          _this.upload(fileOrInput, fileSrc);
        });
      }

      let wrapper = $('<ul class="thumbnail-list"/>').append(_this.$btnButton);
      _this.$element.addClass('upload-image').prepend(wrapper);
      _this.$wrapper = wrapper;

      if (_this.options.large) {
        wrapper.addClass('thumbnail-lg')
      }

      _this.initImage();
      _this.initImageEventProxy();
    },

    /**
     * Generate classNames for elements
     *
     * @return {object} Classes object
     */
    getClassNames: function() {
      let _this = this;
      let customClass = _this.options.customClass;
      let classesObj = {};

      $.each(classList.split(' '), function(i, currClass) {
        let c = customClass.prefix + currClass;
        classesObj[currClass.toLowerCase()] = customClass.camelCase ? c : _this.utils.toDash(c);
      });

      classesObj.prefix = customClass.prefix;
      return classesObj;
    },
  };

  $.fn[pluginName] = function(args) {
    return this.each(function() {
      let data = $.data(this, pluginName);

      if ( data && !data.disableOnMobile ) {
        (typeof args === 'string' && data[args]) ? data[args]() : data.init(args);
      } else {
        $.data(this, pluginName, new UploadImage(this, args));
      }
    });
  };

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
        this[callbackName] = {};
      }

      this[callbackName][hookName] = fn;

      return this;
    },

    /**
     * @param {string} callbackName - The callback name.
     * @param {string}     hookName - The name of the hook that will be removed.
     */
    remove: function(callbackName, hookName) {
      delete this[callbackName][hookName];

      return this;
    }
  };

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
    maxSize: 2*1024*1024,
    customClass: {
      prefix: pluginName,
      camelCase: false
    },
    large: false,
    showOnly: false,
    multiple: false   /* IE8,9不支持此属性，配置无效 */
  };
})(jQuery);