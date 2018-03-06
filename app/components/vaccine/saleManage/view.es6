import Modal from "pokeball/components/modal"
const DayBlock = Handlebars.templates["vaccine/saleManage/templates/dayBlock"]
const WholeWhiteList = Handlebars.templates["vaccine/saleManage/templates/wholeWhiteList"]

class VaccineSaleManage{

  constructor(){

    this.$yearSelect = $('select[name="year"]')
    this.$monthSelect = $('select[name="month"]')
    this.$forbidSale = $('input[name="forbidSale"]')
    this.$settingCalender = $('.calendar-area')

    let today = new Date()
    this.year = today.getFullYear()
    this.month = today.getMonth()

    this.preRender()
    this.bindEvents()
  }

  preRender(){
    this.renderDateSelect()
    this.renderCalendar(this.year, this.month)
    this.renderSupplierSelect()
  }

  bindEvents(){
    this.$yearSelect.on('change', ()=>this.changeDate())
    this.$monthSelect.on('change', ()=>this.changeDate())
    this.$forbidSale.on('change', ()=>this.forbidSale())
    this.$settingCalender.delegate('.manage-button', 'click', (evt)=>this.addWhiteList(evt))
    this.$settingCalender.delegate('.js-show-all-white-list', 'click', (evt)=>this.showAllWhiteList(evt))
    this.$settingCalender.delegate('.js-delete-org', 'click', (evt)=>this.deleteWhiteOrg(evt))
  }

  renderDateSelect(){
    let startYear = this.year - 5,
      endYear = this.year + 4,
      options = ''
    for(let i = startYear; i <= endYear; i++){
      if(i == this.year){
        options += `<option value="${i}" selected>${i}年</option>`
      }
      else{
        options += `<option value="${i}">${i}年</option>`
      }
    }
    this.$yearSelect.empty().append(options)
    $(this.$monthSelect.find('option')[this.month]).prop('selected', true)
    this.$yearSelect.selectric()
    this.$monthSelect.selectric()
  }

  renderCalendar(year, month){
    let self = this
    $('body').spin('medium')
    $.ajax({
      url: '/api/zcy/vaccine/rule/query',
      type: 'get',
      data: {year,month:month+1}
    }).done((result)=>{
      this.$forbidSale.prop('disabled', false)
      self.$forbidSale.prop('checked', result && result.isForbidsale)
      let day = 0,
        $calendarDom = $('<div class="calendar"></div>'),
        dayCount = new Date(year, month + 1, 0).getDate()
      while (day < dayCount){
        day++
        let forbid = false, whiteOrgs
        if(day >= 11){
          forbid = result && result.isForbidsale
        }
        else{
          forbid = false
        }
        try {
          whiteOrgs = result.whiteOrgs[day-1]
        }
        catch (e){
          console.log(e)
        }
        $calendarDom.append(DayBlock({day, forbid, whiteOrgs}))
      }
      $('.calendar-area').empty().append($calendarDom)
      $('body').spin(false)
    })
  }

  renderSupplierSelect(){
    let $supplierSelect = $('#vaccine-supplier-list').find('select')
    $.ajax({
      url: '/api/zcy/vaccine/purchaseOrg/query',
      type: 'GET',
      success:function(result){
        if (result && result.data && result.data.length > 0 ) {
          let options = '<option value="">请选择</option>'
          $.each(result.data,function(i,n){
            options = options + '<option value="'+n.id+'">'+n.name+'</option>'
          })
          $supplierSelect.empty().append(options).select2()
        }
      }
    })
  }

  changeDate(){
    let year = this.$yearSelect.val(),
      month = this.$monthSelect.val()
    if(isNaN(year) || isNaN(month)){
      return
    }
    this.renderCalendar(parseInt(year), parseInt(month))
  }

  forbidSale(){
    let self = this, tipStr = '', flag = false
    if(this.$forbidSale.prop('checked')){
      tipStr = '确认开启11号至月底禁售？'
      flag = false
    }
    else{
      tipStr = '确认关闭11号至月底禁售？'
      flag = true
    }
    new Modal({
      title: "温馨提示",
      icon: "warning",
      isConfirm: true,
      content: tipStr
    }).show(()=>{
      let year = self.$yearSelect.val(),
        month = self.$monthSelect.val(),
        url = ''
      if(isNaN(year) || isNaN(month)){
        return
      }
      year = parseInt(year)
      month = parseInt(month)
      if(self.$forbidSale.prop('checked')){
        url = '/api/zcy/vaccine/rule/open'
        flag = true
      }
      else{
        url = '/api/zcy/vaccine/rule/close'
        flag = false
      }
      this.$forbidSale.prop('disabled', true)
      $.ajax({
        url: url,
        type: 'post',
        data: {year, month: month+1}
      }).done((result)=>{
        if(result){
          self.renderCalendar(year, month)
        }
      }).fail(()=>{
        this.$forbidSale.prop('disabled', false)
      })
    }, {
      beforeClose: ()=>{
        self.$forbidSale.prop('checked', flag)
      }
    })

  }

  addWhiteList(evt){
    let day = $(evt.currentTarget).data('day')
    let orgs = $(evt.currentTarget).data('orgs')
    let addModal = new Modal('#vaccine-supplier-list')
    $('#vaccine-supplier-list').find('select').val('').trigger('change')
    addModal.show()
    this.bindAddModalEvents(addModal, day, orgs)
  }

  showAllWhiteList(evt){
    let orgs = $(evt.currentTarget).closest('.white-list').data('orgs'),
      day = $(evt.currentTarget).data('day')
    let listModal = new Modal(WholeWhiteList({orgs,day}))
    listModal.show()
    $(listModal.modal).delegate('.js-delete-org', 'click', (evt)=>this.deleteWhiteOrg(evt, listModal))
  }


  bindAddModalEvents(modal, day, orgs){
    let year = this.$yearSelect.val(),
      month = this.$monthSelect.val(),
      self = this
    if(isNaN(year) || isNaN(month)){
      return
    }
    year = parseInt(year)
    month = parseInt(month)
    $('.js-submit-white-list').off('click').on('click', ()=>{
      let $supplierSelect = $('#vaccine-supplier-list').find('select')
      let orgId = $supplierSelect.val()
      let name = $supplierSelect.find('option:selected').text()
      modal.close()
      if(!orgId){
        return
      }
      if(orgs && orgs.length > 0){
        let exsit = false
        _.each(orgs, (n)=>{
          if(n.id == orgId){
            exsit = true
            return false
          }
        })
        if(!exsit){
          orgs.push({name, id:orgId})
        }
        else{
          return
        }
      }
      else{
        orgs = [{name, id:orgId}]
      }
      $('body').spin('medium')
      $.ajax({
        url: '/api/zcy/vaccine/rule/save',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({year, month: month+1, day, orgs})
      }).done((result)=>{
        if(result){
          self.renderCalendar(year, month)
        }
        else{
          $('body').spin(false)
        }
      }).fail(()=>{
        $('body').spin(false)
      })
    })
  }

  deleteWhiteOrg(evt, modal){
    let year = this.$yearSelect.val(),
      month = this.$monthSelect.val(),
      self = this
    if(isNaN(year) || isNaN(month)){
      return
    }
    year = parseInt(year)
    month = parseInt(month)
    let day = $(evt.currentTarget).data('day')
    let orgId = $(evt.currentTarget).data('id'),
      orgs = $(evt.currentTarget).closest('.white-list').data('orgs')
    if(!orgId || !day) {
      return
    }
    if(orgs && orgs.length > 0){
      let index = -1
      _.each(orgs, (n, i)=>{
        if(n.id == orgId){
          index = i
          return false
        }
      })
      if(index >= 0){
        orgs.splice(index, 1)
      }
      else{
        return
      }
    }
    if(modal){
      modal.close()
    }
    $('body').spin('medium')
    $.ajax({
      url: '/api/zcy/vaccine/rule/save',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify({year, month: month+1, day, orgs})
    }).done((result)=>{
      if(result){
        self.renderCalendar(year, month)
      }
      else{
        $('body').spin(false)
      }
    }).fail(()=>{
      $('body').spin(false)
    })
  }

}

module.exports = VaccineSaleManage