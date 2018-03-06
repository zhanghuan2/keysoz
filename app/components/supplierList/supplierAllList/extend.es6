import FavoriteShop from 'favorite_shop/view'
const Pagination = require('pokeball/components/pagination')
const ItemServices = require('common/item_services/view')

class supplierAllList {
  constructor() {
    this.beforeRander()
    this.bindEvents()
  }

  beforeRander(){
    this.pagination = $(".list-pagination");
    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 10,
      jump_switch: true,
      page_size_switch: true
    });
    $(".component-supplierAllList").find("img.lazy").lazyload({
      effect: "fadeIn",
      skip_invisible: false
    }).removeClass("lazy");

    let shopIds = [],userId = null
    $('button.js-add-favor').each((i, e) => {
      let shopId = $(e).data('shopId'),
        userId = $(e).data('userId')
      if (shopId) {
        shopIds.push(shopId)
      }
    })
    if (userId && shopIds.length > 0) {
      FavoriteShop.getShopsFollowStatus(shopIds, (result) => {
        $('button.js-add-favor').each((i, e) => {
          let shopId = $(e).data('shopId')
          if (result[shopId]) {
            $(e).replaceWith('<button class="btn btn-info" disabled>已关注</button>')
          }
        })
      })
    }
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  bindEvents () {
    $('.js-add-favor').off().on('click', (evt)=>{
      $(evt.currentTarget).prop('disabled', true)
      let shopId = $(evt.currentTarget).data('shopId')
      if (shopId) {
        FavoriteShop.followShops([shopId], () => {
          $(evt.currentTarget).replaceWith('<button class="btn btn-info" disabled>已关注</button>')
        }, () => {
          $(evt.currentTarget).prop('disabled', false)
        })
      }
    })

    $('.js-enter-shop').off().on('click', (evt) => {
      let shopId = $(evt.currentTarget).data('shopId')
      if (shopId) {
        window.open(`/eevees/shop?searchType=1&shopId=${shopId}`)
      }
    })
  }
}
module.exports = supplierAllList;
