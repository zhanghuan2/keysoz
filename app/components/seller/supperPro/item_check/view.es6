require('pokeball/components/datepicker')

const TextTool = require('seller/item_detail_editor/view')

const Pagination = require('pokeball/components/pagination'),
  Modal = require('pokeball/components/modal'),
  CommonDatepicker = require('extras/common_datepicker')

const Language = require('locale/locale')
var ComplexSearch = require('common/complex_search/extend')
const checkTemplate = Handlebars.templates['seller/item_check/templates/check']
let stateFlag = false
class ShelfItem {
  constructor ($) {
    this.target = this.$el;
    this.singel_flag=""; // 当前选中item的类别
    var search = new ComplexSearch({
      tabElem: '.tab',
      searchElem: '.search',
      searchResetParams: ['pageNo'],
      saveSearchStatus: false
    });
    $('.date-input').datepicker()
    this.pagination = $('.item-pagination');
    this.itemBatch = $('.js-batch-select');
    this.itemSelect = $('.js-item-select');
    this.itemCheckAll = $('.js-item-checkall');
    this.itemBatch.prop('disabled', function () {
      let state;
      $('.js-item-select').each(function (i) {
        if (!state) {
          state = $(this).closest('tr').data('state')
        } else if (state != $(this).closest('tr').data('state')) {
          stateFlag = true; // true 代表有多种不同的状态
          return stateFlag
        }
      })
      return stateFlag
    })

    // 初始化tree select
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
      $('.supplierNameStore').val(name)
    });
    

    if(jQuery.query.keys.shopId){
      // 获取初始供应商名称
      jQuery.ajax({
        url: '/api/zcy/shop/list',
        type: 'GET',
        data: {
          shopId: jQuery.query.keys.shopId,
          pageSize: 20,
          pageNo: 1
        }
      }).done((data)=>{
        let resultData = data.data;
        let id = resultData[0].id,
        name = resultData[0].name;
        if (id && name) {
          $("select[name='shopId']").append(`<option value="${id}" selected>${name}</option>`)
        }
      });
    }

    this.bindEvent()
  }

  bindEvent () {
    new Pagination(this.pagination).total(this.pagination.data('total')).show(this.pagination.data('size'), {
      num_display_entries: 5,
      jump_switch: true,
      page_size_switch: true
    })
    this.itemBatch.on('click', evt => this.selectBatch(evt))
    this.itemSelect.on('change', evt => this.selectItem(evt))
    this.itemCheckAll.on('click', evt => this.checkAll(evt))
    $('body').on('keyup', '#js-examine-reason', function () {
      $(this).val() != '' && $('.js-examine-submit').attr('disabled', false)
      $(this).val() == '' && $('.js-examine-submit').attr('disabled', true)
    })
  }

  // 单个选择
  selectItem (evt) {
    $('.js-batch-select').prop('disabled', $(evt.currentTarget).prop('checked') ? false : true)
    this.itemCheckAll.prop('disabled', function () {
      if ($('.js-item-select:checked').closest('tr').data('state') == 1 || $('.js-item-select:checked').closest('tr').data('state') == 2) {
        return false
      }
    })
    let _flag = $(evt.currentTarget).closest('tr').data('state')
    this.singel_flag = _flag
    $('.js-item-select').each(function (i) {
      if (_flag != $(this).closest('tr').data('state')) {
        $(this).prop('disabled', true)
      }
    })
    if (!$('.js-item-select:checked').length) {
      this.singel_flag = ''
      if (stateFlag) {
        $('.js-batch-select').prop('disabled', true).prop('checked', false)
      } else {
        $('.js-batch-select').prop('disabled', false).prop('checked', false)
      }
      $('.js-item-select').each(function () {
        $(this).prop('disabled', false)
      })
      this.itemCheckAll.prop('disabled', true)
    }
  }

  // 批量选择
  selectBatch (evt) {
    this.itemCheckAll.prop('disabled', function () {
      if (stateFlag) {
        if ($('.js-item-select:checked').closest('tr').data('state') == 1 || $('.js-item-select:checked').closest('tr').data('state') == 2) {
          return false
        }
      } else {
        return false
      }
    })

    let _flag = this.singel_flag
    $('input.js-item-select').each(function () {
      if (!stateFlag) {
        $(this).prop('checked', $(evt.currentTarget).prop('checked') ? true : false)
      } else {
        if (_flag == $(this).closest('tr').data('state')) {
          $(this).prop('checked', $(evt.currentTarget).prop('checked') ? true : false)
        }
      }
    })
    if (!$(evt.currentTarget).prop('checked')) {
      this.singel_flag = ''
      if (stateFlag) {
        $('.js-batch-select').prop('disabled', true)
      } else {
        $('.js-batch-select').prop('disabled', false)
      }
      $('.js-item-select').each(function (i) {
        $(this).prop('disabled', false)
      })
      this.itemCheckAll.prop('disabled', true)
      this.itemBatch.prop('checked', false)
    } else {
      this.itemBatch.prop('checked', true)
    }
  }

  // 批量审核
  checkAll (evt) {
    let check = $(checkTemplate())
    new Modal(check).show()
    this.addOperatorId()
    let vm = this
    let checkStatus = 1 // 审核状态1,初审,2终审
    let auditResult // 审核结果
    if ($('input.js-item-select:checked').closest('tr').data('state') == 2) { // 终审
      $('.first_check').hide()
      checkStatus = 2
    }
    //  $("#freeze-option").selectric();
    $('.js-examine-submit').on('click', function () {
      let items = _.map($('input.js-item-select:checked'), (i) => $(i).closest('tr').data('id'))
      let passed = $('input[name=passed]:checked').val() === 'true' ? true : false
      let auditComment = $('#js-examine-reason').val()
      let nextOperatorId = $('#nextOperatorId').val()
      if (checkStatus == 1) {
        if (passed == true) {
          auditResult = 'FIRST_AUDIT_APPROVE'
        } else {
          auditResult = 'FIRST_AUDIT_REJECT'
        }
      } else if (checkStatus == 2) {
        if (passed == true) {
          auditResult = 'FINAL_AUDIT_APPROVE'
        } else {
          auditResult = 'FINAL_AUDIT_REJECT'
        }
      }
      vm.batchItemCheckstatus(items, auditResult, auditComment, passed, nextOperatorId)
    })
  }

  // 审核商品单个
  itemCheckstatus (itemId, auditResult, auditComment, passed, nextOperatorId) {
    $('body').spin('medium')
    $.ajax({
      url: '/api/items-manage/check',
      type: 'POST',
      data: {
        'itemAuditId': itemId,
        'auditResult': auditResult,
        'auditComment': auditComment,
        'passed': passed,
        'nextOperatorId': nextOperatorId
      },
      success: () => {
        window.location.reload()
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  // 审核商品批量
  batchItemCheckstatus (itemIds, auditResult, auditComment, passed, nextOperatorId) {
    $('.js-examine-submit').prop('disabled', true)
    $('body').spin('medium')
    //区分疫苗商品和普通商品审核
    let urlStr = '/api/item/block/supervise/batchAudit';
    let param = {
      'itemAuditIds': itemIds,
      'auditResult': auditResult,
      'auditComment': auditComment,
      'passed': passed,
      'nextOperatorId': nextOperatorId
    };
    $.ajax({
      url: urlStr,
      type: 'POST',
      data:param,
      success: () => {
        window.location.reload();
        $('.js-examine-submit').prop('disabled', false)
      },
      complete: () => {
        $('body').spin(false)
      }
    })
  }

  // 查询终审人员
  addOperatorId () {
    $('body').spin('medium')
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
        $('body').spin(false)
      }
    })
  }
}

module.exports = ShelfItem
