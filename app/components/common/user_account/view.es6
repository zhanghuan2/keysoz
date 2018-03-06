class UserAccount {
  constructor($) {
    this.accountLogin = $(".js-account");
    this.footerLink = $(".js-footer");
    this.bindEvent();
  }

  bindEvent() {
    this.accountLogin.on("click",this.userInfoExpand);
    this.footerLink.on("click",this.footExpand);
  }

  userInfoExpand() {
    let usrInfo = $(".userinfo");
    if(usrInfo.hasClass("hide")) {
      $(this).css("background-color","white");
      $(this).siblings(".account-login").css("background-color","inherit");
      usrInfo.removeClass("hide").css("right","35px");
      $(".footer-bar").addClass("hide");
    }
    else {
      usrInfo.addClass("hide");
      $(this).css("background-color","inherit");
    }
  }

  footExpand() {
    let footer = $(".footer-bar");
    if(footer.hasClass("hide")) {
      $(this).css("background-color","white");
      $(this).siblings(".account-login").css("background-color","inherit");
      footer.css("right","35px").removeClass("hide");
      $(".userinfo").addClass("hide");
    }
    else {
      footer.addClass("hide");
      $(this).css("background-color","inherit");
    }
  }
}

export default UserAccount
