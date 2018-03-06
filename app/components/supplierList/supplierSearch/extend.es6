class supplierSearch {

  constructor() {
    this.bindEvent();
  }

  bindEvent(){
    $(".component-supplier-search .btn-search").on("click",function(e){
      let _id = e.target.id;
      let searchInput = $(".component-supplier-search .search-input");
      let _value = $.trim(searchInput.val());
      if(!_value) {
        return;
      }
      let url="";//component-supplierMsg
      if(_id=="search-button-local"){
        let shopValue = $(".component-supplierMsg .common_shopid").val();
        if(shopValue){
          url = $.query.set("q", _value).set("shopId",shopValue).toString();
        }else{
          url = $.query.set("q", _value).toString();
        }
        location.href = "/search"+url;
      }else{
        url = $.query.set("q", _value).remove("shopId").remove("searchType").toString();
        location.href = "/search"+url;
      }
    })
  }
}
module.exports = supplierSearch;
