var file_row = Handlebars.templates["common/uploadFile/templates/view"];
var dc;

class UploadFile {

  constructor(getKeyAPI,downloadUrl,selector){
    if (selector==null) {
      selector="";
    }
    /* 上传成功的文件自定义对象数组 */
    this.tfiles    =[];
    /* 选择上传的文件File对象数组 */
    this.files     =[];
    /* 是否展开全部 */
    this.isHide    = true;
    var here       = this;
    var $container = $(selector+' .uploadFile');

    if (getKeyAPI=="") {
      $container.find('.deleteFile').remove();
    }
    /* 默认文件的下载事件 */
    downloadUrlFunc();

    /* 默认文件数据放入tfiles、files变量 */
    var oldFileDiv = $container.find('.fileMsg');
    for(var i=0;i<oldFileDiv.length;i++){
      var file    = {};
      file.fileId = $(oldFileDiv[i]).find('.data-fileId').text();
      file.type   = $(oldFileDiv[i]).find('.data-type').text();
      file.name   = $(oldFileDiv[i]).find('.fileName').text();
      file.size   = $(oldFileDiv[i]).find('.data-size').text();
      here.files.push(file);
      here.tfiles.push(file);
    }

    /* 存入默认数据后，检测浏览器版本 */
    var userAgent = navigator.userAgent;
    console.log(userAgent);
    /* 是IE浏览器 */
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && userAgent.indexOf("Opera") <= -1) {
      var version = userAgent.substring(userAgent.indexOf("MSIE",0)+4, userAgent.indexOf(";",userAgent.indexOf("MSIE",0)));
      /* IE版本在10以下 */
      if(parseFloat(version)<10){
        $container.html("<span class=\"progress-err\">当前浏览器不支持附件功能，请使用IE10及以上或其他主流浏览器</span>"); 
        return;
      }
    }
    dc = require("common/dc/extend");

    /* 默认文件删除操作事件 */
    deleteFileEven();

    /* 默认文件[展开全部]事件*/
    $container.find('a[name="show-all-file"]').unbind('click').bind('click', function(){
      $container.find('.fileRow:gt(4)').show();
      $(this).remove();
      here.isHide = false;
    });

    /* 文件选择 change 事件 */
    $container.find("input[name='files']").bind('change', function(){

      if (undefined === $(this).val()) {
        return;
      }

      for(var i=0;i<this.files.length;i++){
        let file = this.files[i];

        /* 重复文件不操作 */
        for(var j=0;j<here.files.length;j++){
          if (here.files[j].name == file.name) {
            $(this).val(undefined);
            return;
          }
        }
        if (file.size > 2*1024*1024) {
          /* 文件大于两兆 */
          $(this).after('<span name="upload-warn" class="text-danger pl">上传文件不能超过2M</span>');
          setTimeout(function () {
            $('span[name="upload-warn"]').remove();
          }, 2000);
          return;
        }
        here.files.push(file);
        var data         = {};
        
        data.name        = file.name;
        data.resize      = 0;
        data.size        = file.size;
        var temp         = {};
        temp._FILE_DATA_ = data;

        /* 增加文件row，并获取当前row用于样式操作 */
        let html = file_row(temp);
        $(html).insertAfter($container.find("input[name='files']"));
        if (this.isHide) {
          checkFileLength();  
        }

        html = $container.find("input[name='files']").next();
        $(html).find('.fileName').css('color','#999999');
        $(html).find('.fileResize').text("0 / ");

        /* 文件上传 */
        var dcInstance = new dc();
        dcInstance.upload(getKeyAPI, [file], {
          error: function (data) {
            /* 显示[上传失败]*/
            $(html).find('.progress-size').css('display','none');
            $(html).find('.progress-err').css('display','');
            $(html).find('.fileMsg').addClass('fileMsgErr');
            if (this.isHide) {
              checkFileLength();  
            }
          },
          progress: function (evt) {
            /* 更新上传进度 */
            $(html).find('.fileResize').text(formFileSize(evt.loaded) + " / ");
          },
          success: function (key, name,size,type) {
            /* 改变样式，组装对象；上传成功之前已删除，不操作 */
            if ($('.fileName[data-name="'+name+'"]').length > 0) {
              $(html).find('.data-fileId').text(key);
              $(html).find('.fileResize').remove();
              $(html).find('.fileName').css('color','#666666');
              
              downloadUrlFunc();

              var data    = {};
              data.fileId = key;
              data.name   = name;
              data.size   = size;
              data.type   = type;
              here.tfiles.push(data);
              if (here.isHide) {
                checkFileLength();  
              }

              $container.find('input[type="file"]').attr("data-size",here.tfiles.length);
              $container.find('input[type="file"]').trigger('change');
            }
          }
        });
          
        /* 新增文件删除事件 */
        deleteFileEven();
      }
      /* 清空文件当前选项，用于已删除文件的change事件 */
      $(this).val(undefined);
    });

    function formFileSize(size){
      var sizeKB = size/1024;
      if (sizeKB<1) {
        return size.toFixed(1) + 'B';
      }
      var sizeMB = sizeKB/1024;
      if (sizeMB<1) {
        return sizeKB.toFixed(1) + 'KB';
      }
      var sizeGB = sizeMB/1024;
      if (sizeGB<1) {
        return sizeMB.toFixed(1) + 'MB';
      }
      return sizeGB.toFixed(1) + 'GB';
    }

    function checkFileLength(){
      if (here.files.length < 6) {
        $container.find('.fileRow').show();
        $container.find('a[name="show-all-file"]').remove();
        return;
      }
      $container.find('.fileRow').show();
      var mayNeedHide = $container.find('.fileRow:gt(4)');
      /* 在上传过程中的，不进行隐藏 */
      for(var i=0;i<mayNeedHide.length;i++){
        if ($(mayNeedHide[i]).find('.fileName').css('color')=='#666666' 
          || $(mayNeedHide[i]).find('.progress-size').css('display') !== 'none') {
          $(mayNeedHide[i]).hide();
        }
      }
      $container.find('a[name="show-all-file"]').remove();
      $container.append("<a href='javascript:;' name='show-all-file'>展开全部</a>");
      $container.find('a[name="show-all-file"]').unbind('click').bind('click', function(){
        $container.find('.fileRow:gt(4)').show();
        $(this).remove();
        here.isHide = false;
      });
    }
    
    function downloadUrlFunc(){
      $container.find('.fileName').css("cursor","pointer");
      $container.find('.fileName').unbind().bind('click',function(){
        var fileId = $(this).parent().find('span.data-fileId').text();
        var dcTemp = new dc();
        dcTemp.download(downloadUrl,fileId);
      });
    }

    function deleteFileEven(){
      $container.find('.deleteFile').unbind('click').bind('click', function(){
          var name = $(this).parent().parent().children(".fileMsg").children(".fileName").text();
          for (var k=0;k<here.files.length;k++) {
            if (here.files[k].name == name) {
              here.files.splice(k,1);
              if ($(this).prev().css("display") == "none") {
                here.tfiles.splice(k,1); 
              }
            }
          }
          $(this).parent().parent().remove();
          if (here.isHide) {
            checkFileLength();  
          }
          $container.find('input[type="file"]').attr("data-size",here.tfiles.length);
          $container.find('input[type="file"]').trigger('change');
        });
    }
  }

  getFiles(){
    /* 暂时只取一张 */
//  return this.tfiles.length ? this.tfiles[0].fileId : '';
    return this.tfiles;
  }
}
module.exports=UploadFile;