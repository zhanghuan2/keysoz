class LeftSider{
  constructor($){
    this.rightMenu = $(".icon-location");
    this.downMenu = $(".left-sider-li .js-expand");
    this.iconFont = $(".location");
    this.rightSmallMenu = $(".icon-next");
    this.downSiderUl = $(".down-sider-ul");
    this.bindEvent();
  }

  bindEvent(){
    this.rightMenu.on("click",this.menuRightExpand);
    this.rightMenu.on("mouseover",this.addHide);
    this.downMenu.on("click",this.menuDown);
    this.iconFont.on("mouseover",this.fontIcon);
    this.iconFont.on("mouseleave",this.fontIconBack);
    this.rightSmallMenu.on("mouseover",this.smallRightMenu);
    this.rightSmallMenu.on("mouseleave",this.smallRightHide);
    this.downSiderUl.on("mouseleave",this.siderDown);
  }

  addHide() {
    $(".left-sider").find(".icon-next").addClass("hide-mydefine");
  }

  menuRightExpand() {
    $(".down-sider-more").addClass("hide");
    if($(".down-sider-ul").hasClass("flow-ul-second")) {
      $(".down-sider-ul").removeClass("flow-ul-second");
      $(".down-sider-ul").addClass("hide-mydefine");
    }
    if($(".left-sider-li .first-menu-span").hasClass("hide-mydefine")) {
      $(".left-sider-li .first-menu-span").removeClass("hide-mydefine");
      $(".left-sider").find(".icon-xiangxiazhedie").removeClass("hide-mydefine");
      $(".bottom-left-sider").addClass("bottom-left-sider-expand");
    }
    else {
      $(".left-sider-li .first-menu-span").addClass("hide-mydefine");
      $(".left-sider").find(".js-expand").addClass("hide-mydefine");
      $(".down-sider-ul").addClass("hide-mydefine");
      $(".bottom-left-sider").removeClass("bottom-left-sider-expand");
    }
  }

  menuDown() {
    let $down = $(this).siblings(".down-sider-ul")
    if($down.hasClass("hide-mydefine")) {
      $(this).removeClass("icon-xiangxiazhedie").addClass("icon-xiangshangzhedie");
      $down.closest(".left-sider-li").siblings(".left-sider-li").children(".down-sider-ul").addClass("hide-mydefine");
      $down.removeClass("hide-mydefine");
    }
    else {
      $(this).addClass("icon-xiangxiazhedie").removeClass("icon-xiangshangzhedie");
      $down.addClass("hide-mydefine");
    }

  }

  fontIcon() {
    let $down = $(this).closest(".location").siblings(".down-sider-ul");
    if($(".first-menu-span").hasClass("hide-mydefine")) {
      $(this).children(".icon-next").removeClass("hide-mydefine");
      $(this).siblings(".left-sider-li").find(".icon-next").removeClass("hide-mydefine");
      $down.find(".down-sider-more").removeClass("hide");
      $down.addClass("flow-ul-second").removeClass("hide-mydefine");
      $down.addClass("flow-ul-second").closest(".left-sider-li").siblings(".left-sider-li").find(".down-sider-ul").addClass("hide-mydefine");
    }

  }

  fontIconBack() {
    let $downRight = $(this).closest(".location").siblings(".down-sider-ul");
    if($(".first-menu-span").hasClass("hide-mydefine")) {
      $(this).children(".icon-next").addClass("hide-mydefine");
      $downRight.find(".down-sider-more").addClass("hide");
      if($(this).closest(".location").siblings(".down-sider-ul").hasClass("flow-ul-second")) {
        $downRight.removeClass("flow-ul-second").addClass("hide-mydefine");
      }
    }
  }

  smallRightMenu() {
    let $down = $(this).closest(".location").siblings(".down-sider-ul");
    $down.addClass("flow-ul-second").removeClass("hide-mydefine");
    $(this).closest(".left-sider-li").siblings(".left-sider-li").find(".icon-next").addClass("hide-mydefine");
  }

  smallRightHide() {
    let $downRight = $(this).closest(".location").siblings(".down-sider-ul");
    $downRight.removeClass("flow-ul-second").addClass("hide-mydefine");
    //$(this).closest(".left-sider-li").siblings('.left-sider-li').find(".icon-next").addClass("hide-mydefine");
    $(this).closest(".location").unbind("mouseleave");
  }

  siderDown() {
    if($(".first-menu-span").hasClass("hide-mydefine")) {
      $(this).siblings(".location").siblings(".down-sider-ul").removeClass("flow-ul-second").addClass("hide-mydefine");
      $(this).closest(".left-sider-li").find(".icon-next").addClass("hide-mydefine");
    }
  }
}

module.exports =  LeftSider
