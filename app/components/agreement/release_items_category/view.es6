/**
  发商品选择类目跳转
  author by terminus.io (zl)
**/
import Modal from "pokeball/components/modal";

class releaseItemsCategory{
  constructor(){
    this.$submitSpu = $(".js-submit-spu");
    this.bindEvent();
  }
  bindEvent(){
    this.$submitSpu.on("click", ()=>{
      this.submitSpuClick();
    });
  }
  //添加协议商品，提交跳转
  submitSpuClick(){
    let ptype = this.$el.find('#ptype').val(),
        categoryPath = this.$el.find(".selected-path").html(),
        categoryData = this.$el.find(".selected:last").data("category"),
        categoryId = categoryData.id;
    if(!categoryData.status || categoryData.status == 0){
      new Modal({
        icon: 'info',
        title: '温馨提示',
        content: '已冻结类目无法发布商品'
      }).show()
    }
    else if(!categoryData.hasChildren){
      window.location.href = `/agreement/item-publish?categoryId=${categoryId}&categoryPath=${encodeURIComponent(categoryPath)}`;
    }
  }
};

export default releaseItemsCategory;
