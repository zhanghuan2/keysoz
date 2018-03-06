var SystemSiteManage = require('system/site_manage/view');
var Modal = require("pokeball/components/modal");
var asocciateTemplate = Handlebars.templates["system/site_manage/templates/asocciate_districts"];

let relatedDistricts = [];

class SiteManage extends SystemSiteManage {

  constructor(){
    super();
    $('.js-asocciate-districts').on('click', (evt)=>this.asocciateWithDistricts(evt));
  }

  /*
    关联区划操作s
   */
  asocciateWithDistricts(evt){
    let that = this;
    let siteId = $(evt.target).data('id');
    that.getRelateDistrict(siteId);
  }

  /*
    获取站点关联的区划
   */
  getRelateDistrict(siteId){
    let that = this;
    $.ajax({
      url: '/api/design/sites/'+siteId+'/district_relate',
      type: 'GET',
      success:(data)=>{
        relatedDistricts = data;
        (that.asocciateWithDistricts.__modal__ = new Modal(asocciateTemplate({'districts': data}))).show();
        that.initTree();
        $('.js-delete-district').on('click', (evt)=>that.removeDistrictLabel(evt));
        $('.modal .btn-success').on('click', (evt)=>{
          that.saveRelatedDistricts(evt, siteId)
        });
      }
    })
  }

  initTree() {
    let that = this;
    // 初始化树
    let tree = $('#districttree').jstree({
      "plugins" : ["wholerow"],
      "core": {
        'strings' : {
          'Loading ...' : '加载中...'
        },
        'data' : {
          "url" : '/api/district/children',
          "dataType" : "json",
          "data" : function (node) {
            let pid = that.getId(node.id);
            return { "pid" : pid , "deep" : 1 };
          }
        },
        'fix':(data)=>{
          let d = JSON.parse(data);
          d.text = d.fullName;
          d.id = d.code + '-' + d.id;
          _.each(d.children, (item)=>{
            item.text = item.fullName;
            item.id = item.code + '-' + item.id;
            if(!item.isLeaf){
              item.children = true;
            }
          });
          return d;
        },
        "themes" : {
          "icons" : false
        },
        "dblclick_toggle" : false,
        "worker" : false
      }
    })
      .bind('select_node.jstree', function (node, selected) {
        if(selected.node.original.isLeaf){
          that.addDistrictLabel(selected.node.text, selected.node.original);
        }
        else{
          //$(selected.node).unbind('select_node.jstree');
          //if(tree.jstree().is_open(selected.node)){
          //  tree.jstree().close_node(selected.node);
          //}
          //else{
          //  tree.jstree().open_node(selected.node);
          //}
        }
      })
  }

  /*
   入参是treeNodeid
   */
  getId(treeNodeId){
    var regExp = /(\d+)-(\d+)/;
    if (true === regExp.test(treeNodeId)) {
      return RegExp.$1;
    }
    else{
      console.log('获取Id失败，错误的树编码：'+treeNodeId);
    }
  }

  /*
    添加关联区划标签
   */
  addDistrictLabel(text, data) {
    let that = this;
    let repeat = false;
    _.each(relatedDistricts, (d)=>{
      if(d.code == data.code) {
        repeat = true;
        return false;
      }
    })
    if(repeat) return;
    relatedDistricts.push(data);
    let label = '<span class="district-label" data-item='+JSON.stringify(data)+'>' +
      '<span class="district-text">'+text+'</span>' +
      '<button class="js-delete-district"><i class="icon-zcy icon-close"></i></button>' +
      '</span>';
    $('.js-related-districts').append($(label).on('click','.js-delete-district', (evt)=>that.removeDistrictLabel(evt)));
  }

  /*
   删除关联区划
   */
  removeDistrictLabel(evt){
    let label = $(evt.target).closest('.district-label');
    let delCode = label.data('item').code;
    let delIndex = -1;
    _.each(relatedDistricts, (d, index)=>{
      if(d.code == delCode){
        delIndex = index;
        return false;
      }
    })
    relatedDistricts.splice(delIndex, 1);
    label.remove();
  }

  /*
    站点关联区划保存
   */
  saveRelatedDistricts(evt, siteId){
    let that = this;
    $(evt.target).prop('disabled', true);
    let labels = $('.js-related-districts').find('.district-label');
    let districtNodes = [];
    _.each(labels, (label)=>{
      let item = $(label).data('item');
      let district = {
        code : item.code,
        name : item.name,
        fullName : item.fullName
      }
      districtNodes.push(district);
    })
    $.ajax({
      url: '/api/design/sites/'+siteId+'/district_relate',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(districtNodes),
      success: (data)=>{
        console.log('save success');
        that.asocciateWithDistricts.__modal__.close();
      }
    }).fail(()=>{
      $(evt.target).prop('disabled', false);
    })
  }
}

module.exports = SiteManage