const ItemServices = require('common/item_services/view')

class CustomerRequisitionDetail {
  constructor () {
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }
  /* for IE8 */
  abcdefghijklm () {
    console.log('abcdefghijklm');
  }
}

module.exports = CustomerRequisitionDetail;
