

class ZCYSelectCategory1 {
  constructor () {
    this.init()
  }
  init(){
    let cfg = {
      dataUrl:'/api/zcy/backCategories/categoriesByTag',
      bzlmUrl:'/api/zcy/backCategories/listKeyPropertiesByCategoryId',
      spuUrl : '/api/spu/getSimpleByCategory',
      submitUrl : '/api/spu/getSimpleByCategory',
      spuCallback : this.spuCallback.bind(this),
      submitCallback :this.callback.bind(this),
      ptype:9,
      showSearch:true,
      tar:'.component-body'
    };
    let Controller = ZCY.BComp.pubCategory(cfg);

  }
  spuCallback(){

  }
  callback(d){
    console.log(d);
  }

}


module.exports = ZCYSelectCategory1;