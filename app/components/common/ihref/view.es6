let Cookie = require("common/cookie/view");

export default class IHref {
  constructor() {
    this.$hrefElm = this.$el.find('a');
    this.defaultColor = this.$hrefElm.data('color');
    this.hoverColor = this.$hrefElm.data('hoverColor'); // 激活状态

    this.beforeRender()
    this.bindEvent()
  }

  beforeRender() {
    if (this.checkpath(this.$hrefElm)) {
      this.$hrefElm.css('color', this.hoverColor)
    } else {
      this.$hrefElm.css('color', this.defaultColor)
    }
    let ifshow = this.$el.find('.dataStore').data('showdc');
    let ifimg = !!this.$el.find('.dataStore').data('ifimg');
    if(!ifshow){
      return;
    }
    let codeArr = ifshow.split(',');
    let code = Cookie.getCookie("districtCode");
    if(code && $.inArray(code,codeArr)>-1){
      this.$el.closest('.eve-col-cu').addClass('eve-hide');
      if(ifimg){
        this.$el.closest('.eve-col-cu').nextAll().not(':hidden').eq(0).addClass('eve-hide');
      }
    }else{
      this.$el.closest('.eve-col-cu').removeClass('eve-hide');
    }
  }

  bindEvent() {
    let _this = this
    this.$hrefElm.hover(() => this.$hrefElm.css('color', this.hoverColor), () => {
      if (this.checkpath(this.$hrefElm)) {
        return this.$hrefElm.css('color', this.hoverColor);
      }
      this.$hrefElm.css('color', this.defaultColor)
    });

    this.$hrefElm.on('click', function(evt) {
      // 当前页面点击不生效
      if (_this.checkpath($(this))) {
        return evt.preventDefault()
      }
    })
  }

  isIndex(path) {
    return !path || path === '/' || path === '/index'
  }

  /**
   * 解析url
   */
  getUrlJson(url) {
    let urlJson = {};
    let reg = /^(?:([A-Za-z]+):(\/{0,3}))?([0-9.\-A-Za-z]+)?(?::(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;
    let params = reg.exec(url);
    ['url', 'protocol', 'slash', 'host', 'port', 'path', 'query', 'hash'].forEach((field, i) => {
      urlJson[field] = params[i];
    });
    return urlJson
  }

  /**
   * 判断是否是当前页面
   */
  checkpath($el) {
    let jumpurl = $el.attr('href');
    const urlJson = this.getUrlJson(jumpurl);

    let currentHost = window.location.hostname
    let currentPath = window.location.pathname
    //配置host时先比较host，没有配置时比较path
    if (urlJson.host && urlJson.host !== currentHost) {
        return false;
    }
    return this.isIndex(urlJson.path) && this.isIndex(currentPath) || urlJson.path === currentPath
  }
}
