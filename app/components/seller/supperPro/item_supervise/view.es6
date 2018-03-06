require('pokeball/components/datepicker')

const TextTool = require("seller/item_detail_editor/view")

const Pagination = require("pokeball/components/pagination"),
      Modal = require("pokeball/components/modal"),
      CommonDatepicker = require("extras/common_datepicker")

const Language = require("locale/locale")
var ComplexSearch  = require("common/complex_search/extend");
const freezeTemplate = Handlebars.templates["seller/item_supervise/templates/freeze"]
const unFreezeTemplate = Handlebars.templates["seller/item_supervise/templates/unfreeze"]
let stateFlag = false

class ShelfItem {
  constructor ($) {
    this.target = this.$el
    this.singel_flag;//当前选中item的类别
    var search = new ComplexSearch({
      tabElem: ".tab",
      searchElem: ".search",
      searchResetParams: ['pageNo'],
      param: {
      	status: {
          inJson: false
        },
        itemName: {
          inJson: false
        },
        supplier: {
          inJson: false
        },
        onShelfAtStart: {
          inJson: false
        },
        onShelfAtEnd: {
          inJson: false
        }
      }
    });
    $('.date-input').datepicker();
    this.pagination = $(".item-pagination")
   	this.itemBatch = $(".js-batch-select")
    this.itemSelect = $(".js-item-select")
    this.itemFreeze = $(".js-item-freeze")
    this.itemUnFreeze = $(".js-item-unfreeze")
    this.itemAllFreeze = $(".js-item-allfreeze")
    this.itemAllUnFreeze = $(".js-item-allunfreeze")

   	$(".js-batch-select").prop("disabled",function(){
   		let state;
   		$(".js-item-select").each(function(i){
   			if(!state){
   				state = $(this).closest("tr").data("state")
   			}else if(state != $(this).closest("tr").data("state")){
   				stateFlag = true;
   				return stateFlag;
   			}
   		})
   		return stateFlag;
   	})

    this.bindEvent()
  }

  bindEvent () {
    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {num_display_entries: 5, jump_switch: true, page_size_switch: true})
   	this.itemBatch.on("click", evt => this.selectBatch(evt))
    this.itemSelect.on("change", evt => this.selectItem(evt))
    this.itemFreeze.on("click",evt => this.freeze(evt))
    this.itemUnFreeze.on("click",evt => this.unFreeze(evt))
    this.itemAllFreeze.on("click",evt => this.freezeAll(evt))
    this.itemAllUnFreeze.on("click",evt => this.unFreezeAll(evt))
	$("body").on("keyup","#js-examine-reason",function(){
		$(this).val()!="" && $(".js-examine-submit").attr("disabled",false);
		$(this).val()=="" && $(".js-examine-submit").attr("disabled",true);

	})
  }


  // 单个选择
  selectItem (evt) {
  	$(".js-batch-select").prop("disabled",$(evt.currentTarget).prop("checked") ? false : true)
    this.itemAllFreeze.prop("disabled",function(){
    		if($(".js-item-select:checked").closest("tr").data("state")==1){
    			return false;
    		}
    });
    this.itemAllUnFreeze.prop("disabled",function(){
    		if($(".js-item-select:checked").closest("tr").data("state")==-2){
    			return false;
    		}
    });

    let _flag = $(evt.currentTarget).closest("tr").data("state");
    this.singel_flag = _flag;
    $(".js-item-select").each(function(i){
		if(_flag!=$(this).closest("tr").data("state")){
			$(this).prop("disabled",true);
		}
	})
    if(!$(".js-item-select:checked").length){
    		this.singel_flag = "";
  		if(stateFlag){
  			$(".js-batch-select").prop("disabled",true).prop("checked",false);
    		}else{
    			$(".js-batch-select").prop("disabled",false).prop("checked",false);
    		}
  		$(".js-item-select").each(function(){
			$(this).prop("disabled",false);
		})
  		this.itemAllUnFreeze.prop("disabled",true);
  		this.itemAllFreeze.prop("disabled",true);
    }
  }

    // 批量选择
  selectBatch (evt) {
  	this.itemAllFreeze.prop("disabled",function(){
    		if(stateFlag){
	    		if($(".js-item-select:checked").closest("tr").data("state")==1){
	    			return false;
	    		}
  		}else{
  			return false;
  		}
    });
    this.itemAllUnFreeze.prop("disabled",function(){
    		if(stateFlag){
	    		if($(".js-item-select:checked").closest("tr").data("state")==-2){
	    			return false;
	    		}
  		}else{
  			return false;
  		}
    });

  	let _flag = this.singel_flag;
  	$("input.js-item-select").each(function(){
  		if(!stateFlag){
  			$(this).prop("checked",$(evt.currentTarget).prop("checked") ? true : false)
  		}else{
  			if(_flag==$(this).closest("tr").data("state")){
	  			$(this).prop("checked",$(evt.currentTarget).prop("checked") ? true : false)
	  		}
  		}
  	})
  	if(!$(evt.currentTarget).prop("checked")){
  		this.singel_flag = "";
  		if(stateFlag){
  			$(".js-batch-select").prop("disabled",true);
    		}else{
    			$(".js-batch-select").prop("disabled",false);
    		}
  		$(".js-item-select").each(function(i){
			$(this).prop("disabled",false);
		})
  		this.itemAllUnFreeze.prop("disabled",true);
  		this.itemAllFreeze.prop("disabled",true);
  		this.itemBatch.prop("checked",false);
  	}else{
  		this.itemBatch.prop("checked",true)
  	}
  }
  //单个冻结
  freeze(evt){
  	let freeze = $(freezeTemplate());
	new Modal(freeze).show();
	let vm = this;
	let itemId = $(evt.currentTarget).closest("tr").data("id")
	$("#freeze-option").selectric();
	$(".js-examine-submit").on("click",function(){
		let comment = $("#freeze-option").val()+","+$("#js-examine-reason").val();
		vm.changeItemStatus([itemId],"-2",comment)
	})
  }

  //批量冻结
  freezeAll(evt){
  	let freeze = $(freezeTemplate());
	new Modal(freeze).show();
	let vm = this;
	$("#freeze-option").selectric();
	$(".js-examine-submit").on("click",function(){
		let items = _.map($("input.js-item-select:checked"), (i) => $(i).closest("tr").data("id"))
		let comment = $("#freeze-option").val()+","+$("#js-examine-reason").val();
		vm.changeItemStatus(items,"-2",comment)
	})
  }

  //单个解冻
  unFreeze(evt){
  	let unfreeze = $(unFreezeTemplate());
	new Modal(unfreeze).show();
	let vm = this;
	let itemId = $(evt.currentTarget).closest("tr").data("id")
	$(".js-examine-submit").on("click",function(){
		vm.changeItemStatus([itemId],"-1")
	})
  }
  //批量解冻
  unFreezeAll(evt){
  	let unfreeze = $(unFreezeTemplate());
	new Modal(unfreeze).show();
	let vm = this;
	$(".js-examine-submit").on("click",function(){
		let items = _.map($("input.js-item-select:checked"), (i) => $(i).closest("tr").data("id"))
		vm.changeItemStatus(items,"-1")
	})
  }

  //冻结解冻商品status:-1解冻,-2冻结
  changeItemStatus (itemIds, status,comment) {
  	let urlStr, itemTag = $('.js-item-tag').val();
  	if(status === '-1') {
  		urlStr = '/api/item/block/supervise/unfreeze';
		}else {
			urlStr = '/api/item/block/supervise/freeze'
		}
  	$(".js-examine-submit").prop("disabled",true)
    $("body").spin("medium")
    $.ajax({
      url: urlStr,
      type: "POST",
      data: {"itemId": itemIds[0], "status": status,"comment":comment},
      success: () => {
        window.location.reload()
  		$(".js-examine-submit").prop("disabled",false)
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

}

module.exports = ShelfItem
