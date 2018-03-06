class SupplierCompare{
  constructor($){
    this.bindEvent();
  }

  bindEvent(){
    let arr = [];
    let $saleSupplier = $(".sale-supplier span");
    let length = $saleSupplier.length;
    var minValue = $saleSupplier.eq(0).text();
    let minIndex;
    let aa=0;
    for(aa=0;aa<length;aa++) {
      if(parseInt(minValue)>=parseInt($saleSupplier.eq(aa).text())) {
        var minValue = $saleSupplier.eq(aa).text();
        minIndex = aa;
      }
    }
    $(".sale-supplier span").eq(minIndex).siblings().removeClass("hide-mydefine");
  }
}

module.exports =  SupplierCompare
