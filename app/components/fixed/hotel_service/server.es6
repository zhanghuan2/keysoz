//回调函数集合
const hotelCallback = {

  //会议定点类型
  fixedTypeCB (e) {
    e.preventDefault()
    e.stopPropagation()
    return window.location.search = $.query.set('placeTypes', $(e.target).attr('data-id')).set('CNplaceTypes', $(e.target).text()).remove('pageNo').toString();
  },

  //酒店级别
  hotelLevelCB (e) {
    e.preventDefault()
    e.stopPropagation()
    return window.location.search = $.query.set('starRatings', $(e.target).attr('data-id')).set('CNstarRatings', $(e.target).text()).remove('pageNo').toString();
  },

  //多选
  mulSelectCB(e) {
    let $self, thisDl;
    $self = $(e.currentTarget)
    $self.addClass("hide")
    thisDl = $self.closest("dl")
    $.each($("dd", thisDl), function (i, dd) {
      return $(dd).find("label").show().siblings("a").hide()
    });
    return thisDl.find(".mul-btns").show()
  },

  //确定
  btnConfirmCB(e) {
    let szmulSelect, CNszmulSelect, mulSelectArr, CNmulSelectArr, thisDl, qsName;
    thisDl = $(e.target).closest("dl");
    mulSelectArr = [];
    CNmulSelectArr = []; //选项的中文字段
    $.each($(".attr-dd", thisDl), function (i, dd) {
      if ($(dd).find("input:checked").length > 0) {
        CNmulSelectArr.push($(dd).find("input:checked").parent().text());
        return mulSelectArr.push($(dd).find("input:checked").val());
      }
    });
    if (mulSelectArr.length === 0) {

    } else {
      qsName = mulSelectArr[0].indexOf(',') > -1 ? 'starRatings' : 'placeTypes'; //原有参数有逗号分隔，则是星级查询
      szmulSelect = mulSelectArr.join(",");
      CNszmulSelect = CNmulSelectArr.join("|");
      return window.location.search = $.query.set(`${qsName}`, szmulSelect).set(`CN${qsName}`, CNszmulSelect).toString();
    }
  },

  //取消
  btnCancelCB(e) {
    let thisDl;
    thisDl = $(e.target).closest("dl");

    thisDl.find(".js-elects").removeClass("hide");
    $.each($(".dd-cancel", thisDl), function (i, dd) {
      $(dd).find("input").prop("checked", false);
      return $(dd).find("label").hide().siblings("a").show();
    });
    thisDl.find(".mul-btns").hide();
  },

  iconCloseCB (e) {
    e.preventDefault()
    e.stopPropagation()
    $(e.target).parent().hide()
    let removeKey = $(e.target).data('key')
    return window.location.search = $.query.remove(removeKey).remove(`CN${removeKey}`).remove("pageNo").toString()
  },

  //出差定点
  businessTripCB(e) {
    e.preventDefault()
    e.stopPropagation()
    if ($('input[name=business-trip]').is(':checked')) {
      return window.location.search = $.query.set('fixedForTrip', 1).remove('pageNo').toString();
    } else {
      return window.location.search = $.query.remove('fixedForTrip').remove('pageNo').toString();
    }
  },

  //免费停车场
  freeForCarCB(e) {
    e.preventDefault()
    e.stopPropagation()
    if ($('input[name=free-park-select]').is(':checked')) {
      return window.location.search = $.query.set('isFreeForCar', 'true').remove('pageNo').toString();
    } else {
      return window.location.search = $.query.remove('isFreeForCar').remove('pageNo').toString();
    }
  },

  //关键词搜索
  keyWordCB(e) {
    e.preventDefault()
    let keyWord = $('#hot-search').val().trim()
    if (keyWord === '') {
      return window.location.search = $.query.remove("keyWord").remove("pageNo").toString()
    }
    return window.location.search = $.query.set("keyWord", keyWord).remove("pageNo").toString()
  },

  //箭头点击排序,需求变更去掉了
  // iconCB(e) {
  //   e.stopPropagation()
  //   let orderId = $(e.target).data('orderid')
  //   let url = $.query.set('orderBy', orderId).remove('pageNo').toString()
  //   return window.location.search = url
  // },

  //综合,价格升序排列
  showHandler(e) {
    let qid = parseInt($(e.target).data('qid'))
    //综合(星级)排序
    if (qid === 0) {
      return window.location.search = $.query.remove('orderBy').remove('pageNo').toString();
    }

    //判断queryString是否有orderBy参数
    //价格搜索方式默认1升序，-1降序
    let qsObj = $.query.keys
    let keysArr = Object.keys(qsObj)
    let searchCode = 1
    if (keysArr.indexOf('orderBy') > -1) {
      searchCode = (qsObj['orderBy'].toString() === '-1') ? 1 : -1;
    }
    return window.location.search = $.query.set('orderBy', searchCode.toString()).remove('pageNo').toString();

  },

  //表单价格过滤搜索
  filterFormSubmit(e) {
    e.preventDefault();
    let pf, pt, url;
    pf = $('.filter-form').find('input[name=p_f]').val() * 100;
    pt = $('.filter-form').find('input[name=p_t]').val() * 100;
    if (!pf) {
      pf = "";
    }
    if (!pt) {
      pt = "";
    }

    url = $.query.set("minNegotiatedRate", pf).set("maxNegotiatedRate", pt).remove("pageNo").toString();
    return window.location.search = url;
  },

  //param: location.search
  parseQuery(qstr){
    let query = {};
    let a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (let i = 0; i < a.length; i++) {
      let b = a[i].split('=');
      query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
  }

}

module.exports = hotelCallback;