let Cookie = require("common/cookie/view");
let Server = require("zcyEvE/comp/nav_category/server");


class NavHeaderEvE{
  constructor() {
    this.init();
  }
  init(){
    this.target = this.$el;
    this.$category = $(".category-li");
    this.categoryList = $(".js-category-list");
    this.navBarItemLi = $(".navbar-item");
    this.$allCategoryShow = $(".home-channel-container");
    this.listHeight = this.categoryList.height() - 1;
    $(".expand-category").css("min-height", this.listHeight + "px");
    this.setActive();
    this.bindEvent();
  }
  bindEvent(){
    if (this.checkIsIndex()){
      this.setMinHeight()
    }else{
      this.$allCategoryShow.on("mouseenter", this.showCategory.bind(this));
      this.$allCategoryShow.on("mouseleave", this.hideCategory.bind(this));
    }
  this.setImagesHeight();
  this.navBarItemLi.on("click", this.navBarClick);
  this.target.on("mouseenter", ".category-li", this.overCategory.bind(this));
  this.target.on("mouseleave", ".category-li", this.outCategory.bind(this));
  }
  checkIsIndex(){
    let currentHost = window.location.hostname;
    let currentPath = window.location.pathname;
    let districtCode = Cookie.getCookie("districtCode")||'2222';
    let targetHosts = /^https?:\/\/(.*)$/.exec(this.target.find(".navbar-collapse").data("href"));
    if (targetHosts && targetHosts[1] === currentHost && (currentPath === "/" || currentPath === "/index" || currentPath === "/" + districtCode)) {
      return true;
    }
    return false;
  }
  showCategory(evt){
    $(evt.currentTarget).find(".home-channel").addClass("active");
    this.setMinHeight()
  }
  hideCategory(evt){
    $(evt.currentTarget).find(".home-channel").removeClass("active")
  }
  overCategory(evt){
    evt.stopPropagation();
    $(evt.currentTarget).find(".expand-panel").removeClass("disappear")
    this.setRelativeIndex(evt.currentTarget);
    $(evt.currentTarget).find("img.lazy").lazyload({
      effect: "fadeIn",
      skip_invisible : false
    }).removeClass("lazy")
  }
  outCategory(evt){
    evt.stopPropagation();
    $(evt.currentTarget).find(".expand-panel").addClass("disappear")
  }
  setMinHeight(){
    _.each(this.$category,(categoryLi)=>{
      let height = $(categoryLi).height();
      $(categoryLi).find(".attach").css("height", height)
    })
  }
  setRelativeIndex(category){
    let panel = $(category).find(".expand-category");
    let attach = $(category).find(".attach");
    let categoryHeight = this.categoryList.height();
    let categoryTop = this.categoryList.offset().top;
    let parentHeight = this.target.height();
    let parentTop = this.target.offset().top + parentHeight - $(window).scrollTop();

    let panelMinHeight, panelTop;
    if ($(window).scrollTop() > categoryTop){
      panelMinHeight = categoryHeight + categoryTop - $(window).scrollTop()
      panelTop = $(attach).offset().top - $(window).scrollTop()
    }else{
      panelMinHeight = categoryHeight;
      panelTop = $(attach).offset().top - parentTop - $(window).scrollTop()
    }
    $(panel).css("top", - panelTop).css("min-height", panelMinHeight)
  }

  setImagesHeight(){
    this.target.find(".home-channel").removeClass("disappear")
    _.each(this.$category,(categoryLi)=>{
      let height = $(categoryLi).find(".expand-panel").removeClass("disappear").find(".expand-category").css("visibility", "hidden").height()
      if (height > $(categoryLi).find(".image-recommend").height()) {
        $(categoryLi).find(".image-recommend").css("height", height);
      }
      $(categoryLi).find(".expand-panel").addClass("disappear").find(".expand-category").css("visibility", "visible");

    });
    !this.checkIsIndex() && this.target.find(".home-channel").addClass("disappear");
  }
  regExp(regs, type){
    let status = true
    $.each(this.navBarItemLi,(i,d)=>{
      let href = $(d).find("a").attr("href");
      let reg, str,re;
      if (type === 0) {
        reg = regs;
        str = href;
      } else {
        reg = href;
        str = regs;
      }
      re = new RegExp(".*#{reg}.*");
      if (re.test(str)) {
        $(".nav-header li").removeClass("active");
        $(d).closest("li").addClass("active");
        if (type === 0) {
          status = false;
        }
        return false;
      }
    });
    return status;
  }
  setActive(){
    let hostname = window.location.hostname;
    let pathName = window.location.pathname;
    let url = window.location.href;
    let status = true;
    if (pathName !== "/"){
      status = this.regExp(pathName, 0)
    }
    status && this.regExp(url, 1)
  }
  navBarClick(evt){
    $(".nav-header li").removeClass("active");
    $(evt.currentTarget).closest("li").addClass("active");
  }
}


module.exports = NavHeaderEvE;
