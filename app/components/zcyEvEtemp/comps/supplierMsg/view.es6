import FavoriteShop from 'favorite_shop/view'

class supplierMsg {
  constructor() {
    this.content = "";
    this.init();
    this.bindEvent();
  }
  init(){
    let tags = $('.supplier-tags').data('tags');
    let haszzg = false;
    if(tags && tags.length > 0){
	    for(let i=0; i<tags.length; i++){
		    if(tags[i] == 'zzg'){
			    haszzg = true;
			    break;
		    }
	    }
    }
    if(haszzg){
      $('.zzg').removeClass('hide');
    }
    else{
      $('.not-zzg').removeClass('hide');
    }

    let $save = $(".component-supplierMsg .supplier-avg-score-box").find(".js-supplier-avg-save");
    $.each($save,function(i,v){
      if($(this).val()){
	      let arr = $(this).val().split("_");
	      let name = v.name;
	      let tar = parseFloat(arr[0]);
	      let avg =((parseFloat(arr[1]))/100)||0;
	      let modalDom = $(".component-supplierMsg").find("."+name+"-tr").find(".show-scor");
	      if(tar-avg>0){
		      $(".component-supplierMsg .supplier-avg-score-box").find("."+name).addClass("word-red");
		      modalDom.find("i").addClass("icon-jiantouxiangshang avg-up");
	      }else if(tar-avg==0){
		      //$(".component-supplierMsg .supplier-avg-score-box").find("."+name).find("i").addClass("icon-shuiping avg-cp")
		      modalDom.find("i").addClass("icon-shuiping avg-cp");
	      }else{
		      $(".component-supplierMsg .supplier-avg-score-box").find("."+name).addClass("word-grey");
		      modalDom.find("i").addClass("icon-jiantouxiangxia avg-down");
	      }
	      let pencent = (((tar/avg)-1)*100).toFixed(2)+"%";
	      modalDom.find("span").html(pencent);
      }
    })
  }
  bindEvent(){
    let $li = $(".component-supplierMsg .supplier-avg-score-box");

    $li.hover(function(){
      $li.find(".popover-box").removeClass("hide");
      $li.find(".arrow-choose i").removeClass("icon-more");
      $li.find(".arrow-choose i").addClass("icon-xiangshang");
    },function(){
      $li.find(".popover-box").addClass("hide");
      $li.find(".arrow-choose i").removeClass("icon-xiangshang");
      $li.find(".arrow-choose i").addClass("icon-more");
    });
    $(".content-qq button").on("click",(evt) => this.contactFun(evt));

    $('.component-supplierMsg .js-add-favor').on('click', (evt) => {
      $(evt.currentTarget).prop('disabled', true)
      let shopId = $(evt.currentTarget).data('shopId')
      if (shopId) {
        FavoriteShop.followShops([shopId], () => {
          $(evt.currentTarget).replaceWith('<button class="btn btn-info" disabled>已关注</button>')
        }, () =>{
          $(evt.currentTarget).prop('disabled', false)
        })
      }
    })
  }
  contactFun(evt){
    let $qqlink = $(".component-supplierMsg .content-qq button");
    let idNumber = $qqlink.data("qqid");
    let site = $qqlink.data("site");
    if(idNumber && idNumber !== ""){
      window.open("http://wpa.qq.com/msgrd?V=3&uin="+idNumber+"&Site="+site+"&Menu=yes");
    }
  }
}
module.exports = supplierMsg;
