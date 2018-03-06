
    let that = "";



    class procurementInfoServers {

        constructor() {

        }

        bindevents() {

        }

        ajax() {

        }



        // 删除
        ajaxDelete(/* id */ i, /* done */ d) {

            $.post('/api/demand/response/delete/' + i, {}, function (/* response */ r) {d(r.success, r.success ? '删除' : r.error)});

        }

    }



    module.exports = new procurementInfoServers();
