Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "页面底部栏目"
  @baseInfo.description = "页面底部栏目"

  @configs.ext =
    name: "组件设置"

  OnlineConsultLinkProperty = new Properties.Property @,
    name: "OnlineConsultLink"
    label: "智能客服链接"
    description: "设置智能客服链接"
    type: "text"
    default: "https://cschat.cloud.alipay.com/pcportal.htm?tntInstId=KMQNW3CN&scene=SCE00000041"
    useData: true
    reRender: true

  MessageConsultLinkProperty = new Properties.Property @,
    name: "MessageConsultLink"
    label: "留言咨询链接"
    description: "设置留言咨询链接"
    type: "text"
    default: "https://customer.zcy.gov.cn/feedback"
    useData: true
    reRender: true

  ShoppingProcessLinkProperty = new Properties.Property @,
    name: "ShoppingProcessLink"
    label: "购物流程链接"
    description: "设置购物流程链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/12/70.html"
    useData: true
    reRender: true

  CommonProblemLinkProperty = new Properties.Property @,
    name: "CommonProblemLink"
    label: "常见问题链接"
    description: "设置常见问题链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/ruleQuestion/index.html"
    useData: true
    reRender: true

  ContactServiceLinkProperty = new Properties.Property @,
    name: "ContactServiceLink"
    label: "联系客服链接"
    description: "设置联系客服链接"
    type: "text"
    default: "https://cschat.cloud.alipay.com/pcportal.htm?tntInstId=KMQNW3CN&scene=SCE00000041"
    useData: true
    reRender: true

  DirectPaymentLinkProperty = new Properties.Property @,
    name: "DirectPaymentLink"
    label: "财政直接支付链接"
    description: "设置财政直接支付链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/15/78.html"
    useData: true
    reRender: true

  AuthorizePaymentLinkProperty = new Properties.Property @,
    name: "AuthorizePaymentLink"
    label: "财政授权支付链接"
    description: "设置财政授权支付链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/15/78.html"
    useData: true
    reRender: true

  SelfPaymentLinkProperty = new Properties.Property @,
    name: "SelfPaymentLink"
    label: "自有资金支付链接"
    description: "设置自有资金支付链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/15/78.html"
    useData: true
    reRender: true

  ComparePriceLinkProperty = new Properties.Property @,
    name: "ComparePriceLink"
    label: "比价说明链接"
    description: "设置比价说明链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/12/69.html"
    useData: true
    reRender: true

  InvoiceLinkProperty = new Properties.Property @,
    name: "InvoiceLink"
    label: "发票制度链接"
    description: "设置发票制度链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/12/67.html"
    useData: true
    reRender: true

  EnrollInstructionsLinkProperty = new Properties.Property @,
    name: "EnrollInstructionsLink"
    label: "入驻须知链接"
    description: "设置入驻须知链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/15/79.html"
    useData: true
    reRender: true

  EnrollProcessLinkProperty = new Properties.Property @,
    name: "EnrollProcessLink"
    label: "入驻流程链接"
    description: "设置入驻流程链接"
    type: "text"
    default: "https://rule.zcy.gov.cn/web/site_1/2016/08/15/80.html"
    useData: true
    reRender: true

  @registerConfigProperty "ext", OnlineConsultLinkProperty, MessageConsultLinkProperty, ShoppingProcessLinkProperty, CommonProblemLinkProperty, ContactServiceLinkProperty, DirectPaymentLinkProperty, AuthorizePaymentLinkProperty, SelfPaymentLinkProperty, ComparePriceLinkProperty, InvoiceLinkProperty, EnrollInstructionsLinkProperty, EnrollProcessLinkProperty
