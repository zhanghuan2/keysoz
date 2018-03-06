var checkerProto = require("common/formchecker/view");

module.exports = {
  checker : undefined,
  formChecker : function(config) {
    if (undefined === this.checker) {
      this.checker = new checkerProto(config);
    }
    else{
      this.checker.constructor(config);
    }
    return this.checker;
  },
  doRevert : function (obj) {
    console.log('doRevert');
    return this.checker.doRevert(obj);
  }
};
