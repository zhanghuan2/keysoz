
export default class navHall {
  constructor ($) {
    this.bindEvent()
    this.$category = $('.nav-categorys')
  }

  bindEvent () {
    this.$el.on('mouseenter', '.category-li', (evt) => {
      this.overCategory(evt)
    })
    this.$el.on('mouseleave', '.category-li', this.outCategory)

    let width = this.$el.find('.nav-categorys').width()
    this.$el.find('.expand-category').css('left', width)
  }

  overCategory (evt) {
    evt.stopPropagation()
    // this.setRelativeIndex(evt.currentTarget)
    $(evt.currentTarget).find('.expand-panel').removeClass('disappear')
  }

  outCategory (evt) {
    evt.stopPropagation()
    $(evt.currentTarget).find('.expand-panel').addClass('disappear')
  }

  // 根据位置计算偏移
  setRelativeIndex (category) {
    let panel = $(category).find('.expand-category')
    let attachOffsetTop = $(category).find('.attach').offset().top
    let categoryHeight = this.$category.height()
    let categoryTop = this.$category.offset().top
    let windowScrollTop = $(window).scrollTop()
    let parentTop = this.$el.offset().top + this.$el.height() - windowScrollTop

    let panelMinHeight
    let panelTop
    // 如果超过当前
    if (windowScrollTop > categoryTop) {
      panelMinHeight = categoryHeight + categoryTop - windowScrollTop
      panelTop = attachOffsetTop - windowScrollTop
    } else {
      panelMinHeight = categoryHeight
      panelTop = attachOffsetTop - parentTop - windowScrollTop
    }
    $(panel).css("top", - panelTop).css("min-height", panelMinHeight)
  }
}