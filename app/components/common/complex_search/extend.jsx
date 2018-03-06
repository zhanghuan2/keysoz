;
/** *
  * 复杂搜索和tab页的插件, 对搜索条件构造q参数进行接口调用
  * @author sx-wangx@dtdream.com
  */
var Query = require("common/query/extend");
var LocalStorage  = require("common/local_storage/extend");
var DateFormatTpl = Handlebars.templates["common/complex_search/templates/date-format"]


class ComplexSearch {
  constructor(_config) {
    var vm = this;
    this.query   = new Query();
    this.state   = undefined;
    this.config  = $.extend(ComplexSearch.config, _config);
    this.path    = window.location.pathname.replace(/^\//g, '').replace(/\/$/g, '');
    this.$tab    = $(this.config.tabElem);
    this.$search = $(this.config.searchElem);

    // 页面加载时选中Tab标签
    var initTab = function() {
      var tab = window.location.hash?window.location.hash.substring(1):undefined;
      if(tab) { // 有 hash，不是默认标签
        vm.state = tab;
        vm.$tab.find('li[value="'+tab+'"]').addClass('active');
        $('[for="'+vm.name+'"]').show();
      } else {  // 无 hash，默认标签
        vm.state = $(vm.$tab.find('li')[0]).addClass('active').attr('value');
        if(vm.state == undefined){
          vm.state = "";
        }
      }
    }

    // 绑定Tab标签的动作
    var bindTab = function() {
      vm.$tab.find('li').bind('click', function(event) {
        vm.query.empty();
        var k = vm.$tab.attr('name');
        var v = $(this).attr('value');
        v = v==undefined? "":v;
        var tabv = v;
        
        if(vm.config.saveSearchStatus && v != "") {
          vm._saveState();
        }

        // 判断当前tab页是否有搜索缓存
        var searchCache = LocalStorage.get('searchCache');
        if(searchCache) {
          var newSearch = searchCache[vm.path+':'+v];
          if(typeof newSearch !== 'undefined' && newSearch != "") {  // 有缓存
            vm._search(newSearch, '#' + tabv);
          } else {        // 无此页面的缓存
            if(v === '') {
              vm.query.empty();
              vm._search(vm.query.toString(), '#' + tabv);
            } else {
              var tabTranslate = vm.config.tabTranslate[tabv];
              if(tabTranslate) {
                vm._search(tabTranslate+vm.config.constantSearch.replace('?','&'), '#' + tabv);
              } else {
                vm._processParam(k, v, vm.config.param[k])
                vm._search(vm.query.toString()+vm.config.constantSearch.replace('?','&'), '#' + tabv);
              }
            }
          }
        } else {        // 无缓存
          var tabTranslate = vm.config.tabTranslate[tabv];
          if(tabTranslate) {
            vm._search(tabTranslate+vm.config.constantSearch.replace('?','&'), '#' + tabv);
          } else {
            vm._processParam(k, v, vm.config.param[k])
            vm._search(vm.query.toString()+vm.config.constantSearch.replace('?','&'), '#' + tabv);
          }
        }
      });
    }

    // 初始化输入限制
    var initSearchChecker = function() {
      var $elems = $('input'+vm.config.searchElem+',select'+vm.config.searchElem+',textarea'+vm.config.searchElem)
      var inputHistory="";
      $elems.filter('[data-format]').bind('click', function() {
        inputHistory = $(this).val();
      }).each(function() {
        switch($(this).data('format')) {
          case "integer":
          $(this).bind('input propertyChanged blur', function() {
            var val = $(this).val()+'';
            if(!(/^[1-9]\d*$/g).test(val)) {
              $(this).val(inputHistory);
            }
            inputHistory = $(this).val();
          });
          break;
          case "float":
          $(this).bind('input propertyChanged blur', function() {
            var val = $(this).val()+'';
            if(val.split('\.').length > 2) {
              $(this).val(inputHistory);
              return;
            }
            if(val !== "" && isNaN(parseFloat(val))) {
              $(this).val(inputHistory);
            }
            inputHistory = $(this).val();
          });
          break;
          case "currency":
          $(this).bind('input propertyChanged blur', function() {
            var val = $(this).val()+'';
            if(val.split('\.').length > 2) {
              $(this).val(inputHistory);
              return;
            }
            if(val !== "" && isNaN(parseFloat(val))) {
              $(this).val(inputHistory);
            }
            if(val.split('\.').length == 2) {
              if(val.split('\.')[1].length > 2) {
                $(this).val(inputHistory);
                return;
              }
            }
            inputHistory = $(this).val();
          });
          break;
        }
      })
    }

    // 初始化筛选框部分
    var initSearch = function() {
      var $elems = $('input'+vm.config.searchElem+',select'+vm.config.searchElem+',textarea'+vm.config.searchElem)
      // 遍历所有的输入控件
      $elems.each(function() {
        var name = $(this).attr('name');
        var value;

        if(vm.config.param && vm.config.param[name]) { //如果存在配置信息
          var conf = vm.config.param[name];
          value = vm._fromParam(name, conf);
          value = vm._deformat(value, conf);
          value = vm._recover(value, conf);
        } else {
          value = vm.query.get(name);
        }

        if(typeof value !== 'undefined') {
          var elementType = $(this).attr('type');
          if(elementType === 'checkbox') {
            $(this).prop('checked', eval(value));
          } else {
            $(this).val(value);
          }
        }
      });
    }
    var bindSearch = function() {
      vm.$search.filter('input, textarea').bind('keypress', function(event){
        if(event.keyCode == "13") {
          $(vm.config.searchBtn).trigger('click');
        }
      });
      $(vm.config.searchBtn).bind('click', function() {
        var $elems = $('input'+vm.config.searchElem+'[name],select'+vm.config.searchElem+'[name],textarea'+vm.config.searchElem+'[name]')
        $elems.each(function() {
          var k = $(this).attr('name');
          var v = $(this).val();

          var elementType = $(this).attr('type');
          if(elementType === 'checkbox') {
            v = $(this).prop('checked');
          }

          if(typeof v === 'undefined' || v === null || v === "") {
            vm._resetParam(k, vm.config.param[k]);
          } else {
            vm._processParam(k, v, vm.config.param[k]);
          }
          for(var i = 0; i < vm.config.searchResetParams.length; i++) {
            vm._resetParam(vm.config.searchResetParams[i]);
          }
        });

        window.location.search = vm.query.toString();
      });

    }
    var bindClear = function() {
      $(vm.config.clearBtn).bind('click', function() {
        var k = vm.$tab.attr('name');
        var v = window.location.hash;

        vm.$search.each(function() {
          var resetName = $(this).attr('name');
          if(vm.config.param && vm.config.param[resetName]) {
            var conf = vm.config.param[resetName];

            if(conf.format === 'multi') { // 如果是多参数模式，则需要将所有关联参数重置
              var valArray = [];
              conf.paramNames.map(function(name) {
                vm._resetParam(name, conf);
              });
            } else {
              vm._resetParam(resetName, conf);
            }
          } else {
            vm._resetParam(resetName);
          }
        });
        for(var i = 0; i < vm.config.searchResetParams.length; i++) {
          vm._resetParam(vm.config.searchResetParams[i]);
        }
        window.location.search = vm.query.toString()+vm.config.constantSearch.replace('?','&');
      });
    }

    initTab();
    bindTab();
    initSearchChecker();
    initSearch();
    bindSearch();
    bindClear();
  }

  _resetParam(name, conf) {
    var vm = this;
    if(!conf) {
      vm.query.remove(name);
      return;
    }
    if(typeof conf.beforeReset === 'function') {
      conf.beforeReset(name);
    }
    if(typeof conf.reset === 'function') {
      return conf.reset(name, vm.query);
    }
    if(conf.inJson) {
      var mapName = 'q';
      var qMap;
      if(conf.mapName) {
        mapName = conf.mapName;
      }
      try {
        qMap = JSON.parse(vm.query.get(mapName));
      } catch(e) {
        console.log("Old param is not json format", e);
      }
      if(qMap) {
        delete qMap[name];
        vm.query.set(mapName, JSON.stringify(qMap));
      }
    } else {
      vm.query.remove(name);
    }
  }

  _saveState() {
    var vm = this;
    var toSave = {};
    var searchCache = LocalStorage.get('searchCache');

    toSave[vm.path+':'+vm.state] = window.location.search;

    if(!searchCache) {
      searchCache = toSave;
    } else {
      $.extend(searchCache, toSave);
    }
    LocalStorage.set('searchCache', searchCache);
  }

  _processParam(k, v, conf) {
    var vm = this;
    if(conf) { // 存在自定义配置
      v = vm._translate(v, conf)
      v = vm._format(v, conf)
      vm._toParam(k, v, conf)
    } else {   // 不存在自定义配置
      vm.query.set(k, v);
    }
  }

  _search(search, hash) {
    var vm = this;
    var oldSearch = window.location.search;
    var oldHash   = window.location.hash;
    if(hash == "#"){
      hash = "";
    }
    if(search == "?"){
      search = "";
    }
    window.location.hash   = hash;
    window.location.search = search;
    if(oldSearch === search && oldHash !== hash) { // 页面仅有hash发生变化
      setTimeout(function() {
        window.location.reload();
      }, 50);
    }
  }

  // 1.1 获取参数
  _fromParam(key, conf) {
    var vm = this;
    if(typeof conf.fromParam === 'function') {
      return conf.fromParam(key, conf);
    }
    if(conf.format === 'multi') {  // 如果是多参数
      var valArray = [];
      conf.paramNames.map(function(name) {
        if(conf.inJson) {
          var mapName = 'q';
          if(conf.mapName) mapName = conf.mapName;
          var jsonStr = vm.query.get(mapName);
          if(jsonStr) {
            var qMap = JSON.parse(jsonStr);
            if(typeof qMap[name] !== 'undefined') {
              valArray.push(qMap[name]);
            } else {
              valArray.push("");
            }
          }
        } else {         // 从链接中获取参数
          if(typeof vm.query.get(name) !== 'undefined') {
            valArray.push(vm.query.get(name));
          } else {
            valArray.push("");
          }
        }
      });
      return valArray;
    } else { // 如果不是对应多参数，则直接获取参数并处理
      var value;
      if(conf.inJson) {
        var mapName = 'q';
        if(conf.mapName) {
          mapName = conf.mapName;
        }
        var jsonStr = vm.query.get(mapName);
        if(jsonStr) {
          var qMap = JSON.parse(jsonStr);
          value = qMap[key];
        }
      } else {
        value = vm.query.get(key);
      }
      return value;
    }
  }

  // 1.2 反转换格式
  _deformat(value, conf) {
    var vm = this;
    if(typeof conf.deformat === 'function') {
      return conf.deformat(value, conf);
    }
    if(typeof value !== 'undefined') {
      if(typeof conf.format != 'undefined') {
        switch(conf.format) {
          case 'multi': // 多参数型
          case 'array': // 数组型
          value = value.join(',');
          break;
          case 'date': // 时间型
          case 'startDate': // 开始时间型
          case 'endDate': // 结束时间型
          value = moment(parseInt(value)).format(conf.dateFormat ? conf.dateFormat : 'YYYY-MM-DD');
          break;
          case 'currency'://货币型
          var num = parseInt(value+'');
          isNaN(num) ? value='': value=(num/100).toFixed(2);
          break;
          default:
          console.log('[Complex Search] Unsupport Format: ' + conf.format);
        }
      }
    }
    return value;
  }

  // 1.3 恢复到input
  _recover(value, conf) {
    var vm = this;
    if(typeof conf.recover === 'function') {
      return conf.recover(value, conf);
    }
    if(typeof value !== 'undefined') {
      if(typeof conf.recover === 'object') {
        value = conf.recover[value];
      }
    }
    return value;
  }

  // 2.1 获取输入参数
  _translate(value, conf) {
    var vm = this;
    if(typeof conf.translate === 'function') {
      return conf.translate(value, conf);
    }
    if(conf.translate && typeof conf.translate[value] !== 'undefined') {
      value = conf.translate[value];
    }
    return value.trim();
  }

  // 2.2 转换格式
  _format(value, conf) {
    var vm = this;
    if(typeof conf.format === 'function') {
      return conf.format(value, conf);
    }
    try {
      switch(conf.format) {
        case 'multi': // 多参数型
        case 'array': // 数组型
        if(typeof value !== 'object') value = value.split(',');
        break;
        case 'date': // 时间型
        value = moment(value, conf.dateFormat ? conf.dateFormat : 'YYYY-MM-DD').valueOf();
        break;
        case 'startDate': // 开始时间型
        value = moment(value, conf.dateFormat ? conf.dateFormat : 'YYYY-MM-DD').startOf('day').valueOf();
        break;
        case 'endDate': // 结束时间型
        value = moment(value, conf.dateFormat ? conf.dateFormat : 'YYYY-MM-DD').endOf('day').valueOf();
        break;
        case 'integer': // 整型
        value = parseInt(value)
        break;
        case 'float': // 浮点型
        value = parseFloat(value)
        break;
        case 'currency': // 货币型
        var num = parseFloat(value);
        isNaN(num)?value=0:value=(value*100).toFixed(0);
        break;
        default:
        console.log('[Complex Search] Unsupport Format: ' + conf.format);
      }
    } catch(e) {
      console.log('[Complex Search] Error Occured: ' + e);
    }
    return value;
  }

  // 2.3 转换为参数
  _toParam(key, value, conf) {
    var vm = this;
    if(typeof conf.toParam === 'function') {
      return conf.format(key, value, conf, vm.query);
    }
    if(typeof value === 'undefined') {
      return;
    }
    if(conf.inJson) {  // 如果这个参数需要置入json
      var mapName = 'q';
      if(conf.mapName) mapName = conf.mapName;
      var oldJsonStr = vm.query.get(mapName);
      var oldJson, newJson;
      if(oldJsonStr) {
        try {
          oldJson = JSON.parse(oldJsonStr);
        } catch(e) {
          console.log("Old param is not json format", e);
        }
      }
      newJson = oldJson?oldJson:{};
      if(conf.format === 'multi') { // 如果有多个参数需要增加
        for(var i = 0; i < value.length; i++) {
          newJson[conf.paramNames[i]] = value[i];
        }
      } else {
        newJson[key] = value;
      }
      vm.query.set(mapName, JSON.stringify(newJson));
    } else {
      if(conf.format === 'multi') {
        for(var i = 0; i < value.length; i++) {
          vm.query.set(conf.paramNames[i], value[i]);
        }
      } else if(conf.format === 'array') {
        vm.query.set(key, JSON.stringify(value));
      } else {
        vm.query.set(key, value);
      }
    }
  }
}

ComplexSearch.config = {
  param: {},                  // 参数配置：格式如下
    // xxx: {                 // 和元素的name相对应
    //   inJson: false,       // 参数是否在json中
    //   mapName: "",         // json的map名称, 默认为q
    //   translate: {},       // 参数值转义map, 优先级从高到低: translate, val(), text()
    //   format: "",          // 格式，array或multi或date或startDate或endDate或currency
    //   dateFormat: "",      // format为date或startDate或endDate时使用，具体参考moment.js的文档，和常见的DateFormat不一致
    //   paramNames:[]        // format为multi时使用
    // }

  searchElem: "",          // 搜索组件的选择器
  searchBtn: "#searchBtn", // 搜索按钮的选择器
  clearBtn: "#resetBtn",   // 清空按钮的选择器
  searchResetParams:[],    // 搜索时重置的参数
  tabElem: ".tab",         // tab组件的选择器
  tabTranslate: {},        // tab的hash转换得到什么参数
  saveSearchStatus: true,  // 是否保存搜索状态
  constantSearch: ""       // 每次搜索都加入的search参数
}

module.exports = ComplexSearch;
