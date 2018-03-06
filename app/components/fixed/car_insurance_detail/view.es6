import Service from 'fixed/car_insurance_detail/server'
const Pagination = require('pokeball/components/pagination');
const recordList=Handlebars.templates['fixed/car_insurance_detail/templates/recordList'];

class carInsuranceDetail {
  constructor() {
    this.fixedProtocolId = $.query.get('fixedProtocolId')
    this.supplierId=$.query.get('supplierId');
    this.renderFlag = [false, false, false, false, false, false,false] //标记未发送的请求
    this.beforeRender()
    this.bindEvent()
  }

  beforeRender() {
    Service.getProtocolExtra(this.fixedProtocolId, 6)
      .then((data) => {
        $(`#insurance-type-6`).html(data)
        this.renderFlag[0] = true
      })
  }

  bindEvent() {
    let _this = this
    $('.tab').tab({
      delay: 0,
      events: 'click',
      after: function (index, evt) {
        _this.handlerForTab($(evt.$el).find('.active').children(), index)
      }
    })
  }

  handlerForTab($el, index) {
    if (this.renderFlag[index]) {
      return
    }
    // 产品
    if (index == 1) {
      Service.getProtocolProductInfo(this.fixedProtocolId)
        .then((data) => {
          let productDom = this.getProductDom(data.productList)
          $('.tab-contents').children().eq(index).html(productDom)
          this.renderFlag[index] = true
        })
      return
    }

    let typeArray = ($el.data('param') + '').split(',')
    $.each(typeArray, (i, type) => {
      if(type==='8'){
        /*--------交易记录----------*/
        Service.getInsuranceRecord(this.supplierId,1)
        .then((data)=>{
          $(`#insurance-type-${type}`).find("#deal-record-list-tbody").html(recordList(data.result));
          let here=this;
          let recordPagination=new Pagination('.record-pagination').total(data.result.total).show(10,{
            num_display_entries: 5,
            jump_switch: true,
            callback: function (curr, pagesize) {   //局部刷新
                Service.getInsuranceRecord(here.supplierId,curr+1||1)
                .then(function (res) {
                  $('#deal-record-list-tbody').html(recordList(res.result));
                })
                return false;
              }
          })
          this.renderFlag[index] = true;  
        })
      }else{
        Service.getProtocolExtra(this.fixedProtocolId, type)
        .then((data) => {
          $(`#insurance-type-${type}`).html(data || '<br/>')
          this.renderFlag[index] = true
        })
      } 
    })
  }

  //元
  formatPrice(price) {
    if (!price) {
      return ''
    }
    let formatedPrice = (price / 100).toFixed(2)
    let roundedPrice = parseInt(price / 100).toFixed(2)
    return formatedPrice == roundedPrice ? roundedPrice : formatedPrice
  }

  getProductDom(data) {
    let _this = this

    function getValue(attr, value) {
      if (attr == 'insureAmount' || attr == 'originPrice') {
        return _this.formatPrice(value)
      } else {
        return value
      }
    }

    let result = {}, ainsuType = [];
    // 格式化数据
    $.each(data, (index, item) => {
      let type = item.insuranceType.value
      let description = item.insuranceType.description
      if (ainsuType.indexOf(type)<0) {
        ainsuType.push(type)
      }
      if (!result[description]) {
        result[description] = []
      }
      let subType = {
        description: item.insuranceCategory.description || '',
        insureAmount: item.insureAmount,
        originPrice: item.originPrice,
        remark: item.remark
      }
      result[description].push(subType)
    })

    //// 生成table
    //let keys = ['description', 'insureAmount', 'originPrice', 'remark']
    //let table = `<table class='table table-fixed'><thead><tr><th>险种</th><th>险别</th><th>保险金额(元)</th><th>基本保险费(元)</th><th>备注</th></tr></thead><tbody>`;
    //for (let attr in result) {
    //  if (result.hasOwnProperty(attr)) {
    //    if (result[attr].length <= 1) {
    //      table += `<tr><td rowspan='1'>${attr}</td>`; // just for style
    //    } else {
    //      let rowspanlen = result[attr].length
    //      table += `<tr><td rowspan='${rowspanlen}'>${attr}</td>`;
    //    }
    //  }
    //
    //  for (let j = 0, len = result[attr].length; j < len; j++) {
    //    let item = result[attr]
    //    if (j > 0 && len > 1) {
    //      table += '<tr>'
    //
    //      for (let i = 0, leng = keys.length; i < leng; i++) {
    //        let key = keys[i]
    //        table += `<td>${getValue(key, item[j][key])}</td>`
    //      }
    //
    //      table += '</tr>'
    //    }
    //    else {
    //      for (let i = 0, lengt = keys.length; i < lengt; i++) {
    //        let key = keys[i]
    //        table += `<td>${getValue(key, item[j][key])}</td>`
    //      }
    //      table += '</tr>'
    //    }
    //  }
    //}
    let table = '<table class="table">';
    for(let attr in result){
      if (result.hasOwnProperty(attr)) {
        table += '<tr><td width="40%"><div class="title-div"><img src="/lunatone/assets/images/other-images/'+attr+'.png">'+attr+'</div></td><td width="60%"><ul>'
        if(result[attr].length>0){
          $.each(result[attr],function(i,n){
            table += '<li>'+n.description+'</li>'
          })
        }
        table += '</ul></td></tr>'
      }
    }

    return table += '</table>'
  }
}
module.exports = carInsuranceDetail;