import OriginCeiling from 'common/ceiling/view'
import Modal from "pokeball/components/modal"
const Cookie = require("common/cookie/view")

const locationTemplate = Handlebars.templates["common/ceiling/templates/location"],
      optionsTemplate = Handlebars.templates["common/ceiling/templates/options"]

const Language = require("locale/locale");

const taxDistrictCodeArr = ['001000','981000','991000'];

class Ceiling extends OriginCeiling {

  constructor($) {
    //后台页面不展示顶部栏
    if($('body').hasClass('ZCYbacklayout')) {
      return null
    }
    super($)
    $('.more-options').on('mouseover', (evt) => {
      let target = $(evt.currentTarget);
      target.find('.select-box').show();
      target.find('.icon-zcy').removeClass('icon-xiangxiazhedie').addClass('icon-xiangshangzhedie');
    }).on('mouseout', (evt) => {
      let target = $(evt.currentTarget);
      target.find('.select-box').hide();
      target.find('.icon-zcy').removeClass('icon-xiangshangzhedie').addClass('icon-xiangxiazhedie');
    });
  }

  bindEvent () {
    this.$userRegion = $(".js-user-region-show", this.$el)
    this.$switchRegion = $(".js-switch-region", this.$el)
    super.bindEvent()
    $(document).on("click", "#js-ceiling-user-logout", evt => this.userLogout(evt))
    this.getUserRegion()
    if(taxDistrictCodeArr.indexOf(this.districtCode) !== -1){
      $('.js-seller-center-link').parents('li').hide()
    }else{
      $('.js-seller-center-link').parents('li').show()
    }
    this.$switchRegion.off('click').on("click", evt => this.switchRegion(evt))


    //this.$sellerCenterLink.on('click', function(evt) {
    //  return false
    //})
    //this.$sellerCenterLink.popover({
    //  trigger: 'hover',
    //  placement: 'bottom',
    //  html: true,
    //  content: '政采云平台正在迁移浙江政府采购网供应商数据，供应商入驻功能暂停。<br/>预计开放时间：2016年12月26日'
    //})
  }

  userLogout (evt) {
    $.ajax({
      type: "GET",
      url: "/api/user/logout",
      success: (data) => {
        window.location.href = data;
      }
    })
  }

  getUserRegion () {
    this.districtCode = Cookie.getCookie("districtCode")
    this.districtName = Cookie.getCookie("districtName") || "浙江省本级"
    this.frontHref = $("#js-user-action").data("front");
    this.ctaxccgpHref = $("#js-user-action").data("ctaxccgp");
    this.$userRegion.text(this.districtName)
    if(taxDistrictCodeArr.indexOf(this.districtCode) !== -1 && window.location.href == this.frontHref+'/'){
      window.location.href = this.ctaxccgpHref
    }
  }

  switchRegion () {
    new Modal(locationTemplate({districtName: this.districtName})).show()
    let $userRegionModal = $(".js-user-region-modal"),
        $form = $("form", $userRegionModal)
    $form.validator()
    $form.on("submit", evt => this.submitRegion(evt))
    $("select", $userRegionModal).selectric()
    $(".address-select", $userRegionModal).on("change", evt => this.selectAddress(evt))
    this.selectAddress("", {level: 1})
  }

  selectAddress (e, option) {
    let $self = $(e.currentTarget),
        $selectric = $self.closest(".selectric-wrapper"),
        level = option ? option.level : $self.data("level") + 1,
        $parent = $(`.js-user-region-modal .address-select[data-level=${level - 1}] option:selected`),
        pid = $parent.length ? $parent.val() : "",
        isLeaf = $parent.length ? $parent.data("leaf") : false

    $selectric.removeClass("empty").nextAll().addClass("selectric-hide")

    if (!isLeaf) {
      let url = "/api/district/children" + (pid ? `?pid=${pid}` : "")
      $.ajax({
        url: url,
        type: "GET",
        success: (data) => {
          try {
            data = JSON.parse(data).children
          } catch (e) {

          }
          data = data ? data : []
          let $select = $(`.js-user-region-modal .address-select[data-level=${level}]`)
          $select.html(optionsTemplate({data}))
          $select.selectric("refresh")
          $select.closest(".selectric-wrapper").removeClass("selectric-hide")
        }
      })
    }
  }


  static removeSubDomain(domain){
    //ip地址时不做截取
    let firstChar = domain.charAt(0);
    if(firstChar >= '0' && firstChar <= '9'){
      return domain;
    }
    let parts = domain.split('.');
    if (parts.length > 2){
      parts.splice(0,1);
      return parts.join('.');
    }
    return domain;
  }

  submitRegion (evt) {
    evt.preventDefault()
    let $form = $(evt.currentTarget),
        data = $form.serializeObject(),
        href = Ceiling.removeSubDomain(window.location.host),
        $modal = $(".js-user-region-modal"),
        $select = $(".selectric-wrapper:not(.selectric-hide):last", $modal),
        $option = $("option:selected", $select),
        districtCode = $option.val()

    if (districtCode) {
      let districtName = districtCode ? $option.data("name") : "浙江本级",
        preDistrictCode = Cookie.getCookie("districtCode") || '',
        pathName = window.location.pathname
      Cookie.addCookie("districtCode", districtCode, 0, href)
      Cookie.addCookie("districtName", districtName, 0, href)
      // let site = $option.data('site')
      // if (site) {
      //   window.location.hostname = site
      // } else {
      //   window.location.reload()
      // }
      let origin = window.location.protocol + '//' + window.location.host;
      const isTaxHall = origin == this.ctaxccgpHref;
      if (pathName == '/' || pathName == `/${preDistrictCode}`) {
        if (taxDistrictCodeArr.indexOf(districtCode) !== -1) {
          window.location.href = this.ctaxccgpHref;
        } else {
          window.location.href = (isTaxHall && taxDistrictCodeArr.indexOf(preDistrictCode) !== -1) ? `${this.frontHref}/${districtCode}` : `//${window.location.host}/${districtCode}`
          // window.location.href = `//${window.location.host}/${districtCode}`;
        }
      }
      else {
        window.location.reload()
      }
    } else {
      $select.addClass("empty")
    }
  }

  // 获取用户信息
  fetchUserInfo () {
    let target = top.location.href
    $.ajax({
      url: "/api/user",
      type: "GET",
      success: (data) => {
        let hrefmain = this.$userAction.data("hrefmain"),
            middleHref = this.$userAction.data("middleHref"),
            supplierHref = this.$userAction.data("supplierHref");
        if (data) {
          $('.welcome-info').addClass('hide');
          this.$userName.text(data.name)
          this.$userAction.find('.hasUserInfo').show();
          $(document).on("click", "#js-ceiling-user-logout", evt => this.userLogout(evt))

          switch (data.type) {
          case 2:
            this.$sellerCenterLink.text(`${Language.merchantCenter}`).attr("href", `${middleHref}/dashboard/todo`)
          case 0:
            this.$sellerCenterLink.text(`${Language.siteManagement}`).attr("href", `${hrefmain}/system/sites`)
          default:
            this.$sellerCenterLink.text(`${Language.merchantSettlement}`)
            if (taxDistrictCodeArr.indexOf(Cookie.getCookie('districtCode'))!== -1) {
              this.$sellerCenterLink.attr("href", `${supplierHref}/supplier/register?type=tax`)
            } else {
              this.$sellerCenterLink.attr("href", `${supplierHref}/supplier/register`)
            }
          }
        } else {
          //this.$userName.text(`${Language.userCenter}`)
          this.$userAction.find('.noUserInfo').append(`<a href="${hrefmain}/login?target=${target}" class="log-in">${Language.logIn}</a>`)
          this.$sellerCenterLink.text(`${Language.merchantSettlement}`).attr("href", `${supplierHref}/supplier/register`)
        }
      },
      error: () => false
    })
  }

  getCartCount() {
    //获取购物车数量改为在购物车组件中实现
    // $.ajax({
    //   url: "/api/zcy/carts/count",
    //   type: "GET",
    //   success: (data) => {
    //     data = data ? data : 0
    //     if(!this.$userCartCount.text()){
    //       this.$userCartCount.text(data);
    //     }
    //   },
    //   error: (data) => {
    //     if (data.status == 401) {
    //       return;
    //     }
    //     new Modal({
    //       title:"温馨提示",
    //       icon:"info",
    //       htmlContent:"获取信息失败："+data.responseText
    //     }).show();
    //   }
    // });
  }
}

module.exports = Ceiling
