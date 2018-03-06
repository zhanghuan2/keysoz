/** *
  * 用户帮助采宝
  * @author maobeijun@cai-inc.com
  */
const Modal = require("pokeball/components/modal");
const template = Handlebars.templates["common/assist/templates/questions"];
const Slide = require('common/assist/detail/view');
const base = '/assist';

class Assist {

  constructor() {
    this.getList();
    this.pageNo = null;
    this.keepStandUp = false;//采宝半身
    this.closeEyes = true;
  }
  assistInit(){
    this.bindEvent();
    this.to = setTimeout(()=>{
      $('#Popover').remove();
    },5000)
  }
  bindEvent(){
    const _self = this;
    _self.$mascot = $("#mascot");
    const $pop = $('#Popover');
    const $menu = $('.assist-menu');
    const $close = $menu.find('.close');
    
    _self.$mascot.on('mouseover',()=>{
      if($pop.length>0){
        clearTimeout(_self.to);
        $pop.remove();
      }
      _self.$mascot.stop(true);//清除动画队列
      _self.$mascot.animate({'bottom':0});
      if(_self.closeEyes){
        _self.closeEyes = false;
        _self.ce && clearTimeout(_self.ce);
        _self.oe && clearTimeout(_self.oe);
        _self.ce = setTimeout(()=>{
          _self.$mascot.find('#openeyes').css('display','none');
          _self.$mascot.find('#closeeyes').css('display','inline');
        },200);
        _self.oe = setTimeout(()=>{
          _self.$mascot.find('#closeeyes').css('display','none');
          _self.$mascot.find('#openeyes').css('display','inline')
        },700);
      }
    });
    _self.$mascot.on('mouseleave',()=>{
      if(!_self.keepStandUp){
        _self.$mascot.stop(true);//清除动画队列
        _self.$mascot.animate({'bottom':'-20px'})
      }
      _self.closeEyes = true;
    });
    //点击采宝，显示菜单
    _self.$mascot.on('click',()=>{
      $menu.show();
      _self.$mascot.hide();
    });
    _self.$showQuestion.on('click',()=>{
      if(_self.questionModal){
        _self.questionModal.show();
      }else{
        _self.questionModal = new Modal(template());
        _self.questionModal.show();
      }
      $('.modal-overlay,.overlay-iframe').remove();
      _self.detailInit();
    });
    //关闭菜单
    $close.on('click',function(){
      $menu.hide();
      _self.$mascot.show();
    })
    _self.$dm = $('#detailModal');
    $('#detailModal .close').on('click',()=>{
      _self.$dm.css('display','none');
    })
    $('#imageSlider').on('click','img',(e)=>{
      const imageSrc = $(e.target).attr('src');
      let $modal = `<div class="modal image-modal-preview hide w-500">
                        <div class="modal-body">
                          <a href="javascript:;" class="close"><i class="icon-zcy icon-guanbi"></i></a>
                          <img class="modal-preview" src="${imageSrc}"/>
                        </div>
                      </div>`;
      $('body>.image-modal-preview.hide').remove();
      $('body').append($modal);
      new Modal('.image-modal-preview').show();
    });
  }
  detailInit(){
    const _self = this;
    $('#questionModal ul').html(_self.qs);
    $('#questionModal').on('click','li',(e)=>{
      const id = $(e.target).data('id');
      _self.getDetail(id);
      
    });
    if(_self.total > 5){
      $('#change').css('display','inline');
      $('#change').on('click',()=>{
        const pages = Math.ceil(_self.total/5);
        if(_self.pageNo&&_self.pageNo<pages){
          _self.pageNo++;
          _self.getList();
        }else if(!_self.pageNo){
          _self.pageNo = 2;
          _self.getList();
        }else if(_self.pageNo === pages){
          _self.pageNo = 1;
          _self.getList();
        }
      })
    }
    $('#questionClose').on('click',()=>{
      _self.$dm.css('display','none');
      _self.keepStandUp = false;
      _self.$mascot.animate({'bottom':'-20px'})
    });
    
  }
  getDetail(id){
    const _self = this;
    const $is = $('#imageSlider');
    $.ajax({
      url: base + '/knowledge/front/getDetailBy',
      dataType: 'json',
      type: 'get',
      data:{
        id: id,
      },
      success:(resp)=>{
        const {attachs,title,content} = resp.result;
        
        if(attachs&&attachs.length>0){
          let _html = '';
          for(let i in attachs){
            _html += `<li><img src="${attachs[i]}"></li>`;
          }
          $is.html(_html);
          $is.css('display','block');
          $('#pager').css('display','block');
          Slide.initSlider('imageSlider');
        }else{
          $is.css('display','none');
          $('#pager').css('display','none');
        }
        _self.$dm.find('.modal-header>span').text(title);
        _self.$dm.find('.modal-body>p').text(content);
        _self.$dm.css('display','block');
      }
    })
  }
  getList(){
    const _self = this;
    _self.$showQuestion = $('#showQuestion');
    $.ajax({
      url: base + '/knowledge/front/displayKnowledge',
      dataType: 'json',
      type: 'get',
      data:{
          menuCode: window.location.href.split(window.location.host)[1],
          category: $('#currentCategory').val(),
          pageNo: _self.pageNo||1,
      },
      success:(resp)=>{
        const {data,total} = resp.result;
        _self.total = total;
        if(!_self.pageNo){//初始化帮助模块，无数据菜单不展示常见问题
          _self.pageNo = 1;
          if(data.length === 0){
            _self.$showQuestion.remove();
          }
          _self.assistInit();
        }
        let _html = '';
        for(let i in data){
          _html += `<li data-id="${data[i].id}" title="${data[i].title}">${data[i].title}</li>`;
        }
        _self.qs = _html;
        $('#questionModal ul').html(_self.qs);
      }
    })
  }

}


module.exports = Assist;