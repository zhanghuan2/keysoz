import Category from 'seller/category_item/view';
import AgreementService from 'agreement/category_item/server';

let categoryTmplFn = Handlebars.templates["agreement/category_item/templates/category"];

export default class AgreementCategory extends Category{
  constructor(){
    super();
  }
  bindEvent(){
    super.bindEvent();
  }
  //下一级类目逻辑
  nextCategory(e){
    let categoryData = $(e.currentTarget).data("category");
    $(e.currentTarget).parents(".category").nextAll().remove();
    this.setSelected(e.currentTarget);
    $(".js-submit-spu").attr("disabled", true);
    $(".category-list").spin("medium");
    if(categoryData.hasChildren === true){
      let reqData = {
        pid: categoryData.id
      };
      //获取子类目
      AgreementService.getCategoryItemList(reqData, function(data){
        let categoryTemplate = categoryTmplFn({
          extras: {
            "level": parseInt(categoryData.level) + 1,
            "parentId": categoryData.id
          },
          data: data
        });
        $(".fixed-category").append(categoryTemplate);
      }, function(){
        $(".category-list").spin(false);
      });
    }
    else{
      //获取SPU
      this.setSpuOrLeaf(categoryData);
      $(".category-list").spin(false);
      
      // if (categoryData.level <= this.categoryType.maxLength && categoryData.hasSpu){
      //   this.renderSpus(categoryData)
      // }else{
      //   $(".category-list").spin(false);
      // }
    }
  }
  //渲染SPU层
  renderSpus(categoryData){
    let maxLength = this.categoryType.maxLength,
        reqData = {
          categoryId: categoryData.id,
          pageNo:1,
          pageSize: 200
        };
    AgreementService.getSPUItemList(reqData, function(res){
      let spuTemplate = categoryTmplFn({
        extras: {
          "level": 5,
          "parentId": categoryData.id
        },
        data: res.data
      });
      $(".fixed-category").append(spuTemplate);
      $(`.category-${maxLength}`).addClass("category-spu");
    }, function(){
      $(".category-list").spin(false);
    });
  }
  //设置已选SPU
  setSpuOrLeaf(categoryData){
    $(".js-submit-spu").attr("disabled", false);
    let selectedItemsCache = [];
    $.each($(".js-category-component .selected"),function(i,d){
      selectedItemsCache[i] = $(this).data("category").name;
    });
    let selectedString = selectedItemsCache.join("-");
    $(".selected-path").html(selectedString);
  }
};
