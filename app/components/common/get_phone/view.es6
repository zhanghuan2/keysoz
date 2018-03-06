import Modal from "pokeball/components/modal"
class GetPhone {
  constructor($) {
    this.$jsGetPhone = ".js-get-phone"
    this.bindEvent()
  }

  bindEvent() {
    $(document).on("click", this.$jsGetPhone, this.queryPhoneNumber)
  }

  queryPhoneNumber() {
    let userId = $(this).data("user-id")
    let userType = $(this).data("user-type")
    $.ajax({
      url: "/api/zcy/orders/getPurchaserOrSupplierPhone",
      type: "GET",
      data: `userId=${userId}&userType=${userType}`,
      success: (data)=>{
        new Modal({
          title: "成功查询",
          icon: "success",
          content: "联系人电话:" + data
        }).show();
      },
      error: (data)=>{
        new Modal({
          title: "查询失败",
          icon: "error",
          content: data.responseText
        }).show();
      }
    })
  }
}
module.exports = GetPhone
