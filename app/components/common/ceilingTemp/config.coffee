Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "顶通"
  @baseInfo.description = "顶通"

  @configs.ext =
    name: "组件设置"

  HomePageLinkProperty = new Properties.Property @,
    name: "HomePageLink"
    label: "首页链接"
    description: "设置首页链接"
    type: "text"
    default: "https://www.zcy.gov.cn/"
    useData: true
    reRender: true

  SellerEnrollLinkProperty = new Properties.Property @,
    name: "SellerEnrollLink"
    label: "商家入驻链接"
    description: "设置商家入驻链接"
    type: "text"
    default: "http://supplier.zcy.gov.cn/supplier/register"
    useData: true
    reRender: true

  SellerRuleLinkProperty = new Properties.Property @,
    name: "SellerRuleLink"
    label: "商家规则链接"
    description: "设置商家规则链接"
    type: "text"
    default: "http://rule.zcy.gov.cn/web/site_1/2017/01/11/68.html"
    useData: true
    reRender: true

  SellerHelpLinkProperty = new Properties.Property @,
    name: "SellerHelpLink"
    label: "商家帮助链接"
    description: "设置商家帮助链接"
    type: "text"
    default: "http://help.zcy.gov.cn/"
    useData: true
    reRender: true

  HelpCenterLinkProperty = new Properties.Property @,
    name: "HelpCenterLink"
    label: "帮助中心链接"
    description: "设置帮助中心链接"
    type: "text"
    default: "http://help.zcy.gov.cn/"
    useData: true
    reRender: true

  regularGoodsLinkProperty = new Properties.Property @,
    name: "regularGoodsLink"
    label: "我的常购商品链接"
    description: "设置我的常购商品链接"
    type: "text"
    default: "http://help.zcy.gov.cn/"
    useData: true
    reRender: true

  favoriteShopsLinkProperty = new Properties.Property @,
    name: "favoriteShopsLink"
    label: "我关注的店铺链接"
    description: "设置我关注的店铺链接"
    type: "text"
    default: "http://help.zcy.gov.cn/"
    useData: true
    reRender: true

  OnlineHelperLinkProperty = new Properties.Property @,
    name: "OnlineHelperLink"
    label: "在线客服链接"
    description: "设置在线客服链接"
    type: "text"
    default: "https://cschat.cloud.alipay.com/pcportal.htm?tntInstId=KMQNW3CN&scene=SCE00000041"
    useData: true
    reRender: true

  ContactUsLinkProperty = new Properties.Property @,
    name: "ContactUsLink"
    label: "联系我们链接"
    description: "设置联系我们链接"
    type: "text"
    default: "http://help.zcy.gov.cn/web/site_2/contact/index.html"
    useData: true
    reRender: true

  TrainingCourseLinkProperty = new Properties.Property @,
    name: "TrainingCourseLink"
    label: "培训课程链接"
    description: "设置培训课程链接"
    type: "text"
    default: "https://edu.zcy.gov.cn/"
    useData: true
    reRender: true

  TrainingPartnerLinkProperty = new Properties.Property @,
    name: "TrainingPartnerLink"
    label: "培训授权合作伙伴链接"
    description: "设置培训授权合作伙伴链接"
    type: "text"
    default: "https://edu.zcy.gov.cn/web/site_7/2017/04-28/341.html"
    useData: true
    reRender: true

  OnlineLiveLinkProperty = new Properties.Property @,
    name: "OnlineLiveLink"
    label: "在线直播入口链接"
    description: "设置在线直播入口链接"
    type: "text"
    default: "http://zcy.gensee.com/webcast/site/entry/join-2189f3fddc92411a84a0a057ed12002b"
    useData: true
    reRender: true

  OnlineInquiryLinkProperty = new Properties.Property @,
    name: "OnlineInquiryLink"
    label: "在线询价链接"
    description: "设置在线询价链接"
    type: "text"
    default: "https://inquiryhall.zcy.gov.cn/inquiryhall/list"
    useData: true
    reRender: true

  AgreementSupplyLinkProperty = new Properties.Property @,
    name: "AgreementSupplyLink"
    label: "协议供货链接"
    description: "设置协议供货链接"
    type: "text"
    default: "https://hall.zcy.gov.cn/"
    useData: true
    reRender: true

  DesignatedServiceLinkProperty = new Properties.Property @,
    name: "DesignatedServiceLink"
    label: "定点服务链接"
    description: "设置定点服务链接"
    type: "text"
    default: "https://fixedhall.zcy.gov.cn/fixed/hall"
    useData: true
    reRender: true

  MedicalInstrumentsLinkProperty = new Properties.Property @,
    name: "MedicalInstrumentsLink"
    label: "医疗器械链接"
    description: "设置医疗器械链接"
    type: "text"
    default: "https://medexpo.zcy.gov.cn/?normal=1&type=hall"
    useData: true
    reRender: true

  VaccineLinkProperty = new Properties.Property @,
    name: "VaccineLink"
    label: "二类疫苗链接"
    description: "设置二类疫苗链接"
    type: "text"
    default: "https://vaccine.zcy.gov.cn/"
    useData: true
    reRender: true

  CommoditiesLinkProperty = new Properties.Property @,
    name: "CommoditiesLink"
    label: "大宗商品链接"
    description: "设置大宗商品链接"
    type: "text"
    default: "https://block.zcy.gov.cn/"
    useData: true
    reRender: true

  HighQualityPavilionLinkProperty = new Properties.Property @,
    name: "HighQualityPavilionLink"
    label: "精品制造馆链接"
    description: "设置精品制造馆链接"
    type: "text"
    default: "https://zhizao.zcy.gov.cn/"
    useData: true
    reRender: true

  RuleCenterLinkProperty = new Properties.Property @,
    name: "RuleCenterLink"
    label: "规则中心链接"
    description: "设置规则中心链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/"
    useData: true
    reRender: true

  vaccineNoPermissionHref = new Properties.Property @,
    name: "vaccineNoPermissionHref"
    label: "疫苗未授权点击跳转的链接"
    description: "疫苗未授权点击跳转的链接地址"
    type: "text"
    default: "https://vaccine.zcy.gov.cn/pages/no_permission"
    useData: true
    reRender: true

  blocktradeNoPermissionHref = new Properties.Property @,
    name: "blocktradeNoPermissionHref"
    label: "大宗未授权点击跳转的链接"
    description: "大宗未授权点击跳转的链接地址"
    type: "text"
    default: "https://block.zcy.gov.cn/pages/no_permission"
    useData: true
    reRender: true

  appCodeProperty = new Properties.Property @,
    name: "appCode"
    label: "appCode"
    description: "appCode"
    type: "text"
    default: "zcy.emall.blocktrade"
    useData: true
    reRender: true

  @registerConfigProperty "ext", HomePageLinkProperty, SellerEnrollLinkProperty, SellerRuleLinkProperty, SellerHelpLinkProperty, HelpCenterLinkProperty, OnlineHelperLinkProperty, ContactUsLinkProperty, TrainingCourseLinkProperty, TrainingPartnerLinkProperty, OnlineLiveLinkProperty, OnlineInquiryLinkProperty, AgreementSupplyLinkProperty, DesignatedServiceLinkProperty, MedicalInstrumentsLinkProperty, VaccineLinkProperty, CommoditiesLinkProperty, HighQualityPavilionLinkProperty, RuleCenterLinkProperty, vaccineNoPermissionHref, blocktradeNoPermissionHref, appCodeProperty , regularGoodsLinkProperty ,favoriteShopsLinkProperty
