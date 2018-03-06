Properties = require "eevee/config/properties"

module.exports = ->
  @baseInfo.name = "服务保障"
  @baseInfo.description = "服务保障"

  @configs.ext =
    name: "组件设置"

  noticeTextProperty = new Properties.Property @,
    name: "notice1"
    label: "资讯1文案"
    description: "填写公告文案"
    type: "text"
    useData: true

  noticeHrefProperty = new Properties.Property @,
    name: "notice1Href"
    label: "资讯1对应链接"
    description: "填写公告对应的链接跳转地址"
    type: "text"
    useData: true

  notice2TextProperty = new Properties.Property @,
    name: "notice2"
    label: "资讯2文案"
    description: "填写公告文案"
    type: "text"
    useData: true

  notice2HrefProperty = new Properties.Property @,
    name: "notice2tHref"
    label: "资讯2对应链接"
    description: "填写公告对应的链接跳转地址"
    type: "text"
    useData: true

  notice3TextProperty = new Properties.Property @,
    name: "notice3"
    label: "资讯3文案"
    description: "填写公告文案"
    type: "text"
    useData: true

  notice3HrefProperty = new Properties.Property @,
    name: "notice3Href"
    label: "资讯3对应链接"
    description: "填写公告对应的链接跳转地址"
    type: "text"
    useData: true


  listTextProperty = new Properties.Property @,
    name: "listText"
    label: "消息类型文案，默认资讯"
    description: "填写消息类型文案例如'公告'，'通知'"
    type: "text"
    useData: true


  @registerConfigProperty "ext",noticeTextProperty ,noticeHrefProperty ,notice2TextProperty, notice2HrefProperty,notice3TextProperty,notice3HrefProperty,listTextProperty