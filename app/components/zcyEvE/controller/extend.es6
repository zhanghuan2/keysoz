const eevee = require('zcyEvE/ZCYeevee');
const server = require('zcyEvE/server');
let mask = Handlebars.templates['zcyEvE/controller/templates/mask'];
let selectTemplates = Handlebars.templates['zcyEvE/controller/templates/select'];
let selectCommp = Handlebars.templates['zcyEvE/controller/templates/selectCommp'];
let changeRegx = Handlebars.templates['zcyEvE/controller/templates/changeRegx'];
let changepageTemplates = Handlebars.templates['zcyEvE/controller/templates/changePage'];
let part = Handlebars.templates['zcyEvE/controller/templates/part'];
let compsetTemplates = Handlebars.templates['zcyEvE/controller/templates/compSet'];

let rightPart = Handlebars.templates['zcyEvE/controller/templates/rightPart'];



class EeveePageController {
  constructor() {
    this.beforeRender();
    this.render();
    this.bindEvent();
  }
  beforeRender(){
    this.page = 'search';
    this.config = eevee.getBaseCfg();
    this.pageBox = this.$el.find('.ZCY-eevee-row-page');
    this.store = {};
  }
  render(){
    let param = {
      'pageId': 'search'
    };
    this.renderPage(param);
  }
  /**
   * 渲染装修页面
   * @parqam
   * 1、pageID,
   * 2、code
   * */
  renderPage(p){
    //TODO
    eevee.renderPage(p,this.pageBox).then((d)=>{
      this.param = p;
      this.data = d;
    });
    server.getWC().then((d)=>{
      this.$el.find('.side-content').html(rightPart(d));
    });

  }

  bindEvent(){
    //组件hover事件
    this.$el.on('mouseover mouseout','.eevee-col-box',(e)=>{
      if (e.type == "mouseover") {
        this.mouseover(e)
      } else if (e.type == "mouseout") {
        this.mouseout(e)
      }
      e.preventDefault();
      e.stopPropagation();
    });
    //边框hover事件
    this.$el.on('mouseover mouseout','.eevee-grids,.eevee-col-row',(e)=>{
      let $tar = $(e.target);
      if (e.type == "mouseover") {
        $tar.addClass('hover-evt');
      } else if (e.type == "mouseout") {
        $tar.removeClass('hover-evt');
      }
    });
    //边框点击事件
    this.$el.on('click','.eevee-grids,.eevee-col-row',(e)=>{
      this.clickEvent(e);
    });

    //点击组件进行设置
    this.$el.on('click','.eevee-col-box',(e)=>{
      this.clickEvent(e);
    });
    //页面选择
    this.$el.on('change','.controller-main input',(e)=>{
      this.setValue(e);
    });
    this.$el.on('click','.controller-box .h1-logo img',()=>{
      this.$el.find('.controller-box').addClass('upaction');
    });
    this.$el.on('click','.controller-right a',(e)=>{
      let $tar = $(e.target);
      $tar.hasClass('repComp') ? this.repComp() : this.deleComp();
    });
    this.$el.on('click','button,a.evt',(e)=>{
      let $tar = $(e.target);
      if($tar.hasClass('public')){
        this.submit();
      }else if($tar.hasClass('newRegx')){
        this.newRegx();
      }
    });
    this.$el.on('click','.controller-tabs li',(e)=>{
      let $tar = $(e.target);
      $tar.hasClass('addLi') ? this.newRegx():this.changeTabs(e);
    });
    this.$el.on('click','.addRow',(e)=>{
      this.addLine();
    });

    //new event
    this.$el.on('click','button.js-page-show',()=>{
      this.$el.find('.comps-set').addClass('hide');
      this.$el.find('.body-content').toggleClass('body-showRight');
    });
    this.$el.on('click','button.addpage',()=>{
      this.addPage();
    });
    this.$el.find('.left-menu').on('click','ul.menu-li li',(e)=>{
      let $tar = $(e.target);
      if($tar.hasClass('active'))return;
      if($tar.hasClass('addLi')){
        this.addLi();
      }else{
        this.$el.find('.left-menu ul.menu-li li').removeClass('active');
        $tar.addClass('active');
        let id = $tar.data('pageid');
        this.renderHall(id);
      }

    })

    this.$el.on('click','.addAllComps',(e)=>{
      this.addAllCompsModal();

    });
    this.$el.on('click','.deleComs',(e)=>{
      this.deleComp();

    });
    this.$el.on('click','.setRouter',(e)=>{
      this.setRouter();
    });


  }
  setRouter(){
    let that = this;
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/setRouter",   //自定义模板路径
      title:'新增页面',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        m.close();
      },afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
        $('.zcyEvE-modal').on('click','.addTD a', function () {
          that.addTD();
        })
      }
    });
  }
  addTD(){
    let html = `<tr>
          <td>
            作用大厅：
          </td>
          <td>
            <input type="text" name="pageid" />
          </td>
          <td>
            作用页面：
          </td>
          <td>
            <input type="text" name="pageid" />
          </td>
          <td>
            unless Page：
          </td>
          <td>
            <input type="text" name="pageid" />
          </td>
          <td class="addTD">
            <a>➕</a>
          </td>
        </tr>`;
    $('.zcyEvE-modal').find('tbody').find('.addTD').addClass('hide');
    $('.zcyEvE-modal').find('tbody').append(html);
  }
  addAllCompsModal(){
    let that = this;
    let cfg = this.config.comp;//changepageTemplates
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/changeAllComp",   //自定义模板路径
      data:cfg,
      title:'新增页面',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        let param = $('.zcyEvE-modal').find('table').getData({});
        that.addAllComp(param);
        m.close();
      },afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
      }
    });
  }
  addAllComp(d){
    let rootPath = this.config.basePath;
    let path = rootPath+'/'+d.coms+'/view';
    let temp = Handlebars.templates[path];
    let fn = false;
    this.$el.find('.click-evt .eevee-col-row').append(temp());
    try{
      fn = require(path);
    }catch(e){
      console.log(e);
    }
    fn && new fn($);
  }
  addLine(){
    let html = `<div class="eevee-clu-line-index0 eevee-grids" style="min-height:30px">
                    <div class="eevee-col-row"></div>
                  </div>`;
    this.$el.find('.click-evt').after(html);
  }
  addPage(){
    let that = this;
    let cfg = this.config.page;//changepageTemplates
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/changePage",   //自定义模板路径
      data:cfg,
      title:'新增页面',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        let param = $('.zcyEvE-modal').find('table').getData({});
        that.changePage(param);
        m.close();
      },afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
      }
    });

  }
  changePage(param){
    let li = `<li class="show-title" title="" data-shopid="">
      <div class="page-title">${param.pageid}</div>
      <div><a>${param.href}</a></div>
      <div title="${param.discode}"><span>适配区划：</span><span class="discode">${param.discode}</span></div>
    </li>`;
    this.$el.find('.side-content ul').append(li);

    this.showTemplate(param.coms);
  }
  showTemplate(d){
    if(d){
      eevee.renderPage({page:2},this.pageBox);
    } else {
      let html = `<div class="eevee-clu-line-index0 eevee-grids" style="min-height:30px">
                    <div class="eevee-col-row"></div>
                  </div>`
      this.pageBox.html(html);
    }
  }

  renderHall(){
    this.$el.find('.side-content').html(rightPart());
  }
  addLi(){
    let that = this;
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/changeRegx",   //自定义模板路径
      title:'大厅配置',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        let param = $('.zcyEvE-modal').find('table').getData({});
        that.changeRegx(param);
        m.close();
      },afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
      }
    })
  }


  changeTabs(e){
    let $tar = $(e.target);
    if($tar.hasClass('active'))return;
  }
  newRegx(){
    let that = this;
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/changeRegx",   //自定义模板路径
      title:'区划配置',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        let val = $('.zcyEvE-modal').find('input[name=newregx]').val();
        if(val){
          that.changeRegx(val)
        }
        m.close();
      },afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
      }
    })
  }
  changeRegx(v){
    let litemp = `<li class="active">${v.hallname}</li>`;
    this.$el.find('.addLi').before(litemp);
  }
  repComp(){
    let $tar = this.$el.find('.comp-selected');
    let that = this;
    ZCY.utils.modal({
      button:["取消","确认"], //按钮文案
      templateUrl:"zcyEvE/controller/templates/changeComp",   //自定义模板路径
      data:that.cfg.comp, //自定义模板的数据，
      title:'组件列表',
      cls:"zcyEvE-modal",                                 // 自定义class
      confirm:function(m){                             //确认的callback
        let key = $('.zcyEvE-modal').find('select option:selected').html();
        let param = eevee.createHtml({name:key});
        that.$el.find('.comp-selected').replaceWith(param.content());
        m.close();
      },
      afterRander:function(m,target){                 //弹出框渲染成功后的callback
        $('.zcyEvE-modal').find('select').selectric();
      }
    })

  }
  deleComp(){
    let $tar = this.$el.find('.comp-selected');
    $tar.remove();
  }
  submit(){

  }
  mouseover(e){
    let $tar = $(e.currentTarget);
    $tar.addClass('hover-evt');
    $tar.find('.controller-mask').length ==0 ? $tar.append(mask()) : $tar.find('.controller-mask').removeClass('hide');
  }
  mouseout(e){
    let $tar = $(e.currentTarget);
    $tar.find('.controller-mask').addClass('hide');
  }
  clickEvent(e){
    let $tar = $(e.currentTarget);
    $('.click-evt').removeClass('click-evt');
    $('#rowPage').find('.comp-selected').removeClass('comp-selected');
    if($tar.hasClass('eevee-col-box')){
      this.$el.find('.comps-set').html(compsetTemplates({}));
      $tar.addClass('comp-selected');
    }else{
      this.$el.find('.comps-set').html(compsetTemplates({type:'line'}));
      $tar.addClass('click-evt');
    }
    this.$el.find('.comps-set').removeClass('hide');
    this.$el.find('.body-content').addClass('body-showRight');
    this.current = $tar;



    e.preventDefault();
    e.stopPropagation();
    //let path = $tar.data('compPath');

    //let config = require(`${path}/config`);
    //if(!config) return;
    //let data = eevee.getConfig(config.defaultParam);
    //this.$el.find('.controller-main').html(part(data));
  }
  setValue(e){
    let $tar = $(e.target);
    let name = $tar.attr('name');
    let value = $tar.val();
    this.current.css(name,value);
  }
}
module.exports = EeveePageController;
