/** *
 * 筛选使用的Tab
 * @author sx-wangx@dtdream.com
 */
try {
    require("aliyun-sdk/extend");
    require("oss-js-upload/extend");
} catch (e) {
    console.info('module aliyun-sdk/oss-js-upload require error ', e)
}
class dc {
    constructor(selector) {

    }

    /* 删除文件 */
    deletefile(url,path) {

        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            contentType: 'application/json;charset:utf-8',
            data: JSON.stringify({
                "path": path
            }),
            success: function (data) {

            },
            error: function () {

            }
        });

    }

    /* 下载文件 */
    download(url, fileId) {
        $.ajax({
            type: 'GET',
            url: url + '?fileId=' + fileId,
            dataType: 'json',
            contentType: 'application/json;charset:utf-8',
            success: function (data) {
                downloadFile(data.downloadUrl);
            },
            error: function () {

            }
        });


        function downloadFile(url) {
            try {
                var elemIF = document.createElement("iframe");
                elemIF.src = url;
                elemIF.style.display = "none";
                document.body.appendChild(elemIF);
            } catch (e) {
                console.log(e);
            }
        }
    }

    /* 上传文件 */
    upload(url, files, callback) {
        if (files.length <= 0) {
            return;
        }
        if(!callback.success) throw new Exception('no onsuccess function');
        if(!callback.error) throw new Exception('no onerror function');
        var vm = this;
        $.ajax({
            type: 'GET',
            url: url + '?fileNum=' + files.length,
            dataType: 'json',
            contentType: 'application/json;charset:utf-8',
            success: function (data) {
                var key = data;
                console.log(key);
                init(key);
                for (var i = 0; i < files.length; i++) {

                    console.log(files[i].name, files[i].size, files[i].type, key.data[i]);
                    // addFileMeta(files[i], key.data[i]);
                    if (callback.addMeta) {
                          callback.addMeta(files[i], key.data[i]);
                    }

                    vm.ossUpload.upload({
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
                            'ContentDisposition': 'attachment;filename="' + encodeURI(files[i].name) +'"',
                            // oss 支持的 header, 目前仅支持 x-oss-server-side-encryption
                            'ServerSideEncryption': ''
                        },
                        // 文件上传中调用, 可选参数
                        onprogress:  function (evt) {
                           // console.log("onprogress", evt);
                            if(callback.progress) {
                                callback.progress(evt);
                            }
                        },
                        // 文件上传失败后调用, 可选参数
                        onerror: function (evt) {
                            //console.log("onerror", evt);
                            callback.error(evt);
                        },
                        // 文件上传成功调用, 可选参数
                        oncomplete: function (res) {
                           // console.log(res);
                           // console.log("complete", this.key, this.file.name);

                            callback.success(this.key, this.file.name,this.file.size,this.file.type);
                        }
                    });
                }
            },
            error: function (data) {
                callback.error(data);
            }
        });


        /* 添加文件属性 */
        // function addFileMeta(file, path) {
        //     $.ajax({
        //         type: 'POST',
        //         url: '/dc/addFileMeta',
        //         dataType: 'json',
        //         contentType: 'application/json;charset:utf-8',
        //         data: JSON.stringify({
        //             "fileName": file.name,
        //             "size": file.size,
        //             "type": file.type,
        //             "path": path
        //         }),
        //         success: function (data) {
        //
        //         },
        //         error: function (data) {
        //
        //         }
        //     });
        // };


        function init(key) {

            vm.ossUpload = new OssUpload({
                bucket: key.bucket,
                // 根据你的 oss 实例所在地区选择填入
                // 杭州：http://oss-cn-hangzhou.aliyuncs.com
                // 北京：http://oss-cn-beijing.aliyuncs.com
                // 青岛：http://oss-cn-qingdao.aliyuncs.com
                // 深圳：http://oss-cn-shenzhen.aliyuncs.com
                // 香港：http://oss-cn-hongkong.aliyuncs.com
                endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
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

    }
}
module.exports = dc;
