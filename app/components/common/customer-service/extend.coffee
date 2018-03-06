
module.exports =
  openFrame: (cinfo, key, tntInstId = 'KMQNW3CN&scene=SCE00000041') ->
    screenLeft = window.screenLeft || screen.left;
    screenTop = window.screenTop || screen.top;
    width = window.innerWidth || document.documentElement.clientWidth || screen.width
    height = window.innerHeight || document.documentElement.clientHeight || screen.height
    left = Math.abs(width / 2 - 1000/ 2) + screenLeft
    top = Math.abs(height / 2 - 600/ 2) + screenTop

    url = 'https://cschat.cloud.alipay.com/pcportal.htm?tntInstId=' + tntInstId + '&cinfo=' + cinfo + '&key=' + key
    win = window.open(url, "在线助手",
    "toolbar=no, menubar=no, titlebar=no, scrollbars=yes, location=no, status=no, width=1000, height=600, top=" + top + ", left=" + left)
    win.focus() if window.focus
