###
  此文件为前端profile配置文件
  主要用于前端渲染模板配置和js配置
  基础格式
  properties:
    env: "develop"
    decription: "wtf"
    resource:
      user:
        name: 名字
    symbol:
      user:
        hasName: true
###
Language = require "locale/locale"

properties =
  env: "parana"
  description: "parana 配置"
  resource:
    spu:
      skuMostDimension: 5
    activity:
      defaultStart: moment().add(-10, "y").format("YYYY-MM-DD HH:mm:ss")
      defaultEnd: moment().add(90, "y").format("YYYY-MM-DD HH:mm:ss")
      defaultBuyerScale: 5
      defaultItemScale: 1
      defaultDiscountType: "normal"
    address:
      tradeInfoLevel: 4
      shopProfileLevel: 4
      userProfileLevel: 4
      sellerReturnAddressLevel: 4
      sellerWarehouseLevel: 4
    item:
      skuPrice: [
        {level: 0, name: "#{Language.discountedPrice}", isRequire: true}
        {level: 1, name: "#{Language.hotDealPrice}"}
      ]
      skuMostDimension: 5
      hasSkuStock: false
  symbol:
    coupon:
      type: true
      hasItem: true
      hasImage: false
      baseMoney: true
      baseQuantity: true
      mostUseQuantity: true
      perMoney: true
    activity:
      hasImage: false
      hasTitle: false
      hasDate: true
      hasDefaultDate: true
      itemScale:
        showItemScale: false
        hasDefaultItemScale: true
        hasAllSites: true
        hasShopIds: false
        hasItemIds: false
        hasItemCategory: false
        hasItemSpu: false
        hasItemBrand: false
        hasShopBusiness: false
      buyerScale:
        showBuyerScale: true
        hasDefaultItemScale: false
        hasAllBuyer: true
        hasShopMember: false
        hasBuyerIds: false
        hasBuyerType: false
        hasBuyerCompany: false
        hasBuyerGender: false
        hasBuyerAge: false
      hasDesc: false
      discountScale:
        showDiscountScale: true
        hasParentOrder: true
        hasChildOrder: false
      discountType:
        showDiscountType: false
        hasMultiDiscount: false
    validator:
      mobile: "^\\d{8,12}$"
    address:
      hasType: true
    defaultExpend: false
    logistics:
      showSource: false

module.exports = properties
