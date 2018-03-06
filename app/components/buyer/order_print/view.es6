class  OrderDetailPrint{
  constructor(){
    $('.js-print-order').on('click', ()=>{
      $('.order-detail-print-content').print();
    })

    $('.js-items-no').each((i,td)=>{
      $(td).html(i+1);
    })
  }
}

module.exports = OrderDetailPrint;