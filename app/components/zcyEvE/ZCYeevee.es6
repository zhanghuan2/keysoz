export default (function(){
  let baseConfig = require('zcyEvE/config');
  let ROOT_PATH = 'zcyEvE';

  let LINE_TEMPLATES = Handlebars.templates[`${ROOT_PATH}/templates/page`];

  let BASE_PATH = baseConfig.basePath;
  let BASE_COMP = baseConfig.comp;

  let _DATA_ = "";

  let _STORE_ = {};


  let $_TAR_ = '';

  let _SERVER_ = require('zcyEvE/server');

  let _CONTROLLER_ = [];

  let _TYPE_ = 'page';
  Handlebars && Handlebars.registerHelper('eevee',function(a,option){
    let template = `<div class="${a}" data-compath="${this._path}" data-key="${this.key}">${option.fn(this)}</div>`;
    return template
  });
  Handlebars && Handlebars.registerHelper('insert', function (a) {
    let data  = this;
    const path = arguments[0];
    let template = Handlebars.templates[`${path}/view`];
    _CONTROLLER_.push(path);
    //  newData,
    //  ifRenderJs,
    //  option;
    //ifRenderJs = typeof arguments[1] === 'boolean';
    //option = arguments[arguments.length - 1];
    //newData = option.fn() == '' ? {} : JSON.parse(option.fn());
    //const result = $.extend(true, {}, this, newData);
    //ifRenderJs && Router.setInsertController(path, result);
    //result.hash = option.hash;
    return template(data);
  });


  Handlebars && Handlebars.registerHelper('component', function (a, options) {
    const _path = this.path;
    let className = a,
      template = `<div class="${className}" data-compath="${_path}">${options.fn(this)}</div>`;
    return template;
  });

  function _creatHtml(router){
    let key =router.name;
    let template = Handlebars.templates[`${BASE_PATH}/${BASE_COMP[key]}/view`];
    return {
      content:template,
      path:`${BASE_PATH}/${BASE_COMP[key]}`,
      key:key
    };
  }
  //
  function _render(){
    let pageid = _STORE_.pageId || 'search';
    $_TAR_ = arguments[0];
    $_TAR_.empty();
    return _SERVER_.getTemplate(pageid).then(function(d){
              _DATA_ = d.templateJson;
              for(let pop in _DATA_){
                _renderComps(_DATA_[pop],pop);
              }
          });
  }
  function _renderPage(){
    let param = arguments[0];
    $_TAR_ = arguments[1];
    $_TAR_.empty();
    _CONTROLLER_ = [];
    return _SERVER_.getTemplate(param).then(function(d){
      let $tar = LINE_TEMPLATES(d);
      $_TAR_.html($tar);
      _renderController();
      return d;
    });
  }
  function _renderController(){
    $.each(_CONTROLLER_,(i,v)=>{
      let con = _getController(`${v}/view`);
      con && new con($);
    })
  }
  function _renderComps(cfg,pop){
    let css = cfg.css||{};
    let data = {
      clsName:pop,
      css
    };
    let $tar = $(LINE_TEMPLATES(data));
    let $tempDiv = $("<div class='eevee-col-row'></div>");
    let insertArr = cfg.insert||[];
    $.each(insertArr,function(i,v){
      let param = _creatHtml(v);
      let defaultData = _getController(`${param.path}/config`);
      defaultData = defaultData ? _changeData(defaultData) : {};
      let css = $.extend({},defaultData.css,v.css);
      let _data = $.extend({},defaultData.data,v.data);
      let data = {
        css:css,
        data:_data,
        _path:param.path,
        key:param.key
      };
      let pageData = _STORE_.comonData||{};
      let result = $.extend(data,pageData);
      console.log(result);
      $tempDiv.append(param.content(result));
    });
    $tar.html($tempDiv);
    $_TAR_.append($tar);
    $tempDiv = null;
    _CONTROLLER_ = {};
    let $con = $tar.find('.evees-comp');
    $.each($con,function(i,v){
      let p = $(this).data('compath')+'/view';
      let controller = _getController(p);
      if(!controller) return false;
      let key = $(this).data('key');
      if(!_CONTROLLER_[key]){
        _CONTROLLER_[key] = new controller($);
        _CONTROLLER_[key].$el = $(this);
        _CONTROLLER_[key].COMMON = _STORE_.comonData ||{};
        $.isFunction(_CONTROLLER_[key].beforeRender) && _CONTROLLER_[key].beforeRender();
      }
    })
  }
  function _changeData(d){
    let obj = d.defaultParam;
    let result = {
      css:{},
      data:{}
    };
    let cfg = baseConfig.defaultParam;
    $.each(obj.css,function(i,v){
      let key,value;
      if(typeof v == 'string'){
        key = cfg[v].name;
        value = cfg[v].defaultValue;
        result.css[key] = value;
      }else if(typeof v =='object'){
        key = v.name;
        value = v.defaultValue;
        result.css[key] = value;
      }
    });
    return result;
  }
  function _getConfig(cfg){
    let result = [];
    let param = baseConfig.defaultParam;
    $.each(cfg,function(i,v){
      if(typeof  v =="string"){
        param[v] && result.push(param[v]);
      }else{
        result.push(v);
      }
    });
    return result;
  }
  function _getAllTemplate(){
    return _SERVER_.getAllTemplate();
  }
  function _getController(p){
    let fn = false;
    if(!p)return fn;
    try{
      fn = require(p);
    }catch(e){
      console.log(e);
    }
    return fn;
  }







  return {
    render(){
      _TYPE_ = 'page';
      $('.main-container').css('width','auto');
      return _render.apply(this,arguments);
    },
    renderPage(){
      _TYPE_ = 'eevee';
      return _renderPage.apply(this,arguments);
    },
    getConfig(){
      return _getConfig.apply(this,arguments);
    },
    getBaseCfg(){
      return baseConfig;
    },
    getTemplate(path){
      let template = Handlebars.templates[path];
      return template;
    },
    getController(key){
      return _CONTROLLER_[key] || function(){};
    },
    createHtml(p){
      return _creatHtml(p)
    },
    getDATA(){
      return _DATA_;
    },
    getStore (key) {
      const result = $.extend({}, _STORE_);
      if (key) {
        return result[key];
      }
      return result;
    },
    setStore () {
      return _STORE_;
    },
    getCfg(){
      return baseConfig;
    },
    getAllTemplate(){
      return _getAllTemplate();
    }
  }



})()