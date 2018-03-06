var Cookie = require("common/cookie/view");
const categoryListTpl = Handlebars.templates['tax-hall/category-index/templates/category-list'];

export default class CategoryIndex {
    constructor() {
        const that = this;
        that.init();
    }
    init(){
        let distCode = Cookie.getCookie("districtCode") || "001000";
        const envHref = $('input[name=envHref]').val();
        const href = $("#navbar_collapse").data("href");

        $.ajax({
            url: `${envHref}/api/agrsuppmng/getFrontCatalog`,
            type: 'GET',
            dataType: 'jsonp',
            data : {
                distCode : distCode
            },
            jsonp: 'callback',
            success: function (data) {
                // console.log(data);
                $(".js-category-list").append(categoryListTpl({"data":data,"href": href}));
//                 let str = "";
//                 data.forEach(function (item,index) {
//                     str += `
//         <div class="category-li " data-id="${item.status}" id="categoryLi">
//             <div class="parent-category">
//                 <a href="${item._HREF_.main}/search?nodeId=${item.id}" target="_blank" class="child-category"
//                      title="${item.displayName}" data-title="${item.statusMemo}">
//                     ${item.displayName}
//                 </a>
//             </div>
//         </div>
// `
//                 })
//                 $(".js-category-list").append(str);
//                 $("#categoryLi").map(function (index,item) {
//                     if($(item).data("id") != 1) {
//                         $(item).removeClass("category-li ").addClass("category-li-disable ");
//                         $(item).find("a").removeAttr("title").attr("title",$(item).data("title"));
//                     }
//                 })

            }
        })
    }
}

