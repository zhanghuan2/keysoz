const Pagination = require('pokeball/components/pagination');
const recordList=Handlebars.templates['fixed/car_maintenance_detail/templates/recordList'];

class carMaintenanceDetail {
  constructor() {
    this.supplierId = $('.fixedpro-summary').data('supplierid');
    $('.tab-navs').zcySticky({
      idParams: ['introduction', 'repair-content', 'fitting-price', 'service-promise','deal-record'],
      itemClass: 'menuItem',
      itemHover: 'active',
      topMargin: 'auto',
      zIndex: 980
    })

    this.fittingForm = $('#fitting-form')
    this.fittingForm.on('submit', (e) => this.fittingFormSubmit(e)) //搜索

    //分页
    this.totalFitItems = $('.pagination').data('total') // 配件信息总数量
    this.pagination = new Pagination('.pagination');
    this.pagination.total(this.totalFitItems).show($('.pagination').data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      maxPage: -1,
      page_size_switch: true,
      perpage: 10,
      //复写callback，实现ajax局部刷新
      callback: (function (_this) {
        return function (curr, pagesize) {
          _this.getFittingData(false, (parseInt(curr) + 1), pagesize)
            .then(function (data) {
              carMaintenanceDetail.dataTable(data)
            })
          $('.pagination select:not(.noselectric)').selectric() //局部刷新 selectric 调用
          return false;
        };
      })(this)
    })

    /*------------------------交易记录分页开始------------------------------*/
    //交易记录分页初始化
    $.ajax({
      url: '/api/vehicle/repairment/pageBuyRecord',
      dataType: 'json',
      data: {
        supplierId: this.supplierId,
        pageNo:1
      }
    }).done((data)=>{
      $('#deal-record-list-tbody').html(recordList(data.result));
      let here=this;
      let recordPagination=new Pagination('.record-pagination').total(data.result.total).show(10,{
        num_display_entries: 5,
        jump_switch: true,
        callback: function (curr, pagesize) {   //局部刷新回调
            $.ajax({
              url: '/api/vehicle/repairment/pageBuyRecord',
              dataType: 'json',
              data: {
                supplierId: here.supplierId,
                pageNo: (curr+1)|| 1
              }
            })
            .then(function (res) {
              $('#deal-record-list-tbody').html(recordList(res.result));
            })
            return false;
          }
      })
    })
    /*----------------------交易记录分页结束------------------------*/

    this.projectName = $('input[name=name]').val() || '';
    this.accessoriesTypeCode = $('input[name=accessoriesTypeCode]').val() || '';

    this.ToggleFittingTree()
    this.initFittingTree()
  }

  initFittingTree() {
    let fittingTree;
    let _this = this;
    fittingTree = $('#fitting-tree').jstree({
      core: {
        strings: {
          'Loading ...': '加载中...'
        },
        data: {
          url: '/api/vehicle/repairment/accessories/getChildren',
          dataType: 'json',
          data: function (node) {
            let pid = _this.getId(node.id) || ''
            return {'pid': pid}
          }
        },
        fix: function (data) {
          let pNode = data.result;
          for (let i in pNode) {
            let sNode = pNode[i]
            sNode.id = sNode.code + '-' + sNode.id
            sNode.text = sNode.name
            sNode.children = sNode.hasChildren
          }
          let d = data.result;
          return d;
        },
        themes: {
          icons: false
        },
        dblclick_toggle: false,
        worker: false
      }
    }).bind('select_node.jstree', function (node, selected) {
      if (selected.node.children.length > 0) {
        fittingTree.jstree().deselect_all()
        $('input[name=accessoriesName]').val('').blur()
        $('input[name=accessoriesTypeCode]').val('')
        return false;
      }
      selected.event.bubbles = false;
      let Node = selected.node;
      $('input[name=accessoriesName]').val(Node.text).blur()
      $('input[name=accessoriesTypeCode]').val(_this.getCode(Node.id))
      // $('#partsSelect').hide()
    }).bind('ready.jstree', function () {
      fittingTree.jstree().select_node($('input[name=accessoriesTypeCode]').val())
    });
  }

  /* 入参是treeid */
  getCode(treeNodeId) {
    var regExp = /(.+)-(\d+)/;
    if (true === regExp.test(treeNodeId)) {
      return RegExp.$1;
    } else {
      console.log('获取Code失败，错误的树编码：' + treeNodeId);
    }
  }

  /* 入参是treeNodeid */
  getId(treeNodeId) {
    var regExp = /(.+)-(\d+)/;
    if (true === regExp.test(treeNodeId)) {
      return RegExp.$2;
    } else {
      console.log('获取Id失败，错误的树编码：' + treeNodeId);
    }
  }

  fittingFormSubmit(evt, pageNo, pageSize) {
    evt.preventDefault();
    let that = this;
    this.getFittingData(true, pageNo, pageSize)
      .then(function (data) {
        return carMaintenanceDetail.dataTable(data)
      })
      .then(function (searchNum) {
        //搜索局部刷新,需要重置分页页数
        that.pagination.total = searchNum
        that.pagination.show($('.pagination').data('size'), {
          current_page: pageNo,
          num_display_entries: 5,
          jump_switch: true,
          maxPage: -1,
          page_size_switch: true,
          perpage: 10,
          //复写callback，实现ajax局部刷新
          callback: (function (_this) {
            return function (curr, pagesize) {
              _this.getFittingData(false, (parseInt(curr) + 1), pagesize)
                .then(function (data) {
                  carMaintenanceDetail.dataTable(data)
                })
              $('.pagination select:not(.noselectric)').selectric() //局部刷新 selectric 调用
              return false;
            };
          })(that)
        })

      })

  }

  getFittingData(searchFlag, pageNo, pageSize) {
    //必填的两个字段
    if (searchFlag) {
      this.accessoriesTypeCode = $('input[name=accessoriesTypeCode]').val() || '';
      this.projectName = $('input[name=name]').val() || '';
      //待完善
      //只做了输入为空的限制，view.hbs使用了readonly，选择一个即可
      if ($('input[name=accessoriesName]').val().trim() === '') {
        this.accessoriesTypeCode = '';
      }
    }

    return $.ajax({
      url: '/api/vehicle/repairment/accessories/findPage',
      dataType: 'json',
      data: {
        supplierId: this.supplierId,
        accessoriesTypeCode: this.accessoriesTypeCode,
        name: this.projectName,
        pageNo: pageNo || 1,
        pageSize: pageSize || 10
      }
    })

  }

  ToggleFittingTree() {
    $('input[name=accessoriesName]').focus(function (e) {
      e.stopPropagation()
      $('#partsSelect').show()
    })

    $(document).click(function (e) {
      if (e.target.getAttribute('name') !== 'accessoriesName' &&
        e.target.getAttribute('class') !== 'jstree-anchor' &&
        e.target.getAttribute('role') !== 'presentation') {
        $('#partsSelect').hide()
      }
    })
  }

  static formatPrice(price) {
    if (!price) {
      return ''
    }
    let formatedPrice = (price / 100).toFixed(2)
    let roundedPrice = parseInt(price / 100).toFixed(2)
    return formatedPrice == roundedPrice ? roundedPrice : formatedPrice
  }

  static dataTable(data) {
    let dataArr = data.result.data || [];
    let searchNum = data.result.total || 0;
    let szresult = '';

    $.each(dataArr, function (index, data) {
      szresult += `<tr>
                    <td>${data.name}</td>
                    <td>${data.accessoriesTypeName}</td>
                    <td>${data.vehicleBrandName}</td>
                    <td>${data.specifications}</td>
                    <td>${carMaintenanceDetail.formatPrice(data.price)}</td>
                    <td>${data.guarantee}</td>
                    <td>${data.productionPlace}</td>
                    <td>${data.source}</td>
                    </tr>`
    })
    $('#fitting-list-tbody').html(szresult)
    return searchNum
  }

}

module.exports = carMaintenanceDetail;
