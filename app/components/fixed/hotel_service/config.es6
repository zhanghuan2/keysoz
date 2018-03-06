const Properties = require("eevee/config/properties");

module.exports = function () {
  let hrefAllProperty;
  this.baseInfo.name = "酒店大厅";
  this.baseInfo.description = "酒店大厅";
  this.configs.ext = {
    name: "组件设置"
  };

  hrefAllProperty = new Properties.Property(this, {
    name: "configHref",
    label: "酒店大厅的链接",
    description: "酒店大厅的链接,适配不同的环境",
    type: "text",
    useData: true,
    reRender: true
  });

  return this.registerConfigProperty("ext", hrefAllProperty);
};