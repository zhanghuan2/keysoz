const OriginShelfItem = require("seller/shelf_item/view")

const Modal = require("pokeball/components/modal")

const listExamineTemplate = Handlebars.templates["seller/shelf_item/templates/list_examine"]

let examine

class ShelfItem extends OriginShelfItem {
  constructor($) {
    super($)
  }

  bindEvent() {
    super.bindEvent()
    $("body").on("keyup", "#js-examine-reason", function () {
      let content = $(this).val().trim()
      $(".js-examine-submit").attr("disabled", content == "")
    })
  }

    // 重载下架
  offTheItem (evt) {
    let itemId = $(evt.currentTarget).closest("tr").data("id")
    $(".js-item-off").attr("id", itemId)
    $(document).on("confirm:off-one", (event, data)=> this.changeItemStatus([data], "-1"))
  }

  // 重载上架
  onTheItem (evt) {
  	let vm = this;
    let itemId = $(evt.currentTarget).closest("tr").data("id")
    $(".js-item-on").attr("id", itemId)
    let name = $(evt.currentTarget).parent().parent().find(".left-text").find("a").text();
    this.checkItemdiscont([itemId]);//检查商品是否协议
    $(document).off('confirm:on-one').on("confirm:on-one", function(event, data){
    		if(examine){
	  		let listExamine = $(listExamineTemplate({name}));
			new Modal(listExamine).show();
			$(".js-examine-submit").on("click",function(){
				let auditComment = $("#js-examine-reason").val().trim();
				vm.itemOnshelfExamin(data,auditComment)
    			})
	    }else{
	    		vm.changeItemStatus([data], "1")
	    }
    })
  }

  // 批量下架商品
  batchOffItems () {
    let items = _.map($("input.js-item-select:checked"), (i) => $(i).closest("tr").data("id"))
    if (items.length) {
      this.changeItemStatus(items, "-1")
    } else {
      new Modal({
        icon: "error",
        title: "没有商品没选中",
        content: "请勾选至少一个需要操作的商品"
      }).show()
    }
  }

  // 批量上架
  batchOnItems () {
  	let vm = this;
    let items = _.map($("input.js-item-select:checked"), (i) => {return $(i).closest("tr").data("id")})
    let name = "批量商品"
    if (items.length) {
      this.checkItemdiscont(items);//检查商品是否协议
    	  if(examine){
    	  	let listExamine = $(listExamineTemplate({name}));
		new Modal(listExamine).show();
		$(".js-examine-submit").on("click",function(){
			let auditComment = $("#js-examine-reason").val().trim();
			vm.batchItemOnshelfExamin(items,auditComment)
		})
    	  }else{
      	vm.changeItemStatus(items, "1")
    	  }
    } else {
      new Modal({
        icon: "error",
        title: "没有商品没选中",
        content: "请勾选至少一个需要操作的商品"
      }).show()
    }
  }

  // 重载商品选择
  selectItem (evt) {
    let totalCount = 0;
    _.each($(".js-item-select:checked"), (item)=>{
      totalCount++
    });
    if(totalCount != 0){
      $(".js-item-batch-delete").removeAttr("disabled");
     }else{
      $(".js-item-batch-delete").attr("disabled", true);
    }
  }

  // 重载批量选择
  selectBatch (evt) {
    $("input.js-item-select").prop("checked", $(evt.currentTarget).prop("checked") ? true : false)
    this.selectItem(evt)
  }

  //检查商品是否是协议商品(上架)
  checkItemdiscont(itemIds){
  	$("body").spin("medium")
    $.ajax({
    	  async:false,
      url: "/api/seller/items/check-discount",
      type: "POST",
      data: {"itemIds": itemIds},
      success: (data) => {
        examine = data;
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

  //商品上架申请单个
  itemOnshelfExamin (itemId, auditComment) {
  	$(".js-examine-submit").prop("disabled",true)
    $("body").spin("medium")
    $.ajax({
      url: "/api/seller/items/do-onshelf",
      type: "POST",
      data: {"itemId": itemId, "auditComment": auditComment,"auditResult":"SUBMIT_FIRST_AUDIT"},
      success: () => {
        window.location.reload()
        $(".js-examine-submit").prop("disabled",false)
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

  //商品上架申请批量
  batchItemOnshelfExamin (itemIds, auditComment) {
  	$(".js-examine-submit").prop("disabled",true)
    $("body").spin("medium")
    $.ajax({
      url: "/api/seller/items/batch-onshelf",
      type: "POST",
      data: {"itemIds": itemIds, "auditComment": auditComment,"auditResult":"SUBMIT_FIRST_AUDIT"},
      success: () => {
        window.location.reload()
  		$(".js-examine-submit").prop("disabled",false)
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

  //重载商品详情编辑
  getItemDetail (evt) {
  	if($(evt.currentTarget).data("status")=="2"){//待审核状态不允许编辑
  		return false;
  	}
    let itemId = $(evt.currentTarget).data("id")
    $.ajax({
      url: `/api/seller/items/${itemId}/detail`,
      type: "GET",
      dataType: "html",
      success: (data) => {
        this.renderRichEditor(itemId, data)
      }
    })
  }


}

module.exports = ShelfItem
