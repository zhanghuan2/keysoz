import Modal  from  "pokeball/components/modal";
import Pagination  from  "pokeball/components/pagination";
import GetPhone from "common/get_phone/view";

class SelectRequisitions{
  constructor($){
    this.totalComment = $(".buyer-select-req-lists").data("req-lists-total");
    new Pagination($(".list-pagination")).total(this.totalComment).show($(".list-pagination").data("size"),{num_display_entries: 5, jump_switch: true, page_size_switch: true});
    this.itemBatchReject = $(".js-reject-batch");
    this.itemBatchDelete = $(".js-delete-batch");
    this.reqSubmit = $(".js-req-submit");
    this.selectRquItem = $(".js-select-requisition-item");
    this.batchSelectItem = $(".js-batch-select");
    this.inputKey = $('.js-search-content');
    this.searchResetClick = $('.js-search-reset');
    new GetPhone();
    this.bindEvent();
    this.tempSelectionReqIds="";
    this.allSelectionReqIds="";
    this.allSelectionReqPrice = 0.0;
  }
  bindEvent(){
    this.initUrl();
    this.sumEveryItem();
    this.sumEveryReq();
    this.selectRquItem.on("change", (evt)=>this.checkReqItems(evt));
    this.batchSelectItem.on("change", (evt)=>this.batchSelectItems(evt));
    this.itemBatchReject.on("click", (evt)=>this.rejectreqs(evt));
    this.itemBatchDelete.on("click", (evt)=>this.deleteItems(evt));
    $(".js-search").on("click", (evt)=>this.searchRequisitions(evt));
    this.inputKey.on('keypress', (evt)=>this.searchContentKeyPress(evt));
    this.searchResetClick.on('click', (evt)=>this.clickSearchReset(evt));
    this.reqSubmit.on("click", this.submitReq);
    $('.requisition-tr').on('click', (evt)=>this.hideOrShowSecondLevel(evt));
    this.getSelection();
    // $(window).on({
    //   "scroll":(evt)=>this.runScroll(evt),
    //   "resize": (evt)=>this.runResize(evt)
    // });
    // $(window).scroll();
  }

  //点击重置按钮
  clickSearchReset(evt){
    window.location.href = window.location.pathname +  '?pageNo=1';
  }
  //关键字按enter按钮事件
  searchContentKeyPress(evt){
    if (!evt) evt = window.event;
    var keyCode = evt.keyCode || evt.which;
    if(keyCode == 13){
      //console.log('关键字按enter按钮事件:'+$(evt.target).val());
      this.searchRequisitions();
    }
  }

  //选择需求单模块：显示或者隐藏商品列表
  hideOrShowSecondLevel(evt){
    if(evt.target.nodeName == 'INPUT' || evt.target.nodeName == 'A'  || evt.target.nodeName == "SPAN"  || evt.target.nodeName == "LABEL"){
      return;
    }
    let items = $(evt.target);
    let id = items.closest('.first-level-tr').data('requisition');
    let item = $('.second-level-tr[data-site="'+id+'"]');
    if($(item).is(":hidden")){
      $(item).slideDown('fast', ()=>{});
    }else{
      $(item).slideUp('fast');
    }
  }

   //提交需求单到采购清单
   submitReq(){
    //console.log("提交需求单到采购清单测试～～");
    let reqIds = "";
    _.each($(".js-select-requisition-item:checked"), (item)=>{
      reqIds +=$(item).closest('.requisition-tr').data('requisition')+",";
    });
    if(reqIds != ""){
      reqIds = reqIds.substring(0,reqIds.length-1);
      $.ajax({
          type:"GET",
          dataType:"text",
          url:"/api/requisitions/submits?reqIds="+reqIds+"&type=p",
          success:(data)=>{
            //console.log("success:"+data);
            //成功后转跳到需求单列表页面
            window.location.href = "/buyer/purchase-process?purchaseId="+data;
          },
          error:(data)=>{
            //console.log("error: "+data.responseText);
            new Modal({
              icon: "warning",
              title: "提醒",
              content: "提交失败！错误信息: " + data.responseText + ""
            }).show();
          }
      });
    }
   }

   //获取缓存中（已经勾选）的需求单
   getSelection(){
    //console.log("获取缓存中（已经勾选）的需求单");
    let reqIds = "";
    $.ajax({
      url: "/api/requisitions/selection",
      type: "GET",
      success: (data) =>{
        //console.log("success:reqIds="+data.reqIds +" ,price="+ data.price);
        if(data.reqIds != undefined && data.price != undefined){
          this.allSelectionReqIds = data.reqIds;
          this.tempSelectionReqIds =  data.reqIds;
          this.allSelectionReqPrice =parseFloat(data.price)/100;
        }
        //将数据勾选
        _.each(data.reqIds,(reqId)=>{
          $(".requisition-tr[data-requisition="+reqId+"] .js-select-requisition-item").prop('checked', 'true');
          if(!$(".item-tr[data-site="+reqId+"]").hasClass("isSelect")){
            $(".item-tr[data-site="+reqId+"]").addClass("isSelect");
          }
        });
        this.selectItemCount();
        this.totalSum();
      },
      error:(data)=>{
      }
    });
   }

   //将勾选的需求单放到临时缓存中
   setSelection(reqIds){
    //console.log("将勾选的需求单放到临时缓存中,reqIds="+reqIds.toString());
    this.allSelectionReqIds = this.tempSelectionReqIds = reqIds;
    this.selectItemCount();
    this.totalSum();
    $.ajax({
      url: "/api/requisitions/selection",
      type: "PUT",
      data: {reqIds: reqIds.toString()},
      success: (data) =>{
        //console.log("success:"+data);
        this.allSelectionReqIds = data;
        if(data.length == 0){
          if(this.allSelectionReqIds != undefined && this.allSelectionReqIds.toString() != ""){
            this.allSelectionReqIds = this.allSelectionReqIds + "," +reqIds;
          }
          else{
            this.allSelectionReqIds = this.tempSelectionReqIds;
          }
        }
        this.selectItemCount();
        this.totalSum();
      },
      error:(data)=>{
        //console.log("error: "+data.responseText);
        //就算出台出错，也要允许创建采购单
        this.allSelectionReqIds = this.tempSelectionReqIds;
        this.selectItemCount();
        this.totalSum();
      }
    });
   }

  //初始化url对应的过滤条件值
  initUrl(){
    let reqId = $.query.get("reqId");
    let since = $.query.get("since");
    let status = $.query.get("status");
    let pageNo = $.query.get("pageNo");
    if (reqId !== "" && reqId != "true")$(".search-content").val(reqId);
    if (since !== "" && since != "true")$(".js-select-time").val(since);
    if (status !== "")$(".js-select-status").val(status);
    //如果是需求申请人，默认状态为“未提交需求申请单”
    //if(reqId === "" && since === "" && status === "" && pageNo === ""){
    //  let url= "/buyer/requs?status=0";
    //  window.location.href = url;
    //}
    //如果是采购经办人，默认状态为“已提交/待受理申请单”
    // if(reqId == "" && since == "" && status == "" && pageNo == ""){
    //   let url= "/buyer/select-requisitions";
    //   window.location.href = url;
    // }
    //如果pageNo出现了异常，则pageNo=1
    if (pageNo == "NaN") {
      window.location.href = $.query.set("pageNo",1);
    };
  }
  //通过需求单编号查找需求单
  searchRequisitions(evt){
    //清空已经选择好的需求单
    this.setSelection("");
    let url = window.location.pathname +  '?pageNo=1';

    let reqId = $(".search-content").val();
    if(reqId != "") url += "&reqId="+reqId;

    let since = $('.js-select-time').val();
    if(since != ""){
      url += "&since="+since;
    }

    let status = $.query.get("status");
    if(status !== ""){
      url += "&status="+status;
    }

    window.location.href = url;
  }

  //批量删除需求单
  deleteItems(evt){
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "需求单【删除】之后不可恢复，确认【删除】？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      _.each($(".js-select-requisition-item:checked"), (checkbox)=>{
        let reqId = $(checkbox).closest(".requisition-tr").data("requisition");
        this.deleteItem(reqId);
      });
      window.location.href = window.location.href;
    })
  }

  //删除需求单
  deleteItem(reqId){
    //console.log("删除需求单测试～～");
    $.ajax({
        type:"DELETE",
        url:"/api/requisitions/"+reqId,
        success:(data)=>{
        },
        error:(data)=>{
        }
    });
  }

 //批量拒绝需求申请单
 rejectreqs(evt){
    new Modal({
      icon: "warning",
      title: "温馨提示",
      content: "需求单【拒绝】之后不可恢复，确认【拒绝】？",
      isConfirm: true,
      event: function(){}
    }).show(()=>{
      _.each($(".js-select-requisition-item:checked"), (checkbox)=>{
        let reqId = $(checkbox).closest(".requisition-tr").data("requisition");
        this.rejectreq(reqId);
      });
      window.location.href = window.location.href;
    })
 }
 //拒绝申请单
 rejectreq(reqId){
  $.ajax({
      type:"POST",
      url:"/api/requisitions/"+reqId,
      data: {status:-1},
      dataType: "json",
      success:(data)=>{
      },
      error:(data)=>{
      }
  });
 }

  //选中一个需求单
  checkReqItems(evt){
    let requisitionId = $(evt.target).closest(".requisition-tr").data("requisition");
    //选中需求单的价格小计
    let thisPrice = parseFloat($(evt.target).closest('.requisition-tr').find('.requisition-subtotal').html());
    if($(evt.target).prop("checked")){
       //var requisitions = $(".item-tr[data-site="+requisitionId+"]");
       $(".item-tr[data-site="+requisitionId+"] ").addClass("isSelect");
       if(this.allSelectionReqIds != undefined && this.allSelectionReqIds.toString() != ""){
         this.tempSelectionReqIds = this.allSelectionReqIds + "," +requisitionId;
         this.setSelection(this.allSelectionReqIds + "," +requisitionId);
       }
       else{
         this.tempSelectionReqIds = requisitionId.toString();
         this.setSelection(requisitionId.toString());
       }
       //增加总价
       this.allSelectionReqPrice = this.allSelectionReqPrice + thisPrice;
      } else{
       $(".js-batch-select").prop("checked", false);
       $(".item-tr[data-site="+requisitionId+"] ").removeClass("isSelect");
       //删除缓存中的reqIds
       //console.log("删除缓存："+requisitionId);
       //console.log(typeof(this.allSelectionReqIds))
       if(typeof(this.allSelectionReqIds) == "string")this.allSelectionReqIds = this.allSelectionReqIds.split(",");
       this.allSelectionReqIds = this.allSelectionReqIds.filter((id)=>{return id!=requisitionId});
       //减除总价
       this.allSelectionReqPrice = this.allSelectionReqPrice - thisPrice;
       this.tempSelectionReqIds = this.allSelectionReqIds;
       this.setSelection(this.allSelectionReqIds);
     }

  }

  //全选需求单
  batchSelectItems(evt){
    //console.log("全选需求单");
    let thisPrice = 0.0;
    let requisitions = $(".js-select-requisition-item");
    if($(evt.target).prop("checked")){
      let requisitionIds = "";
      _.each(requisitions,(el,index)=>{
        let requisitionId = $(el).closest(".requisition-tr").data("requisition");
        if(this.allSelectionReqIds.indexOf(requisitionId.toString()) > -1) return true;
        //选中需求单的价格小计
        thisPrice += parseFloat($(el).closest('.requisition-tr').find('.requisition-subtotal').html());
        $(el).prop("checked", true);
        $(".item-tr[data-site="+requisitionId+"]").addClass("isSelect");
        //let subtotal = $(".item-tr[data-site="+requisitionId+"] .item-subtotal").html();
        requisitionIds +=requisitionId+","
      });
      if(requisitionIds != ""){
        requisitionIds = requisitionIds.substring(0,requisitionIds.length-1);
        if(this.allSelectionReqIds != undefined && this.allSelectionReqIds != ""){
          this.tempSelectionReqIds = this.allSelectionReqIds + "," +requisitionIds;
          this.setSelection(this.allSelectionReqIds + "," +requisitionIds);
        }
        else{
          this.tempSelectionReqIds =  requisitionIds;
          this.setSelection(requisitionIds);
        }
        //增加总价
        this.allSelectionReqPrice = this.allSelectionReqPrice + thisPrice;
      }
    }else{
      requisitions.prop("checked", false);
      $(".item-tr").removeClass("isSelect");
      //删除缓存中的reqIds
      _.each(requisitions,(item)=>{
        let requisitionId = $(item).closest('.requisition-tr').data('requisition');
        if(typeof(this.allSelectionReqIds) == "string")this.allSelectionReqIds = this.allSelectionReqIds.split(",");
        this.allSelectionReqIds = this.allSelectionReqIds.filter((id)=>{return id!=requisitionId});
        //选中需求单的价格小计
        thisPrice = parseFloat($(item).closest('.requisition-tr').find('.requisition-subtotal').html());
        //减除总价
        this.allSelectionReqPrice = this.allSelectionReqPrice - thisPrice;
      });
      this.tempSelectionReqIds = this.allSelectionReqIds;
      this.setSelection(this.allSelectionReqIds);
    }
  }

  //统计选中需求的总数
  selectItemCount(){
    //统计总数
    let sum = this.allSelectionReqIds.length;
    //_.each($(".js-select-requisition-item:checked"), (item)=>{
    //  sum++
    //});
    //$(".total-item .total-count").text(sum);
    $(".total-item .total-count").text(this.allSelectionReqIds.length);
    if(sum != 0){
      $(".js-req-submit").removeAttr("disabled");
     }else{
      $(".js-req-submit").attr("disabled", true);
    }
  }

  //统计选中商品的总价
  totalSum(){
    //统计总价
    let total = this.allSelectionReqPrice;
    //_.each($(".item-tr.isSelect"), (item)=>{
    //  let subtotal = $(item).find(".item-subtotal");
    //  total += parseFloat($(subtotal).text());
    //});
    $(".total-price .currency").text(parseFloat(total).toFixed(2));
  }

  //计算每一个需求单的商品数量和总价
  sumEveryReq(){
    let requisitions = $(".requisition-tr");
    requisitions.each(function(index, item) {
      let requisitionId = $(item).data("requisition");
      let subItems = $(".item-tr[data-site="+requisitionId+"]");
      let price = 0.0;
      let count = 0;
      subItems.each(function(index, el) {
         price += parseFloat($(el).find(".item-subtotal").text());
         count += parseInt($(el).find(".count-number").html());
      });
      $(item).find(".requisition-subsum").text(count);
      $(item).find(".requisition-subtotal").text(price.toFixed(2));
    });
  }
  //需求单列表，循环每个SKU用于计算每个商品价格
  sumEveryItem(){
    _.each($(".item-tr"), (item)=>{
      this.sumItem(item);
    });
  }

  //计算每个商品的价格
  sumItem(item){
    let unitPrice = $(item).find(".sku-price").text();
    let count = parseInt($(item).find(".count-number").html());
    $(item).find(".item-subtotal").text((unitPrice * count).toFixed(2));
  }

  //滚动滚动条保证清单状态栏悬浮于同一位置
  runScroll(evt){
    let footDiv = $(".select-req-list-foot");
    let originY = $(".select-req-list-body").offset().top + $(".select-req-list-body").height() ;
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")){
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && ((originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height()))){
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".select-req-list-body").offset().left - 1));
    }
  }

  runResize(evt){
    let footDiv = $(".select-req-list-foot")
    footDiv.removeClass("float-foot")
    this.runScroll(evt);
  }

}

module.exports = SelectRequisitions;

