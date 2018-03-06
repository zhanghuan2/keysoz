let Query = require('common/query/extend');
let Pagination  = require('pokeball/components/pagination');
let PaginationTmpl = Handlebars.templates['common/ajax-template-search/templates/pagination'];

class AjaxTemplateSearch {
  constructor(_config) {
    if (!_config.ajaxUrl) {
      throw new Error('AjaxTemplateSearch组件的ajaxUrl为必填' + JSON.stringify(_config));
    }
    if (!_config.template) {
      throw new Error('AjaxTemplateSearch组件的template为必填，为Handlebars.templates的function');
    }

    let _default = {
      template: null,          // 模板，为Handlebars.templates的function
      ajaxUrl: '',             // ajax请求地址
      extends: null,
      preSearch: true,
      paginationSelector: '',  // 分页组件的位置
      root: '',                // 组件的根
      appendElem: '.ajax-template', // 结果append位置
      searchElem: '',          // 搜索组件的选择器
      searchBtn: '#searchBtn', // 搜索按钮的选择器
      clearBtn: '#resetBtn',   // 清空按钮的选择器
      searchResetParams:[],    // 搜索时重置的参数
      preRender: null,
      callback: null
    };

    this.query   = new Query();
    this.query.set('pageSize', 10).set('pageNo',1);
    this.config  = $.extend(_default, _config);

    this.bindEvent();

    /* 如果有扩展，填入query */
    if (this.config.extends) {
      $.each(this.config.extends, (key, value) => {
        this.query.set(key, value);
      });
    }
    this.config.preSearch && this.search();
  }

  initTmpl(data) {
    let vm = this;
    let initFlag = false;
    let pageNo;
    $(vm.config.paginationSelector).html(PaginationTmpl(data || {}));
    let pagination = new Pagination($(vm.config.paginationSelector).find('.pagination'));
    pagination.total($(vm.config.paginationSelector).find('.pagination-total').data('total'));
    $(vm.config.paginationSelector).find('.items-per-page-selector').selectric();

    function callback(currentPage) {
      let pageNo = parseInt(currentPage) + 1;
      vm.query.set('pageNo', pageNo);
      vm.search(true);
    }

    function showPagination() {
      let $itemsPerPageSelector = $(vm.config.paginationSelector).find('.items-per-page-selector');
      let pageSize = $itemsPerPageSelector.val();
      vm.query.set('pageSize', pageSize || 10);
      let currentPage = (pageNo && (pageNo - 1)) || 0;
      pagination.show(pageSize, {
        current_page: currentPage,
        callback: callback
      });
      initFlag && callback(currentPage);
    }

    showPagination();
    initFlag = true;
    $(vm.config.paginationSelector).find('.items-per-page-selector').off('change').on('change', showPagination);
  }

  bindEvent() {
    let vm = this;
    $(vm.config.searchBtn).bind('click', function() {
      if (vm.config.searchElem) {
        let $elems = $(vm.config.root).find('input'+vm.config.searchElem+'[name],select'+vm.config.searchElem+'[name],textarea'+vm.config.searchElem+'[name]');

        $elems.each(function() {
          let key = $(this).attr('name');
          let value = $(this).val();

          var elementType = $(this).attr('type');
          if(elementType === 'checkbox') {
            value = $(this).prop('checked');
          }

          if(typeof value === 'undefined' || value === null || value === '') {
            vm.query.remove(key);
          } else {
            vm.query.set(key, value);
          }
        });
      }

      vm.search();
    });

    $(vm.config.clearBtn).bind('click', function() {
      for(let i = 0; i < vm.config.searchResetParams.length; i++) {
        vm.query.remove(vm.config.searchResetParams[i]);
        let $elm = $(vm.config.root).find("[name='"+vm.config.searchResetParams[i]+"']")
        if ($elm.is('select')) {
          $($elm.find('option')[0]).attr('selected', true);
          $elm.data('selectric')&& $elm.selectric('refresh')
        } else {
          $elm.val("");
        }

      }
      vm.search();
    });
  }

  search(unRenderFlag) {
    let vm = this;
    $.ajax({
      type: 'GET',
      url: vm.config.ajaxUrl + vm.query.toString(),
      contentType: 'application/json',
      success: function(resp) {
        if (!resp) {
          resp = {};
        }
        /* 列表显示，默认为[] */
        if (!resp.data) {
          resp.data = [];
        }

        if (vm.config.preRender) {
          resp = vm.config.preRender(resp)
        }

        if (vm.config.extends) {
          resp.params = vm.config.extends;
        }

        /* 将新数据添加到template中，修改分页显示 */
        $(vm.config.root).find(vm.config.appendElem).html(vm.config.template(resp));
        !unRenderFlag && vm.initTmpl(resp);
        vm.config.callback && vm.config.callback(resp);
      }
    });
  }
}

module.exports = AjaxTemplateSearch;

