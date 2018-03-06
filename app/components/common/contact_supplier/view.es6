class ContactSupplier {

  constructor(selector) {
    if($(selector).length > 0) {
      $(selector).on('click', (evt) => this.contactFun(evt))
    }
  }

  contactFun(evt) {
    let type = $(evt.target).data('type')
    if (type == 'ww') {
      let userName = $(evt.target).data('name')
      if(!userName){
        userName = $(evt.target).find('option:selected').data('name')
      }
      if (userName && userName !== '') {
        window.open('aliim:sendmsg?touid=cntaobao' + userName)
      }
    } else if (type == 'qq') {
      let qqNumber = $(evt.target).data('qq')
      if(!qqNumber){
        qqNumber = $(evt.target).find('option:selected').data('qq')
      }
      let site = $(evt.target).find('option:selected').data('site')
      if (qqNumber && qqNumber !== '') {
        window.open('http://wpa.qq.com/msgrd?V=3&uin=' + qqNumber + '&Site=' + site + '&Menu=yes')
      }
    }
  }
}

module.exports = ContactSupplier