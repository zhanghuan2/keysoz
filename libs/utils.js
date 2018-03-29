var ZCY = window.ZCY = (function(){
    var Modal = require("pokeball/components/modal");
    var ajaxGetConfig = {
        type: "get",
        contentType: "application/json"
    };
    var ajaxPostConfig = {
        type: 'post',
        dataType: 'json',
        contentType: 'application/json;charset:utf-8'
    };
    var modalObj = "";
    var zcy_modal_confirm = '<div class="modal zcy_modal" style="width: 450px;">'+
      '<div class="modal-header">'+
      '<label class="modal-title">发布确认</label>'+
      '<a href="javascript:;" class="close">&times;</a>'+
      '</div>'+
      '<div class="modal-body">'+
      '<div class="warning-row" style="padding: 10px;margin-left: 100px;">'+
      '<i class="icon-zcy icon-notify-warning" style="font-size: 2.6em;color: #F2C200;"></i>'+
      '<label class="info-title" style="font-size: 16px;">您是否确认要？</label>'+
      '</div>'+
      '</div>'+
      '<div class="modal-footer text-right">'+
      '<button type="button" name="cancel-btn" class="cancel btn btn-minor">取消</button>&nbsp;&nbsp;'+
      '<button type="button" name="accept-btn" class="confirm btn btn-primary">确认</button>'+
      '</div>'+
      '</div>';
    /**
     * 绑定事件
     * */
    function _bindEvents(bindings) {
        if ($.isArray(bindings) && bindings.length > 0) {
            for (var i in bindings) {
                if(bindings[i].live){
                    $(bindings[i].live).on(bindings[i].event,bindings[i].element,bindings[i].handler);
                }else{
                    $(bindings[i].element).on(bindings[i].event, bindings[i].handler);
                }
            }
        }
    }
    /**
     * ajax get
     * */
    function _get(c){
        var config = $.extend({},ajaxGetConfig,c);
        $.ajax(config);
    }
    /**
     * ajax post
     * */
    function _post(c){
        var config = $.extend({},ajaxPostConfig,c);
        $.ajax(config);
    }
    /**
     * pop弹出框
     * */
    function _pop(config){
        if(typeof config.type != 'undefined') {
            var iconClass     = [undefined, 'icon-zcy icon-notify-success text-success', 'icon-zcy icon-notify-info text-info', 'icon-zcy icon-notify-warning text-warning', 'icon-zcy icon-notify-danger text-danger'];
            config.iconClass  = iconClass[config.type];
        }
        var template ='<div class="notify zcy_notify zcy_tip_'+config.type+'" style="display: none;">'+
          '<div class="notify-icon"><i class="'+config.iconClass+'"></i></div>'+
          '<div class="notify-text">'+
          '<div class="notify-title">'+config.title+'</div>'+
          '<div class="notify-content">'+config.content+'</div>'+
          '</div>'+
          '</div>';
        var $notify = $(template);
        var containerName = config.containerId?('#'+config.containerId):'';
        $(".notify-container" + containerName).prepend($notify);
        $(".notify-container" + containerName).addClass("zcy-notify-container");
        // bindings
        $notify.find('.notify-close').bind('click', function() {
            $notify.fadeOut(500, 'swing', function() {
                $notify.remove();
                if(config.callback) {
                    config.callback({success: false});
                }
            });
        });

        $notify.fadeIn(500, 'swing');

        if(!config.needClose) {
            var timeoutMillis = config.time?config.time:2000;
            setTimeout(function () {
                $notify.fadeOut(500, 'swing', function() {
                    $notify.remove();
                    if(config.callback) {
                        config.callback({success: true});
                    }
                });
            }, timeoutMillis);
        }
    }
    /**
     * modal弹出框
     * {title:wewe,
     *  content:asds,
     *  success:sd
     * }
     * */
    function _confirm(){
        var that = this;
        var config = typeof arguments[0] == "object" ? arguments[0]:{};
        if(!modalObj){
            modalObj = new Modal(zcy_modal_confirm);
        }
        modalObj.show();
        if(config.cls){
            $(".zcy_modal").removeClass().addClass("modal zcy_modal").addClass(config.cls);
        }else{
            $(".zcy_modal").removeClass().addClass("modal zcy_modal");
        }
        $(".zcy_modal .modal-title").html(config.title || "提示");
        $(".zcy_modal .modal-body label").html(config.content ||"确认您的选择吗？");
        $(".zcy_modal .modal-footer button").unbind("click.ZCY").bind("click.ZCY",function(){
            if($(this).hasClass("cancel")){
                $.isFunction(config.cancel) ? config.cancel(modalObj) : modalObj.close();
            }else{
                $.isFunction(config.confirm) ? config.confirm(modalObj) : modalObj.close();
            }
        });
    }
    /***
     * 检查正则类型
     * param
     * @type  "phone" or  "email" or""
     * @checkSource  "13456788888"
     * **/
    function _checkRagular(type,data){
        var rgx,ragular;
        switch (type){
            //手机号
            case 'phone' : rgx =  '^[1][358][0-9]{9}$';
                break;
            default : rgx =type;
                break;
        }
        ragular = new RegExp(rgx);
        return ragular.test(data);
    }
    /**
     * 初始化带有checkboxs的table
     * **/
    function _solveTable(){
        var $table = arguments[0].eq(0);
        var config = arguments[1] ?arguments[1]:{};
        if($table.data("zcytype")=="hasCheckboxs" && !$table.hasClass("hasRendered")){
            var conf = {
                onTotalChange: undefined,
                onLineChange: undefined,
            };
            $.extend(conf, config);
            var totalElement = '<th width="30"><input type="checkbox" name="table-total-check"></th>';
            var lineElement = '<td width="30"><input type="checkbox" name="table-line-check"></td>';
            $table.find('thead tr,tfoot tr').prepend(totalElement);
            $table.find('tbody tr').prepend(lineElement);
            var $total = $table.find('input[name="table-total-check"]');
            var $line = $table.find('input[name="table-line-check"]');
            $line.each(function(e) {
                if(conf.haveBatch){
                    if(!conf.haveBatch($line[e])){
                        $($line[e]).parent().find("input").remove();
                    }
                }
            });
            $total.bind('click.tableCheckbox', function(event) {
                if($(this)[0].checked) {
                    $total.prop("checked", true);
                    $line.prop("checked", true);
                    if(conf.onTotalChange) conf.onTotalChange($table.find('tbody tr'), true);
                } else {
                    $total.prop("checked", false);
                    $line.prop("checked", false);
                    if(conf.onTotalChange) conf.onTotalChange($table.find('tbody tr'), false);
                }
            });
            $line.bind('click.tableCheckbox', function(event) {
                var result = true;
                $line.each(function(e) { result&=$(this)[0].checked });
                if(conf.onLineChange) conf.onLineChange($(this).parents('tr'), $(this)[0].checked);
                if($total[0].checked != result) {
                    $total.prop("checked", result);
                }
            });
            $table.addClass("hasRendered");
        }
    }

    function _solveDiv(dom,_config){
        var type = "";

        $.each(arguments[0],function(i,v){
            type = $(v).data("zcytype");
            if(type.indexOf("formcheck")==0){
                _formCheck(type,_config);
            }
        })
    }
    function _formCheck(type,_config){
        var formcheck = require("common/formchecker/extend");
        var arr = type.split(" ");
        var obj = _config ? _config : {};
        var config = {
            container: ".ZCY-check",
            ctrlTarget: ".ZCY-save"
        }
        $.extend(config,{
            container: arr[1],
            ctrlTarget: arr[2]
        },obj);
        formcheck.formChecker(config);
    }
    /*
     * 绑定页面初始化
     * return true or false
     * **/
    $.fn.render = function(){
        var $box = $(this);
        var $table = $box.find("table[data-zcytype]"),
          $input =  $box.find("input[data-zcytype]").filter("[type=text]"),
          $select =  $box.find("select[data-zcytype]"),
          $div = $box.find("div[data-zcytype]");
        if($box.data("zcytype")){
            $table = $box.is("table") ? $box : [];
            $input =  $box.is("input[type=text]") ? $box : [];
            $select =  $box.is("select") ? $box:[];
            $div = $box.is("div") ? $box : [];
        }
        $table.length >0 && _solveTable($table,arguments[0]);


        $div.length>0 && _solveDiv($div,arguments[0]);
        $box.find("input.date-input").datepicker();
    };


    return {
        bindEvents:function(){
            _bindEvents(arguments[0]);
        },
        get:function(){
            _get.apply(this,arguments);
        },
        post:function(){
            _post.apply(this,arguments);
        },
        error:function(){
            _pop({type: 4, title: arguments[0], content: arguments[1] || "", callback: arguments[2], time: arguments[3], needClose: arguments[4]})
        },
        success:function(){
            _pop({type: 1, title: arguments[0], content: arguments[1] || "", callback: arguments[2], time: arguments[3], needClose: arguments[4]})
        },
        warning:function(){
            _pop({type: 3, title: arguments[0], content: arguments[1] || "", callback: arguments[2], time: arguments[3], needClose: arguments[4]})
        },
        confirm :function(){
            _confirm.apply(this,arguments);
        }
    }


})();

var RootPath = "comps/";
/**
 * 工具类
 * */
ZCY.utils = (function(){
    var _Modal,

    //模态框外层模板

      _ModalTemplate,

    //模板ID

      _modalId = 0;

    // 表单验证obj
    var validateOBJ ;

    /*
     * 弹出框，内容自定义
     * {
     *  title: title,
     *  type: normal || second || error || success || info || confirm
     *  content : [line1,line2]
     *  templateUrl:  template url,
     *  html :  template html,
     *  data : data for templateUrl,
     *  confirm:  callback function for confirm,
     *  cancel:  callback function for cancel,
     *  cls :  modal class for self-sass,
     *  button:[1,2]  :  show words for footer button  //json
     * }
     * */
    //TODO   json
    //TODO   校验规则。
    //TODO   定规则、api
    function _modal(){
        var param = arguments[0];
        var type = param.type || "normal";
        //获取模态框对象
        if(!_Modal)
            _Modal = require("pokeball/components/modal");
        //获取模态框外层基础模板
        if(!_ModalTemplate)
            _ModalTemplate = Handlebars.templates[RootPath+"templates/modal"];
        var btn = [];
        //设置默认按钮文字
        if(param.button){
            btn = param.button;
        }
        var tempData = {
            title   :  param.title||"提示",
            btn1    :  (btn)[0] || "取消",
            btn2    :  (btn)[1] || "确定",
            cls     :  param.cls || "",
            type    :  type,
            content :  param.content || ["确认此操作吗？"],
            id      :  ++_modalId
        };
        //获取模态框dom节点
        var $modalDom = $(_ModalTemplate(tempData));
        //获取模态框body 自定义内容
        var html;
        if(param.templateUrl){
            var data = param.data || {};
            var templates =  Handlebars.templates[param.templateUrl];
            html = templates(data);
        }
        if(param.html){
            html  = param.html;
        }
        //将自定义 body内容嵌入到模态框中
        html && $modalDom.find(".modal-body").html(html);
        //当模态框不是normal时 内容填入
        if(!html && param.content.length>0 && type!="normal"){
            $modalDom.find(".modal-body .info-title").html(param.content[0]||"");
            type=="second" ?
              $modalDom.find(".modal-body .second-content").html(param.content[1]||"") :
              $modalDom.find(".modal-body .info-content").html(param.content[1]||"");
        }
        var modal = new _Modal($modalDom[0].outerHTML);
        modal.show();

        //绑定按钮事件
        $("#modal-id-"+tempData.id).find(".modal-footer button").unbind("click.ZCY").bind("click.ZCY",function(){
            if($(this).hasClass("btn-cancel")){
                $.isFunction(param.cancel) ? param.cancel(modal) : modal.close();
            }else{
                $.isFunction(param.confirm) ? param.confirm(modal) : modal.close();
            }
        });
        //加载弹框show后的事件
        $.isFunction(param.afterRander) && param.afterRander(modal,"#modal-id-"+tempData.id);

        //二次弹框 CheckBox 选择时 按钮disabled 控制
        if(type=="second"){
            $("#modal-id-"+tempData.id).find(".second-checkbox").on("change.zcy",function(){
                if($(this).is(":checked")){
                    $("#modal-id-"+tempData.id).find(".btn-success").removeAttr("disabled");
                }else{
                    $("#modal-id-"+tempData.id).find(".btn-success").attr("disabled",true);
                }
            })
        }

        return {
            dom:$("#modal-id-"+tempData.id),
            modal:modal
        };
    }



    $.fn.ZCYvalidate = function(){
        if(!validateOBJ){
            try
            {
                validateOBJ = require(RootPath+"common/ZCY_validate/view");
            }
            catch(err)
            {
                return {};
            }
        }

        var dom = $(this);
        var validate;
        if(!dom.data("zcy-obj")){
            validate = new validateOBJ(dom);
            dom.data("zcy-obj",validate);
        }else{
            validate = dom.data("zcy-obj");
        }
        if(arguments.length>1){
            typeof arguments[0] == "string" && validate[arguments[0]](arguments[1])
        }else{
            typeof arguments[0] == "string" ?
              validate[arguments[0]]() :
              validate["result"](arguments[0])
        }
        return validate.getResult();
    };




    return {
        modal:function(){
            return  _modal.apply(this,arguments);
        }
    }
})();
/**
 * 业务组件
 * */
ZCY.Business = (function(){


})();

/**
 * 方法集合
 * */
ZCY.fn = (function(){



    function _getData(){
        var $tar = $(arguments[0]).find("[name]");
        var result = {};
        var config = arguments[1] || {
              "money":"inputMoney",
              "dateSec":"inputDate"
          };
        $.each($tar,function(i,v){
            var $dom = $(this);
            var _pop = $dom.attr("name");
            if($dom.hasClass(config.ignore)){
                return true;
            }
            var value="";

            if($dom.is("input")){
                if($dom.hasClass(config.money)){
                    result[_pop] = $dom.val()*100;
                }else if($dom.hasClass(config["dateSec"])){

                }else{
                    result[_pop] = $dom.val();
                }

            }else if($dom.is("select")){
                result[_pop] = $dom.val();
                result[_pop+"text"] = $dom.find("option:selected").text();
            }

        })
        return result;
    }

    $.fn.getData = function(){
        return _getData($(this),arguments[0]);

    };
    return {
        get:function(){

        },
        post:function(){

        },
        ajax:function(){

        },
        getData:function(){
            return _getData.apply(this,arguments);
        }
    }

})();

ZCY.setPath = function(p){
    RootPath = p;
};
