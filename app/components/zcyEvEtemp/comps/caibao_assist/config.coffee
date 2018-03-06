Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "网超采宝前台"
  @baseInfo.description = "网超采宝优化"

  @configs.ext =
    name: "组件设置"


  customerServiceUrl = new Properties.Property @,
    name : "serviceUrl"
    label : "智能客服链接"
    description : "请输入智能客服链接，默认是https://cschat.cloud.alipay.com/pcportal.htm?tntInstId=KMQNW3CN&scene=SCE00000041"
    type : "text"
    useData: true
    reRender: true

  customerServiceText = new Properties.Property @,
    name : "serviceText"
    label : "智能客服按钮文案"
    description : "请输入智能客服按钮文案，默认是智能客服"
    type : "text"
    useData: true
    reRender: true

  messageConsultUrl = new Properties.Property @,
    name : "messageUrl"
    label : "留言咨询链接"
    description : "请输入留言咨询链接，默认是http://help.zcy.gov.cn "
    type : "text"
    useData: true
    reRender: true

  messageConsultText = new Properties.Property @,
    name : "messageText"
    label : "留言咨询按钮文案"
    description : "请输入留言咨询按钮文案，默认是留言咨询"
    type : "text"
    useData: true
    reRender: true


  @registerConfigProperty "ext",customerServiceUrl , messageConsultUrl , customerServiceText , messageConsultText