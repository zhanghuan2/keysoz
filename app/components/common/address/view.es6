/** *
  * 级联地址选择器
  * @author sx-wangx@dtdream.com
  */

var OptionTpl = Handlebars.templates["common/address/templates/options"];
var districtOptionsTpl = Handlebars.templates["common/address/templates/districtoptions"];

class Address {
  constructor(selector) {
    var vm = this;
    vm.queryData = vm.addressQueryData;
    vm.init = vm.addressInit;
    if ("district" === $('.address input[data-type=address_type]').val()) {
      vm.queryData = vm.districtQueryData;
      vm.init = vm.districtInit;
    }

    $('select.address-select').on('change', function() {
      if($(this).hasClass('init'))
        $(this).removeClass('init').parents('.selectric-wrapper').children('.selectric').removeClass('init'); // fabricate the placeholder style of select

      if($(this).data('level') < $('select.address-select').length) {
        vm.queryData($(this).val(), $(this).data('level'), function(){
          $('select.address-select').trigger('blur');
        });
        $($('select.address-select')[$(this).data('level')]).addClass('init')
          .parents('.selectric-wrapper').children('.selectric').addClass('init'); // fabricate the placeholder style of select
        for(var i = $(this).data('level')+1; i < $('select.address-select').length; i++) {
          var $sel = $($('select.address-select')[i]);
          var selectric = $sel.html($sel.find('option:first-child').clone()).addClass('init').data('selectric');
          if(selectric) selectric.refresh();
          $sel.parents('.selectric-wrapper').children('.selectric').addClass('init');
        }
      }
    });
    vm.init();
  }

  addressInit() {
    var vm = this;
    var promises = [];

    promises.push(vm.queryData(0, 0));
    $('[data-level]').each(function() {
      var val = ($(this).attr('value'));
      if(!isNaN(parseInt(val)) && $(this).data('level') < $('select.address-select').length ) {
        promises.push(vm.queryData(val, $(this).data('level')));
      }
    });

    $.when.apply($, promises).done(function() {
      $('[data-level]').each(function() {
        var val = $(this).attr('value');
        if(!isNaN(parseInt(val))) {
          $(this).children('[value="'+$(this).attr('value')+'"]').prop('selected',true).parent('select').removeClass('init');
          var selectric = $(this).data('selectric');
          if(selectric) selectric.refresh();
          $(this).trigger('blur');
        } else {
          $(this).parents('.selectric-wrapper').children('.selectric').addClass('init');
        }
      });
    });
  }

  addressQueryData(parentId, level, callback) {
    if (isNaN(parseInt(parentId))) {
      return null;
    }
    return $.ajax({
      url: '/api/address/' + parentId + '/children',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        var $placeholder = $('select.address-select[data-level="'+(level+1)+'"]').find('option:first-child').clone();
        let $selectric = $('select.address-select[data-level="'+(level+1)+'"]');
        $selectric.empty().html($placeholder).append(OptionTpl(data));
        let selectric = $selectric.data('selectric');
        if(selectric) selectric.refresh();
        if ($.isFunction(callback)) {
          callback();
        }
      }
    });
  }

  districtInit() {
    var vm = this;
    var level = $('[data-level]');

    var init = function () {
      if (0 === level.length) {
        return;
      }
      var val = $(level[0]).data('code');
      if(!isNaN(parseInt(val))) {
        $(level[0]).children('[data-id="'+$(level[0]).data('code')+'"]').prop('selected',true).parent('select').removeClass('init');
        var selectric = $(level[0]).data('selectric');
        if(selectric) selectric.refresh();
      } else {
        $(level[0]).parents('.selectric-wrapper').children('.selectric').addClass('init');
      }
      var l = $(level[0]).data('level');
      var v = $(level[0]).val();

      vm.queryData(v, l, init);
      level.splice(0, 1);
    };
    vm.queryData(0, 0, init);
  }

  districtQueryData(parentId, level, callback) {
    var Id =  ((parseInt(parentId) === 0) ? '' : '&pid='+ parentId);
    if (isNaN(parseInt(parentId))) {
      return;
    }
    return $.ajax({
      url: '/api/district/getDistrictTree?deep=1'+Id,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        var d = data.data[0].children;
        var $placeholder = $('select.address-select[data-level="'+(level+1)+'"]').find('option:first-child').clone();
        let $selectric = $('select.address-select[data-level="'+(level+1)+'"]');
        //防止覆盖setValue已经设置好的值
        let oVal =  $selectric.val();
        if( oVal === undefined || oVal === '' || oVal === null){
          $selectric.html($placeholder).append(districtOptionsTpl(d));
          //console.log('yyy-------'+ level +'-------' + $placeholder +' ------ ' + oVal);
        }
        else{
          $selectric.append(districtOptionsTpl(d));
          //console.log('nnn-------'+ level +'-------' + $placeholder +' ------ ' + oVal);
        }
        var selectric = $selectric.data('selectric');
        if(selectric) selectric.refresh();

        if ($.isFunction(callback)) {
          callback();
        }
      }
    });
  }

  _getSelector(selector) {
    let vm = this;
    return vm.selector ? $(vm.selector).find(selector): $(selector);
  }
  /**
   * 设值，data为3级结构的value的数组
   */
  setValue(values, callback) {
    let vm = this;
    let len = values.length;
    let parentId = values[0];
    if (!parentId) {
      callback && callback();
      return;
    }
    vm.queryData(0, 0, function() {
      setLevelVal(1, parentId);
      vm.queryData(parentId, 1, function () {
        if (len > 1) {
          parentId = values[1];
          if (!parentId) {
            callback && callback();
            return;
          }
          setLevelVal(2, parentId);
          vm.queryData(parentId, 2, function () {
            if(len > 2){
              parentId = values[2];
              if(!parentId){
                callback && callback();
                return;
              }
            }
            setLevelVal(3, values[2]);
            vm.queryData(parentId, 3, function(){
              parentId && (len > 3) && setLevelVal(4, values[3]);
              callback && callback();
            })
          });
        }
      });
    })


    function setLevelVal(level, value) {
      let $selectric = vm._getSelector('select.address-select[data-level="'+level+'"]');
      //console.log('------set----' + level + '-----' + JSON.stringify(value));
      $selectric.val(value).selectric('refresh');
      /* 触发blur ，用于formchecker校验 */
      $selectric.trigger('blur');
    }
  }

  /**
   * 清空当前的值
   */
  clearValue() {
    let vm = this;
    $.each([0, 1, 2], (index, value) => {
      let $selectric = vm._getSelector('select.address-select[data-level="'+(index+1)+'"]');
      $selectric.prop('selectedIndex', 0).selectric('refresh');
    });
  }

  getValue(attrs) {
    let vm = this;
    function getSelectVal(level) {
      return vm._getSelector('select.address-select[data-level="'+ level +'"]');
    }

    function getSelectText($target){
      let selectedIndex = $target.get(0).selectedIndex;
      return selectedIndex == 0 ? '' : $target.find('option:selected').text();
    }

    let $province = getSelectVal(1);
    let $city = getSelectVal(2);
    let $region = getSelectVal(3);
    if (attrs && attrs.length) {
      let obj = {};
      obj[attrs[0]] = getSelectText($province);
      obj[attrs[1]] = $province.val();
      obj[attrs[2]] = getSelectText($city);
      obj[attrs[3]] = $city.val();
      obj[attrs[4]] = getSelectText($region);
      obj[attrs[5]] = $region.val();
      return obj;
    }
    return {
      province: getSelectText($province),
      provinceId: $province.val(),
      city: getSelectText($city),
      cityId: $city.val(),
      region: getSelectText($region),
      regionId: $region.val()
    };
  }

}

module.exports = Address;
