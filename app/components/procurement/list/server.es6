
    let that = "";



    class procurementListServers {

        constructor() {

        }

        bindevents() {

        }

        ajax() {

        }



        // 发布
        ajaxPublish(/* id */ i, /* done */ d) {
            let id = $(i).parents("tr").data("id");
            let callback = arguments[1];
            ZCY.post({
               url:"/api/demand/publish/"+id,
               success:function(data){
                 callback(data,"发布")
               }
            });
        }

        // 取消
        ajaxCancel(/* id */ i, /* done */ d) {
            let id = $(i).parents("tr").data("id");
            let callback = arguments[1];
            ZCY.post({
                url:"/api/demand/cancel/"+id,
                success:function(data){
                    callback(data,"取消")
                }
            });
        }

        // 删除
        ajaxDelete(/* id */ i, /* done */ d) {
            let id = $(i).parents("tr").data("id");
            let callback = arguments[1];
            ZCY.post({
                url:"/api/demand/delete/"+id,
                success:function(data){
                    callback(data,"删除")
                }
            });
        }
        ajaxIgnore(/* id */ i, /* done */ d) {
            let id = $(i).parents("tr").data("id");
            let callback = arguments[1];
            ZCY.post({
                url:"/api/demand/ignore/"+id,
                success:function(data){
                    callback(data,"忽略")
                }
            });
        }

    }



    module.exports = new procurementListServers();
