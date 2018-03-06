const PaginationClass = require('pokeball/components/pagination');
const Service = require('fixed/hotel_service/server');
const Cookie = require("common/cookie/view");

class HotelService {
  constructor() {
    this.fixedTypeEle = $('.js-fixed-type'); //会议定点类型
    this.hotelLevelEle = $('.js-hotel-level'); //酒店级别
    this.multipleSelect = $('.js-elects'); //多选
    this.btnConfirm = $('.js-mul-confirm');//确定
    this.btnCancel = $('.js-mul-cancel');//取消
    this.closeIcon = $('.colse-select');//close icon
    this.businessTripEle = $('input[name=business-trip]'); //出差定点
    this.freeForCarEle = $('input[name=free-park-select]'); //免费停车场
    this.listKey = $('.filter-key'); //综合(星级)、协议价格排序
    // this.iconEle = $('.icon-zcy'); //价格搜索箭头
    this.filterForm = $('.filter-form');
    this.bindEvent();

    //初始化页面所用到的插件
    let districtCode = $.query.get('protocolDistrict') || Cookie.getCookie("districtCode");
    $('#hotel-region').zcyAddress().on('zcyAddress-change', (event, element, instance) => {
      event.preventDefault();
      event.stopPropagation();
      let addressObj = instance.getValue();
      let query = $.query.set('provinceId', addressObj.provinceId)
          .set('cityId', addressObj.cityId)
          .set('regionId', addressObj.regionId)
          .remove('pageNo');
      return window.location.search = query.toString();
    });

    this.totalHotelItems = $('.pagination').data('total'); // 酒店总数量
    this.pagination = new PaginationClass('.pagination').total(this.totalHotelItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true
    });

    //标记选中状态
    //starRatings placeTypes fixedForTrip keyWord isFreeForCar protocolDistrict minNegotiatedRate maxNegotiatedRate
    this.qsObj = $.query.keys;
    HotelService.hotelSelectStyle(this.qsObj)

  }

  bindEvent() {
    this.fixedTypeEle.on('click', (e) => Service.fixedTypeCB(e)); //会议定点类型
    this.hotelLevelEle.on('click', (e) => Service.hotelLevelCB(e)); //酒店级别
    this.multipleSelect.on('click', (e) => Service.mulSelectCB(e)); //多选
    this.btnConfirm.on('click', (e) => Service.btnConfirmCB(e)); //确定
    this.btnCancel.on('click', (e) => Service.btnCancelCB(e)); //取消
    this.closeIcon.on('click', (e) => Service.iconCloseCB(e)) //清除搜索条件
    this.businessTripEle.on('click', (e) => Service.businessTripCB(e)); //出差定点
    this.freeForCarEle.on('click', (e) => Service.freeForCarCB(e)); //免费停车场

    //关键字搜索
    $('#hot-search').keydown(function (e) {
      if (e.which == "13") //enter
        Service.keyWordCB(e)
    });

    //综合 默认升序
    this.listKey.on('click', (e) => Service.showHandler(e));
    //箭头点击排序
    // this.iconEle.on('click', (e) => Service.iconCB(e))
    //价格过滤搜索
    this.filterForm.on('submit', (e) => Service.filterFormSubmit(e))
  }

  //考虑到整页刷界面,改方法仅仅为了复写样式,回填字段
  static hotelSelectStyle(obj) {
    let keysArr = Object.keys(obj);
    //行政区划

    //会议定点类型
    // if (keysArr.indexOf('placeTypes') > -1) {
    //   let placeTypeArr = obj['placeTypes'].toString().split(',');
    //   if (placeTypeArr.length > 0) {
    //     $.each(placeTypeArr, function (i) {
    //       $.each($('.js-fixed-type'), function (index, ele) {
    //         if ($(ele).data('id') == placeTypeArr[i]) {
    //           $(ele).addClass('click-active')
    //         }
    //       })
    //
    //     })
    //   }
    // }
    //酒店级别,注意无星级对应的编号5要特殊处理
    // if (keysArr.indexOf('starRatings') > -1) {
    //   let starRatingsArr = obj['starRatings'].split(',');
    //   if (starRatingsArr.length > 0) {
    //     $.each(starRatingsArr, function (i, starEle) {
    //       if (starEle !== '5') {
    //         $.each($('.js-hotel-level'), function (index, ele) {
    //           if ($(ele).data('id').indexOf(starRatingsArr[i]) > -1) {
    //             if (!$(ele).hasClass('click-active')) {
    //               $(ele).addClass('click-active')
    //             }
    //           }
    //         })
    //       }
    //
    //     })
    //   }
    // }
    //出差定点
    if (keysArr.indexOf('fixedForTrip') > -1) {
      let fixedForTrip = obj['fixedForTrip'];
      if (fixedForTrip == '1') {
        $('input[name=business-trip]').prop("checked", true)
      }
    }
    //免费停车场
    if (keysArr.indexOf('isFreeForCar') > -1) {
      let isFreeForCar = obj['isFreeForCar'];
      if (isFreeForCar == 'true') {
        $('input[name=free-park-select]').prop("checked", true)
      }
    }
    //关键词
    if (keysArr.indexOf('keyWord') > -1) {
      let keyWord = obj['keyWord'];
      // queryString的参数值为空时, $.query.get()得到布尔值true
      if (typeof keyWord != 'boolean') {
        $('#hot-search').val(decodeURIComponent(keyWord))
      }
    }
    //价格搜索左区间
    if (keysArr.indexOf('minNegotiatedRate') > -1) {
      let minNegotiatedRate = obj['minNegotiatedRate'];
      if (typeof minNegotiatedRate != 'boolean') {
        $('input[name=p_f]').val(minNegotiatedRate / 100)
      }
    }
    //间隔搜索右区间
    if (keysArr.indexOf('maxNegotiatedRate') > -1) {
      let maxNegotiatedRate = obj['maxNegotiatedRate'];
      if (typeof maxNegotiatedRate != 'boolean') {
        $('input[name=p_t]').val(maxNegotiatedRate / 100)
      }
    }
    //价格搜索
    if (keysArr.indexOf('orderBy') > -1) { //1升序 0降序
      let orderBy = obj['orderBy'];
      $('.filter-key:first-child').removeClass('filter-active');
      $('.filter-key:last-child').addClass('filter-active');
      if (orderBy == 1) {
        $('#price-up').addClass('icon-arrow-active')
      } else {
        $('#price-down').addClass('icon-arrow-active')
      }
    }

  }

}

module.exports = HotelService;