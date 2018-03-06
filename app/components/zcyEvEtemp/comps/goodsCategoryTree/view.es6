import Modal from "pokeball/components/modal"

class categoryTree{

    constructor() {
        this.render()
    }
    render(){
        $.query.keys.searchType ==1 && this.init();
    }
    formatData(data) {
        let result = [];
        data.forEach(function(item){
            let temp = {};
            temp.id = item.id.toString();
            temp.parent = item.pid.toString();
            if(temp.parent == "0") {
                temp.parent = "#";
            }
            temp.children = item.hasChildren;
            temp.text = item.name;
            result.push(temp);
        });
        return result;
    }

    showFirstLevelNode(num){   // 默认展示一级子节点
        let self = this;
        $('#menu-tree').jstree(true).open_node($(`li[aria-level=${num}]`).first(), function(){
            if($(`li[aria-level=${num}]`).first().find('ul').length != 0){
                self.showFirstLevelNode(num+1);
            }
            else{
                return;
            }
        });
    }

	init() {
        let self = this;
        let shopId = $('.shopId-box').data('shopid');

        $('#menu-tree').jstree({
            'core': {
                'data': function(node, cb) {   // 懒加载
                    let pCatId = (node.id == "#") ? "0" : node.id;  // node.id 初始化的默认值为#, 代表根节点
                    $.ajax({
                        url: `/api/zcy/shop/category?shopId=${shopId}&pCatId=${pCatId}`,
                        type: "GET",
                        success: function(data){
                            cb(self.formatData(data));
                        },
                        error: function(data) {
                            new Modal({
                                title:'温馨提示',
                                icon:'info',
                                content: data.responseText
                            }).show();
                        }
                    });
                }
            },
            "plugins" : ["wholerow"]
        }).bind('click.jstree', function(event) {
            let eventNodeName = event.target.nodeName;
            if (eventNodeName == 'INS') {
                return;
            } else if (eventNodeName == 'A') {
                // 被选择节点的id值
                let nodeId = $(event.target).parents('li').attr('id');
                if(window.location.href.indexOf('items') >= 0){  // 组件位于 商品详情页
                    window.open(`/eevees/shop?searchType=1&shopId=${shopId}&fcids=${nodeId}`);
                }
                else {   // 组件位于 商品搜索页
                    $('.component-goods-supplierSearch-list').data('fcid', nodeId);
                    $('.component-goods-supplierSearch-list').trigger('categorySearch');
                }
            }
        }).bind('loaded.jstree', function(event, data) {
            let num = 1;
            self.showFirstLevelNode(num);
        });
    }
}

module.exports = categoryTree
