import FavoriteShop from 'favorite_shop/view'
const template = Handlebars.templates["supplierList/supplierList/templates/supplierListT"]
const PaginationClass = require('pokeball/components/pagination')
const ItemServices = require('common/item_services/view')

class supplierList {
  constructor() {
    this.beforeRander();
    //this.init();
    //this.bindEvent();
  }
  beforeRander(){
    let that = this;
    let param = {};
    param.pageNo = $.query.keys.pageNo ||1;
    param.pageSize = $.query.keys.pageSize ||10;
    param.name = $.query.keys.q || "";
    if (param.name === true) {//$.query.keys.q 这种方式取值，为空是会返回true
      param.name = ''
    }
    $.ajax({
      url:"/api/search/supplier/withavg",
      type: "GET",
      data:param,
      success:function(data){
        if(data){
          that.render(data);
          that.init();
          that.bindEvent();
          that.afterRender();
        }
      }
    })
  }
  afterRender () {
    let hasLogin = $('#isPurchaser').data('user')
    if (!hasLogin) {
      return
    }
    let shopIds = []
    $('a.js-add-favor').each((i, e) => {
      let shopId = $(e).data('shopId')
      if (shopId) {
        shopIds.push(shopId)
      }
    })
    FavoriteShop.getShopsFollowStatus(shopIds, (result) => {
      $('a.js-add-favor').each((i, e) => {
        let shopId = $(e).data('shopId')
        if (result[shopId]) {
          $(e).replaceWith('<label>已关注店铺</label>')
        }
      })
    })
  }
  render(data){
    let isPurchaser = $('#isPurchaser').val()
    let DATA = {
      _DATA_:data,
      isPurchaser
    };
    let html = template(DATA);
    $(".detail-box").html(html);
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }
  init(){
    let supplierDom = $(".component-supplierList .supplierName");
    $.each(supplierDom,function(i,v){
      let name = $(this).data("name");
      $(this).html(name);
    });

    let $target = $(".component-supplierList .supplierItem");
    $.each($target,function(j,k){
      let dom = $(k);
      let $save = $(k).find(".avg-score-box").find(".js-supplier-avg-save");
      $.each($save,function(i,v){
        let arr = ($(this).val()||[]).split("_");
        let name = v.name;
        let avgDom = $(".component-supplierList").find(".js-supplier-avg-save2[name="+name+"]");
        let tar = parseFloat($(this).val())||0;
        let avg =((parseFloat(avgDom.val()))/100)||0;
        if(tar-avg>0){
          dom.find("."+name).find("i").addClass("icon-jiantouxiangshang avg-up")
        }else if(tar-avg==0){
          dom.find("."+name).find("i").addClass("icon-shuiping avg-cp")
        }else{
          dom.find("."+name).find("i").addClass("icon-jiantouxiangxia avg-down")
        }
      })

    });

  }
  bindEvent(){
    $(".component-supplierList .supplier-title").find(".logo-img-box,.supplierName").on("click",function(){
        let id = $(this).parents(".supplier-title").find(".shopidSave").val()||0;
        location.href = "/eevees/shop?searchType=1&shopId="+id
    });
    this.totalItems = $('.pagination').data('total')
    this.pagination = new PaginationClass('.pagination').total(this.totalItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true
    })
    $(".component-supplierList").find(".supplier-msg .icon-detailqq").on("click",function(e){
      let qqid = $(this).parent().parent().find(".qqSave").val();
      if(!qqid){
        return;
      }
      let qqidObj = qqid.split(",")[0];
      let idNumber = qqidObj.split(":")[1];
      let site = $(".component-supplierList").find(".hrefmain").val();
      if(idNumber && idNumber !== ""){
        window.open("http://wpa.qq.com/msgrd?V=3&uin="+idNumber+"&Site="+site+"&Menu=yes");
      }
    })
    //关注店铺
    $('.js-add-favor').off().on('click', (evt) => {
      $(evt.currentTarget).hide()
      let shopId = $(evt.currentTarget).data('shopId')
      if (shopId) {
        FavoriteShop.followShops([shopId], () => {
          $(evt.currentTarget).replaceWith('<label>已关注店铺</label>').show()
        }, () => {
          $(evt.currentTarget).show()
        })
      }
    })

  }
}
module.exports = supplierList;
