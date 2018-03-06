const Pagination = require("pokeball/components/pagination")
const Modal = require("pokeball/components/modal")
const ComplexSearch = require("common/complex_search/extend")
const submitTemplate = Handlebars.templates["seller/brand_manage/templates/submit"]
const deleteTemplate = Handlebars.templates["seller/brand_manage/templates/delete"]

class brandManage {
  constructor($) {
    new ComplexSearch({
      tabElem: ".tab",
      searchElem: ".search",
      searchResetParams: ['pageNo'],
      param: {
        brandName: {
          inJson: false
        },
        type: {
          inJson: false
        },
        status: {
          inJson: false
        }
      }
    });

    this.itemDelete = $(".js-delete")
    this.itemSubmit = $(".js-submit")
    this.pagination = $(".item-pagination")

    this.bindEvent()
  }

  bindEvent() {
    this.itemDelete.on("click", evt => this.deleteItem(evt))
    this.itemSubmit.on("click", evt => this.submitItem(evt))
    $("body").on("keyup", "#js-examine-reason", function() {
      $(".js-examine-submit").attr("disabled", $(this).val() === "")
    })

    new Pagination(this.pagination).total(this.pagination.data("total")).show(this.pagination.data("size"), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })
  }

  //删除申请
  deleteItem(evt) {
    let deleteModal = new Modal(deleteTemplate());
    deleteModal.show();
    let vm = this;
    $(".js-examine-submit").on("click", function() {
      let items = $(evt.currentTarget).closest("tr").data("workid")
      vm.itemDeleteStatus(items)
      deleteModal.close()
    })
  }

  //删除商品
  itemDeleteStatus(workflowId) {
    $("body").spin("medium")
    $.ajax({
      url: "/api/brands/supplier/delete-audit",
      type: "POST",
      data: {
        "workflowId": workflowId
      },
      success: () => {
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

  //提交审核申请
  submitItem(evt) {
    let submitModal = new Modal(submitTemplate());
    submitModal.show();
    let vm = this;
    let urlType = $(evt.currentTarget).data("type");
    $(".js-examine-submit").on("click", function(event) {
      $(event.currentTarget).prop('disabled', true)
      let bizId = $(evt.currentTarget).closest("tr").data("id")
      let workflowId = $(evt.currentTarget).closest("tr").data("workid")
      vm.itemSubmitStatus(bizId,workflowId,urlType)
      submitModal.close();
    })
  }

  //提交审核商品
  itemSubmitStatus(bizId,workflowId,urlType) {
    $("body").spin("medium")
    let url = urlType=="0"?"/api/brands/supplier/submit-create":"/api/brands/supplier/submit-change"
    let data = {
        "bizId": bizId,
        "workflowId": workflowId,
        "auditResult":"SUBMIT_AUDIT"
      }
    $.ajax({
      url: url,
      type: "POST",
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: () => {
        new Modal({
          icon: "success",
          title: "提交成功"
        }).show(()=>{window.location.reload()})
      },
      complete: () => {
        $("body").spin(false)
      }
    })
  }

}

module.exports = brandManage