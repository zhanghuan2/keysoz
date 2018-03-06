const Pagination = require("pokeball/components/pagination"),
  Modal = require("pokeball/components/modal")

var ComplexSearch = require("common/complex_search/extend");
const deleteTemplate = Handlebars.templates["seller/spu_list_supplier/templates/delete"]
const deleteFailTemplate = Handlebars.templates["seller/spu_list_supplier/templates/deleteFail"]

class brandListOperate {
  constructor($) {
    this.target = this.$el
    this.singel_flag; //当前选中item的类别
    var search = new ComplexSearch({
      tabElem: ".tab",
      searchElem: ".search",
      searchResetParams: ['pageNo'],
      param: {
        spuName: {
          inJson: false
        },
        brandName: {
          inJson: false
        },
        categoryName: {
          inJson: false
        },
        supplierName: {
          inJson: false
        }
      }
    });
    this.itemDelete = $(".js-delete")

    this.pagination = $(".item-pagination")
    this.bindEvent()
  }

  bindEvent() {

    this.itemDelete.on("click", evt => this.deleteItem(evt))

    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })
  }

  //删除申请
  deleteItem(evt) {
    let deleteTem = $(deleteTemplate());
    new Modal(deleteTem).show();
    let vm = this;
    $(".js-examine-submit").on("click", function() {
      let items = $(evt.currentTarget).closest("tr").data("id")
      vm.itemDeleteStatus(items)
    })
  }

  //删除商品
  itemDeleteStatus(brandId) {
    $("body").spin("medium")
    $.ajax({
      url: "/api/zcy/spu/"+brandId,
      type: "DELETE",
      success: (data) => {
        new Modal({
          icon: "success",
          title: "删除成功"
        }).show(()=>{window.location.reload()})
      },
      error: (data) =>{
        new Modal({
          icon: "error",
          title: data.responseText
        }).show(()=>{window.location.reload()})
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

}

module.exports = brandListOperate