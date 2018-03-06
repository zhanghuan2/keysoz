const purchaseOrgList = Handlebars.templates["education/purchaseOrgList/templates/list"]
const ITEM_SIZE = 224, LEFT_OFFSET = 0

class PurchaseOrgList {
  constructor ($) {
    this.$listBody = $('.list-body')
    this.$orgList = $('.scroll-list')
    this.showSize = 5
    this.preRender()
  }

  preRender() {
    try {
      let jsonStr = $('.js-purchas-orgs').val(),
      data = JSON.parse(jsonStr)
      this.init(data)
    } catch (e) {}
  }

  init (items) {
    let originArray = items, extendArray = []
    if (originArray.length > this.showSize){
      extendArray = originArray.concat(originArray.slice(0, this.showSize))
    } else {
      extendArray = originArray
    }
    this.itemCount = extendArray.length
    this.$orgList.empty().append(purchaseOrgList({data:extendArray}))

    this.resetPositionStart()
    if (this.itemCount > this.showSize) {
      this.$listBody.on('click', '.left', (evt) => this.rightScroll(evt))
      this.$listBody.on('click', '.right', (evt) => this.leftScroll(evt))
      this.autoScroll()
    } else {
      this.$listBody.find('.left').hide()
      this.$listBody.find('.right').hide()
    }
  }

  leftScroll (evt) {
    this.$orgList.stop()
    if (evt && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = 0
    }
    if (this.tailIndex >= this.itemCount - 1) {
      this.resetPositionStart()
    }
    this.headIndex += 1
    this.tailIndex += 1
    this.scrollAnimate()
  }

  rightScroll (evt) {
    this.$orgList.stop()
    if (evt && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = 0
    }
    if (this.headIndex < 1) {
      this.resetPositionEnd()
    }
    this.headIndex -= 1
    this.tailIndex -= 1
    this.scrollAnimate()
  }

  autoScroll() {
    this.timeout = setTimeout(()=>{
      this.leftScroll ()
    }, 3000)
  }

  resetPositionStart () {
    this.headIndex = 0
    this.tailIndex = this.showSize - 1
    this.$orgList.attr('style', `width: ${this.itemCount * (ITEM_SIZE + 1)}px; margin-left: ${LEFT_OFFSET}px;`)
  }

  resetPositionEnd () {
    this.headIndex = this.itemCount - this.showSize -1
    this.tailIndex = this.itemCount - 1
    this.$orgList.attr('style', `width: ${this.itemCount * (ITEM_SIZE + 1)}px; margin-left: ${- ITEM_SIZE * this.headIndex + LEFT_OFFSET}px;`)
  }

  scrollAnimate () {
    this.$orgList.animate({'margin-left': `${- ITEM_SIZE * this.headIndex + LEFT_OFFSET}px`}, 400, () => {
      this.autoScroll()
    })
  }
}

module.exports = PurchaseOrgList