const carouselTemplate = Handlebars.templates["local_manufacturer/common/scrollItems/templates/carousel"]

const ITEM_SIZE = 228, LEFT_OFFSET = 30

class ScrollItems {

  constructor($) {
    this.showSize = 6
    let itemIds = $('.js-items-id').val()
    if(itemIds) {
      this.getItemsData(itemIds)
    }
  }

  getItemsData (itemIds) {
    $.ajax({
      url: '/api/portal/mfacture/index/item',
      type: 'get',
      data: {addressCode:'330000', ids: itemIds}
    }).done((result) => {
      this.init(result)
    })
  }

  init (itemsData) {
    let originArray = itemsData.items, extendArray = []
    this.carousel = $('.scroll-items-floor')

    if (originArray.length > this.showSize){
      extendArray = originArray.concat(originArray.slice(0, this.showSize - 1))
    } else {
      extendArray = originArray
    }
    this.itemCount = extendArray.length
    this.carousel.find('.floor-body').append(carouselTemplate(extendArray))
    this.carouselContainer = this.carousel.find(".carousel-container")
    this.resetPositionStart()
    if (this.itemCount > this.showSize) {
      this.carousel.on('click', '.prev', (evt) => this.rightScroll(evt))
      this.carousel.on('click', '.next', (evt) => this.leftScroll(evt))
      this.autoScroll()
    } else {
      this.carousel.find('.prev').hide()
      this.carousel.find('.next').hide()
    }
  }

  leftScroll (evt) {
    this.carouselContainer.stop()
    if (evt && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = 0
    }
    if (this.tailIndex >= this.itemCount) {
      this.resetPositionStart()
    }
    this.headIndex += 1
    this.tailIndex += 1
    this.scrollAnimate()
  }

  rightScroll (evt) {
    this.carouselContainer.stop()
    if (evt && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = 0
    }
    if (this.headIndex < 0) {
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
    this.carouselContainer.attr('style', `width: ${this.itemCount * (ITEM_SIZE + 1)}px; margin-left: ${LEFT_OFFSET}px;`)
  }

  resetPositionEnd () {
    this.headIndex = this.itemCount - this.showSize -1
    this.tailIndex = this.itemCount - 1
    this.carouselContainer.attr('style', `width: ${this.itemCount * (ITEM_SIZE + 1)}px; margin-left: ${- ITEM_SIZE * this.headIndex + LEFT_OFFSET}px;`)
  }

  scrollAnimate () {
    this.carouselContainer.animate({'margin-left': `${- ITEM_SIZE * this.headIndex + LEFT_OFFSET}px`}, 400, () => {
      this.autoScroll()
    })
  }
}

module.exports = ScrollItems