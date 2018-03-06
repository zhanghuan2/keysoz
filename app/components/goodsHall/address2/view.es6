/** *
  * 级联地址选择器
  * @author sx-wangx@dtdream.com
  */

var OptionTpl = Handlebars.templates["goodsHall/address2/templates/options"];
var districtOptionsTpl = Handlebars.templates["goodsHall/address2/templates/districtoptions"];

class Address1 {
  constructor(selector) {
    var vm = this;
    if(typeof selector ==="string" && selector){
      vm.selector=selector;
    }else{
      vm.selector="";
    }
    vm.queryData = vm.addressQueryData;
    vm.init = vm.addressInit;
    if ("district" === $('.address input[data-type=address_type]').val()) {
      vm.queryData = vm.districtQueryData;
      vm.init = vm.districtInit;
    }      
    $(vm.selector+' select.address-select').on('change', function() {
      if($(this).hasClass('init'))
        $(this).removeClass('init').parents('.selectric-wrapper').children('.selectric').removeClass('init'); // fabricate the placeholder style of select
      if($(this).data('level') < $(vm.selector+' select.address-select').length) {
        vm.queryData($(this).val(), $(this).data('level'));
        $($(vm.selector+' select.address-select')[$(this).data('level')]).addClass('init')
          .parents('.selectric-wrapper').children('.selectric').addClass('init'); // fabricate the placeholder style of select
        for(var i = $(this).data('level')+1; i < $(vm.selector+' select.address-select').length; i++) {
          var $sel = $($(vm.selector+' select.address-select')[i]);
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
    $(vm.selector+' [data-level]').each(function() {
      var val = ($(this).attr('value'));
      if(!isNaN(val) && $(this).data('level') < $(vm.selector+' select.address-select').length ) {
        promises.push(vm.queryData(val, $(this).data('level')));
      }
    });

    $.when.apply($, promises).done(function() {
      $(vm.selector+' [data-level]').each(function() {
        var val = $(this).attr('value');
        if(!isNaN(val)) {
          $(this).children('[value="'+$(this).attr('value')+'"]').prop('selected',true).parent('select').removeClass('init');
          var selectric = $(this).data('selectric');
          if(selectric) selectric.refresh();
        } else {
          $(this).parents('.selectric-wrapper').children('.selectric').addClass('init');
        }
      });
    });
  }

  addressQueryData(parentId, level) {
   var vm=this;
   if(isNaN(parseInt(parentId))){
       return;
   }  
    return $.ajax({
      url: '/api/address/' + parentId + '/children',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        var $placeholder = $(vm.selector+' select.address-select[data-level="'+(level+1)+'"]').find('option:first-child').clone();
        var selectric = $(vm.selector+' select.address-select[data-level="'+(level+1)+'"]').html($placeholder).append(OptionTpl(data)).data('selectric');
        if(selectric) selectric.refresh();
      }
    });
  }

  districtInit() {
    var vm = this;
    var level = $(vm.selector+' [data-level]');

    var init = function () {
      if (0 === level.length) {
        return;
      }
      var val = $(level[0]).data('code');
      if(!isNaN(val)) {
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
    var vm = this;
    var Id =  ((parseInt(parentId) === 0) ? '' : '&pid='+ parentId);
    if (isNaN(parseInt(parentId))) {
      return;
    }
    return $.ajax({
      // url: '/api/district/getDistrictTree?deep=1'+Id,
      url: '/api/district/children?deep=1'+Id,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(data) {
        //var d = data.data[0].children;
        var d = JSON.parse(data).children;
        var $placeholder = $(vm.selector+' select.address-select[data-level="'+(level+1)+'"]').find('option:first-child').clone();
        var selectric = $(vm.selector+' select.address-select[data-level="'+(level+1)+'"]').html($placeholder).append(districtOptionsTpl(d)).data('selectric');
        if(selectric) selectric.refresh();

        if ($.isFunction(callback)) {
          callback();
        }
      }
    });
  }
  
}

module.exports = Address1;