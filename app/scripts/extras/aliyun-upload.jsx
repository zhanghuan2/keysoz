/** *
 * 上传和下载文件工具类
 * @author xiongyy@cai.com
 *
 */
try {
  require("aliyun-sdk/extend");
  require("oss-js-upload/extend");
} catch (e) {
  console.info('module aliyun-sdk/oss-js-upload require error ', e)
}

let frameCount = 0;

/**
 * 格式化返回结果
 * 暂时单文件上传，只返回一个
 * @param data {Object}
 * {
 *   "success": "true",
 *   "result: {
 *     fileList: [{
 *       "fileId": "aada/edadsaseee",
 *       "size": "8892",
 *       "fileName": "name.jpg"
 *     }]
 *   }"
 * }
 **/
function formatFileInfo(data) {
  if (!data || !data.result || !data.result.fileList || !data.result.fileList.length) {
    return {};
  }
  let file = data.result.fileList[0];
  file.name = file.fileName;
  return file;
}

/**
 * 获取文件上传Key
 * @param url
 * @param callbacks
 */
function getUploadKey(url, fileNum, bizCode, callbacks) {
  $.ajax({
    type: 'GET',
    url: url,
    data: {
      fileNum: fileNum,
      bizCode: bizCode
    },
    dataType: 'json',
    contentType: 'application/json;charset:utf-8',
    success: callbacks.success,
    error: callbacks.error
  });
}

/**
 * 初始化oss上传组件
 * @param key {Object}
 */
function initOssUpload(key) {
  return new OssUpload({
    bucket: key.bucket,
    // 根据你的 oss 实例所在地区选择填入
    // 杭州：http://oss-cn-hangzhou.aliyuncs.com
    // 北京：http://oss-cn-beijing.aliyuncs.com
    // 青岛：http://oss-cn-qingdao.aliyuncs.com
    // 深圳：http://oss-cn-shenzhen.aliyuncs.com
    // 香港：http://oss-cn-hongkong.aliyuncs.com
    endpoint: key.endPoint, // 'http://oss-cn-hangzhou.aliyuncs.com',
    // 如果文件大于 chunkSize 则分块上传, chunkSize 不能小于 100KB 即 102400
    chunkSize: 1048576,
    // 分块上传的并发数
    concurrency: 2,
    // 注意: 虽然使用 accessKeyId 和 secretAccessKey 可以进行上传, 但是存在泄露风险, 因此强烈建议使用下面的 STS token
    // 只有在确认不会出现泄露风险的情况下, 才使用 aliyunCredential
    //aliyunCredential: {
    //"accessKeyId": key.accessKeyId,
    //"secretAccessKey": key.accessKeySecret
    //},
    stsToken: // 这是一个 stsToken 的样例
    {
      //      "RequestId": "577DA7A9-35BB-4AC0-8B39-F75DF8BDACB2",
      //      "AssumedRoleUser": {
      //        "AssumedRoleId": "391405342211886582:chylvina",
      //          "Arn": "acs:ram::31611321:role/role-oss-js-upload/chylvina"
      //      },
      "Credentials": {
        "AccessKeySecret": key.accessKeySecret,
        "AccessKeyId": key.accessKeyId,
        "Expiration": key.expiration,
        "SecurityToken": key.securityToken
      }
    }
  });
}

/**
 * 使用FileApi上传文件到阿里云OSS, 使用阿里云SDK提供的一些特性
 * @param url {String} 获取key 接口地址
 * @param files {FileList} 文件列表
 * @param callbacks {Object} 回调函数
 */
function uploadUsingFileApi(url, files, bizCode, callbacks) {
  getUploadKey(url, files.length, bizCode, {
    error: callbacks.error,
    success: function (data) {
      if (!data || !data.success) {
        callbacks.error('文件上传异常');
        return;
      }
      let key = data.result;
      let ossUpload = initOssUpload(key)
      for (let i = 0; i < files.length; i++) {
        if ('function' === typeof callbacks.addMeta) {
          callbacks.addMeta(files[i], key.data[i])
        }
        let filename = encodeURI(files[i].name)
        ossUpload.upload({
          // 必传参数, 需要上传的文件对象
          file: files[i],
          // 必传参数, 文件上传到 oss 后的名称, 包含路径
          key: key.data[i],
          // 上传失败后重试次数
          maxRetry: 3,
          // OSS支持4个 HTTP RFC2616(https://www.ietf.org/rfc/rfc2616.txt)协议规定的Header 字段：
          // Cache-Control、Expires、Content-Encoding、Content-Disposition。
          // 如果上传Object时设置了这些Header，则这个Object被下载时，相应的Header值会被自动设置成上传时的值
          // 可选参数
          headers: {
            'CacheControl': 'public',
            'Expires': '',
            'ContentEncoding': '',
            'ContentDisposition': `attachment;filename="${filename}";filename*=UTF-8''${filename}`,
            // oss 支持的 header, 目前仅支持 x-oss-server-side-encryption
            'ServerSideEncryption': ''
          },
          // 文件上传中调用, 可选参数
          onprogress: function (evt) {
            if ('function' === typeof callbacks.progress) {
              callbacks.progress(evt);
            }
          },
          // 文件上传失败后调用, 可选参数
          onerror: function (evt) {
            callbacks.error(evt);
          },
          // 文件上传成功调用, 可选参数
          oncomplete: function (res) {
            callbacks.success(this.key, this.file.name, this.file.size, this.file.type);
            callbacks.done && callbacks.done(this.key, this.file)
          }
        })
      }
    }
  })
}

/**
 * 使用iframe 上传文件通过政采云平台中传上传到OSS
 * @param inputElement {HTMLInputElement}
 * @param callbacks {Object}, callbacks.success,中参数eg:<pre>
 * {
 *   "success": true,
 *   "result": {
 *       "fileList": [{filename: "38100/7100/ed497b34-be09-4b98-8da0-ebdf2164c2b5.png",size: 1212, fileId: '2112122112'}],
 *       "bucket":"demo-doc",
 *       "ext":{
 *           "key1":"扩展参数返回值1",
 *           "key2":"扩展参数返回值2"
 *       }
 *   }
 *}
 * </pre>
 * callbacks.error,参数,eg:<pre>
 * {
 *     "success":false,
 *      "error":"[6001]传入参数bizCode无效!"
 * }
 * @param formData {Object}参数中需要有:
 * bizCode ：上传附件所属业务类型，新业务由后端服务负责人（长乐）分配
 * midPath ：中间路径，由业务端自定义，主要是为文件划分进一步路径
 * userId ：用户ID ，标识文件所属用户
 * 可扩展参数
 * extMap ： 扩展入参，如需定制某些业务文件上传，可传动态参数，参数值格式遵守Map json串化格式
 **/
function uploadUsingFrame(inputElement, callbacks, formData) {
  let uploadHandler = '/api/zoss/upload'
  ajaxSubmit(uploadHandler, inputElement, formData, callbacks)
}

/**
 * 使用Frame上传
 * @param url {String} 上传文件 后台接口
 * @param input {HTMLInputElement} 文件选择表单元素,目前不支持多文件元素,只能是HTMLElement不能是jQuery对象
 * @param formData {Object} 表单参数,如果不需要额外参数,传入null
 * @param callbacks {Object} callbacks.beforeSend {Function} callbacks.success callbacks.error
 */
function ajaxSubmit(url, input, formData, callbacks) {
  let startUpload = function() {
    frameCount++
    let beforeSend = callbacks.beforeSend || $.noop
    let v = (false !== beforeSend.call(input, input.value))
    if (v) {
      let $input = $(input)
      let frameName = `upload_frame_${frameCount}`
      let uploadFrame = $(`<iframe style="position:absolute;top:-9999px" name="${frameName}"><script type="text/javascript"></script></iframe>`)

      let form = $('<form method="post" style="display:none;" enctype="multipart/form-data" />')
      form.attr("target", frameName).attr('action', url)
      let $cloneInput = $input.clone(true)
      $cloneInput.insertAfter($input);
      let formHtml = ""
      // form中增加数据域
      let key
      if(formData) {
        for (key in formData) {
          formHtml += '<input type="hidden" name="' + key + '" value="' + formData[key] + '">'
        }
      }
      formHtml && form.append(formHtml)
      form.append($input)
      uploadFrame.appendTo("body")
      form.appendTo("body")
      //禁用
      $($cloneInput).attr("disabled", "disabled").attr('name', 'zossfile')
      //加载事件
      uploadFrame.bind("load", function(evt) {
        let data
        try {
          let contents = $(this).contents().get(0)
          data = $(contents).find('body').text()
          if (data) {
            // 413为http status, 表示文件太大，
            if (data.indexOf('413') > -1) {
              callbacks.error && callbacks.error(evt, null, '文件太大，最大为2M');
              data = null
            } else {
              data = data && window.eval('(' + data + ')')
            }
          }
        } catch (ex) {
          console.log('返回的json数据错误', ex)
          callbacks.error && callbacks.error(evt, ex)
          data = null
        }

        if (data) {
          let file = formatFileInfo(data);
          callbacks.success && callbacks.success(file.fileId, file.name, file.size);
          callbacks.done && callbacks.done(file.fileId, file)
        }
        uploadFrame.remove()
        form.remove()
        form = null
        uploadFrame = null
        $cloneInput.removeAttr('disabled')
      })
      form.submit()
    }
  }
  setTimeout(startUpload, 100)
}

module.exports = {
  /**
   * 删除文件
   **/
  delete(url, path) {
    return $.ajax({
      type: 'POST',
      url: url,
      dataType: 'json',
      contentType: 'application/json;charset:utf-8',
      data: JSON.stringify({
          path: path
      })
    });
  },

  /**
   * 获取实际路径
   */
  getRealUrl(url, fileId) {
    return $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      data: {fileId: fileId},
      contentType: 'application/json;charset:utf-8'
    }).then(function(data) {
      return data && data.success && data.result;
    });
  },

  /**
   * 下载文件
   * @param url {String}   文件下载地址
   * @param fileId {String}   文件id
   **/
  download(url, fileId) {
    this.getRealUrl(url, fileId)
    .then(function(realUrl) {
      if (!realUrl) {
        return false;
      }
      try {
        let elemIF = document.createElement("iframe");
        elemIF.src = realUrl;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
      } catch (e) {
      }
    });
  },

  /**
   * 上传文件
   * @param url {String} 获取Key地址
   * @param files {HTMLElement|FileList} 文件选择字段或者文件列表对象
   * @param callbacks {Object} 回调函数
   * @param opts {Object}  mode: 0 混合 1 阿里云  2 政采平台 ,formData: {Object} 需要附加的表单参数
   */
  upload(url, files, callbacks, opts) {
    if (!callbacks.success) throw 'no onsuccess function'
    if (!callbacks.error) throw 'no onerror function'
    if (!opts) {
      opts = {mode: 0}
    } else if (!opts.mode) {
      opts.mode = 0
    }
    opts.formData = $.extend({
      // midPath: ''
      userId: $('#env-config').data('userId') || ''
    }, opts.formData)
    if (!files) {
      throw 'upload files is empty'
      return false
    }
    if (0 === opts.mode) {
      if (window.FileList) {
        if (files.length > 0 && (files[0] instanceof window.File)) {
          uploadUsingFileApi(url, files, opts.formData.bizCode, callbacks)
        }
      } else {
        uploadUsingFrame(files, callbacks, opts.formData)
      }
    } else if (1 === opts.mode) {
      if (window.FileList) {
        uploadUsingFileApi(url, files, opts.formData.bizCode, callbacks)
      } else {
        callbacks.error('您当前使用的浏览器版本太老,不支持HTML 5,请使用chrome或者IE 10及以上版本的浏览器!')
      }
    } else if (2 === opts.mode) {
      uploadUsingFrame(files, callbacks, opts.formData)
    }
  }
};
