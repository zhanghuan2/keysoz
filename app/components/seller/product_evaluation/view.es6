import Modal from "pokeball/components/modal"
let _deliverEvaluation = Handlebars.templates["seller/product_evaluation/templates/deliver-evaluation"];
let _evaluationDetails = Handlebars.templates["seller/product_evaluation/templates/evaluation-details"];
let _addEvalutionTemplate = Handlebars.templates["seller/order_evaluation/templates/add-order-evaluation"];

class ProductEvaluation{
  constructor($) {
    this.imageFlag = 0;
    this.flag = 0;
    this.showModal = $(".product-li .js-add");
    this.showSelectModal = $(".product-li .js-select");
    this.jsAddItemEvaluation = $(".js-add-select");
    this.jsChangeEvaluate = $(".change-item-evaluated");
    this.$jsImageSingle = $(".js-image-single");
    this.jsIconShanchu = ".js-icon-shanchu";
    this.orderId = $(".order-whole-evaluation").data("orderid");
    this.jsAddItemSubmit = ".js-add-item-submit";
    this.jsChangeItemSubmit = ".js-change-item-submit"
    this.bindEvent();
  }

  bindEvent() {
    this.showModal.on("click", evt => this.modalShow(evt));
    this.showSelectModal.on("click",evt => this.modalShowSelect(evt));
    this.jsAddItemEvaluation.on("click", evt => this.addSingleItemEvaluation(evt));
    $(document).on("click", this.jsIconShanchu, (evt)=>this.deletePhotoSingle(evt)); //evt指向帮低昂的元素
  }

  checkLogKeyup(evt){
    var maxChars = 500;//最多字符数
    let obj = $(evt.target),
        words = obj.val(),
        $commentWord = $(".js-checklog-comment-count")
    if (words.length >= maxChars) {
      obj.val(words.substring(0,maxChars));
      $commentWord.addClass("error")
    } else {
      $commentWord.removeClass("error")
    }

    $commentWord.html(obj.val().length);
  }

  imageUpload () {
    $(".image-upload").fileupload({
      url: "/api/user/files/upload",
      dataType: "html",
      done: (evt, data) => {
        let urlJ = JSON.parse(data.result)[0].userFile.path;
        let imageHtml = `<div class='image-single js-image-single change-image-single'><img src='${urlJ}'><i class='icon-zcy icon-shanchu font-16 js-icon-shanchu hide'></i></div>`
        if (this.flag == 1)
          $(".js-first-image").append(imageHtml);
        if (this.flag == 2)
          $(".js-change-image").append(imageHtml);
        if (this.flag == 3)
          $(".js-add-image").append(imageHtml);
      }
    })
  }

  modalShow(evt) {
    this.flag = 1;
    this.imageFlag = 1;
    let itemId = $(evt.currentTarget).closest(".product-li").data("itemid");
    let itemTblId = $(evt.currentTarget).closest(".product-li").data("skuid");
    let totalNum = $(evt.currentTarget).closest(".product-li").data("itemshuliang");
    $.ajax({
      url: "/api/zcy/getEvaluateWeightByOrder",
      type: "GET",
      data: "evaluateModule=1&isOrder=false",
      success: (data)=> {
        let _modal = new Modal(_deliverEvaluation({data:data}));
        _modal.show();
        this.noCancel(itemId,itemTblId,totalNum);
        $("input.star").rating();
        this.imageUpload();
      }
    });
  }

  noCancel(itemId,itemTblId,totalNum) {
    $(".js-nocancel").on("click", (evt) => this.eachProductEvaluation(evt, itemId, itemTblId, totalNum));
  }

  eachProductEvaluation(evt, itemId, itemTblId, totalNum) {
    let evaluateTargetScores = [];
    let annexUrl = [];
    let total = 0;
    let obj;
    let content = $(".js-product-evaluation").val();
    let businessService = "cn.gov.zcy.web.util.OrderEvaluateBussinessService";
    if(this.imageFlag == 1)
      obj = $(".js-first-image .js-image-single");
    if(this.imageFlag == 2)
      obj = $(".js-change-image .js-image-single");
    if(this.imageFlag == 3)
      obj = $(".js-add-image .js-image-single");
    _.each(obj,(i)=>{
      annexUrl.push($(i).find("img").attr("src"));
    });
    _.each($(".left-title-star"),(i)=>{
      let evaluat = $(i).siblings(".right-star").find(".star-rating-control").find(".star-rating-on").length;
      let evaluatReally;
      if(evaluat==0) evaluatReally=8;
      else evaluatReally = evaluat;
      let targetName = $(i).data("evaluatename");
      let evaTargetId = $(i).data("weightruleid");
      evaluateTargetScores.push({evaluateType:2,evaTargetId,score:evaluatReally*10,targetName});
      total = total + $(i).data("evaluatevalue")/10 * evaluatReally;
    });
    $.ajax({
      url: "/api/credit/evaluate/firstEvaluateForItem",
      type: "POST",
      data: JSON.stringify({businessService,"evaluateItem":{itemId,orderId:this.orderId,itemTblId,itemNum:totalNum,score:total,content,isFirst:'true'},annexUrl,evaluateTargetScores}),
      dataType: 'json',
      contentType: 'application/json',
      success:(data)=> {
        new Modal({
          icon: "success",
          title: "评价成功",
          content: data.responseText
        }).show( () => {
          window.location.reload();
        });
      }
    });
  }

  modalShowSelect(evt) {
    let itemId = $(evt.currentTarget).closest(".product-li").data("itemid");
    let itemTblId = $(evt.currentTarget).closest(".product-li").data("skuid");
    let orderId = this.orderId
    $(".modify-item-evaluation").removeClass("hide");
    $.ajax({
      url: "/api/zcy/getSingleItemEvaluateDetail",
      type: "GET",
      data: `orderId=${orderId}&itemTblId=${itemTblId}`,
      success:(data)=>{
        // data[0].user = $(".order-whole-evaluation").data("user")
        // console.log(JSON.stringify(data))
        let flag = $('.js-item-evaluation').data('flag-self')
        let _moda = new Modal(_evaluationDetails({data, flag}));
        _moda.show(()=>$("input.star").rating());
        _.each($(".evaluation-details-modal").find(".right-star"),(i)=>{
          let leng = $(i).data("score")/10;
          $(i).find(`input[name="rating-select${$(i).data('itemid')}"]`).eq(leng-1).attr("checked",true);
        });
        this.noCancel(itemId,itemTblId);
        this.selectEvaluationafter(evt,itemId,itemTblId);
        this.initButton();              //修改评价，追评按钮一段时间后消失
        $(".gallery").viewer({navbar: false})  //大图查看
        $("input.star").rating();
        $("input.star").rating('disable');
      }
    });
  }

  //商品查看评价后的一系列操作
  selectEvaluationafter(evt,itemId,itemTblId) {
    $(".js-change-item-evaluated").on("click", (evt)=> this.changeItemEvaluate(evt));
    $(".js-add-item-evaluation").on("click", (evt)=>this.addItemEvaluation(evt));
    $(".js-checklog-comment").on('keyup', (evt)=>this.checkLogKeyup(evt));
    $(".modal-evaluation").on("click", this.jsAddItemSubmit, (evt)=>this.addItemSubmit(evt,itemId,itemTblId))
    $(".modal-evaluation").on("click", this.jsChangeItemSubmit, (evt)=>this.changeItemSubmit(evt,itemId,itemTblId))
  }

  //商品追评
  addItemEvaluation(evt,itemId,itemTblId) {
    this.flag = 3;
    this.imageFlag = 3;
    $(".js-add-area-evauation").removeClass("hide");
    $(".modify-item-evaluation").addClass("hide");
    $(".modal-tile").text("追加评价");
    $(".left-title").css("color","#9F9F9F");
    $(".js-save", $(".modal")).addClass("js-add-item-submit").removeClass("hide")
    $(".js-close-button", $(".modal")).text("取消")
    this.imageUpload();
  }

  //追加评价
  addSingleItemEvaluation(evt) {
    let itemId = $(evt.currentTarget).closest(".product-li").data("itemid");
    let itemTblId = $(evt.currentTarget).closest(".product-li").data("skuid");
    new Modal(_addEvalutionTemplate()).show()
    $(".js-add-order-evaluation-submit").on("click", (evt)=>this.addItemSubmit(evt,itemId,itemTblId))
  }

  //商品修改评价
  changeItemEvaluate(evt) {
    this.flag = 2;
    this.imageFlag = 2;
    let thisDl = $(".js-change-evaluation-item .js-input-fivehundred-content")
    let xuanContent = thisDl.siblings(".appraise-content").text()
    $(".modal-tile").text("修改评价");
    $(".modify-item-evaluation,.js-commnet-content-text", $(".modal")).addClass("hide");
    $("input.star").rating('enable');
    $(".js-image-single").addClass("change-image-single")
    thisDl.removeClass("hide");
    thisDl.find(".js-checklog-comment").text(xuanContent)
    thisDl.find(".js-checklog-comment-count").text(xuanContent.length)
    $(".delete-add-photo-left").removeClass("hide");
    $(".js-change-image").removeClass("image-only-select");
    $(".js-save", $(".modal")).addClass("js-change-item-submit").removeClass("hide")
    $(".js-close-button", $(".modal")).text("取消")
    this.imageUpload();
  }

  //修改商品评价时删除照片
  deletePhotoSingle(evt) {
    $(evt.currentTarget).closest(".js-image-single").remove();
  }

  //提交商品追评
  addItemSubmit(evt,itemId,itemTblId) {
    // console.log("提交商品评价")
    let content = $(".js-add-evaluation-item .js-checklog-comment").val();
    let annexUrl = [];
    _.each($(".js-add-image img"),(i)=>{
      annexUrl.push($(i).attr("src"))
    })
    let data = JSON.stringify({"evaluateItem":{itemId,orderId:this.orderId,itemTblId,content},annexUrl})
    // console.log(data)
    $.ajax({
      url: "/api/credit/evaluate/item-additional-comment",
      type: "POST",
      data: data,
      dataType: 'json',
      contentType: 'application/json',
      success:(data)=>{
        new Modal({
          icon: "success",
          title: "追评成功",
          content: "成功"
        }).show( () => {
          window.location.reload();
        });
      }
    })
  }

  //提交商品修改评价
  changeItemSubmit(evt,itemId,itemTblId) {
    let evaluateTargetScores = [];
    let annexUrl = [];
    let content = $(".js-change-evaluation-item .js-checklog-comment").val();
    let businessService = "cn.gov.zcy.web.util.OrderEvaluateBussinessService";
    let obj;
    if(this.imageFlag == 1)
      obj = $(".js-first-image .js-image-single");
    if(this.imageFlag == 2)
      obj = $(".js-change-image .js-image-single");
    if(this.imageFlag == 3)
      obj = $(".js-add-image .js-image-single");
    _.each(obj,(i)=>{
      annexUrl.push($(i).find("img").attr("src"));
    });
    _.each($(".js-product-star"),(i)=>{
      let evaluateType = 2;
      let evaluat = $(i).find(".star-rating-control").find(".star-rating-on").length;
      let evaluatReally;
      if(evaluat==0) evaluatReally=8;
      else evaluatReally = evaluat;
      let targetName = $(i).data("evaluatename");
      let evaTargetId = $(i).data("weightruleid");
      evaluateTargetScores.push({evaluateType,evaTargetId,score:evaluatReally*10,targetName});
    });
    let data = JSON.stringify({"evaluateItem":{itemId,orderId:this.orderId,itemTblId,content,isFirst:'false'},annexUrl,evaluateTargetScores})
    // console.log(data);
    $.ajax({
      url: "/api/credit/evaluate/edit-item-comment",
      type: "PUT",
      data: data,
      dataType: 'json',
      contentType: 'application/json',
      success: (data)=>{
        new Modal({
          icon: "success",
          title: "修改评价成功",
          content: data.responseText
        }).show( () => {
          window.location.reload();
        })
      }
    })
  }

  initButton() {
    let time = $(".js-item-first-time").text()
    // console.log($(".js-item-first-time").text())
    let now = new Date()
    let nowDistance = now - new Date(time).valueOf()
    let d = nowDistance/(30*24*3600*1000)
    // console.log(d)
    if (d > 1) {
      $(".js-change-item-evaluated").addClass("hide")
      if (d > 6)
        $(".js-add-item-evaluation").addClass("hide")
    }
  }
}

module.exports =  ProductEvaluation
