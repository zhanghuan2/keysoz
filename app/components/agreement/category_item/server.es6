let Service = {
  //获取类目
  getCategoryItemList(data, successFn, completeFn){
    let isSupperPro = $.query.keys.tag == ""
    $.ajax({
      url: "/api/zcy/backCategories/children",
      type: "GET",
      data : data,
      success: function(res){
        if(res && successFn) {
          successFn(res);
        }
      },
      complete: function(){
        if(completeFn){
          completeFn();
        }
      }
    });
  },
  //获取SPU产品列表
  getSPUItemList(data, successFn, completeFn){
    $.ajax({
      url: "/api/seller/spu/bycat",
      type: "GET",
      data: data,
      success: function(res){
        if(res && successFn){
          successFn(res);
        }
      },
      complete: function(){
        if(completeFn){
          completeFn();
        }
      }
    });
  }
};

export default Service;
