import ComplexSearch from 'common/complex_search/extend';
import Pagination from 'pokeball/components/pagination';

class PurchaseIntentionList{
  constructor($){
    this.inputKey = $('.js-search-keyword');

    let $pagination = $('.list-pagination');
    new Pagination($pagination).total($pagination.data('total')).show($pagination.data('size'),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.bindEvent();
  }

  bindEvent(){
    let searcher = new ComplexSearch({
      searchElem: '.search',
      searchResetParams: ['pageNo'],
      searchBtn: '.js-search-click',
      clearBtn: '.js-search-reset'
    });

    this.inputKey.on('keypress', (evt) => this.searchKeyPress(evt, searcher));
  }

  //关键字按enter按钮事件
  searchContentKeyPress(evt, searcher){
    if (!evt) evt = window.event;
    var keyCode = evt.keyCode || evt.which;
    if(keyCode == 13){
      searcher.search();
    }
  }
}

module.exports = PurchaseIntentionList;
