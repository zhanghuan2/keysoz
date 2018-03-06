class supplierSearch {
  constructor($) {
    this.$typeArray = []
    this.init()
	  this.bindEvents()
  }

  init(){
    let tags = $.query.get("tags"),self = this,searchVal = $.query.get("name")
    if(tags && tags.length > 0){
      this.$typeArray = tags.split("_")
    }
    $("input[name='labelType']").each(function(){
      if(self.$typeArray.indexOf($(this).data("type")) > -1){
        $(this).prop("checked",true)
      }
    })
    $(".jSearchName").val(searchVal)
  }
  bindEvents(){
    $("#jSearchSup").on("click",() => this.searchSupplier())
    $(".label-search").delegate("input[name='labelType']","change",(evt) => this.supplierType(evt))
    $(".supplier-search").delegate(".jSearchName","keydown",(evt) => this.searchContentKeyPress(evt))
  }
  supplierType(evt){
    let _this = $(evt.target)
    if(_this.prop("checked")){
      this.$typeArray.push(_this.data("type"))
    }else{
      let _index = this.$typeArray.indexOf(_this.data("type"))
      if (_index > -1) {
        this.$typeArray.splice(_index, 1);
      }
    }
    this.searchSupplier()
  }
  searchSupplier(){
    let searchVal = $.trim($(".jSearchName").val()),
      url = window.location.pathname+"?pageSize=200"

      if(searchVal.length > 0){

        url += "&name="+ searchVal
      }
      if(this.$typeArray.length > 0){
        url += "&tags="+this.$typeArray.join("_")
      }
      window.location.replace(url)
  }

	//关键字按enter按钮事件
	searchContentKeyPress(evt) {
		let keyCode = evt.keyCode || evt.which;
		if (keyCode == 13) {
			this.searchSupplier();
		}
	}
}
module.exports = supplierSearch;
