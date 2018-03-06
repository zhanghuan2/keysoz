var UploadFile = require("common/uploadFile/extend");
module.exports ={
  uploadFile: undefined,
  bindChange: function(getKeyAPI,downloadUrl){
    if (this.uploadFile == undefined) {
      this.uploadFile = new UploadFile(getKeyAPI,downloadUrl);
    }
  },

  getFiles: function(){
    return this.uploadFile.getFiles();
  }
};
