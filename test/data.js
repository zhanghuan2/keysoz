var DataMocker = {
  urls: {
    "/base/privileges/page/check":function() {
      return true;
    },
    "/base/district/detail":function() {
      var data = {
        "total":'50',
        "data":[
          {
            "id":'1',
            "displayNo":'2444555',
            "organName":'的范德萨发大水',
            "name":'test1',
            "gpcategoryName":'规范大多数',
            "publishedAt":'1521009097582',
            "stutas":'生效'
          }
        ]
      };
      return data;
    },
    "/api/zcy/businessType/create":function() {
      return true;
    },
    "/api/zcy/businessTyp222e/update":function() {
      return true;
    },
    "/api/zcy/businessType/update":function() {
      return true;
    },
    "/api/aa/bbb":function() {
      return true;
    },
    "/api/aasd/asdasd":function() {
      return true;
    }
  },
  comps: {
    "comps/demo/table/list":function(){
      var data = {
        "total":'50',
        "data":[
          {
            "id":'1',
            "displayNo":'2444555',
            "organName":'的范德萨发大水',
            "name":'test1',
            "gpcategoryName":'规范大多数',
            "publishedAt":'1521009097582',
            "stutas":'生效'
          }
        ]
      }
      return data;
    },
    "demo/table/list":function(){
      var data = {
        "total":'50',
        "data":[
          {
            "id":'1',
            "displayNo":'2444555',
            "organName":'的范德萨发大水',
            "name":'test1',
            "gpcategoryName":'规范大多数',
            "publishedAt":'1521009097582',
            "stutas":'生效'
          }
        ]
      }
      return data;
    }

  }
};

module.exports = DataMocker;
