const Pagination = require('pokeball/components/pagination'),
    Modal = require('pokeball/components/modal'),
    ComplexSearch = require('common/complex_search/extend'),
    checkTemplate = Handlebars.templates['seller/item_check/templates/check'],
    priceChangeTemplate = Handlebars.templates['seller/item_check/templates/priceChange']

let stateFlag = false

class ShelfItem {
  constructor ($) {
    this.isVaccine = $('.js-vaccine-tag').val()//是否疫苗
    this.singel_flag // 当前选中item的类别
    new ComplexSearch({
      tabElem: '.tab',
      searchElem: '.search',
      searchResetParams: ['pageNo'],
      saveSearchStatus: false
    })
    $('.date-input').datepicker()
    this.pagination = $('.item-pagination')
    this.itemBatch = $('.js-batch-select')
    this.itemSelect = $('.js-item-select')
    this.itemCheckAll = $('.js-item-checkall')
    $('.js-batch-select').prop('disabled', function () {
      let state
      $('.js-item-select').each(function (i) {
        if (!state) {
          state = $(this).closest('tr').data('state')
        } else if (state != $(this).closest('tr').data('state')) {
          stateFlag = true // true 代表有多种不同的状态
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
      $('.supplierNameStore').val(name);
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

    $("select[name='categoryId']").selectric()
    this.initTree() // tree
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
    $('.js-item-audit').on('click', (evt) => this.ShowItemAudit(evt))
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
    new Modal(checkTemplate()).show()
    this.addOperatorId()
    let vm = this, checkStatus = 1,//审核状态: 1=>初审,2=>终审
      auditResult = null //审核结果
    if ($('input.js-item-select:checked').closest('tr').data('state') == 2) { // 终审
      $('.first_check').hide()
      checkStatus = 2
    }
    $('.js-examine-submit').off().on('click', function () {
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

  ShowItemAudit (evt) {
    let itemData = $(evt.currentTarget).data('item'),
      itemId = itemData.itemId,
      type = itemData.type,
      auditStatus = itemData.auditStatus,
      itemAuditId = itemData.id
    if (this.isVaccine) {
      window.location.href = `/seller/item-check-detail?itemId=${itemId}&type=${auditStatus}&itemAuditId=${itemAuditId}`
    } else {
      let modalData = {
        title: '商品审核',
        item: itemData
      }
      if (type == 1 ){
        modalData.title = auditStatus == 1 ? '商品涨价初审' : '商品涨价终审'
        this.getItemPriceChange(itemAuditId)
      } else {
        modalData.title = auditStatus == 1 ? '商品上架初审' : '商品上架终审'
      }
      new Modal(checkTemplate(modalData)).show()
      if (auditStatus == 1){
        this.addOperatorId()
      } else {
        $('.first_check').hide()
      }
      let vm = this,
        auditResult = null //审核结果
      $('.js-examine-submit').off().on('click', function () {
        let passed = $('input[name=passed]:checked').val() === 'true' ? true : false,
          auditComment = $('#js-examine-reason').val(),
          nextOperatorId = $('#nextOperatorId').val()
        if (auditStatus == 1) {
          if (passed == true) {
            auditResult = 'FIRST_AUDIT_APPROVE'
          } else {
            auditResult = 'FIRST_AUDIT_REJECT'
          }
        } else if (auditStatus == 2) {
          if (passed == true) {
            auditResult = 'FINAL_AUDIT_APPROVE'
          } else {
            auditResult = 'FINAL_AUDIT_REJECT'
          }
        }
        vm.itemCheckstatus(itemAuditId, auditResult, auditComment, passed, nextOperatorId)
      })
    }
  }

  getItemPriceChange (itemAuditId) {
    $.ajax({
      url: '/api/zcy/itemAudits/findChangedPrice',
      type: 'get',
      data: {itemAuditId}
    }).done((result) => {
      $('.price-change').html(priceChangeTemplate(result))
    })
  }

  // 审核商品单个
  itemCheckstatus (itemAuditId, auditResult, auditComment, passed, nextOperatorId) {
    $('.js-examine-submit').prop('disabled', true)
    $.ajax({
      url: '/api/items-manage/check',
      type: 'POST',
      data: {
        'itemAuditId': itemAuditId,
        'auditResult': auditResult,
        'auditComment': auditComment,
        'passed': passed,
        'nextOperatorId': nextOperatorId
      },
      success: () => {
        window.location.reload()
      },
      complete: () => {
        $('.js-examine-submit').prop('disabled', false)
      }
    })
  }

  // 审核商品批量
  batchItemCheckstatus (itemIds, auditResult, auditComment, passed, nextOperatorId) {
    $('.js-examine-submit').prop('disabled', true)
    //区分疫苗商品和普通商品审核
    let requestUrl = '/api/items-manage/batch-check';
    if (this.isVaccine == '1') {
      requestUrl = '/api/items-vaccine/batch-audit';
    }
    $.ajax({
      url: requestUrl,
      type: 'post',
      data: {
        'itemAuditIds': itemIds,
        'auditResult': auditResult,
        'auditComment': auditComment,
        'passed': passed,
        'nextOperatorId': nextOperatorId
      },
      success: () => {
        window.location.reload()
      },
      complete: () => {
        $('.js-examine-submit').prop('disabled', false)
      }
    })
  }

  // 查询终审人员
  addOperatorId () {
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
      }
    })
  }

  // 初始化tree
  initTree () {
    let tree2
    let content = JSON.parse($('.treeData').html())
    let walk = function (pNode) {
      if (!pNode.children || pNode.children === true || pNode.children === false) {
        pNode.children = false
      } else {
        for (var i = 0; i < pNode.children.length; i++) {
          var sNode = pNode.children[i]
          sNode.text = sNode.node.name
          sNode.id = sNode.node.id
          walk(sNode)
        }
      }
    }
    walk(content)

    tree2 = $('#item-tree').jstree({
      'core': {
        'themes': {
          'icons': false
        },
        'data': content.children,
        'dblclick_toggle': false
      }
    }).on('select_node.jstree', function (node, selected) {
      node = selected.node
      $(this).parent().find('.selectric p').text(node.text)
      $('#item-tree').hide()
      $($('#itemSelect').children('option').eq(0)).attr('value', node.id)
      $('#itemSelect').val(node.id + '')
      $('#itemSelect').trigger('change')
    }).on('loaded.jstree', function (e, data) {
      tree2.jstree().select_node($.query.get('categoryId'))
      $('#itemSelect').val($.query.get('categoryId'))
    })

    $('.selectric-js-category .selectric').unbind().bind('click', function (e) {
      e.stopPropagation()
      $('#item-tree').toggle()
      $('select.js-category').selectric('close')
    })

    $('select.js-category').on('selectric-before-open', function () {
      $('#item-tree').hide()
    })

    $(document).on('click', function (e) {
      if ($(e.target).hasClass('jstree-ocl')) {
        return
      }
      $('#item-tree').hide()
    })
  }

}

module.exports = ShelfItem
