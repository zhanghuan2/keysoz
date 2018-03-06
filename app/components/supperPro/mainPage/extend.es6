let template = Handlebars.templates["supperPro/mainPage/templates/supperProList"];
const PaginationClass = require('pokeball/components/pagination');

class supperpromain {
  constructor() {

    this.$tar = $(".component-supperPro-main");
    this.param={};
    this.beforeRander();
    //this.bindEvent();
  }

  init(){
    let width = $(".component-supperPro-main .supplier-list").find(".list-li").eq(0).width();
    $(".component-supperPro-main .supplier-mask").width(width-1);
    let li = $(".component-supperPro-main .list-li");
    $.each(li,function(index,t){
      let $target = $(t);
      let $save = $(t).find(".js-supplier-avg-save");
      $.each($save,function(i,v){
        let arr = ($(this).val()||[]).split("_");
        let name = v.name;
        let tar = parseFloat(arr[0]);
        let avg =((parseFloat(arr[1]))/100)||0;
        if(tar-avg>0){
          $target.find("."+name).find("i").addClass("icon-jiantouxiangshang avg-up")
        }else if(tar-avg==0){
          $target.find("."+name).find("i").addClass("icon-shuiping avg-cp")
        }else{
          $target.find("."+name).find("i").addClass("icon-jiantouxiangxia avg-down")
        }
      })

    });
  }
  beforeRander(){
    let $ptitle = $(".page-title");
    if($.query.keys.tabs==1){
      $ptitle.find(".btn-tab").eq(1).addClass("active");
    }else{
      $ptitle.find(".btn-tab").eq(0).addClass("active");
    }
    let fId = $ptitle.find(".btn-tab.active").data("fontid")||"",
        tId = $(".local-tab").find("li.active").data("tenderid")||"";
    this.param = {
      "frontCategoryId":fId, // 前台类目id
      "tenderId":tId, // 标段id
      "pageNo":1, // 页码
      "pageSize":10 // 也大小
    };
    this.getList();
  }
  getList(){
    let that = this;
    this.$tar.find(".listBox").html('<img style="display: block;margin: 0 auto;" src="/lunatone/assets/images/other-images/block_loading.gif" />')
    $.ajax({
      url:"/api/zcy/blocktrade/index/suppliers",
      type:"GET",
      data:this.param,
      success:function(data){
        let frontUrl = $('input[name="frontUrl"]').val();
        let result = {_DATA_:data, frontUrl}
        let html = template(result);
        that.$tar.find(".listBox").html(html);
        that.init();
        that.bindEvent();
      }
    })
  }
  bindEvent(){
    let that = this;
    this.$tar.find(".supplier-title").on("mouseover mouseout",function(event){
      var $parent = $(event.target).hasClass("supplier-title") ?
                            $(event.target):
                                ($(event.target).parents(".supplier-title"));
      if(event.type == "mouseover"){
        $parent.parent().find(".supplier-mask").removeClass("hide");
      }else if(event.type == "mouseout"){
        $parent.parent().find(".supplier-mask").addClass("hide");//鼠标离开
      }
    });
    this.$tar.find(".supplier-link").on("mouseover mouseout",function(event){
      let dom = $(this).find("div.link-info");
      if(event.type == "mouseover"){
        dom.removeClass("hide");
      }else if(event.type == "mouseout"){
        dom.addClass("hide");//鼠标离开
      }
    });
    this.$tar.find(".supplier-link").on("click",function(){
      let $dom = $(this).find("div.link-info");
      let _id = $dom.data("linkid");
      if(_id){
        let frontUrl = $('input[name="frontUrl"]').val();
        location.href = frontUrl + "/items/"+_id+"?searchType=1"
      }
    });
    this.$tar.find(".supplier-title .product-image,.title-msg").on("click",function(){
      location.href = $(this).parent(".supplier-title").find(".title-content a.initShop").attr("href");
    });
    this.$tar.find(".page-title .btn-tab").on("click",function(evt){
      if($(evt.currentTarget).hasClass('active'))
        return;
      let index = $(evt.currentTarget).index();
      // if(index == 0){
      //   window.location.search="";
      //   return;
      // }
      let frontCategoryId = $(evt.currentTarget).data("fontid");
      window.location.search = "?frontCategoryId="+frontCategoryId+"&tabs="+index;
    });
    this.$tar.find(".local-tab li").on("click",function(e){
      if($(this).hasClass('active'))
        return;
      that.$tar.find(".local-tab li").removeClass("active");
      $(this).addClass("active");
      that.showTab(e.target,2);
    })
  }
  showTab(){
    if(arguments.length==2){
      let tenderId = $(arguments[0]).data("tenderid")||"";
      this.param.tenderId = tenderId;
    }else{
      let frontId = $(arguments[0]).data("fontid") || 860;
      this.param.frontCategoryId = frontId;
    }
    this.getList();
  }
}
module.exports = supperpromain;
