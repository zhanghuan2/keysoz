/**
 * 网超商品审核
 */
const Pagination = require('pokeball/components/pagination')
const ComplexSearch = require('common/complex_search/extend')
const TableCheckbox = require('common/table_checkbox/extend')
const Modal = require('pokeball/components/modal')
const checkTemplate = Handlebars.templates['seller/item_check/templates/check']
let _modal
// 审核状态1,初审,2终审
const CHECKSTATUS = {
  'FIRST': 1,
  'FINAL': 2
}

class Item_check_new {

  constructor () {
    this.pagination = $('.item-pagination');
    new Pagination(this.pagination).total(this.pagination.data('total')).show(this.pagination.data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })
    new ComplexSearch({
      searchElem: '.search',
      searchBtn: '#searchBtn',
      clearBtn: '#resetBtn',
      searchResetParams: ['pageNo'],
      saveSearchStatus: false,
      param: {
        supplierId: {
          inJson: false
        }
      }
    })

    if($('#noRecord').length == 0){
      if($('.js-item-checkFirst').length > 0 || $('.js-item-checkFinal').length > 0){
        new TableCheckbox('#checkTable')
      }
    }

    $("select[name='shopId']").select2({
      placeholder: '请选择',
      allowClear: true,
      ajax: {
        url: '/api/zcy/shop/list',
        dataType: 'json',
        delay: 500,
        data: function (params) {
          if (params.term == undefined) {
            return {
              name: '',
              pageSize: 20,
              pageNo: 1
            }
          }
          return {
            name: params.term.trim(),
            pageSize: 20,
            pageNo: 1
          }
        },
        error: function (e) {
          console.log(e)
        },
        processResults: function (data) {
          let resultData = data.data;
          let tempResults = []
          if (resultData === undefined) {
            return {
              results: tempResults
            }
          }
          else {
            for(let i=0; i < resultData.length; i++){
              let option = {};
              option.id = resultData[i].id;
              option.text = resultData[i].name;
              tempResults.push(option);
            }
            return {
              results: tempResults
            }
          }
        },
        cache: true
      }
    }).on('change', (evt) => {
      let name = $(evt.currentTarget).find('option:selected').text();
      $('.supplierNameStore').val(name);
    });
    
    this.bindEvent()
    this.navStyle()
  }

  /**
   * 绑定事件
   */
  bindEvent () {
    // 批量初审
    $('.js-item-checkFirst').on('click', (evt) => this.checkAll(evt, CHECKSTATUS.FIRST))

    $('.js-item-checkFinal').on('click', (evt) => this.checkAll(evt, CHECKSTATUS.FINAL))

    // 批量审核提交按钮
    $('body').on('keyup', '#js-examine-reason', function () {
      $(this).val() != '' && $('.js-examine-submit').attr('disabled', false)
      $(this).val() == '' && $('.js-examine-submit').attr('disabled', true)
    })
  }

    // 查询终审人员
  addOperatorId () {
    $('.supplier').spin('medium')
    $.ajax({
      url: '/api/item-manage/next/operators',
      type: 'GET',
      data: {
        'itemId': '1'
      },
      success: (result) => {
        $('#nextOperatorId').empty()
        $.each(result, function (i, item) {
          $('#nextOperatorId').append('<option value=' + item.id + '>' + item.displayName + '</option>')
        })
        $('#nextOperatorId').selectric()
      },
      complete: () => {
        $('.supplier').spin(false)
      }
    })
  }
  // 批量审核  status 审核状态1,初审,2终审
  checkAll (evt, status) {
    let totalCount = 0;
    var shopIds = _.map($("input[name='table-line-check']:checked"), (i) => {
      let $tr = $(i).closest('tr');
      if(status === 1){
        let count = parseInt($tr.data('waitFirstAuditCount'));
        totalCount += (count ? count : 0);
      }
      else if(status === 2){
        let count = parseInt($tr.data('waitFinalAuditCount'));
        totalCount += (count ? count : 0);
      }
      return $tr.data('id')
    })
    if(totalCount === 0){
      new Modal({
        icon: "warning",
        title: "没有待"+ (status===1 ? "初审": "终审") +"的商品"
      }).show()
      return
    }
    if (!(shopIds && shopIds.length)) {
      return
    }
    let check = $(checkTemplate())
    if (_modal) {
      _modal.show()
    } else {
      _modal = new Modal(check)
      _modal.show()
    }
    this.addOperatorId()
    let auditResult // 审核结果
    if (status === 2) {
      $('.first_check').hide()
    }
    $('.js-examine-submit').on('click', () => {
      let passed = $('input[name=passed]:checked').val() === 'true' ? true : false
      let auditComment = $('#js-examine-reason').val()
      let nextOperatorId = $('#nextOperatorId').val()
      if (status == 1) {
        if (passed == true) {
          auditResult = 'FIRST_AUDIT_APPROVE'
        } else {
          auditResult = 'FIRST_AUDIT_REJECT'
        }
      } else if (status == 2) {
        if (passed == true) {
          auditResult = 'FINAL_AUDIT_APPROVE'
        } else {
          auditResult = 'FINAL_AUDIT_REJECT'
        }
      }
      this.batchItemCheckstatus(shopIds, auditResult, auditComment, passed, nextOperatorId, status, totalCount)
    })
  }

  // 审核商品批量
  batchItemCheckstatus (shopIds, auditResult, auditComment, passed, nextOperatorId, status, totalCount) {
    $('.js-examine-submit').prop('disabled', true)
    _modal.close()
    $('body').spin('medium')

    $.ajax({
      url: '/api/items-manage/batch-supplier-check',
      type: 'POST',
      data: {
        'shopIds': shopIds,
        'auditResult': auditResult,
        'auditComment': auditComment,
        'passed': passed,
        'auditStatus': status,
        'nextOperatorId': nextOperatorId
      },
      success: () => {
        let tipText = '本次操作共审核完成'+ totalCount +'个商品';
        ZCY.success('审核成功', tipText, null, 3000);
        window.location.reload()
        $('.js-examine-submit').prop('disabled', false)
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  navStyle () {
    let auditStatus = $.query.get('auditStatus')
    switch (auditStatus) {
      case 1:
        $('.waitSubmit').siblings().removeClass('active')
        $('.waitSubmit').addClass('active')
        break
      case 2:
        $('.waitOffer').siblings().removeClass('active')
        $('.waitOffer').addClass('active')
        break
      default:
        $('.total').siblings().removeClass('active')
        $('.total').addClass('active')
    }
  }
}
// noinspection JSUnresolvedVariable
module.exports = Item_check_new
