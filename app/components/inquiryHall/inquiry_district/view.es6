const Cookie = require("common/cookies/extend")

let vm, provinceIds=[], cityIds = [],
  selectedCodes = [], provinceFlag,
  cityFlag, iCountyText = [];
class inquiryDistrict {
  constructor() {
    vm = this
    this.$inputPurchase = $('input[name=purchase-search]')
    this.$inputKeyword = $('input[name=keyword-search]')
    this.$seniorSearch = $('.senior-search')
    this.$searchModal = $('.search-modal')
    this.$locationContainer = $('.location-container')
    this.$locationBody = $('.location-body')
    this.$panelContainer = $('.panel-container')

    this.bindEvent()
      // this.init()
  }

  bindEvent() {

    //输入同步(表单搜索字段、关键词搜索 双向绑定)
    this.$inputPurchase.on('keyup blur', function() {
      vm.$inputKeyword.val($(this).val());
      vm.toggleCloseIcon()
    });
    this.$inputKeyword.on('keyup blur', function() {
      vm.$inputPurchase.val($(this).val());
      vm.toggleCloseIcon()
    });

    //初始加载
    vm.toggleCloseIcon()

    $('.close-i').on('click', function() {
      vm.$inputPurchase.val('')
      vm.$inputKeyword.val('')
      $(this).hide()
    })

    //点击高级搜索
    this.$seniorSearch.on('click', function(e) {
      e.preventDefault()
      vm.$searchModal.slideToggle()
      vm.$locationContainer.hide()
    })

    //隐藏高级搜索
    $('body').on('click', function(e) {
      // 排除动态插入 .panel-close-icon DOM 特殊情况
      if (!$(e.target).closest('.search-container').length && !$(e.target).hasClass('panel-close-icon')) {
        vm.$searchModal.hide()
        vm.$locationContainer.hide()
      }
    })

    //点击icon 进行采购需求或询价目录搜索
    $('.icon-sousuo-').on('click', function() {
      if (!vm.$inputPurchase.val()) {
        return false
      }
      window.location.search = $.query.remove('pageNo').remove('pageSize').remove('error').set('otherSearch', vm.$inputPurchase.val())
    })

    //回车键 进行采购需求或询价目录搜索
    this.$inputPurchase.on('keypress', function(e) {
      if (e.keyCode == '13') {
        window.location.search = $.query.remove('pageNo').remove('pageSize').remove('error').set('otherSearch', vm.$inputPurchase.val())
      }

    });

    //radio选择 不限
    this.$searchModal.find('input[value=0]').on('click', function(e) {
      $('.location-container').hide()
      $('.search-modal .selectric').css({ "background-color": "#fff" })
    })

    //多选区划
    this.$searchModal.find('.selectric').on('click', function() {
      $('input[value=1]').prop("checked", true); //value=1的radio被选中
        if ($('.location-body').data('first')) {
            vm.districtQueryData(0, 0, function(data) {
              let provinceIndex = 0;
              let html = data.reduce(function (html, item, index, data) {
                if (item.code != '009900' && item.code != '980000' && item.code != '990000' && item.code != 'ZY0000') {
                  html+=`<div class="dt-province" data-pos="${index - provinceIndex}" data-id="${item.id}" data-code="${item.code}" data-child="${!item.leaf}" data-text="${item.text}"><div class="border"><input type="checkbox" data-code="${item.code}" data-child="${!item.leaf}" data-text="${item.text}" name="province">${item.text}<i class="icon-zcy icon-xiangxiazhedie"></i></div></div>`
                }
                else {
                    provinceIndex += 1;
                }
                  return html;
              }, "");
              $('.location-body').html(html);
            });
            $('.location-body').data('first', false);
        }
        $('.location-container').slideToggle()
        // if ($(':radio[name=inquiry-location]:checked').val() == '1') {
        // }
    })

    //收起区划选择下拉框
    this.$searchModal.on('click', function(e) {
      if ($(e.target).parents('.selectric-wrapper').length) {
        return;
      }
      $('.location-container').hide()
    })

    //初始化日期选择组件
    $('.date1').datepicker()



    this.$locationBody.on('click', '.dt-province', function(event) {
      event.stopPropagation()
      if ($(this).data('child')) {
        if (event.target.nodeName.toLowerCase() === 'input') {
          return;
        }

        if (provinceIds.indexOf($(this).data('id')) > -1) {
          if ($(this).data('id') == provinceFlag) {
            $(this).find('.dt-float').slideToggle()
            $(this).find('i').toggleClass('icon-xiangshangzhedie')
            $(this).find('i').toggleClass('icon-xiangxiazhedie')
            $(this).toggleClass('dt-choosed')
          } else {
            $('.dt-choosed').find('.dt-float').hide()
            $('.dt-choosed').find('.dt-sfloat').hide()
            $('.dt-choosed').removeClass('dt-choosed')
            $(this).addClass('dt-choosed')

            $('.dt-province').find('i').removeClass('icon-xiangshangzhedie')
            $('.dt-province').find('i').addClass('icon-xiangxiazhedie')

            $(this).find('.border i').removeClass('icon-xiangxiazhedie')
            $(this).find('.border i').addClass('icon-xiangshangzhedie')

            $(this).find('.dt-float').show()
            provinceFlag = $(this).data('id')
          }


          return;
        }
      }







      provinceFlag = $(this).data('id')
      provinceIds.push($(this).data('id'))
      $('.dt-choosed').find('.dt-float').hide()
      $('.dt-choosed').find('.dt-sfloat').hide()
      $('.dt-choosed').removeClass('dt-choosed')

      $('.dt-province').find('i').removeClass('icon-xiangshangzhedie')
      $('.dt-province').find('i').addClass('icon-xiangxiazhedie')

      $(this).find('.border i').removeClass('icon-xiangxiazhedie')
      $(this).find('.border i').addClass('icon-xiangshangzhedie')

      //iCityText = $(this).find('input[name=province]').data('select') || []

      if ($(this).data('child')) {
        if ($(this).find('.dt-float').length) {} else {
          $(this).append('<div class="dt-float"></div>')
        }
        var pos = $(this).data('pos')
        let left = (pos % 4) * -169.4
        let $this = $(this)
        $this.find('.dt-float').attr("style", "left:" + left + "px")
        var pid = $(this).data('code')
        vm.districtQueryData($(this).data('id'), 1, function(data) {
          var divFloat = $this.find('.dt-float')
          $.each(data, function(v, i) {
            if (i.leaf == false) {
              var str = `<div class="dt-city" data-pos="${v}" data-id="${i.id}" data-pid="${pid}" data-code="${i.code}" data-child="${i.children}" data-text="${i.text}">
                          <input type="checkbox" data-code="${i.code}" data-child="${i.children}" data-pid="${pid}" name="city" data-text="${i.text}">${i.text}<i class="icon-zcy icon-xiangxiazhedie"></i>
                        </div>`
            } else {
              var str = `<div class="dt-city" data-pos="${v}" data-id="${i.id}" data-pid="${pid}" data-code="${i.code}" data-child="${i.children}" data-text="${i.text}"><input type="checkbox" data-code="${i.code}" data-pid="${pid}" name="city" data-child="${i.children}" data-text="${i.text}">${i.text}</div>`
            }
            divFloat.append(str)
          })

          if ($this.find('.border input').prop('checked')) {
            $this.find('input[name=city]').each(function(i, ele) {
              $(ele).prop('checked', true)
            })
          }

          $this.find('.dt-float').slideDown()
            // let height = $('.search-block.mb').height()
        })

        $(this).addClass('dt-choosed')
      }
    })

    //浙江省下辖地级市点击
    this.$locationBody.on('click', '.dt-city', function(event) {
      event.stopPropagation()
        //处理缓存地市数据(不包括浙江省本级)
      if ($(this).data('child')) {

        if (event.target.nodeName.toLowerCase() === 'input') {
          return;
        }

        if (cityIds.indexOf($(this).data('id')) > -1) {
          if ($(this).data('id') == cityFlag) {
            $(this).find('.dt-sfloat').slideToggle()
            $(this).find('i').toggleClass('icon-xiangshangzhedie')
            $(this).find('i').toggleClass('icon-xiangxiazhedie')
            $(this).toggleClass('dt-choosed-city')

          } else {
            $('.dt-choosed-city').removeClass('dt-choosed-city')
            $(this).addClass('dt-choosed-city')

            //其实不需要对所有的icon操作,对切换时的上一个操作即可
            $('.dt-city').find('i').removeClass('icon-xiangshangzhedie')
            $('.dt-city').find('i').addClass('icon-xiangxiazhedie')

            $(this).find('i').removeClass('icon-xiangxiazhedie')
            $(this).find('i').addClass('icon-xiangshangzhedie')
            $('.dt-sfloat').hide()
            $(this).find('.dt-sfloat').show()
            cityFlag = $(this).data('id')
          }

          iCountyText = $(this).find('input[name=city]').data('select') || []

          return;
        }
      }

      //新的请求
      cityFlag = $(this).data('id')
      cityIds.push($(this).data('id'))
      $('.dt-choosed-city').find('.dt-sfloat').hide()
      $('.dt-choosed-city').removeClass('dt-choosed-city')

      $('.dt-city').find('i').removeClass('icon-xiangshangzhedie')
      $('.dt-city').find('i').addClass('icon-xiangxiazhedie')

      $(this).find('i').removeClass('icon-xiangxiazhedie')
      $(this).find('i').addClass('icon-xiangshangzhedie')
      iCountyText = $(this).find('input[name=city]').data('select') || []

      if ($(this).data('child')) {
        if ($(this).find('.dt-sfloat').length) {} else {
          $(this).append('<div class="dt-sfloat"></div>')
        }
        var pos = $(this).data('pos')
        let left = -169.5 * (pos % 4)
        $(this).find('.dt-sfloat').attr("style", "left:" + left + "px")
        var $this = $(this)
        var pid = $this.data('code')
        vm.districtQueryData($(this).data('id'), 2, function(data) {
          var divFloat = $this.find('.dt-sfloat')
          $.each(data, function(v, i) {
            var str = `<div class="dt-county" data-pos="${v}" data-id="${i.id}" data-pid="${pid}" data-code="${i.code}" data-text="${i.text}"><input type="checkbox" data-code="${i.code}" data-pid="${pid}" name="county" data-child="${i.children}" data-text="${i.text}"><span>${i.text}</span></div>`
            divFloat.append(str)
          })
          $this.find('.dt-sfloat').slideDown()
          if ($this.children('input').prop('checked')) {
            $this.find('input[name=county]').each(function(i, ele) {
              $(ele).prop('checked', true)
            })
          }
        })
        $(this).addClass('dt-choosed-city')

      }
    })

    //区县点击
    this.$locationBody.on('click', '.dt-county', function(event) {
      event.stopPropagation();
      if (event.target.nodeName.toLowerCase() === 'input') {
        return;
      }
    })

    this.$locationBody.on('click', 'input[name=province]', function(event) {
      if ($(this).prop('checked')) {
        // 全选市级
        $(this).parents('.dt-province').find('.dt-city>input').each(function(i, ele) {
            $(ele).prop('checked', true)
            $(ele).attr('indeterminate', false).prop('indeterminate', false)
            $(ele).siblings().find('.dt-county>input').each(function(ii, element) {
              $(element).prop('checked', true)
            })
          })
          // $('.panel-container').empty()
        $('.panel-close-icon').each(function(i, e) {
          if (String($(e).data('code')).slice(0,2) == String($(event.target).data('code')).slice(0,2)) {
            $(e).parent('a').remove()
          }
        })

        vm.showPanelProvince($(this)) // 显示浙江省
      } else {
        // 全不选市级
        $(this).parents('.dt-province').find('.dt-city>input').each(function(i, ele) {
            $(ele).prop('checked', false)
            $(ele).attr('indeterminate', false).prop('indeterminate', false)
            $(ele).siblings().find('.dt-county>input').each(function(ii, element) {
              $(element).prop('checked', false)
            })
          })
          // console.log(iCountyText)
          // vm.hidePanelProvince($(this)) // 隐藏浙江省
          // $('.panel-container').empty()
        $('.panel-close-icon').each(function(i, e) {
          if (String($(e).data('code')).slice(0,2) == String($(event.target).data('code')).slice(0,2)) {
            $(e).parent('a').remove()
          }
        })
      }
    })

    this.$locationBody.on('click', 'input[name=city]', function(event) {
      $('.panel-close-icon[data-pid=' + $(this).data('code') + ']').parents('a').remove()
        const province = $(event.target).parents('.dt-province').find('input[name=province]')
      const cities = $(event.target).parents('.dt-float').find('input[name=city]')
      const checkCities = $(event.target).parents('.dt-float').find('input[name=city]:checked')
      const citySize = cities.length
      const checkedSize = checkCities.length
      if (!$(this).prop('checked')) {
        $(this).attr('indeterminate', false).prop('indeterminate', false)
      }

      if (citySize === checkedSize) {
        // 全选父级
          province.prop('checked', false)
          province.trigger('click')
          // 展示父级标签, 省的标签
          // vm.showPanelProvince($('input[name=province]')) // 显示浙江省
          checkCities.each(function(i, ele) {
          vm.hidePanelCity($(ele))
        })

      } else if (citySize > checkedSize && checkedSize != 0) {
        // 半选父级
          province.prop("indeterminate", true) //checkbox的状态仍然只有两种, indeterminate 仅仅是视觉上的
        //vm.hidePanelProvince($('input[name=province]'))
        vm.hidePanelProvince(province)
        if ($(this).prop('checked')) {
          vm.showPanelCity($(this))
        } else {
          vm.hidePanelCity($(this))
        }

          checkCities.each(function(i, ele) {
          vm.showPanelCity($(ele))
        })

      } else {

        if ($(this).parents('.dt-province').find('input[name=city][indeterminate=true]').size()) {
          vm.hidePanelCity($(this))
        } else {
          // 取消父级选择
            province.prop('checked', false).attr('indeterminate', false).prop('indeterminate', false)
            // $('input[name=province]').trigger('click')
            // 删除标签
          vm.hidePanelCity($(this))
          vm.hidePanelProvince(province)
        }
      }

      if ($(this).prop('checked')) {
        if ($(this).data('child')) {
          // 全选县区
          iCountyText = []
          $.each($(this).parents('.dt-city').find('.dt-county').children('input'), function(i, ele) {
            iCountyText.push($(ele).data('text'))
            $(this).closest('.dt-city').find('input[name=city]').data('select', iCountyText)

          })
          console.log(iCountyText)
          $(this).parents('.dt-city').find('.dt-county').children('input').each(function(i, ele) {
            $(ele).prop('checked', true)
          })
        } else {
          if (citySize !== checkedSize) {
            vm.showPanelCity($(this)) // 省本级
          }
        }

      } else {
        if ($(this).data('child')) {
          // 全不选县区
          $(this).parents('.dt-city').find('.dt-county').children('input').each(function(i, ele) {
            $(ele).prop('checked', false)
          })
          iCountyText = []
        } else {
          vm.hidePanelCity($(this)) // 省本级
        }

      }

    })

    this.$locationBody.on('click', 'input[name=county]', function(e) {
      const province = $(this).parents('.dt-province').find('input[name=province]')
      const countrySize = $(this).parents('.dt-city').find('input[name=county]').length
      const checkedSize = $(this).parents('.dt-city').find('input[name=county]:checked').length
      if (countrySize == checkedSize) {
        // 全选父级
        $(this).parents('.dt-city').children('input').prop('checked', false)
        $(this).parents('.dt-city').children('input').trigger('click')
          // 展示父级标签, 省市的标签
        $(this).parents('.dt-city').trigger('click')

        // vm.showPanelCity($(this).parents('.dt-city').children('input'))
        $(this).parents('.dt-city').children('input').prop('checked', true)
        $(this).parents('.dt-city').find('.dt-county').children('input').each(function(i, ele) {
          vm.hidePanelCounty($(ele))
        })

      } else if (countrySize > checkedSize && checkedSize != 0) {
        // 半选父级
        $(this).parents('.dt-city').children('input').attr('indeterminate', true).prop('indeterminate', true)
        province.attr('indeterminate', true).prop('indeterminate', true)
          // 循环展示叠加显示省市县标签
        vm.hidePanelProvince(province) 
        vm.hidePanelCity($(this).parents('.dt-city').children('input')) 
        $(this).parents('.dt-city').children('input').prop('checked', false)
        $(this).parents('.dt-city').siblings('.dt-city').children('input').each(function(i, e) {
          if ($(e).prop('checked')) {
            vm.showPanelCity($(e))
          } else {
            if (!$(e).attr('indeterminate')) {
              vm.hidePanelCity($(e))
            }
          }
        })

        if ($(this).prop('checked')) {
          vm.showPanelCounty($(this)) // 区县
        } else {
          vm.hidePanelCounty($(this)) // 区县
          iCountyText = []
          $.each($(this).parents('.dt-city').find('input[name=county]:checked'), function(i, ele) {
            iCountyText.push($(ele).data('text'))
            vm.showPanelCounty($(ele))
          })
          $(this).closest('.dt-city').find('input[name=city]').data('select', iCountyText)
        }
        vm.renderProvinceStatus(province)
      } else {
        // 取消父级选择
        $(this).parents('.dt-city').children('input').prop('checked', true)
        $(this).parents('.dt-city').children('input').trigger('click')
        $(this).parents('.dt-city').children('input').prop('checked', false)
          // 删除标签
        vm.hidePanelProvince(province) 
        vm.hidePanelCity($(this).parents('.dt-city').children('input'))

        if ($(this).prop('checked')) {
          vm.showPanelCounty($(this)) // 区县
        } else {
          vm.hidePanelCounty($(this)) // 区县
        }
        vm.renderCityStatus($(this).parents('.dt-city').children('input'))
        vm.renderProvinceStatus(province)
      }

    })

    //panel 关闭
    //提交时检查所有是checked状态的checkbox即可 或者 检查 每个district-pannel
    this.$panelContainer.on('click', '.panel-close-icon', function(event) {

      let closeID = $(this).data('code')
      $(this).parent().remove();
      //处理checkbox
      $('input[type=checkbox]:checked').each(function(index, ele) {




        if ($(this).attr('name') == 'province' && $(this).data('code') == closeID) {
          $(this).attr('indeterminate', false).prop('indeterminate', false)
          $(ele).prop('checked', false)
            $(this).parents('.dt-province').find('.dt-city').each(function(index, ele) {
                $(ele).children('input').prop('checked', false)
                $(ele).find('.dt-county').each(function(index, ele) {
                    $(ele).children('input').prop('checked', false)
                })
            })
          return;
        }
        //地级市(不包括浙江省本级)
        if ($(this).attr('name') == 'city' && $(this).data('code') == closeID) {
            $(ele).prop('checked', false)
            // $(ele).prop('indeterminate', false)
            $.each($(ele).parents('.dt-city').find('.dt-county'), function(index, ele) {
                $(ele).children('input').prop('checked', false)
            })
            return;
        }
        //省本级、区县(包括多选合并情况)
        var $ele = $(ele)
        $.each(closeID.toString().split(','), function(i, ele) {
          if ($ele.data('code') == ele) {
            $ele.prop('checked', false)
          }
        })
        if (!$(ele).parents('.dt-city').find('input[name=county]:checked').length) {
          $(ele).parents('.dt-city').children('input').attr('indeterminate', false).prop('indeterminate', false)
        }

      })

      // vm.hidePanelCity($(this).parents('.dt-city').children('input')) // 隐藏杭州市

      if (!$('.panel-close-icon').length) {
        $('input[name=province]').attr('indeterminate', false).prop('indeterminate', false)
        $('input[name=province]').prop('checked', false)
      }

    })

    //获取多个区划后，保存
    $('.submit-btn-container button').on('click', function() {
      let text = []
      $('.district-pannel').each(function(index, ele) {
        text.push($(ele).text())
      })
      if (!text.length) {
        $('.district-text').html('请选择所在地')
      } else {
        text = text.join('、')
        $('.district-text').html(text)
        $('.location-container').hide()
      }
    })

    // 高级搜索 点击确定
    $('.btn-inquiry-sure').on('click', function() {
      $('.panel-close-icon').each(function(index, ele) {
        selectedCodes.push($(ele).data('code'))
      })
      Cookie.set('districtCodeCookie', selectedCodes.join(','))
        // Cookie.set('districtCodeCookie', obj)
      window.location.search = $.query.remove('pageNo').remove('pageSize').remove('error').set('otherSearch', vm.$inputKeyword.val()).set('startSearchTime', $('input[name=startSearchTime]').val()).set('endSearchTime', $('input[name=endSearchTime]').val()).set('districtCode', encodeURI(selectedCodes.join(','))).toString()

    })

    // 重置
    $('.btn-inquiry-reset').on('click', function() {
      //关键字清空
      vm.$inputKeyword.val('')
        //外层输入框清空
      vm.$inputPurchase.val('')
        //所在地设置为不限
      if ($('.panel-close-icon').length) {
        vm.$panelContainer.empty()
        $('input[type=checkbox]:checked').each(function(index, ele) {
          $(ele).prop('checked', false)
        })
      }
      $('.radio-inquiry-first').trigger('click')
      $('.district-text').html('请选择所在地')
        //重置询价时间
      $('.container-date').remove()
        // let start = $('.time-position').data('start') || ''
        // let end = $('.time-position').data('end') || ''
      let start = ''
      let end = ''
      $('.time-position').append(`<span class="container-date"><input class="date1 search date-input mr" name="startSearchTime" value="${start}" readonly  type="text" placeholder="开始时间">-<input class="date1 search date-input mr ml" name="endSearchTime" readonly value="${end}"  type="text" placeholder="结束时间"></span>`)
      $('.date1').datepicker()
    })

  }

  renderProvinceStatus(province) {
    const citySize = province.parents('.dt-province').find('input[name=city]').size()
    const checkedSize = province.parents('.dt-province').find('input[name=city]:checked').size()
    if (citySize === checkedSize) {
      province.prop('checked', true)
      return
    }
    const indeterminateSize = province.parents('.dt-province').find('input[name=city][indeterminate=true]').size()
    if (checkedSize || indeterminateSize) {
      province.attr('indeterminate', true).prop('indeterminate', true)
      return
    }
    province.prop('checked', false).attr('indeterminate', false).prop('indeterminate', false)
  }

  renderCityStatus($cityInput) {
    const countySize = $cityInput.parents('.dt-city').find('input[name=county]').size()
    const checkedSize = $cityInput.parents('.dt-city').find('input[name=county]:checked').size()
    if (countySize === checkedSize) {
      $cityInput.prop('checked', true)
      return
    }
    const indeterminateSize = $cityInput.parents('.dt-city').find('input[name=county][indeterminate=true]').size()
    if (checkedSize || indeterminateSize) {
      $cityInput.attr('indeterminate', true).prop('indeterminate', true)
      return
    }
    $cityInput.prop('checked', false).attr('indeterminate', false).prop('indeterminate', false)
  }

  // init() {
  //   vm.districtQueryData(0, 0)
  // }

  // 市级 http://inquiryhall.zcy.gov.cn/api/district/getDistrictTree?deep=1&pid=953&_=1489652356190
  // 县级 http://inquiryhall.zcy.gov.cn/api/district/getDistrictTree?deep=1&pid=968&_=1489652356191
  // 市县两级 http://inquiryhall.zcy.gov.cn/api/district/getDistrictTree?deep=3&pid=953

  //获取区域代码数据
  districtQueryData(parentId, level, callback) {
    var Id = ((parseInt(parentId) === 0) ? '' : '&pid=' + parentId);
    if (isNaN(parseInt(parentId))) {
      return;
    }
    return $.ajax({
      url: '/api/district/getActiveDistrictTree?deep=1' + Id,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        if ($.isFunction(callback)) {
          //callback(data.data[0].children);
          callback(data[0].children);
        }
      }
    });
  }

  // jumpUrl(obj) {
  //   Cookie.set('districtCodeCookie', obj)
  //   window.location.search = $.query.empty().set('districtCode', obj)
  // }

  showPanelProvince($input) {
    //浙江省
    let province = $input.data('text').trim() || ''
    let tpl = `<a class="district-pannel">${province}<i class="panel-close-icon icon-zcy icon-roundclose" data-code="${$input.data('code')}"></i></a>`

    $('.panel-container').append(tpl)
  }

  hidePanelProvince($input) {
    let codeProvince = $input.data('code')

    $('.panel-close-icon').each(function(i, ele) {
      if (codeProvince == $(ele).data('code')) {
        $(ele).parent('a').remove()
        return false
      }
    })
  }

  showPanelCity($input) {
    let flag = 0
    $('.panel-close-icon').each(function(i, ele) {
      if ($input.data('code') == $(ele).data('code')) {
        flag = 1
        return false
      }
    })

    if (flag) {
      return;
    }

    let city = $input.data('text').trim() || ''

    let province = $input.parents('.dt-province').data('text').trim() || ''
    let district = `${province}-${city}`

    let tpl = `<a class="district-pannel">${district}<i class="panel-close-icon icon-zcy icon-roundclose" data-code="${$input.data('code')}" data-pid="${$input.data('pid')}"></i></a>`

    $('.panel-container').append(tpl)
  }

  hidePanelCity($input) {
    let codeCity = $input.data('code')

    $('.panel-close-icon').each(function(i, ele) {
      if (codeCity == $(ele).data('code')) {
        $(ele).parent('a').remove()
        return false
      }
    })
  }

  showPanelCounty($input) {
    //pid是父级code
    let flag = 0
    $('.panel-close-icon').each(function(i, ele) {
      if ($input.data('pid') == $(ele).data('pid')) {
        var text = $input.data('text')
        if (iCountyText.indexOf(text.toString()) < 0) {
          iCountyText.push(text)
          $input.closest('.dt-city').find('input[name=city]').data('select', iCountyText)
        }
        var showTextCounty = iCountyText.length > 3 ? iCountyText.slice(-3).join('/') : iCountyText.join('/')
        var arrText = $(ele).siblings('span').text().split('-')
        arrText[2] = showTextCounty
        var showText = arrText.join('-')

        $(ele).siblings('span').text(showText)
        let codeCounty = $(ele).data('code').toString().split(',')
        codeCounty.push($input.data('code').toString())
        $(ele).data('code', codeCounty.join(','))

        flag = 1
        return false
      }
    })

    if (flag) {
      return;
    }

    //杭州市本级、区县
    let country = $input.data('text').trim() || ''
    let city = $input.parents('.dt-city').data('text').trim() || ''
    let province = $input.parents('.dt-province').data('text').trim() || ''
    let district = `${province}-${city}-${country}`
    iCountyText.push(country)
    $input.closest('.dt-city').find('input[name=city]').data('select', iCountyText)

    let tpl = `<a class="district-pannel"><span>${district}</span><i class="panel-close-icon icon-zcy icon-roundclose" data-code="${$input.data('code')}" data-pid="${$input.data('pid')}" name="county"></i></a>`

    $('.panel-container').append(tpl)
  }

  hidePanelCounty($input) {
    //pid是父级code
    let flag = 0
    $('.panel-close-icon').each(function(i, ele) {
      if ($input.data('pid') == $(ele).data('pid')) {

        let textCounty = $input.data('text')
        if (iCountyText.indexOf(textCounty) > -1) {
          let iii = -1;
          $.each(iCountyText, function(i, txt) {
            if (txt == textCounty) {
              iii = i;
              return false
            }
          })
          iCountyText.splice(iii, 1)
        }

        var showTextCounty = iCountyText.length > 3 ? iCountyText.slice(-3).join('/') : iCountyText.join('/')
        var arrText = $(ele).siblings('span').text().split('-')
        arrText[2] = showTextCounty
        var showText = arrText.join('-')
        $(ele).siblings('span').text(showText)

        // let reg = new RegExp(`${textCounty}(/){0,1}`, 'g')
        // $(ele).siblings('span').text($(ele).siblings('span').text().replace(reg, ''))

        let codeCounty = $(ele).data('code').toString().split(',')
        let start = -1
        $.each(codeCounty, function(i, e) {
          if ($(e) == $input.data('code')) {
            start = i
            return false
          }
        })
        codeCounty.splice(start, 1)
        $(ele).data('code', codeCounty.join(','))

        flag = 1
        return false
      }
    })
    if (!iCountyText.length) {
      $('.panel-close-icon').each(function(i, ele) {
        if ($input.data('pid') == $(ele).data('pid')) {
          $(ele).parent('a').remove()
          return false
        }
      })
    }

    if (flag) {
      return;
    }
  }

  toggleCloseIcon() {
    if (!(vm.$inputKeyword.val().trim() == '')) {
      $('.close-i').show()
    } else {
      $('.close-i').hide()
    }
  }

}

export default inquiryDistrict
