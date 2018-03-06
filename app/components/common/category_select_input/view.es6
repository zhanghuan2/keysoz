class CategorySelectInput {

  constructor ($) {
    this.$categorySelect = $('.category-select')
    this.$categorySelect.selectric()
    let tag = this.$categorySelect.data('tag')
    if (tag) {
      this.getTreeData(tag)
    }
  }

  getTreeData (tag) {
    $.ajax({
      url: '/api/zcy/backCategories/categoriesByTag',
      type: "GET",
      data: {tag: tag}
    }).done((result) => {
      let rootNode = {children: result}
      this.initTree(rootNode)
    })
  }


  //初始化tree
  initTree(content) {
    let that = this
    let walk = function (pNode) {
      if (!pNode.children || true === pNode.children || false === pNode.children) {
        pNode.children = false
      }
      else {
        for (let i = 0; i < pNode.children.length; i++) {
          let sNode = pNode.children[i]
          sNode.text = sNode.node.name
          sNode.id = sNode.node.id
          walk(sNode)
        }
      }
    }
    walk(content)

    let tree2 = $('#item-tree').jstree({
      "core": {
        "themes": {
          "icons": false
        },
        "data":content.children,
        "dblclick_toggle": false
      }
    }).on('select_node.jstree',function(node, selected) {
      node = selected.node
      $(this).parent().find('.selectric p').text(node.text)
      $('#item-tree').hide()
      $(that.$categorySelect.children("option").eq(0)).attr("value", node.id)
      that.$categorySelect.trigger("change")

    }).on('loaded.jstree',function(){
      tree2.jstree().select_node($.query.get('categoryId'))
      that.$categorySelect.closest('.category-select-input').css('display', 'inline-block')
    })

    $('.selectric-category-select .selectric').unbind().bind('click', function(e) {
      e.stopPropagation()
      $('#item-tree').toggle()
      that.$categorySelect.selectric('close')
    })

    $(document).on('click', function(e) {
      if ($(e.target).hasClass('jstree-ocl')) {
        return
      }
      $('#item-tree').hide()
    })
  }
}

module.exports = CategorySelectInput