let _orderEvaluation = Handlebars.templates["seller/order_evaluation/templates/select-order-evaluation"];
let _orderAddEvaluation = Handlebars.templates["seller/order_evaluation/templates/add-order-evaluation"];
import Modal from "pokeball/components/modal"

class OrderEvaluation {

  constructor($) {
    this.starScore = $(".icon-shoucangxingbiao");
    this.deliverEvalution=$(".deliver-evalution");
    this.addOrderEvaluation = ".js-add-order-evaluaiton";
    this.jsModifyEvaluation = ".js-modify-order-evaluation";
    this.jsChecklogComment = ".js-checklog-comment";
    this.orderId = $(".order-whole-evaluation").data("orderid");
    this.jsModifyEvaluationSubmit = ".js-modify-evaluation-submit"
    this.userOrgId = $(".order-whole-evaluation").data("user-orgid")
    this.orgId = $(".order-whole-evaluation").data("orgid")
    this.bindEvent();
  }

  bindEvent() {
    this.starScore.on("click",this.scoreStar);
    this.deliverEvalution.on("click",(evt)=>this.evalutionDeliver(evt));
    $(document).on("click",this.addOrderEvaluation,(evt)=>this.addEvaluationOrder(evt));
    $(document).on("click",this.jsModifyEvaluation, (evt)=>this.modifyEvaluation(evt));
    $(document).on('keyup', this.jsChecklogComment,(evt)=>this.checkLogKeyup(evt));
    $(document).on("click", this.jsModifyEvaluationSubmit, (evt)=>this.modifyEvaluationSubmit(evt));
    if($(".order-whole-evaluation").data("hascomment")) {
      this.orderSelect();
    }
    if($(".order-whole-evaluation").data("hassuppliercomment")) {
      this.orderSelect();
    }
  }

  evalutionDeliver(evt) {
    let evaluateTargetScoreLst = [];
    let totalScore = 0;
    let businessService = "cn.gov.zcy.web.util.OrderEvaluateBussinessService";
    let type = "POST"
    let content = $("#remark-order-evaluation").val();
    _.each($(".js-left-evaluation-content"),(i)=>{
      let evaluatetype = $(i).data("evaluatetype");
      let evatargetid = $(i).data("weightruleid");
      let targetname = $(i).data("targetname");
      let evaluat = $(i).siblings(".right-star").find(".star-rating-control").find(".star-rating-on").length;
      let evaluatReally;
      if(evaluat==0) evaluatReally=8;
      else evaluatReally = evaluat;
      evaluateTargetScoreLst.push({evaluateType:evaluatetype,evaTargetId:evatargetid,score:evaluatReally*10,targetName:targetname});
      totalScore = totalScore + evaluatReally * $(i).data("evaluatevalue")/10;
    });
    let data = (JSON.stringify({businessService,"evaluateOrder":{relateId:this.orderId,relateType:1,score:totalScore,content,firstEvaluate:'true'},evaluateTargetScoreLst}));
    let firstEvaluateUrl = "/api/credit/evaluate/firstEvaluateForOrder"
    // console.log(data)
    this.evaluateOrderFunction(data,firstEvaluateUrl,type);
  }

  orderSelect(evt) {
    let orgId = this.orgId
    let orderId = this.orderId;
    $.ajax({
      url: "/api/zcy/getOrderEvaluateByOrderAndOrg",
      type: "GET",
      data: `orderId=${orderId}&orgId=${orgId}`,
      async: false,
      success:(data)=> {
        $(".order-border").empty();
        $(".order-border").append(_orderEvaluation({data:data}));
        if($('.order-whole-evaluation').data('flag-self') == '1')
          $('.js-evaluation-btn').removeClass('hide')
        _.each($(".order-border").find(".right-star"),(index)=>{
          let leng = $(index).data("score")/10;
          $(index).find(`input[name="rating-order${$(index).data('evatargetid')}"]`).eq(leng-1).attr("checked",true);
        });
        $("input.star").rating();
        $("input.star").rating('disable');
      },
      error: (data)=> {
        new Modal({
          icon: "error",
          title: "获取订单评价失败",
          content: data.responseText
        }).show();
      }
    });
    this.initButton();
  }

  //订单追评弹框
  addEvaluationOrder(evt) {
    let _orderAddModal = new Modal(_orderAddEvaluation());
    _orderAddModal.show();
    $(".js-add-order-evaluation-submit").on("click", (evt)=>this.addOrderEvaluationSubmit(evt))
  }

  //订单修改评价弹框
  modifyEvaluation(evt) {
    let xuanContent = $(".js-order-evaluation-change").siblings(".appraise-content").text()
    $("input.star").rating('enable');
    $(evt.currentTarget).addClass("hide")
    $(evt.currentTarget).siblings(".js-add-order-evaluaiton").addClass("hide")
    $(".deliver-evalution").removeClass("hide").addClass("js-modify-evaluation-submit");
    $(".js-order-evaluation-change").removeClass("hide");
    $(".js-order-evaluation-change .js-checklog-comment").text(xuanContent);
    $(".js-order-evaluation-change .js-checklog-comment-count").html(xuanContent.length);
    $("#remark-order-evaluation-content").addClass("hide");
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

  //提交订单追评
  addOrderEvaluationSubmit(evt) {
    let content = $(".add-order-evaluation-modal .js-add-evaluation-item .js-checklog-comment").val();
    let data = JSON.stringify({relateId:this.orderId,"firstEvaluate":false,relateType:1,content})
    // console.log(data);
    $.ajax({
      url: "/api/credit/evaluate/order-additional-comment",
      type: "POST",
      data: data,
      dataType: 'json',
      contentType: 'application/json',
      success: (data)=>{
        new Modal({
          icon: "success",
          title: "追评成功",
          content: "成功"
        }).show(()=>{window.location.reload();})
      }
    })
  }

  //订单修改后提交
  modifyEvaluationSubmit() {
    // console.log("修改订单提交")
    let changeEvaluateUrl = "/api/credit/evaluate/edit-order-comment"
    let type = "PUT"
    let evaluateTargetScoreLst = [];
    let content = $(".js-order-evaluation-change .js-checklog-comment").val();
    _.each($(".js-star-order"),(i)=>{
      let evaluateType = 1;
      let evaTargetId = $(i).data("evatargetid");
      let targetName = $(i).data("targetname");
      let evaluat = $(i).find(".star-rating-control").find(".star-rating-on").length;
      let evaluatReally;
      if(evaluat==0) evaluatReally=8;
      else evaluatReally = evaluat;
      evaluateTargetScoreLst.push({evaluateType,evaTargetId,score:evaluatReally*10,targetName});
    });
    let data = (JSON.stringify({"evaluateOrder":{relateId:this.orderId,relateType:1,content,firstEvaluate:false},evaluateTargetScoreLst}));
    this.evaluateOrderFunction(data,changeEvaluateUrl,type)
  }

  //初评订单和修改订单通用的方法
  evaluateOrderFunction(data,url,type) {
    $.ajax ({
      url: url,
      type: type,
      data: data,
      dataType: 'json',
      contentType: 'application/json',
      success:(data)=> {
        if($.query.get("hasComment")=="false")
          window.location.search = $.query.set("hasComment","true").set("orgId",this.userOrgId).set("flagSelf",1);
        else
          window.location.search = $.query.set("hasSupplierComment","true").set("orgId",this.userOrgId).set("flagSelf",1)
        $(".deliver-evalution").addClass("hide-mydefine")
      }
    });
  }

  //初始化按钮，是否可以修改，追评
  initButton() {
    let time = $(".js-order-first-time").text()
    let now = new Date()
    let nowDistance = now - new Date(time).valueOf()
    let days = nowDistance/(30*24*3600*1000)
    if (days > 1) {
      $(".js-modify-order-evaluation").addClass("hide")
      if (days > 6)
        $(".js-add-order-evaluaiton").addClass("hide")
    }
  }
}

module.exports = OrderEvaluation
