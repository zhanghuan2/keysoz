import Modal from "pokeball/components/modal"
const DeliveryAddressEdit = Handlebars.templates["buyer/delivery_address_picker/templates/deliveryAddressEdit"]
const AddressTableList = Handlebars.templates["buyer/delivery_address_picker/templates/addressTableList"]
const FormChecker = require('common/formchecker/view')
const Address = require('common/address/view')

/**
 * 地址选择控件
 * 初始化完成时触发事件 ZCYEvent.AddressPickerSetup
 * 地址发生改变时触发事件 ZCYEvent.AddressPickerChanged
 */

class DeliveryAddressPicker {

  constructor() {
    this.preRender()
    this.bindEvents()
    this.reRenderAddressList()
  }

  preRender() {
    this.$addressPicker = $('.delivery-address-picker')
    this.$addressTable = this.$addressPicker.find('.address-table')
  }

  bindEvents() {
    this.$addressPicker.delegate('.address-block', 'click', this.changeAddress.bind(this))
    this.$addressPicker.delegate('.expand-all', 'click', this.expandOrFold)
    this.$addressPicker.delegate('.manage-address', 'click', this.gotoManage.bind(this))
    this.$addressPicker.delegate('.set-default-address', 'click', this.setDefaultAddress.bind(this))
    this.$addressPicker.delegate('.update-address', 'click', this.updateAddress.bind(this))
    this.$addressPicker.delegate('.create-address', 'click', this.createAddress.bind(this))
  }

  reRenderAddressList() {
    let self = this,
      userId = this.$addressTable.data('userId'),
      editAble = !!this.$addressTable.data('edit')
    $.ajax({
      url: '/api/zcy/userDeliveryAddress',
      type: 'get',
      data: {userId}
    }).done((resp)=>{
      let html = AddressTableList({data:resp, editAble})
      self.$addressTable.empty()
      self.$addressTable.append(html)
      //保持原来的展开/折叠状态
      let $a = self.$addressTable.find('.foot-operations .expand-all')
      let $extra = self.$addressTable.find('.extra')
      if(self.$addressTable.attr('data-table-status') === 'fold'){
        $a.text('展开全部')
        $extra.css('display', 'none')
      }
      else{
        $a.text('收起')
        $extra.css('display', 'inline-block')
      }

      let autoSelectDefault = self.$addressTable.data('autoSelectDefault')
      if ( autoSelectDefault === undefined || autoSelectDefault === '' || autoSelectDefault === null){//没有配置时默认true
        autoSelectDefault = true
      }

      if (!autoSelectDefault) {
        let preBlock = $('.address-block.active')
        preBlock.find('.active-sign').hide()
        preBlock.removeClass('active')
      }
      //选中指定地址
      let selectedId = self.$addressTable.data('selectedId')
      if(selectedId){
        self.$addressTable.find('.address-block').each((i, el)=>{
          let address = $(el).data('address')
          if(address.id == selectedId){
            let preBlock = $('.address-block.active')
            preBlock.find('.active-sign').hide()
            preBlock.removeClass('active')
            $(el).addClass('active')
            $(el).find('.active-sign').show()
            return false
          }
        })
      }
      this.$addressPicker.trigger('ZCYEvent.AddressPickerSetup')
    })
  }

  changeAddress(evt) {
    let btn
    if ($(evt.target).hasClass('address-block')){
      btn = $(evt.target)
    }
    else{
      btn = $(evt.target).closest('.address-block')
    }
    if(btn.hasClass('active')) {
      return
    }
    let preBtn = $('.address-block.active')
    preBtn.find('.active-sign').hide()
    preBtn.removeClass('active')
    btn.addClass('active')
    btn.find('.active-sign').show()
    this.$addressPicker.trigger('ZCYEvent.AddressPickerChanged')
  }

  expandOrFold(evt) {
    let $a = $(evt.target)
    let $table = $('.address-table')
    let $extra = $table.find('.extra')
    if($table.attr('data-table-status') === 'fold'){
      $a.text('收起')
      $table.attr('data-table-status', 'expand')
      $extra.css('display', 'inline-block')
    }
    else{
      $a.text('展开全部')
      $table.attr('data-table-status', 'fold')
      $extra.css('display', 'none')
    }

  }

  gotoManage(){
    let middle = this.$addressTable.data('middleHref')
    window.open(middle + '/orgmanage/user-address')
  }

  setDefaultAddress(evt) {
    evt.stopPropagation()
    $('body').spin('medium')
    let self = this,
        addrId = $(evt.target).data('id')
    $.ajax({
      url: '/api/zcy/intergration/user/receivers/'+addrId+'/default',
      type: 'post'
    }).done(()=>{
      self.reRenderAddressList()
    }).always(()=>{
      $('body').spin(false)
    })
  }

  updateAddress(evt) {
    evt.stopPropagation()
    let addressData = $(evt.target).closest('.address-block').data('address')
    let editModal = new Modal(DeliveryAddressEdit(addressData))
    editModal.show()
    this.bindModalEvents(editModal, addressData)
  }

  createAddress(evt) {
    evt.stopPropagation()
    let editModal = new Modal(DeliveryAddressEdit())
    editModal.show()
    this.bindModalEvents(editModal)
  }

  bindModalEvents(editModal, addressData) {
    let modal = editModal.modal
    new Address('.modal.address')
    $(modal).find('.address-select').selectric()
    $(modal).delegate('.save-address', 'click', ()=>this.saveDeliveryAddress(editModal))
    new FormChecker({
      container: '.modal.delivery-address-edit .address-table',
      ctrlTarget: '.save-address',
      precheck: !!addressData
    })
  }

  saveDeliveryAddress(editModal) {
    let modal = editModal.modal
    let data = {
      "receiverName"  : $(modal).find('input[name="receiverName"]').val(),
      "province"      : $(modal).find('select[name="province"]').find('option:selected').text(),
      "provinceCode"  : $(modal).find('select[name="province"]').val(),
      "city"          : $(modal).find('select[name="city"]').find('option:selected').text(),
      "cityCode"      : $(modal).find('select[name="city"]').val(),
      "region"        : $(modal).find('select[name="region"]').find('option:selected').text(),
      "regionCode"    : $(modal).find('select[name="region"]').val(),
      "street"        : $(modal).find('select[name="street"]').find('option:selected').text(),
      "streetCode"    : $(modal).find('select[name="street"]').val(),
      "details"       : $(modal).find('textarea[name="details"]').val(),
      "zip"           : $(modal).find('input[name="zip"]').val(),
      "mobile"        : $(modal).find('input[name="mobile"]').val(),
      "areaCode"      : $(modal).find('input[name="areaCode"]').val(),
      "phone"         : $(modal).find('input[name="phone"]').val(),
      "phoneExt"      : $(modal).find('input[name="phoneExt"]').val(),
      "isDefault"     : ($(modal).find('input[name="isDefault"]').prop('checked') == true)
    }
    let url, self = this,
        id = $(modal).data('id')
    if(id){
      url = '/api/zcy/intergration/user/receivers/'+ id +'/onlyUpdateAddr'
    }
    else{
      url = '/api/zcy/intergration/user/receivers/create'
    }
    $.ajax({
      url: url,
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(()=>{
      editModal.close()
      self.reRenderAddressList()
    })
  }
}

module.exports = DeliveryAddressPicker