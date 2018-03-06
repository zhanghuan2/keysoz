Modal = require "pokeball/components/modal"

# loginModalTemplate = Handlebars.templates["common/login_form/templates/login"]
# ModalLoginClass = require "common/login_form/view"

$.ajaxSetup
  headers:
    CSRFToken: $('input.csrf-token').val()
  cache: false
  error: (jqXHR, textStatus, errorThrown) ->
    $("body").spin(false)
    switch jqXHR.status
      when 400
        new Modal
          "icon": "error"
          "content": jqXHR.responseText || "请求参数不对"
        .show()

      when 401
        href = window.location.href
        window.location.href = "/login?target=#{encodeURIComponent href}"
        # loginModal = new Modal loginModalTemplate()
        # loginModal.show()
        # ModalLogin = new ModalLoginClass()
      when 404 then true

      when 413
        new Modal
          "icon": "error"
          "title": "温馨提示"
          "content": "上传文件过大"
        .show()

      when 502, 503
        new Modal
          "icon": "error"
          "title": "出错啦"
          "content": "系统生病了，程序猿GG正在抢救"
        .show()
      when 504
        new Modal
          "icon": "error"
          "title": "温馨提示"
          "content": "啊，网络不是很给力啊~"
        .show()
      else
        new Modal
          "icon": "error"
          "title": "温馨提示"
          "content": jqXHR.responseText || "未知故障"
        .show()
