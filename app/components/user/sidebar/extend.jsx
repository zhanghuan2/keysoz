/*
* Sidebar component
*
* Author: w0309 / wuxt@dtdream.com
* Date: 2015-12-14
*/


;
var LocalStorage = require("common/local_storage/extend");
var dotColors = ['#197AFF', '#FF7900', '#FF2200', '#2DC12D', '#1EB6F8'];

class Sidebar {
  constructor() {

    //global variable
    this.isCollapsed = LocalStorage.get('isSidebarCollapsed') || false;

    this.bindEvents(this);

    this.portal();

    selectMenu();

    function selectMenu(){
      var href = window.location.pathname;
      let menuPath = $("ol.breadcrumb").data("menu-path");
      var navList = $('li.nav-list');
      var $navListHeader = $('div.nav-list-header');

      for (var index = navList.length - 1; index >= 0; index--) {
        var headers = $(navList[index]).find('div.subnav-list-header');
        /*如果循环到的一级菜单没有子菜单，则直接判断一级菜单的href，否则循环二级菜单判断 @sx-wangc*/
        if(headers.length==0){
          let navHref = $($navListHeader[index]).attr('href');
          let i = navHref.indexOf("/",8);
          let navPathname = navHref.substring(i);
          let j = navPathname.indexOf('?');
          if(j > -1 ){
            navPathname = navPathname.substring(0,j)
          }
          // console.log("navPathname:"+navPathname);
          if (href.indexOf(navPathname) > -1) {
            $($navListHeader[index]).addClass('selected');
            return;
          }
        }else{
          for (var innerIndex = headers.length - 1; innerIndex >= 0; innerIndex--) {
            var currHref = $(headers[innerIndex]).attr('href');
            let i = currHref.indexOf("/",8);
            var currHrefPathname = currHref.substring(i);
            let j = currHrefPathname.indexOf('?');
            if(j > -1 ){
              currHrefPathname = currHrefPathname.substring(0,j)
            }
            // if($(headers[innerIndex]).attr('href').indexOf(href) > -1) {
            if (href.indexOf(currHrefPathname) > -1 ||
                (menuPath && menuPath.indexOf(currHrefPathname) > -1)) {
              $($(navList[index]).find('div.nav-list-header')).trigger('click');
              $(headers[innerIndex]).addClass('selected');
              return;
            }
          }
        }
      }

      for (var index = $navListHeader.length - 1; index >= 0; index--) {
        var h = ('' == $($navListHeader[index]).attr('href'))?'*':$($navListHeader[index]).attr('href');
        if(h.indexOf(href) > -1) {
          $($navListHeader[index]).addClass('selected');
          return;
        }
      }
    }
  }

  portal() {
    var $sidebar       = $('.sidebar');
    var $portal        = $('ul.sidebar-portal');
    var $currentPortal = $('ul.sidebar-portal li.current-portal');
    var $otherPanel    = $('ul.sidebar-portal div.other-portals');
    var $otherPortal   = $('ul.sidebar-portal li:not(.current-portal)');

    $('.portal-dot').each(function(index, dot){
      $(dot).css({
        'background-color': dotColors[index % dotColors.length]
      });
    });

    $portal.click(function(){
      $portal.toggleClass('other-portal-show');
      $otherPanel.toggleClass('hidden');
    });

    $otherPortal.click(function(){
      /* 后台重定向 */
      var href = $('#user-dropdown a[name=category]').attr('href');
      var code =  $(this).children('label').data('code');
      href += '?code=' + code;
      window.location.href = href;
    });
  }

  bindEvents(that) {
    var $firstLevel  = $('.nav-list-header');
    var $secondLevel = $('.subnav-list-header');
    var $collapseBtn = $('#collapse-nav');
    var $sidebar     = $('.sidebar');

    //click event of first level menu items
    $firstLevel.on('click', function(event) {
      var link = $(this).attr('href');
      if($(this).parents('li.nav-list').hasClass('nav-open')) {
        $(this).parents('li.nav-list').removeClass('nav-open');
      }
      else if(link && ('' !== link)) {
        window.location.href = link;
      }
      else {
        that.toggleCollapse(event.currentTarget, false);
      }
    });

    //mouseover event of second level menu item to show the floating panel
    //which contains the 3rd level menu items
    $secondLevel.on('click', function(event){
      window.location.href = $(event.currentTarget).attr('href');
    });

    //click event of 'collapse-sidebar' button
    $collapseBtn.on('click', function(event){
      that.collapseNav(that);
    });
  }

  /*
  *   show/hide second level menu item panel when expanded
  *   @param
  *     target : mouseenter/mouseleave event target
  *     isSidebarCollapsed: true  - sidebar collapsed
  *                         false - sidebar expanded
  */
  toggleCollapse(target, isSidebarCollapsed) {

    if(!isSidebarCollapsed) {
      $('.nav-list').removeClass('nav-open');
      $(target).parent().addClass('nav-open');
    }
  }

  /*
  *   show/hide 3rd level menu item floating panel when collapsed
  *   @param
  *     target : mouseenter/mouseleave event target
  *     isEnter: event type
  *              true  - mouseenter
  *              false - mouseleave
  */
  toggleFloatPanel(secondLevel, isEnter) {
    var $listHeader = $(secondLevel);
    var $target     = $listHeader.siblings('ul');

    if(isEnter) {
      $('.subnav-list-body').removeClass('floating-panel-open');
    } else {
      $('.subnav-list-header').removeAttr('style');
    }

    if($target.length) {
      var $navBody    = $target.parent();
      var $subNavBody = $('.subnav-list-body');

      var top  = $navBody.position().top;
      var left = $navBody.position().left + $navBody.width();

      $subNavBody.removeClass('floating-panel-open').removeAttr('style');

      $target.addClass('floating-panel-open').css({
        position: 'absolute',
        top     : top,
        left    : left
      });

      $target
        .on('mouseenter', function(event){
          $listHeader.css({'background-color': '#5460B9'});
        })
        .on('mouseleave', function(event){
          $subNavBody.removeClass('floating-panel-open').removeAttr('style');
          $listHeader.removeAttr('style');
          $subNavBody.off('mouseleave');
        });
    }
  }

  /*
  *   collapse/expand sidebar
  *   @param
  *     that: Sidebar class instance
  */
  collapseNav(that, isInit){
    var $sidebar     = $('div.sidebar');
    var $navIcon     = $('div.nav-list-header div.nav-icon');
    var $nav         = $('ul.nav > li');
    var $collapseBtn = $('#collapse-nav');
    var $floatNav    = $('div.nav-floating');

    $nav.toggleClass('nav-collapsed');

    if(!isInit) {
      that.isCollapsed = !that.isCollapsed;
      LocalStorage.set('isSidebarCollapsed', that.isCollapsed);
    }

    if(that.isCollapsed) {
      $('.nav-list-body').removeClass('nav-open');
      $('.nav-list-body ul').removeClass('subnav-open');

      $navIcon.on('mouseenter', function(event){
        that.toggleCollapsedFloatNav(event.target, true);
      });

      $floatNav.on('mouseleave', function(event){
        that.toggleCollapsedFloatNav(event.target, false);
      });

      $floatNav.css({
        position: 'absolute',
        top     : $sidebar.position().top,
        left    : $('.nav-icon').width(),
        "padding-top": $sidebar.css('padding-top'),
        overflow: 'auto'
      });

      $collapseBtn.css({width: $('.nav-icon').width()});
    } else {

      $navIcon.off('mouseenter');
      $floatNav.off('mouseleave');

      $floatNav.removeClass('nav-floating-open');
      $floatNav.removeAttr('style');

      $('.nav-body').removeClass('nav-collapsed-open');
      $('.nav-body ul').removeClass('subnav-collapsed-open');
      $collapseBtn.removeAttr('style');
    }
  }

  /*
  *   show/hide second level menu item panel when collapsed
  *   @param
  *     target : mouseenter/mouseleave event target
  *     isEnter: event type
  *              true  - mouseenter
  *              false - mouseleave
  */
  toggleCollapsedFloatNav(target, isEnter) {
    if(('DIV' !== target.tagName) || ('nav-icon' !== target.className)) {
      return;
    }
    var $floatNav  = $('.nav-floating');
    var $navList   = $(target).parent().parent();

    if(isEnter) {
      $floatNav.html($navList.clone(true).removeClass('nav-collapsed'));
    } else {
      $floatNav.html('');
    }

    $floatNav.addClass('nav-floating-open');

    $floatNav.on('mouseleave', function(event){
      $floatNav.removeClass('nav-floating-open');
      $floatNav.off('mouseleave');
    });
  }
}

module.exports = Sidebar;
