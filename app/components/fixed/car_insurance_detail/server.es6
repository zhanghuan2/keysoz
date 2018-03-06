
module.exports = {

  /**
   * 查询信息
   *
   */
  getProtocolExtra(fixedProtocolId, extraDataType) {
    return $.ajax({
      url: '/api/fixed/protocol/getProtocolExtra',
      type: 'GET',
      data: {
        fixedProtocolId,
        extraDataType
      }
    })
  },

  getProtocolProductInfo(fixedProtocolId) {
    return $.ajax({
      url: '/api/fixed/protocol/getProtocolProductInfo',
      type: 'GET',
      data: {fixedProtocolId}
    })
  },

  getInsuranceRecord(supplierId,pageNo){
    return $.ajax({
      url: '/api/fixed/insurance/pageBuyRecord',
      type: 'GET',
      data: {
        supplierId:supplierId,
        pageNo:pageNo
      }
    })
  }
}