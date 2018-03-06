
class ItemsIssueTool {

  static tagOfPtype(ptype) {
    ptype = parseInt(ptype)
    let tag
    switch (ptype) {
      case 2: tag = 'netsuper'
        break
      case 3: tag = 'vaccine'
        break
      case 4: tag = 'blocktrade'
        break
      case 5: tag = 'spu'
        break
      case 7: tag = 'protocol'
        break
      case 8: tag = 'mfacture'
        break
      default: tag = 'default'
        break
    }
    return tag
  }

  static isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }

  // static isElementInViewport (check_dom){
  //   var offsetTop = check_dom.offsetTop;
  //   return offsetTop >= $(window).scrollTop() && offsetTop< ($(window).scrollTop()+$(window).height())
  // }

}

module.exports = ItemsIssueTool