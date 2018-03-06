class TradeCancel {
  constructor() {
    this.initExpand();
  }

  initExpand() {
    console.log(`init expand`);
    $('.right-span').on('click', e => {
      $('#resultContent').removeClass('hide');
      $('.show-panel').hide();
    });
  }
}

module.exports = TradeCancel;
