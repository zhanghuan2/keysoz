class Header {
  
    constructor() {
      if (window.ScriptEngineMinorVersion && window.ScriptEngineMinorVersion() === 8) {
        var $style;
        $style = $('<style type="text/css">:before,:after{content:none !important}</style>');
        $('head').append($style);
        setTimeout((function() {
          $style.remove();
        }), 0);
      }
      //$('html, body').css('height', '100%');
      var vm = this;
      var $toggleBtns = $('.header').find('.nav-toggle-btn');
      var $dropdowns  = $('.header').find('.dropdown-menu');
  
      this.onAppClick()
      this.switchProtal()
      //this.initRightHeight()
      this.initMessageAndTodoHref()
      this.initUserIndentityIconBg()
      // ====== 菜单显示逻辑 ======
      var timeout;
      $toggleBtns.on('mouseover click', function(event) {
        event.stopPropagation();
        var _this = this;
        /* 在当前页不显示列表弹框 */
        // if ($(_this).parent().hasClass("active")) {
        //   return;
        // }
  
        /* 时间比较 */
        var localdate = new Date();
        $(".time-info").map(function(){
          var dataTime = $(this).data('time-millis');
          var diftime = localdate - new Date(dataTime.replace(/-/g, "/"));
          if (diftime < 60000) {
            $(this).text("刚刚");
          }else if (diftime < 60 * 60000) {
            $(this).text(parseInt(diftime/60000) + "分钟前");
          }else if (diftime < 24 * 60 * 60000) {
            $(this).text(parseInt(diftime/60/60000) + "小时前");
            return;
          }else {
            $(this).text(parseInt(diftime/24/60/60000) + "天前");
          }
  
        });
  
        timeout = setTimeout(function() {
          $(_this).addClass('active').next('.dropdown-menu').slideDown(200).filter(".float-menu").children('.float-menu-body').slideDown(200);
          $toggleBtns.not(_this).removeClass('active').next('.dropdown-menu').slideUp(200).filter(".float-menu").children('.float-menu-body').slideUp(200);
        }, 200);
      }).on('mouseout', function(event) {
        if(timeout) clearTimeout(timeout);
      });
  
      $dropdowns.on('mouseleave', function(event) {
        if(event.pageY >= 60) {
          $(this).filter(".float-menu").children('.float-menu-body').slideUp(200);
        }
      }).on('mouseover', function(event) {
        event.stopPropagation();
      });
  
      $(document).on('mouseover', function(event) {
        $toggleBtns.removeClass('active').next('.dropdown-menu').slideUp(200).filter(".float-menu").children('.float-menu-body').slideUp(200);
  
      });
  
      for(var path in Header.Mappings) {
        if(window.location.pathname.indexOf(path) === 0) {
          $(Header.Mappings[path]).addClass('active');
          break;
        }
      }
  
      // 待办列表初始化
      $('[data-todo-invalidate-date]').each(function() {
        if($(this).siblings('.icon-flag-expedited').length>0) {
          return;
        }
        var dateStr = $(this).data('todoInvalidateDate');
        var date = new Date(dateStr);
        var margin = (date.getTime() - new Date().getTime())/(1000*60*60*24);
        if(margin <= 1 && $(this).siblings('label').length===0) {
          $(this).fadeIn(200);
        }
      });
      $('[data-time-millis]').each(function() {
        var startupMillis = parseInt(new Date($(this).data('timeMillis')).getTime());
        if(isNaN(startupMillis)) {$(this).html('未知时间')}
        var startupDate = new Date(startupMillis);
        var currentDate = new Date();
        var gapFns = ['getFullYear', 'getMonth', 'getDate', 'getHours', 'getMinutes'];
        var gapNames = ['年', '月', '天', '小时', '分钟'];
        for(var i; i < gapFns.length; i++) {
          var fnName = gapFns[i];
          var gap = currentDate[fnName]() - startupDate[fnName]();
          if(gap < 0) {
            console.log(fnName, currentDate[fnName](), startupDate[fnName]())
            $(this).html('时间异常');
            return;
          }
          if(gap > 0) {
            var gapName = gapNames[i];
            $(this).html(gap + gapName + "前");
            return;
          }
        }
      });
    }
  
    initRightHeight() {
      let resizeTimer
      function resizeRight() {
        let iHeight = $(window).height()
        let rightHeight = iHeight - 60
        $('.main-right').css({height: rightHeight})
      }
  
      resizeRight()
      $(window).resize(function () {
        if (resizeTimer) {
          clearTimeout(resizeTimer)
        }
  
        resizeTimer = setTimeout(resizeRight, 100)
      })
    }
  
    initMessageAndTodoHref() {
      const $envConfig = $('#env-config')
      const category = $envConfig.data('category')
      /**
       * 如果是采购人的类型，则需要调整跳转地址
       * 其他的保留原有逻辑
       */
      if (category == '01' || category == '02' || category == '03' || category == '06' || category == '12') {
        const today = moment().valueOf()
        const beginTime = moment().subtract(1, 'month').valueOf()
        const middleDomain = $envConfig.data('middle') || ''
  
        $('.header-todo-more').attr('href', `${middleDomain}/dashboard/todo?noside=1&pageSize=100&status=UNFINISH#UNFINISH`)
  
        $('.header-message-more').attr('href', `${middleDomain}/dashboard/message?noside=1&pageSize=100&read=false&beginTime=${beginTime}&endTime=${today}&range=month#unread`)
      }
    }
  
    initUserIndentityIconBg() {
      /**
       * 初始化颜色
       */
      const bgArray = [
        'user-circle-o',
        'user-circle-y',
        'user-circle-g',
        'user-circle-b'
      ]
      if(!!$('#user-dropdown li').length){
           $('#user-dropdown li').each((i, item) => {
          let index = i % 4
          const bgClass = bgArray[index]
          if ($(item).hasClass('active') && window.location.pathname !== '/guide') {
            $('.user-info .user-name span').addClass(bgClass);
          }
          if ($(item).hasClass('active')) {
            $('.nav-toggle-btn .user-circle').addClass(bgClass);
          }
          $(item).find('.user-circle').addClass(bgClass)
        })
      }else{
        if (window.location.pathname !== '/guide') {
          $('.user-info .user-name span').addClass(bgArray[0]);
        }
        $('.nav-toggle-btn .user-circle').addClass(bgArray[0]);
      }
  
  
    }
  
    switchProtal() {
      const memberHref = $('#env-config').data('memberHref')
      $('#user-dropdown').on('click', 'li', function() {
        const $this = $(this)
        const empId = $this.data('empId')
        const code = $this.data('code')
        // 后端根据该链接自动跳转
        window.location.href = `${memberHref}/api/user/swt/orgCategory?default=1&empId=${empId}&code=${code}`;
      })
    }
  
    onAppClick () {
      $('.top-nav-wrapper .dropdown-menu-app li').on('click', 'a', function() {
        const $this = $(this)
        if ($this.hasClass('active')) {
          return false
        }
  
        const code = $this.data('code')
        const href = $this.data('href')
        const backCode = $this.data('backCode')
        if (!href) {
          return
        }
        // 如果code不存在，直接跳转
        if (!code) {
          window.location.href = href
          return
        }
  
        $.ajax({
          url: `/api/common/app/${code}`,
          method: 'post'
        }).then(() => {
          if (href.indexOf('?') > -1) {
            window.location.href = `${href}&app=${backCode}&pageSize=20`
          } else {
            window.location.href = `${href}?app=${backCode}&pageSize=20`
          }
        })
      })
    }
  }
  
  Header.Mappings = {
    "/dashboard/todo": "#todo-nav",
    "/dashboard/message": "#msg-nav"
  }
  
  module.exports = Header;