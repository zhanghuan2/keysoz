
class districtSelectInput {

  constructor ($) {
    this.$tree = $('.district-tree')
    this.$districtList = $('.districtList')
    this.$districtInput = $('.district-input')
    this.$searchBtn = $('.district-search-btn')

    this.initTree()
    this.bindTreeEvents()
  }

  initTree() {
    let _self = this;

    $.ajax({
      type: "get",
      url: "/api/district/search?keyword=" + encodeURI(_self.$districtInput.val()),
      contentType: "application/json",
      success: function (data) {
        let nodes = data.data;
        _self.changeData(data.data);

        _self.$tree.jstree({
          "plugins": ["wholerow", "search"],
          "core": {
            'strings': {
              'Loading ...': '加载中...'
            },
            'data': nodes,
            "themes": {
              "icons": false
            },
            "dblclick_toggle": false,
            "worker": false
          },
          "search": {
            "show_only_matches": true,
            "show_only_matches_children": true
          }
        }).bind('select_node.jstree', function (node, selected) {
          if (selected.node.state.opened) {
            _self.$tree.jstree().close_node(selected.node);//点击文字触发展开事件
          } else {
            _self.$tree.jstree().open_node(selected.node);//点击文字触发展开事件
          }
          if (selected.node.children.length == 0) {
            $("input[name=districtName]").val(selected.node.text);
            $("input[name=districtCode]").val(_self.getCode(selected.node.id));
            _self.$districtList.toggleClass("hide")
          }
        }).bind('ready.jstree', function () {
          _self.$tree.jstree().search($("input[name=districtName]").val());
        });
      }
    });

  }
  //绑定页面操作事件
  bindTreeEvents() {
    let _self = this;
    $(".districtBox").on("click", function () {
      _self.$districtList .toggleClass("hide");
    });

    //检索(前端jstree插件)
    _self.$searchBtn.on("click", function () {
      _self.$tree.jstree().search(_self.$districtInput.val())
    })

    _self.$districtInput.keydown(function (e) {
      if ((e.keyCode || e.which) == 13) {
        _self.$tree.jstree().search(_self.$districtInput.val())
      }
    });

    //区划树清除
    _self.$districtList.find("[name='district-clear-btn']").on("click", function () {
      $("input[name=districtName]").val("");
      $("input[name=districtCode]").val("");
      _self.$districtInput.val("");
      _self.$tree.jstree().destroy();
      _self.initTree();
    });

    // 区划树取消
    _self.$districtList.find("[name='district-cancel-btn']").on("click", function () {
      _self.$districtList.toggleClass("hide");
    });
  }
  //数据处理
  changeData(data) {
    let _self = this
    for (let i = 0, iLen = data.length; i < iLen; i++) {
      data[i].id = data[i].code + "-" + data[i].id;
      if (data[i].children.length > 0) {
        _self.changeData(data[i].children);
      }
    }
  }

  getCode(treeNodeId) {
    let regExp = /(\d+)-(\d+)/;
    if (true === regExp.test(treeNodeId)) {
      return RegExp.$1;
    }
    else {
      console.log('获取Code失败，错误的树编码：' + treeNodeId);
    }
  }
}

module.exports = districtSelectInput