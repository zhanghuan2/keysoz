let treeTlp = Handlebars.templates["common/selectric_tree/templates/tree"];

/**
 * 树形选择，值为选择的所有子节点
 */
class SelectricTree {
  constructor(selector, config) {
    let _default = {
      plength: 6,
      prefix: 'selectric-tree',
      isOpen: false,
      isTreeInit: false,
      isQuerying: false,
      onChange: null,
      onError: function(error) {
        //Notify.warning('警告', error);
        ZCY.warning('警告', error);
      }
    };
    this.pids = {};
    this.nodes = '';
    this.selector = selector || null;
    this.config = $.extend(_default, config);
    this.bindEvent();

    let $treeTypeInput = this._getJqueryDom('input[data-type=tree_type]');
    let typeVal = $treeTypeInput.data('typeValue');
    this.limit = $treeTypeInput.data('limit') || 30;
    this.isTitle = typeVal == 'title';
    this.remoteUrl = '/api/demand/query_catalog_tree';
    this._preInit();
  }

  bindEvent() {
    let vm = this;
    let $tree = vm._getJqueryDom('.selectric-tree');
    $tree.click((event) => {
      vm.config.isOpen ? vm._close() : vm._open(event);
    });

    let $doc = $(document);
    $doc.on('click', () => {
      if(vm.config.isOpen){
          $.isFunction(vm.config.closeBack) && vm.config.closeBack.apply(vm,[]);
      }
      vm._close();
    });

    let $treeItem = vm._getJqueryDom('.selectric-tree-items');
    $treeItem.click((event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    $(this.selector).find('.selectric-tree .clear').off('click').on('click', function() {
      vm.deselectAll();
      vm._hideClearBtn();
    });
  }

  _showClearBtn() {
    $(this.selector).find('.selectric-tree .clear').show();
    $(this.selector).find('.selectric-tree .button').hide();
  }
  _hideClearBtn() {
    $(this.selector).find('.selectric-tree .clear').hide();
    $(this.selector).find('.selectric-tree .button').show();
  }

  _getJqueryDom(selector) {
    return this.selector ? $(this.selector).find(selector) : $(selector);
  }

  _getInput() {
    return $(this.selector).find('input[data-type="tree_type"]');
  }

  _close() {
    let vm = this;
    let $treeWrapper = vm._getJqueryDom('.selectric-tree-wrapper');
    $treeWrapper.removeClass(vm.config.prefix + '-' + 'open');
    vm.config.isOpen = false;
  }

  _open(event) {
    let vm = this;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!vm.config.isQuerying && !vm.config.isTreeInit) {
      vm._queryAndInitTree();
    }
    $(event.target).parent().parent().addClass(vm.config.prefix + '-' +'open');
    vm.config.isOpen = true;
  }

  _queryAndInitTree(callback) {
    let vm = this;
    vm.config.isQuerying = true;
    $.ajax({
      url: vm.remoteUrl,
      type: 'GET',
      data:{"includeAuditMap":false,"year":2016},
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        let $treeItem = vm._getJqueryDom('.selectric-tree-items');
        let result = data.data.data || [];

        $treeItem.append(treeTlp(result));
        vm._initTree($treeItem);
        callback && callback();
      }
    }).always(function(){
      vm.config.isQuerying = false;
    });
  }

  _preInit() {
    let vm = this;
    let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
    let nodes = $treeValueRoot.find('.selectric-nodes').text();
    let names = $treeValueRoot.find('.selectric-names').text();

    /* 如果已经有值，直接写入 */
    if (nodes && names) {
      let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
      $treeLabelRoot.find('.label').text(names);
      /* 得到ids */
      vm.nodes = nodes.split(',');
    }
  }

  getValue() {
    let vm = this;
    if (!vm.tree) {
      return {};
    }
    let nodes = vm.tree.jstree(true).get_bottom_selected(true);
    if (vm.limit == 1) {
      let node = nodes[nodes.length - 1];
      return {id: node.id, text: node.text};
    }
    let ids = [];
    let texts = [];
    $.each(nodes, (index, node) => {
      ids.push(node.id);
      texts.push(node.text);
    });
    return {id: ids.join(','), text: texts.join(',')};
  }

  selectNode(obj) {
    /* 字符串 */
    let vm = this;
    let nodes = obj;
    if ($.type(obj) == 'string') {
      /* 将中文逗号转成英文 */
      obj = obj.replace(/，/g, ',');
      nodes = obj.split(',');
    }
    if (!vm.tree) {
      vm._queryAndInitTree(function() {
        /* 先清除原本的选中 */
        vm.tree.jstree('deselect_all', true);
        vm.tree.jstree('select_node', nodes);
      });
    } else {
      /* 先清除原本的选中 */
      vm.tree.jstree('deselect_all', true);
      vm.tree.jstree('select_node', nodes);
    }
  }

  deselectAll() {
    let vm = this;
    if (!vm.tree) {
      return false;
    }

    vm.tree.jstree('deselect_all', true);
    let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
    $treeLabelRoot.find('.label').text('');

    let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
    $treeValueRoot.find('.selectric-nodes').text('');
    $treeValueRoot.find('.selectric-names').text('');

    /* 修改input的值 */
    let $input = vm._getInput();
    $input && $input.val('');
  }

  /**
   * 验证个数
   */
  _validParentLength(item) {
    let vm = this;
    /* 父级元素，忽略 */
    if (item.children && item.children.length) {
      return true;
    }
    let pid = item.parent;
    /* 取消选中 */
    if (item.state.selected) {
      vm.pids[pid] --;
      /* 已经为0，清空 */
      if (!vm.pids[pid]) {
        delete vm.pids[pid];
      }
      return true;
    }
    /* 已经存在 */
    if (vm.pids[pid]) {
      vm.pids[pid] ++;
      return true;
    }
    if (_.keys(vm.pids).length >= vm.config.plength) {
      vm.config.onError && vm.config.onError('最多只能选择' + vm.config.plength + '个分类节点');
      return false;
    }
    vm.pids[pid] = 1;
    return true;
  }

  _initTree(treeRoot) {
    let vm = this;
    vm.config.isTreeInit = true;
    let plugins = vm.limit == 1 ? ['ui', 'themes', 'html_data'] : ['checkbox', 'conditionalselect', 'ui', 'themes', 'html_data'];
    vm.tree = treeRoot.jstree({
      conditionalselect: function(item, event) {
        if (!vm._validParentLength(item)) {
          return false;
        }
        // if (item.children && item.children.length > 0) {
        //   return false;
        // }
        if (vm.limit && vm.limit > 0 && this.get_bottom_checked().length >= vm.limit && !item.state.selected && item.children_d.length >= vm.limit) {
          vm.config.onError && vm.config.onError('最多只能选择' + vm.limit + '个节点');
          event.preventDefault();
          return false;
        }
        return true;
      },
      plugins : plugins,
      ui: {
        select_limit: vm.limit
      },
      core: {
        themes : {
          icons : false
        },
        dblclick_toggle : false
      },
      checkbox : {
        keep_selected_style : false
      }
    })
    .on('ready.jstree', function(event, data) {
      vm.nodes && data.instance.select_node(vm.nodes);
    })
    .on('changed.jstree', function(event, data) {
      /* 将选中的子节点值进行拼接，忽略父节点 */
      let nodes = data.instance.get_bottom_selected({full: true});
      let nameArray = [];
      let idArray = [];
      $.each(nodes, (index, node) => {
        /* 去除text中的空格等字符 */
        nameArray.push($.trim(node.text));
        idArray.push(node.id);
      });
      let selectedValues = nameArray.join(',');
      let $treeLabelRoot = vm._getJqueryDom('.' + vm.config.prefix);
      $treeLabelRoot.find('.label').text(selectedValues);

      let ids = idArray.join(',');
      let $treeValueRoot = vm._getJqueryDom('.selectric-tree-value');
      $treeValueRoot.find('.selectric-nodes').text(ids);
      $treeValueRoot.find('.selectric-names').text(selectedValues);

      /* 修改input的值 */
      let $input = vm._getInput();
      $input && $input.val(ids);
      vm.config.onChange && vm.config.onChange(ids);

      vm._showClearBtn();
    });
  }
}

module.exports = SelectricTree;
