class ContrastDetail {
  constructor($) {
    this.itemTitleContent = $(".item-title-content");
    this.highLight = $("input[type=checkbox]");
    this.arrowUpDown = $(".arrow-up-down");
    this.bindEvent();
    this.init();
  }

  init(){
    var length = $.query.get("goodIds").split(",").length;
    $(".product-pro li").each(function(){
      var t = $(this);
      if(!t.prop("className")){
        t.addClass("hide");
      }
    });
    $(".brands-name td").each(function(){
      var t = $(this);
      if(!t.prop("className")){
        t.addClass("hide");
      }
    });
    $(".compare-tr").each(function(){
      if(length === 2){
        $(this).find("td").eq(2).addClass("hide");
        $(this).find("td").eq(3).addClass("hide");
      }else if(length === 3){
        $(this).find("td").eq(3).addClass("hide");
      }
    });
    /* 设置样式 */
    $(".first").css("width",$(".brands-name th").outerWidth() + 1 + "px");
    $(".first-flow").css("width",$(".brands-name th").outerWidth() + 1 + "px");
    $(".product-name").css("width",$(".compare-td").eq(0).outerWidth() + "px");

  }

  bindEvent() {
    var length = $(".product-name").length;
    if(length<4)
    for(let i=0;i<4-length;i++) {
      $(".compare-tab").find(".compare-tr").append("<td></td>");
      $(".product-pro").append("<li></li>");
      $(".brands-name").find("tr").append("<td></td>");
    }
    this.arrowUpDown.on("click",this.titleItemContent);
    this.itemTitleContent.on("click",this.titleItemContent);
    this.highLight.on("change",this.lightHigh);
    this.browerPosition();

  }

  titleItemContent() {
    let _this = $(this).closest(".item-title")
    $(this).closest("thead").siblings("tbody").toggle(100);
    $(_this).find(".arrow-down-open").toggle(100);
    $(_this).find(".arrow-up-close").toggle(100);
  }

  browerPosition() {
    $(window).scroll(function(event){
      var winPos = $(window).scrollTop();
      $(".change-input p").remove();
      $(".js-check-item br").remove();
      if(winPos>50) {
        $(".change-input").prepend("<p>商品概况</p>");
        $(".js-check-item").addClass("change-input");
        $(".js-check-item span").after("<br><br>");
        $(".product-flow").addClass("fixed");
        $(".first").addClass("hide");
        $(".first-flow").removeClass("hide");
      }
      else if(winPos<=50) {
        $(".js-check-item").removeClass("change-input");
        $(".product-flow").removeClass("fixed")
        $(".first").removeClass("hide");
        $(".first-flow").addClass("hide");
      }
    });
  }

  lightHigh() {
    // 高亮显示不同项  品牌
    var mchecked = $(".highlight-diff").prop("checked");
    var mbrands = $(".brands-name .td-brands");
    var mmtype = mbrands.eq(0).text().trim() !== mbrands.eq(1).text().trim();
    if(mchecked && mmtype){
      $(".brands-name").addClass("highlight");
    }else{
      $(".brands-name").removeClass("highlight");
    }


    if(!$(".highlight-same").is(":checked"))
      $(".connect-same").attr("checked",false);
    else
      $(".connect-same").attr("checked",true);
    if(!$(".highlight-diff").is(":checked"))
      $(".high-light").attr("checked",false);
    else
      $(".high-light").attr("checked",true);
    let $td = $(".product-name");
    let $tr = $(".compare-tab").find("tbody tr");
    let tr = $tr.length;
    let td =$td.length;
    $(".compare-tab").find("tbody tr").removeClass("hide");
    $(".compare-tab").find("tbody tr").removeClass("highlight");
    if($(".highlight-same").is(":checked")) {
      if($(".highlight-diff").is(":checked")) {
      $(".compare-tab").find("tbody tr").addClass("hide");
      for(var j=0;j<tr;j++) {
          for(let i=0;i<td;i++) {
            if($.trim($tr.eq(j).find("td").eq(i).text())!=$.trim($tr.eq(j).find("td").eq((i+1)%td).text())) {
              $(".compare-tab").find("tbody tr").eq(j).addClass("highlight");
              $(".compare-tab").find("tbody tr").eq(j).removeClass("hide");
            }
          }
        }
      }
      else {
        $(".compare-tab").find("tbody tr").addClass("hide");
        for(var j=0;j<tr;j++) {
          for(let i=0;i<td;i++) {
            if($.trim($tr.eq(j).find("td").eq(i).text())!=$.trim($tr.eq(j).find("td").eq((i+1)%td).text())) {
              $(".compare-tab").find("tbody tr").eq(j).removeClass("hide");
            }
          }
        }
      }
    }
    else {
      if($(".highlight-diff").is(":checked")) {
        for(var j=0;j<tr;j++) {
          for(var i=0;i<td;i++) {
            if($.trim($tr.eq(j).find("td").eq(i).text())!=$.trim($tr.eq(j).find("td").eq((i+1)%td).text())) {
              $(".compare-tab").find("tbody tr").eq(j).addClass("highlight");
            }
          }
        }
      }
      else {

      }
    }
  }

  lightHighN() {
    if(!$(".connect-same").is(":checked"))
      $(".highlight-same").attr("checked",false);
    else
     $(".highlight-same").attr("checked",true);
    if(!$(".high-light").is(":checked"))
     $(".highlight-diff").attr("checked",false);
    else
     $(".highlight-diff").attr("checked",true);
  }
}

export default ContrastDetail
