const Pagination = require('pokeball/components/pagination');
const recordList=Handlebars.templates['fixed/hotel_service_detail/templates/recordList'];
let meetingRoomTpl = Handlebars.templates['fixed/hotel_service_detail/templates/meeting_room_list'];
let diningRoomTpl = Handlebars.templates['fixed/hotel_service_detail/templates/dining_room_list'];

class HotelServiceDetail {
  constructor() {
    this.supplierId=$.query.get('supplierId');
    $('.tab-navs').zcySticky({
      idParams: ['roomtype-list', 'base—info', 'service-project', 'service-promise','deal-record'],
      itemClass: 'menuItem',
      itemHover: 'active',
      topMargin: 'auto',
      zIndex: 980
    })

    let options = {
      url: 'data-original',
      zIndex: 10003,
      ready: function (e) {
        // console.log(e.type);
      },
      show: function (e) {
        // console.log(e.type);
      },
      shown: function (e) {
        // console.log(e.type);
      },
      hide: function (e) {
        // console.log(e.type);
      },
      hidden: function (e) {
        // console.log(e.type);
      },
      view: function (e) {
        // console.log(e.type, e.detail.index);
      },
      viewed: function (e) {
        // console.log(e.type, e.detail.index);
      }
    };

    //成交记录展示
    this.getDealRecord(this.supplierId,1)
    .done((data)=>{
       $('#deal-record-list-tbody').html(recordList(data.result));
       let here=this;
       let recordPagination=new Pagination('.record-pagination').total(data.result.total).show(10,{
         num_display_entries: 5,
         jump_switch: true,
         callback: function (curr, pagesize) {   //局部刷新回调
             here.getDealRecord(here.supplierId,curr+1)
             .then(function (res) {
               $('#deal-record-list-tbody').html(recordList(res.result));
             })
             return false;
           }
       })
     })

    // 文档参考 https://github.com/fengyuanchen/viewerjs
    $('.docs-pictures').viewer(options)
    $('.total-pic-btn').on('click', e => {
      e.preventDefault();
      $('.first-pic').trigger('click');
    })

    //地图预览轮播, 配置同上
    $('.location-pic-hotel').viewer(options)

    this.radioEle = $('input:radio[name=modeRoom]');
    this.vacantRoomBtn = $('a[name=empty-room-btn]')

    let that = this;
    this.hotelRoomCache = $('.room-mode-content').html()
    this.hotelMeetingCache = '';
    this.hotelRestaurantCache = '';
    // 客房在页面渲染的时候直接调用dubbo接口,会议室和餐厅走ajax接口;之后切换利用缓存
    this.radioEle.change(function () {
      if (!that.vacantRoomBtn.hasClass('hide')) {
        that.vacantRoomBtn.addClass('hide');
      }
      if ($(this).val() === 'guestroom') {
        that.vacantRoomBtn.removeClass('hide')
        $('.room-mode-content').html(that.hotelRoomCache)
        HotelServiceDetail.trCompleteHandler()
        return;
      }

      let param = $(this).data('id');
      that.roomModeHandler(param, that)

    })

    //房型列表 每行查看详情,运用事件代理,代理元素不变
    $('.room-mode-content').on('click', '.expanded-trigger', (e) => {
      $(e.target).parents('.tr-info').next('.tr-detail').toggleClass('hide')
      if ($(e.target).parents('.tr-info').next('.tr-detail').hasClass('hide')) {
        $(e.target).closest('.expanded-trigger').html('<span>查看详情</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
      } else {
        $(e.target).closest('.expanded-trigger').html('<span>收起</span><i class="icon-zcy icon-xiangshangzhedie"></i>')
      }
    });

    //服务项目 查看详情
    $('#service-project').find('.tr-info').on('click', '.expanded-trigger', (e) => {
      $(e.target).parents('.tr-info').next('.tr-detail').toggleClass('hide')
      if ($(e.target).parents('.tr-info').next('.tr-detail').hasClass('hide')) {
        $(e.target).closest('.expanded-trigger').html('<span>查看详情</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
      } else {
        $(e.target).closest('.expanded-trigger').html('<span>收起</span><i class="icon-zcy icon-xiangshangzhedie"></i>')
      }
    });


    //房型列表 默认只显示5行
    HotelServiceDetail.trCompleteHandler()

    //服务项目 默认只显示5行
    $('.tr-service-total').on('click', '.hotel-list-all', (e) => {
      if ($('.tr-service-total .hotel-list-all span').text().indexOf('收起') > -1) {
        //收起全部时,收起从第6个详情开始以后展开的详情
        $.each($('#service-project .tr-info:nth-child(n+10) .expanded-trigger'), function (index, ele) {
          if ($(ele).children('span').text().indexOf('收起') > -1) {
            $(ele).html('<span>查看详情</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
            $(ele).closest('.tr-info ').next('.tr-detail').addClass('hide')
          }
        })

        $('.tr-info:nth-child(n+10)').addClass('hide')
        $(e.target).closest('.hotel-list-all').html('<span>查看全部</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
      } else {
        $('.tr-info:nth-child(n+10)').removeClass('hide')
        $(e.target).closest('.hotel-list-all').html('<span>收起</span><i class="icon-zcy icon-xiangshangzhedie"></i>')
      }
    });

    // // 地图预览大图
    // $('.location-pic-hotel').on('click', (e) => {
    //   e.stopPropagation();
    //
    //   let picUrl = $(e.target).data('path');
    //   let picAlt = $(e.target).attr('alt') || '';
    //
    //   let $container = $('.hotel-pic-container');
    //   let $originalPic = $('.img-original-hotel')
    //
    //   $originalPic.attr('src', picUrl)
    //   $originalPic.attr('title', picAlt)
    //
    //   $originalPic[0].onload = function () {
    //     // imgResize($('.hotel-pic-container'), this);
    //     // $originalPic.css('zoom', 1)
    //     $container.removeClass('hide')
    //   }
    //
    // })

    // 房型列表(客房、会议室、餐厅) 图片预览大图, 事件代理
    //$('.room-mode-content').on('click', 'img', (e) => {
    //  let picUrl = $(e.target).data('path');
    //  let picAlt = $(e.target).attr('alt') || '';
    //
    //  let $container = $('.hotel-pic-container');
    //  let $originalPic = $('.img-original-hotel')
    //
    //  $originalPic.attr('src', picUrl)
    //  $originalPic.attr('title', picAlt)
    //
    //  $originalPic[0].onload = function () {
    //    // imgResize($('.hotel-pic-container'), this);
    //    // $originalPic.css('zoom', 1)
    //    $container.removeClass('hide')
    //  }
    //});
    let imgPopover=null;

    $('.room-mode-content').on('mouseenter', 'img', (e) => {
      let popoverHtml = '';
      imgPopover = null;
      let picUrl = $(e.target).data('path');
      let picAlt = $(e.target).attr('alt') || '';
      popoverHtml = '<div class="popover-img-box"><img src="'+picUrl+'" title="'+picAlt+'"></div>';
      imgPopover = $(e.target).popover({
        placement: 'right',
        html: true,
        content: popoverHtml
      });
      imgPopover.popover('show');
    }).on('mouseleave','img',(e) => {
      imgPopover.popover('hide');
    })


    // 服务项目 图片预览大图,事件代理
    //$('#service-project').on('click', 'img', (e) => {
    //
    //  let picUrl = $(e.target).data('path');
    //  let picAlt = $(e.target).attr('alt') || '';
    //
    //  let $container = $('.hotel-pic-container');
    //  let $originalPic = $('.img-original-hotel')
    //
    //  $originalPic.attr('src', picUrl)
    //  $originalPic.attr('title', picAlt)
    //
    //  $originalPic[0].onload = function () {
    //    // imgResize($('.hotel-pic-container'), this);
    //    // $originalPic.css('zoom', 1)
    //    $container.removeClass('hide')
    //  }
    //})
    let servicePopover = null;
    $('#service-project').on('mouseenter', 'img', (e) => {
      let popoverHtml = '';
      servicePopover = null;
      let picUrl = $(e.target).data('path');
      let picAlt = $(e.target).attr('alt') || '';
      popoverHtml = '<div class="popover-img-box"><img src="'+picUrl+'" title="'+picAlt+'"></div>';
      servicePopover = $(e.target).popover({
        placement: 'right',
        html: true,
        content: popoverHtml
      });
      servicePopover.popover('show');
    }).on('mouseleave','img',(e) => {
      servicePopover.popover('hide');
    })

    // // 调整原始图片大小
    // function imgResize($container, imgDom) {
    //   $(imgDom).removeAttr('width')
    //   $(imgDom).removeAttr('height')
    //   let w = $container.width() * .9;//容器宽度
    //   let h = $container.height() * .9;//容器宽度
    //
    //   let img_w = imgDom.width;//图片宽度
    //   let img_h = imgDom.height;//图片高度
    //
    //   if (img_w < w && img_h < h) {
    //     return;
    //   } else if (img_w > w && img_h > h) {
    //     return $(imgDom).attr({width: '100%', height: '100%'});
    //   } else {
    //     if (img_w > img_h) {
    //       let resizeh = (w * img_h) / img_w; //高度等比缩放
    //       return $(imgDom).attr({width: w, height: resizeh});
    //     } else {
    //       let resizew = (h * img_w) / img_h; //宽度等比缩放
    //       return $(imgDom).attr({width: resizew, height: h});
    //     }
    //   }
    //
    // }


    // // 用于图片缩放
    // function zoomImg(o) {
    //   $(o).removeAttr('width')
    //   $(o).removeAttr('height')
    //   let zoom = parseInt(o.style.zoom, 10) || 100;
    //   zoom += event.wheelDelta / 2;
    //   if (zoom > 0) {
    //     o.style.zoom = zoom + '%';
    //   }
    // }
    //
    // $(".hotel-pic-container").on("mousewheel", function (e) {
    //   e.stopPropagation()
    //   if(e.target.nodeName.toLowerCase() === 'img') {
    //     zoomImg(e.target); //DOM
    //   }
    //   return false;
    // });

    // //地图预览关闭btn
    // $('.hotel-pic-closebtn').on('click', (e) => {
    //   e.stopPropagation()
    //   $('.hotel-pic-container').addClass('hide')
    // })

  }

  roomModeHandler(param, that) {
    //缓存以前发送ajax获取到的数据
    if (param === 'hotelMeetingRoom' && that.hotelMeetingCache) {
      $('.room-mode-content').html(that.hotelMeetingCache)
      HotelServiceDetail.trCompleteHandler()
      return;
    }
    if (param === 'hotelRestaurant' && that.hotelRestaurantCache) {
      $('.room-mode-content').html(that.hotelRestaurantCache)
      HotelServiceDetail.trCompleteHandler()
      return;
    }

    $.ajax({
      url: `/api/fixed/protocol/${param}`, //hotelRoom hotelMeetingRoom hotelRestaurant
      dataType: 'json',
      data: {
        supplierId: HotelServiceDetail.getParameterByName('supplierId'),
        protocolId: HotelServiceDetail.getParameterByName('protocolId'),
      },
      success: function (data) {
        if (param === 'hotelMeetingRoom') {
          that.hotelMeetingCache = meetingRoomTpl(data)
          $('.room-mode-content').html(that.hotelMeetingCache)
          HotelServiceDetail.trCompleteHandler()
        } else {
          that.hotelRestaurantCache = diningRoomTpl(data)
          $('.room-mode-content').html(that.hotelRestaurantCache)
          HotelServiceDetail.trCompleteHandler()
        }
      }
    })

  }

  
/**** 
 * 获取成交记录
*/
  getDealRecord(supplierId,pageNo){
    return $.ajax({
      url: '/api/fixed/hotel/hall/pageBuyRecord',
      type: 'GET',
      data: {
        supplierId:supplierId,
        pageNo:pageNo
      }
    })
  }

  static getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  static trCompleteHandler() {
    //默认只显示5行
    //重新绑定"查看全部"、"收起"
    $('.tr-hotel-total').on('click', '.hotel-list-all', (e) => {
      if ($('.tr-hotel-total .hotel-list-all span').text().indexOf('收起') > -1) {
        //收起全部时,收起从第6个详情开始以后展开的详情
        $.each($('#roomtype-list .tr-info:nth-child(n+10) .expanded-trigger'), function (index, ele) {
          if ($(ele).children('span').text().indexOf('收起') > -1) {
            $(ele).html('<span>查看详情</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
            $(ele).closest('.tr-info ').next('.tr-detail').addClass('hide')
          }
        })

        $('.tr-info:nth-child(n+10)').addClass('hide')
        $(e.target).closest('.hotel-list-all').html('<span>查看全部</span><i class="icon-zcy icon-xiangxiazhedie"></i>')
      } else {
        $('.tr-info:nth-child(n+10)').removeClass('hide')
        $(e.target).closest('.hotel-list-all').html('<span>收起</span><i class="icon-zcy icon-xiangshangzhedie"></i>')
      }
    });
  }

}

module.exports = HotelServiceDetail;
