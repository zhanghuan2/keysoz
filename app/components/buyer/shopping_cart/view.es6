import Modal from "pokeball/components/modal"
const ItemServices = require('common/item_services/view')

class ShoppingCart {
  constructor($) {
    this.selectItem = $(".js-select-item");
    this.selectShopItem = $(".js-select-shop-item");
    this.batchSelectItem = $(".js-batch-select");
    this.itemDelete = $(".js-delete-item");
    this.itemBatchDelete = $(".js-delete-batch");
    this.cartSubmit = $(".wangchao .js-cart-submit");
    this.xieyiCartSubmit = $(".xieyi .js-cart-submit");
    this.requSubmit = $(".wangchao .js-cart-submitRequ");
    this.orderSubmit = $(".js-cart-submitOrder");
    this.itemInvalidDelete = $(".js-delete-invalid");
    this.wangchao = $(".wangchao");
    this.xieyi = $(".xieyi");
    this.vaccine = $(".vaccine");
    this.bindEvent();
    this.initItemStatus();
  };

  bindEvent() {
    this.sumEveryItem();
    this.totalSum(this.wangchao);
    this.totalItems(this.wangchao);
    this.totalSum(this.xieyi);
    this.totalItems(this.xieyi);
    this.totalSum(this.vaccine);
    this.totalItems(this.vaccine);
    // 左侧input 选择商品 change事件 o
    this.selectItem.on("change", (evt) => {
      var mParent;
      if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
        mParent = $(".wangchao");
      } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
        mParent = $(".xieyi");
      } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
        mParent = $(".vaccine");
      }
      this.checkOneItem(evt, mParent)
    });
    // 左侧iput 选择供应商 change事件 o
    this.selectShopItem.on("change", (evt) => {
      var mParent;
      if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
        mParent = $(".wangchao");
      } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
        mParent = $(".xieyi");
      } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
        mParent = $(".vaccine");
      }
      this.checkShopItems(evt, mParent)
    });
    // 左侧input 选择全部 change事件 o
    this.batchSelectItem.on("change", (evt) => {
      var mParent;
      if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
        mParent = $(".wangchao");
      } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
        mParent = $(".xieyi");
      } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
        mParent = $(".vaccine");
      }
      this.batchSelectItems(evt, mParent)
    });
    // 数量增加 + 点击事件 o
    $(".plus").on("click", (evt) => this.addAndMinusCount(evt));
    // 数量减少 - 点击事件 o
    $(".minus").on("click", (evt) => this.addAndMinusCount(evt));
    // 数量input 的blur事件 发送ajax 成功后修改数量 (协议商品 数量input需要带 data-thirdId) o
    $("input.count-number").on("blur", (evt) => this.changeCount(evt));
    // 数量input 的change事件 发送ajax 成功后修改数量 - (协议商品 数量input需要带 data-thirdId) o
    $("input.count-number").on("change", (evt) => this.changeCount(evt));
    // 单个商品右侧的删除事件 发送ajax 成功后刷新页面 o
    this.itemDelete.on("click", (evt) => this.deleteTheItem(evt));
    // 删除选中商品 点击事件 发送ajax 成功后刷新页面 o
    this.itemBatchDelete.on("click", (evt) => this.deleteBatchItem(evt));
    // 生成需求单 点击事件 发送ajax 成功后跳转页面 ???
    this.cartSubmit.on("click", (evt) => this.submitCart(evt, false));
    // 生成竞价单 点击事件 发送ajax 成功后跳转页面 ???
    this.xieyiCartSubmit.on("click", (evt) => this.xieyiSubmitCart(evt, false));
    //this.vaccineCartSubmit.on("click", (evt)=>this.vaccineSubmitCart(evt,false));
    // 直接生成采购单 点击事件 发送ajax 成功后跳转页面 ???
    this.requSubmit.on("click", (evt) => this.submitCart(evt, true));
    // 未知事件 ???
    this.orderSubmit.on("click", (evt) => this.submitOrder(evt));
    // 清除失效商品 点击事件 ???
    this.itemInvalidDelete.on("click", (evt) => this.deleteInvalidItems(evt));
    //初始化数字增减控件
    $('.input-amount').amount();
    // $(window).on({
    //   "scroll":(evt)=>this.runScroll(evt),
    //   "resize": (evt)=>this.runResize(evt)
    // });
    // $(window).scroll();

    $('.js-cart-create-order').on('click', this.createOrder)
  }

  //清除失效商品
  deleteInvalidItems(evt) {
    //console.log("清除失效商品");
    /*if($(evt.target).closest(".xieyi").length > 0){
     var dArr = [];
     $(".xieyi [data-thirdid]").each(function(){
     dArr.push($(this).attr("data-thirdid"));
     });
     $.ajax({
     url : "api/zcy/carts/invalid",
     type : "get",
     data : {
     goodsIds : dArr.join(",")
     },
     async : false,
     success : function(){

     }
     });
     }*/
    $.ajax({
      type: "DELETE",
      url: "/api/zcy/carts/out-date",
      success: function () {
        window.location.href = window.location.href;
      },
      error: (data) => {

      }
    });
  }

  /**
   * 直接生成订单
   * @param evt
   */
  createOrder(evt) {
    let $list = $(evt.target).closest("[data-newname]");
    let orderItems = [],
      totalMoney = 0,
      orderType = $(evt.target).data('orderType'),
      shopMap = {};
    $list.find('input.js-select-item:checked').each((i, el) => {
      let $tr = $(el).closest('tr'),
        item = $tr.data('item'),
        itemCount = $tr.find('input.count-number').val(),
        shopName = $tr.data('shop'),
        sellerId = $tr.data('sellerId'),
        shopItems = shopMap[shopName];
      if (!shopItems) {
        shopItems = {
          'shopName': shopName,
          'sellerId': sellerId,
          'items': []
        };
        shopMap[shopName] = shopItems;
        orderItems.push(shopItems);
      }
      itemCount = isNaN(itemCount) ? 0 : parseInt(itemCount);
      item.itemCount = itemCount;
      item.unbindCount = itemCount;
      item.plans = [];
      shopItems.items.push(item);
    })

    if (orderItems.length === 0) {
      new Modal({
        title: '温馨提示',
        icon: 'info',
        content: '您没有选择任何商品'
      }).show();
      return;
    }
    totalMoney = parseFloat($list.find(".total-price .currency").text())
    //前端暂存订单商品
    sessionStorage.setItem('orderItems', JSON.stringify({
      'totalMoney': totalMoney,
      'orderType': orderType,
      'data': orderItems
    }));
    window.location.href = `/buyer/create-order?fromCart=1&orderType=${orderType}`;
  }

  //直接提交商品到采购清单
  submitOrder(evt) {
    let skus;
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      skus = this.getSelectSkus($(".wangchao"));
    } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
      skus = this.getSelectSkus($(".vaccine"));
    }
    let url = '/api/zcy/carts/purchaser/submit';
    let cartClass = $(evt.currentTarget).data('cartClass');
    if (cartClass) {
      url = url + '?cartClass=' + cartClass;
    }
    $.ajax({
      type: "POST",
      url: url,
      data: skus,
      dataType: "text",
      contentType: 'application/json',
      success: (data) => {
        //转跳到采购单列表
        window.location.href = "/buyer/purchase-process?purchaseId=" + data;
      }
    });
  }

  //提交商品到预处理的需求清单
  //needSubmitRequ:判断是否需要与其他需求合并下单（采购经办人才是true，默认为false）
  submitCart(evt, needSubmitRequ) {
    //console.log("提交购物车测试～～");
    let skus = this.getSelectSkus($(".wangchao"));
    let orgId = $('.wangchao .shopping-cart-foot-operate').data("orgid");
    $.ajax({
      type: "POST",
      url: "/api/zcy/carts/submit",
      data: skus,
      dataType: "text",
      contentType: 'application/json',
      success: (data) => {
        // 直接生成采购单
        if (needSubmitRequ) {
          this.submitRequ(evt, data);
          // 生成 需求单
        } else {
          //console.log("success:"+data);
          window.location.href = "/buyer/requisition-process?reqId=" + data + "&orgId=" + orgId;
        }
      },
      error: (data) => {
        //console.log("error: "+data.responseText);
        let resultJson;
        try {
          resultJson = JSON.parse(data.responseText);
          if (resultJson.type == undefined) {
            let _resultJson = JSON.parse(resultJson);
            if (_resultJson.type != undefined) {
              resultJson = _resultJson;
            }
          }
          if (resultJson.type != undefined) {
            let type = resultJson.type;
            let errorMsg = resultJson.errorMsg;
            let errorCode = resultJson.errorCode;
            let ids = resultJson.ids
            new Modal({
              title: '温馨提示',
              icon: 'info',
              content: errorMsg
            }).show((evt) => {
            });
          }
        } catch (e) {
          new Modal({
            title: '温馨提示',
            icon: 'info',
            content: data.responseText
          }).show();
        }
      }
    });
  }

  //生成竞价单
  xieyiSubmitCart(evt, needSubmitRequ) {
    /*let skus = this.getSelectSkus($(".xieyi"));*/
    let arrs = this.getSelectXieyi($(".xieyi"));
    let orgId = $('.xieyi .shopping-cart-foot-operate').data("orgid");
    $.ajax({
      type: "post",
      url: "/lasvegas/finance/api/protocol/hall/saveHallRequirement",//早晚要改，参见app/components/goodsHall/spu_tab2/extend.coffee
      data: {jsonStr: JSON.stringify(arrs)},
      success: (data) => {
        var idData = data;
        new Modal({
          title: '温馨提示',
          icon: 'success',
          content: "生成竞价单成功"
        }).show(function () {
          // $(".xieyi .js-delete-batch").trigger("click");
          //坑 begin
          let ids = [];
          var thirdId = [];
          var mParent = $(".xieyi");
          _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
            ids.push($(checkbox).closest(".item-tr").data("id"));
            var thi = $(checkbox).closest(".item-tr").find("[data-thirdid]").attr("data-thirdid");
            if (thi.length > 0) {
              thirdId.push(thi);
            }
          });

          $.ajax({
            url: "/api/zcy/carts/batchDelete",
            type: "POST",
            data: {
              skuIds: ids.join(","),
              thirdIds: thirdId.join(","),
              classification: 1
            },
            success: () => {
              window.location = $("input[name=urlInquiry]").val() + "/agreementsupply/order/order?id=" + idData;
            }
          });
          // 坑 end
        });
      }
    });
  }

  vaccineSubmitCart(evt, needSubmitRequ) {
    /*let skus = this.getSelectSkus($(".xieyi"));*/
    let arrs = this.getSelectXieyi($(".vaccine"));
    let orgId = $('.vaccine .shopping-cart-foot-operate').data("orgid");
    $.ajax({
      type: "get",
      url: "/api/zcy/carts/purchaser/jingjiaSubmit",
      data: {jsonStr: JSON.stringify(arrs)},
      success: (data) => {
        var idData = data;
        new Modal({
          title: '温馨提示',
          icon: 'success',
          content: "生成采购单成功"
        }).show(function () {
          // $(".xieyi .js-delete-batch").trigger("click");
          //坑 begin
          let ids = [];
          var thirdId = [];
          var mParent = $(".vaccine");
          _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
            ids.push($(checkbox).closest(".item-tr").data("id"));
            var thi = $(checkbox).closest(".item-tr").find("[data-thirdid]").attr("data-thirdid");
            if (thi.length > 0) {
              thirdId.push(thi);
            }
          });

          $.ajax({
            url: "/api/zcy/carts/batchDelete",
            type: "POST",
            data: {
              skuIds: ids.join(","),
              thirdIds: thirdId.join(","),
              classification: 2
            },
            success: () => {
              window.location = $("input[name=urlInquiry]").val() + "/agreementsupply/order/order?id=" + idData;
            }
          });
          // 坑 end
        });
      }
    });
  }

  //与其他需求合并下单（采购经办人才有这个功能）
  //提交需求清单(变更需求单状态为已提交)
  submitRequ(evt, reqId) {
    $.ajax({
      type: "POST",
      url: "/api/requisitions/" + reqId,
      data: {status: 2},
      dataType: "json",
      success: (data) => {
        //console.log("success:"+data);
        window.location.href = "/buyer/select-requisitions";
      },
      error: (data) => {
        //console.log("error: "+data.responseText);
        let resultJson;
        try {
          resultJson = JSON.parse(data.responseText);
          if (resultJson.type == undefined) {
            let _resultJson = JSON.parse(resultJson);
            if (_resultJson.type != undefined) {
              resultJson = _resultJson;
            }
          }
          if (resultJson.type != undefined) {
            let type = resultJson.type;
            let errorMsg = resultJson.errorMsg;
            let errorCode = resultJson.errorCode;
            let ids = resultJson.ids
            new Modal({
              title: '温馨提示',
              icon: 'info',
              content: errorMsg
            }).show(() => {
              window.location.href = "/buyer/requisition-process?reqId=" + reqId;
            });
          }
        } catch (e) {
          new Modal({
            title: '温馨提示',
            icon: 'info',
            content: "提交失败：" + data.responseText
          }).show(() => {
            window.location.href = "/buyer/requisition-process?reqId=" + reqId;
          });
        }
      }
    });
  }

  getSelectSkus(mParent) {
    let skus = {};
    _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
      let status = true;
      let item = $(checkbox).closest(".item-tr");
      let skuId = item.data("id");
      let quantity = parseInt(item.find(".count-number").val());
      skus[skuId] = quantity;
    });
    skus = JSON.stringify(skus);
    //skus = JSON.parse(skus);
    //console.log(skus);
    return skus;
  }

  getSelectXieyi(mParent) {
    var arr = [];
    _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
      let status = true;
      let item = $(checkbox).closest(".item-tr");
      let skuId = item.data("id");
      let quantity = parseInt(item.find(".count-number").val());
      let goodsId = $(checkbox).data("thirdid");
      let oobj = {
        skuId: skuId,
        goodsId: goodsId,
        quanity: quantity
      };
      arr.push(oobj);
    });
    return arr;
  }

  //商品状态（库存紧张 or 库存不足）初始化，购买时间格式化
  initItemStatus() {
    let item_trs = $('.item-tr');
    item_trs.each((i, d) => {
      let stock = parseInt($(d).find("span.count-warning").data("stock"));
      let quantity = parseInt($(d).find("span.count-warning").data("quantity"));
      //console.log("stock="+stock+",quantity="+quantity);
      if (isNaN(stock) || isNaN(quantity)) {
        return true;
      }
      ;
      this.judgmentOfInventory($(d), stock, quantity);
    });
    //购买时间格式化
    let buyTime = $('.js-item-create-time');
    buyTime.each((i, d) => {
      let skuBuyTime = $(d).html();
      if (skuBuyTime != undefined) {
        let _buyDate = skuBuyTime.split(" ")[0];
        let _buyTime = skuBuyTime.split(" ")[1];
        let buyTimeHtml = '<div><span class="css-date">' + _buyDate + '</span><br /><span class="css-time">' + _buyTime + '</span></div>'
        $(d).html(buyTimeHtml);
      }
    });
    //显示商品服务信息
    new ItemServices('.js-item-services').showServiceInfo()
  }

  //判断商品与库存的关系
  //如果商品选购数量-库存<0，则提示库存不足，而且禁止手动勾选该商品
  //如果商品数量大于0小于等于3，则库存紧张
  //stock:库存；quantity：选购数量
  judgmentOfInventory(el, stock, quantity) {
    if (el.closest("[data-newname]").hasClass(".xieyi")) {
      return;
    }
    const left = stock - quantity;
    //剩余为负数，或者库存为0，均为库存不足
    if (left < 0 || stock == 0) {
      //console.log("商品不足！"+(stock-quantity));
      el.find("span.count-warning").css("display", "none");
      el.find("span.count-wrong").css("display", "block");
      //如果商品不足，则禁用选择框
      el.find("input.js-select-item").prop("checked", false);
      el.find("input.js-select-item").prop("disabled", true);
      el.addClass('low-stocks-item');
    } else if (0 <= left && left <= 3) {
      //console.log("商品紧张！"+(stock-quantity));
      el.find("span.count-warning").css("display", "block");
      el.find("span.count-wrong").css("display", "none");
      el.find("input.js-select-item").prop("disabled", false);
      el.removeClass('low-stocks-item');
    } else {
      //console.log("商品正常！"+(stock-quantity));
      el.find("span.count-warning").css("display", "none");
      el.find("span.count-wrong").css("display", "none");
      el.find("input.js-select-item").prop("disabled", false);
      el.removeClass('low-stocks-item');
    }
    ;
  }

  //选中单个商品
  checkOneItem(evt, mParent) {
    $(this).closest("tr").removeClass("fail-item");
    let shopId = $(evt.target).closest(".item-tr").data("site");
    if (!($(evt.target).prop("checked"))) {
      mParent.find(".shop-tr[data-shop=" + shopId + "] .js-select-shop-item").prop("checked", false);
      mParent.find(".js-batch-select").prop("checked", false);
    }
    this.selectItemCount(mParent);
    this.totalSum(mParent);
  }


  //选中一个店铺的商品
  checkShopItems(evt, mParent) {
    //console.log("选中一个店铺的商品");
    let shopId = $(evt.target).closest(".shop-tr").data("shop");
    if (mParent.find(evt.target).prop("checked")) {
      mParent.find(".item-tr[data-site=" + shopId + "] .js-select-item").prop("checked", true);
    } else {
      mParent.find(".js-batch-select").prop("checked", false);
      mParent.find(".item-tr[data-site=" + shopId + "] .js-select-item").prop("checked", false);
    }
    //将购物车里面库存不足的商品去除勾选
    let shopItems = mParent.find(".item-tr[data-site=" + shopId + "]");
    shopItems.each(function (i, e) {
      if ($(e).hasClass("low-stocks-item")) {
        $(e).find(".js-select-item").prop("checked", false);
        $(e).closest(".shop-tr").prop("checked", false);
      }
    });
    this.selectItemCount(mParent);
    this.totalSum(mParent);
  }

  //全选商品
  batchSelectItems(evt, mParent) {
    //console.log("全选商品");
    if (mParent.find(evt.target).prop("checked")) {
      mParent.find(".js-select-item").prop("checked", true);
      mParent.find(".js-select-shop-item").prop("checked", true);
      let shopItems = mParent.find(".js-select-item").closest(".item-tr");
      shopItems.each(function (i, e) {
        if ($(e).hasClass("low-stocks-item")) {
          $(e).find(".js-select-item").prop("checked", false);
        }
      });
    } else {
      mParent.find(".js-select-item").prop("checked", false);
      mParent.find(".js-select-shop-item").prop("checked", false);
    }
    this.selectItemCount(mParent);
    this.totalSum(mParent);
  }

  //手动更改商品数量（input控件修改）
  changeCount(evt) {
    //console.log("手动更改商品数量");
    let input = $(evt.target);
    let count = input.val();
    var mParent;
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      mParent = $(".wangchao");
    } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
      mParent = $(".xieyi");
    } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
      mParent = $(".vaccine");
    }
    let stock = parseInt($(evt.target).closest(".item-tr").find("span.count-warning").data("stock"));
    if (count == "" || count <= 0) {
      input.val(1);
      input.trigger("blur");
    }
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      if (count > stock) {
        input.val(stock);
        count = stock;
        input.trigger("blur");
      }
      //判断商品与库存的关系
      this.judgmentOfInventory($(evt.target).closest(".item-tr"), stock, count);
    }
    // 当前商品 总价
    this.sumItem($(evt.target).closest(".item-tr"));
    // 统计选中商品的总价
    this.totalSum(mParent);
    // 修改商品数量 发送ajax (协议商品 数量input需要带 data-thirdId)
    this.changeNumber(input, mParent);
  }

  //点击加减按钮修改商品数量（自动触发input的change事件）
  addAndMinusCount(evt) {
    let input = $(evt.target).siblings("input.count-number");
    let count = input.val();
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      let stock = parseInt($(evt.target).closest(".item-tr").find("span.count-warning").data("stock"));
      if (count > stock) {
        input.val(stock);
        count = stock;
      }
    }
  }

  //old: /api/cart
  //new: /api/zcy/carts
  // 修改商品数量ajax请求
  changeNumber(el, mParent) {
    //如果商品数量的初始值不存在，则先加上
    if (isNaN(el.data("number"))) {
      let oldValue = el.data("init");
      el.data("number", oldValue);
    }
    var sendObj = {
      // 收集协议id
      thirdId: el.closest(".item-tr").find("[data-thirdid]").attr("data-thirdid") || "",
      skuId: el.parents("tr").data("id"),
      quantity: el.val() - el.data("number"),
    };
    if (mParent.hasClass("wangchao")) {
      sendObj.classification = 0;
    } else if (mParent.hasClass("xieyi")) {
      sendObj.classification = 1;
    } else if (mParent.hasClass("vaccine")) {
      sendObj.classification = 2;
    }
    //sendObj.classification = mParent.hasClass("wangchao") ? 0 : 1;
    $.ajax({
      url: "/api/zcy/carts",
      type: "PUT",
      data: sendObj,
      success: (data) => {
      }
    });
    el.data("number", el.val());
  }

  //删除单个商品
  deleteTheItem(evt) {
    let id = $(evt.target).closest(".item-tr").data("id");
    let mParent;
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      mParent = $(".wangchao");
    } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
      mParent = $(".xieyi");
    } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
      mParent = $(".vaccine");
    }
    let thirdId = [];
    let thi = $(evt.target).closest(".item-tr").data('id');
    if (thi.length > 0) {
      thirdId.push(thi);
    }
    this.deleteItem(id, mParent, thirdId);
  }

  //批量删除商品
  deleteBatchItem(evt) {
    let ids = [];
    var thirdId = [];
    var mParent;
    if ($(evt.target).closest("[data-newname]").hasClass("wangchao")) {
      mParent = $(".wangchao");
    } else if ($(evt.target).closest("[data-newname]").hasClass("xieyi")) {
      mParent = $(".xieyi");
    } else if ($(evt.target).closest("[data-newname]").hasClass("vaccine")) {
      mParent = $(".vaccine");
    }
    _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
      ids.push($(checkbox).closest(".item-tr").data("id"));
      var thi = $(checkbox).closest(".item-tr").find("[data-thirdid]").attr("data-thirdid");
      if (thi.length > 0) {
        thirdId.push(thi);
      }
    });
    this.deleteItem(ids.join(","), mParent, thirdId);
  }

  //发送删除商品请求
  deleteItem(ids, mParent, thirdId) {
    var obj = {
      skuIds: ids,
      thirdIds: thirdId.join(",")
    };
    if (mParent.hasClass("wangchao")) {
      obj.classification = 0;
    } else if (mParent.hasClass("xieyi")) {
      obj.classification = 1;
    } else if (mParent.hasClass("vaccine")) {
      obj.classification = 2;
    }
    $.ajax({
      url: "/api/zcy/carts/batchDelete",
      type: "POST",
      data: obj,
      success: () => {
        window.location.reload()
      }
    });
  }

  //统计选中商品的总价
  totalSum(mParent) {
    let sum = 0;
    _.each(mParent.find(".js-select-item:checked"), (checkbox) => {
      let subtotal = $(checkbox).closest(".item-tr").find(".item-subtotal");
      sum += parseFloat($(subtotal).text());
    });
    mParent.find(".total-price .currency").text(sum.toFixed(2));
  }

  //循环每个商品用于计算每个商品价格
  sumEveryItem() {
    _.each($(".item-tr"), (item) => {
      this.sumItem(item);
    });
  }

  //计算每个商品的价格
  sumItem(item) {
    //如果商品是下架的 直接显示0元
    if ($(item).hasClass("off-shelf-item")) {
      $(item).find(".item-subtotal").text("0.00");
      return;
    }
    let unitPrice = $(item).find(".price").text();
    let count = parseInt($(item).find(".count-number").val());
    $(item).find(".count-number").val(count);
    $(item).find(".item-subtotal").text((unitPrice * count).toFixed(2));
  }

  //统计购物车状态是否到达50
  totalItems(mParent) {
    let total = 0;
    _.each(mParent.find(".item-tr"), (item) => {
      total++;
    });
    mParent.find(".fill-count").text(total);
    mParent.find(".bar").css("width", total / 50 * 100);
  }

  //统计选中的商品数量
  selectItemCount(mParent) {
    let totalCount = 0;
    _.each(mParent.find(".js-select-item:checked"), (item) => {
      totalCount++
    });
    mParent.find(".total-count").text(totalCount);
    if (totalCount != 0) {
      mParent.find(".js-cart-submit").removeAttr("disabled");
      mParent.find(".js-cart-submitRequ").removeClass("hide");
      mParent.find(".js-cart-submitOrder").removeAttr("disabled");
      mParent.find('.js-cart-create-order').prop("disabled", false);
    } else {
      mParent.find(".js-cart-submit").attr("disabled", true);
      mParent.find(".js-cart-submitRequ").addClass("hide");
      mParent.find(".js-cart-submitOrder").attr("disabled", true);
      mParent.find('.js-cart-create-order').prop("disabled", true);
    }
  }

  //滚动滚动条保证购物车状态栏悬浮于同一位置
  runScroll(evt) {
    let footDiv = $(".shopping-cart-foot");
    let originY = $(".shopping-cart-body").offset().top + $(".shopping-cart-body").height();
    if (footDiv.offset().top > originY && footDiv.hasClass("float-foot")) {
      footDiv.removeClass("float-foot");
    }
    if (!footDiv.hasClass("float-foot") && (originY - $(".float-hidden").offset().top) > ($(window).height() - footDiv.height())) {
      footDiv.addClass("float-foot");
      footDiv.css("top", $(window).height() - footDiv.height());
      footDiv.css("left", ($(".shopping-cart-body").offset().left - 1));
    }
  }

  runResize(evt) {
    let footDiv = $(".shopping-cart-foot")
    footDiv.removeClass("float-foot")
    this.runScroll();
  }

}

module.exports = ShoppingCart;
