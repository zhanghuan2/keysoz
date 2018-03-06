import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";

class OrderFormShipmentDetail{
  constructor($){
    this.contentSum = $(".item-list-total").data("list-total");
    new Pagination($(".list-pagination")).total(this.contentSum).show($(".list-pagination").data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.bindEvent();
  }

  bindEvent(){
    //$(".timeline").timeline();
  }
}

module.exports =  OrderFormShipmentDetail;
