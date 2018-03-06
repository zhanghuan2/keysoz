var defaultChecks ={
  "email":{
    errorText: "这是无效的邮箱。",
    check : (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i)
  },
  "mobile":{
    errorText: "这是无效的手机号。",
    check : (/^(13|14|15|17|18)\d{9}$/i)
  },
  "phone":{
    errorText: "这是无效的电话。",
    check : (/^\d{3}-\d{8}|\d{4}-\d{7,8}|^1[3|4|5|7|8]\d{9}$/i)
  },
  "url":{
    errorText: "无效的URL地址。",
    check : (/(^|\s)((https?:\/\/)?[\w\-]+(\.[\w\-]+)+\.?(:\d+)?(\/\S*)?)/i)
  },
  "idNumber":{
    errorText: "无效的身份证号。",
    check : (/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/)
  },
  "account":{
    errorText: "无效的银行账号。",
    check : (/^([0-9]{12,25})?$/g)
  },
  "uploadFile_required":{
    errorText: "必输项。",
    extend:function($tar){
      if($tar.attr("data-size") !== "0"){
        return false;
      }else{
        return true;
      }
    }
  },
  "password":{
    errorText: "密码为8至16位, 且不能为全数字。。",
    check : (/(?![0-9]+$)[\x21-\x7e]{8,16}/i)
  }
};
var buttomErrorTemp = '<span class="zcy-validate-buttom-box"></span>'
class ZCY_Validate {
  constructor(selector) {
    this.$target = selector;
    this.end =true;
    this.checks = {};
    this.cls = "";
    this.ignorCls = "";
    this.ifTempSave = false;
  }
  render(){
    if(typeof arguments[0] == "object"){
      let _checks = arguments[0].rules || {};
      $.extend(true,this.checks,defaultChecks,_checks);
      this.cls = arguments[0].target || "[data-zcy=validate]";
      this.ignorCls = (arguments[0].ignore || "zcy-validate-ignore").replace(".","");
    }else{
      $.extend(true,this.checks,defaultChecks);
    }
    let $element = this.$target.find(this.cls);
    this.$input = $element.filter("input[type=text]");
    this.$textarea = $element.filter("textarea");
    this.$checkbox = $element.filter("input[type=checkbox]");
    this.$radio = $element.filter("input[type=radio]");
    this.$select = $element.filter("select");

    this.$input.length>0 && this._bindInputEvent();
    this.$select.length>0 && this._bindSelectEvent();
    this.$textarea.length>0 && this._bindTextareaEvent();

  }
  result(){
    this.ifTempSave = false;
    this.checkInputs();
    this.checkSelect();
    this.checkTextarea();
  }
  addErrorInput(){
    let dom = $(arguments[0]);
    let errorText = arguments[1] || "格式错误！";
    if(dom.length==0)
      return;
    let type = dom.data("showerror") || "normal";
    if(dom.hasClass("zcy-validate-error")){
      dom.next(".zcy-error-text-out").html(errorText);
      dom.next(".zcy-error-text-init").attr("title",errorText);
      return;
    }
    dom.addClass("zcy-validate-error");
    if(type=="normal"){
      dom.after('<span name="check-requirederr" class="zcy-text-danger pl zcy-error-text-out">'+errorText+'</span>')
    }else if(type == "bottom"){
      !dom.parent().hasClass("zcy-text-danger-box") && dom.wrap("<span class='zcy-text-danger-box'></span>");
      dom.parent().append('<span class="zcy-validate-buttom-box zcy-error-text-out">'+errorText+'</span>');
    }else if(type == "right"){
      dom.after('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-right text-danger icon-zcy icon-alertfill"></span>')
      //dom.next(".zcy-icon-error-right").tooltip();
    }else if(type == "inside"){
      dom.after('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-inside text-danger icon-zcy icon-alertfill"></span>')

    }
  }
  addErrorSelect(){
    let _select = $(arguments[0]);
    let errorText = arguments[1] || "格式错误！";
    if(_select.length==0)
      return;
    let dom = _select.parent().parent(".selectric-wrapper");
    let dom1 = dom.find('.selectric');
    if(dom.length==0)
      return;
    let type = _select.data("showerror") || "normal";
    if(dom1.hasClass("zcy-validate-error")){
      dom.next(".zcy-error-text-out").html(errorText);
      dom.find(".zcy-error-text-out").html(errorText);
      dom.find(".zcy-error-text-init").attr("title",errorText);
      return;
    }
    dom1.addClass("zcy-validate-error");
    if(type=="normal"){
      dom.after('<span name="check-requirederr" class="zcy-text-danger pl zcy-error-text-out">'+errorText+'</span>')
    }else if(type == "bottom"){
      dom.append('<span class="zcy-validate-buttom-box zcy-error-text-out ">'+errorText+'</span>');
    }else if(type == "right"){
      dom.append('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-select-right text-danger icon-zcy icon-alertfill"></span>')
      //dom.next(".zcy-icon-error-right").tooltip();
    }else if(type == "inside"){
      dom.append('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-inside text-danger icon-zcy icon-alertfill"></span>')

    }
  }
  addErrorTextarea(){
    let dom = $(arguments[0]);
    let errorText = arguments[1] || "格式错误！";
    if(dom.length==0)
      return;
    let type = dom.data("showerror") || "normal";
    if(dom.hasClass("zcy-validate-error")){
      dom.next(".zcy-error-text-out").html(errorText);
      dom.next(".zcy-error-text-init").attr("title",errorText);
      return;
    }
    dom.addClass("zcy-validate-error");
    if(type=="normal"){
      dom.after('<span name="check-requirederr" class="zcy-text-danger pl zcy-error-text-out">'+errorText+'</span>')
    }else if(type == "bottom"){
      !dom.parent().hasClass("zcy-text-danger-box") && dom.wrap("<span class='zcy-text-danger-box'></span>");
      dom.parent().append('<span class="zcy-validate-buttom-box zcy-error-text-out">'+errorText+'</span>');
    }else if(type == "right"){
      dom.after('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-right text-danger icon-zcy icon-alertfill"></span>')
      //dom.next(".zcy-icon-error-right").tooltip();
    }else if(type == "inside"){
      dom.after('<span name="check-icon" title="'+errorText+'" class="zcy-error-text-init zcy-icon-error-inside text-danger icon-zcy icon-alertfill"></span>')

    }
  }
  addError(){
    let dom = $(arguments[0]);
    if(dom.is("input")){
      this.addErrorInput.apply(this,arguments);
    }else if(dom.is("select")){
      this.addErrorSelect.apply(this,arguments);
    }else if(dom.is("textarea")){
      this.addErrorTextarea.apply(this,arguments);
    }
  }
  reset(){
    let input = this.$input;
    let that = this;
    $.each(input,function(i,v){
      that.removeError(this);
    })
  }
  removeError(){
    let dom = $(arguments[0]);
    if(dom.length==0)
      return;
    let type = dom.data("showerror") || "normal";
    if(dom.is("select")){
       let parent = dom.parent().parent(".selectric-wrapper");
       let child = parent.find('.selectric')
      if(!child.hasClass("zcy-validate-error"))
        return;
      child.removeClass("zcy-validate-error");
      parent.next(".zcy-error-text-out").remove();
      parent.find(".zcy-error-text-out").remove();
      parent.find(".zcy-error-text-init").remove();

    }else if(dom.is("input")){
      if(!dom.hasClass("zcy-validate-error"))
        return;
      dom.removeClass("zcy-validate-error");
      if(type=="normal"){
        dom.nextAll("span.zcy-text-danger").remove();
      }else if(type == "bottom"){
        dom.next('.zcy-validate-buttom-box').remove();
      }else if(type == "right"){
        dom.next('.zcy-icon-error-right').remove();
        //dom.next(".zcy-icon-error-right").tooltip();
      }
    }else if(dom.is("textarea")){
      if(!dom.hasClass("zcy-validate-error"))
        return;
      dom.removeClass("zcy-validate-error");
      if(type=="normal"){
        dom.nextAll("span.zcy-text-danger").remove();
      }else if(type == "bottom"){
        dom.next('.zcy-validate-buttom-box').remove();
      }else if(type == "right"){
        dom.next('.zcy-icon-error-right').remove();
        //dom.next(".zcy-icon-error-right").tooltip();
      }
    }

  }
  getResult(){
    if(this.$target.find(".zcy-validate-error").length>0){
      return false;
    }
    return true;
  }
  checkInputs(){
    let $target = arguments[0] ? $(arguments[0]) : this.$input;
    let result = true;
    let that = this;
    $.each($target,function(i,v){
      if($(v).hasClass(that.ignorCls)){
        that.removeError($(v));
        return true;
      }
      let value = $(v).val();
      let type = $(v).data("zcy-pattern");
      let check = that.checks[type] ? that.checks[type]:
              {
                errorText:$(v).data("zcy-errortext")||"输入格式错误！",
                check:type
              };
      if(!$(v).is("[required]")){
         if(value==""){
           that.removeError($(v));
           return true;
         }
      }else{
        if(value==""){
          if(that.ifTempSave){
            that.removeError($(v));
            return true;
          }else{
            that.addError($(v),"必填项！");
            return true;
          }
        }
      }
      //校验正则 ----RegExp
      if(check.check!==""){
        let regx = new RegExp(check.check);
        if(!regx.test(value)){
          that.addError($(v),check.errorText);
          result = false;
          return true;
        }
      }
      this.text = check.errorText;
      let extendResult = $.isFunction(check.extend) ? check.extend.call(this,$(v)):true;
      if(extendResult||typeof extendResult=="undefined"){
        that.removeError($(v));
      }else{
        that.addError($(v),this.text);
        result = false;
      }
    });
    return result;
  }

  checkTextarea(){

    let $target = arguments[0] ? $(arguments[0]) : this.$textarea;
    let result = true;
    let that = this;
    $.each($target,function(i,v){
      if($(v).hasClass(that.ignorCls)){
        that.removeError($(v));
        return true;
      }
      let value = $(v).val();
      let type = $(v).data("zcy-pattern");
      let check = that.checks[type] ? that.checks[type]:
              {
                errorText:$(v).data("zcy-errortext")||"输入格式错误！",
                check:type
              };
      if(!$(v).is("[required]")){
         if(value==""){
           that.removeError($(v));
           return true;
         }
      }else{
        if(value==""){
          if(that.ifTempSave){
            that.removeError($(v));
            return true;
          }else{
            that.addError($(v),"必填项！");
            return true;
          }
        }
      }
      //校验正则 ----RegExp
      if(check.check!==""){
        let regx = new RegExp(check.check);
        if(!regx.test(value)){
          that.addError($(v),check.errorText);
          result = false;
          return true;
        }
      }
      this.text = check.errorText;
      let extendResult = $.isFunction(check.extend) ? check.extend.call(this,$(v)):true;
      if(extendResult||typeof extendResult=="undefined"){
        that.removeError($(v));
      }else{
        that.addError($(v),this.text);
        result = false;
      }
    });
    return result;
  }

  _bindInputEvent(){
    let that = this;
    this.$input.off("blur.zcy").on("blur.zcy",function(e){
      that.checkInputs(e.target);
    })
  }
  _bindSelectEvent(){
    let that = this;
    this.$select.off("change.zcy").on("change.zcy",function(e){
      that.checkSelect(e.target);
    })
  }

  _bindTextareaEvent(){
    let that = this;
    this.$textarea.off("blur.zcy").on("blur.zcy",function(e){
      that.checkTextarea(e.target);
    })
  }

  extend(){
    if(typeof arguments[0] == "object"){
      let _checks = arguments[0].rules || {};
      $.extend(true,this.checks,_checks);
    }
  }
  tempSave(){
    this.ifTempSave = true;
    this.checkInputs();
    this.checkSelect();
    this.checkTextarea();
  }
  checkSelect(){
    let $target = arguments[0] ? $(arguments[0]) : this.$select;
    let result = true;
    let that = this;
    $.each($target,function(i,v){
      if($(v).hasClass(that.ignorCls)){
        that.removeError($(v));
        return true;
      }
      let value = $(this).val();
      if($(v).is("[required]")){
        if(value=="" && !that.ifTempSave){
          that.addError($(v),"必填项");
          return true;
        }
      }
      let type = $(v).data("zcy-pattern");
      let check = that.checks[type] ? that.checks[type]:
      {
        errorText:$(v).data("zcy-errortext")||"输入格式错误！",
        check:type
      };
      this.text = "不符合规则";
      let extendResult = $.isFunction(check.extend) ? check.extend.call(this,$(v)):true;
      if(extendResult||typeof extendResult=="undefined"){
        that.removeError($(v));
      }else{
        that.addError($(v),this.text);
        result = false;
      }

    })
  }
}
module.exports = ZCY_Validate;
