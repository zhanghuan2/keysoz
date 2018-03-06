const SessionStorage = require('common/session_storage/extend')
let userCategory = '99'
class CustomerUtil {
  constructor () {
    // for 下级业务
    if ($('[name="userCategory"]').val() == '01') {
      userCategory = '01'
    }

    this.searchPanel = $('.search-panel')

    this.orgSearch = $('[name="orgId"]').not('.js-select-org')
    // this.orgResultPanel = $('.org-result-panel');

    this.supplierSearch = $('[name="supplierId"]')
    // this.supplierResultPanel = $('.supplier-result-panel');

    this.userSearch = $('.user-id')
    // this.userResultPanel = $('.user-result-panel');
    this.areaSearch = $('[name="districtId"]').not('.js-select-org').not('.js-select-district')

    this.dataTable = $('#data-table')

    this.initSearchPlugin()

    this.bindBasicEvents()
  }

  // 初始化搜索栏中的控件并绑定事件
  initSearchPlugin () {
    // 初始化搜索栏插件
    $('.date-input').datepicker()

    // 机构搜索
    if (userCategory == '01') {
      this.orgSearch.select2({
        placeholder: '请选择',
        allowClear: true,
        ajax: {
          url: '/api/purchaseSupervise/pagingDistinctOrg',
          dataType: 'json',
          delay: 500,
          data (params) {
            console.log(params)
            if (params.term == undefined) {
              return ''
            }
            return {
              keyword: params.term.trim() // search term
              // page: params.page
            }
          },
          error (e) {
            console.log(e)
          },
          processResults (data) {
            console.log('resultdata:' + data)
            const orgNames = []
            if (data == undefined) {
              return { results: orgNames }
            }
            $.each(data, (i, n) => {
              const option = {}
              option.id = n.id
              option.text = n.name
              orgNames.push(option)
            })
            return {
              results: orgNames
            }
          },
          cache: true
        }
      }).on('change', () => {
        const $selectedOption = $('select[name=orgId] option:selected')
        const orgId = $selectedOption.val()
        const orgName = $selectedOption.text()
        SessionStorage.set('SELECT2/orgOption', { orgId, orgName })
      })
    } else {
      this.orgSearch.select2({
        placeholder: '请选择',
        allowClear: true,
        ajax: {
          url: '/api/customer/getOrgInfoList?pageNo=1&pageSize=20',
          dataType: 'json',
          delay: 500,
          data (params) {
            console.log(params)
            if (params.term == undefined) {
              return ''
            }
            return {
              keyword: params.term.trim() // search term
              // page: params.page
            }
          },
          error (e) {
            console.log(e)
          },
          processResults (data) {
            console.log('resultdata:' + data)
            const orgNames = []
            if (data.data == undefined) {
              return { results: orgNames }
            }
            $.each(data.data, (i, n) => {
              const option = {}
              option.id = n.id
              option.text = n.name
              orgNames.push(option)
            })
            return {
              results: orgNames
            }
          },
          cache: true
        }
      }).on('change', () => {
        const $selectedOption = $('select[name=orgId] option:selected')
        const orgId = $selectedOption.val()
        const orgName = $selectedOption.text()
        SessionStorage.set('SELECT2/orgOption', { orgId, orgName })
      })
    }

    const urlOrg = this.getQueryString('orgId')
    const orgOption = SessionStorage.get('SELECT2/orgOption')
    if (urlOrg != null && orgOption != undefined && urlOrg == orgOption.orgId) {
      this.orgSearch.append('<option value=' + orgOption.orgId + '>' + orgOption.orgName + '</option>')
      this.orgSearch.val(orgOption.orgId).trigger('change')
    } else {
      SessionStorage.del('SELECT2/orgOption')
    }

    // 区划搜索
    this.areaSearch.select2({
      placeholder: '请选择',
      allowClear: true,
      language: 'zh-CN',
      ajax: {
        url: '/api/customer/district',
        dataType: 'json',
        delay: 500,
        data (params) {
          console.log(params)
          if (params.term == undefined) {
            return ''
          }
          return {
            keyword: params.term.trim() // search term
              // page: params.page
          }
        },
        error (e) {
          console.log(e)
        },
        processResults (data) {
          console.log('resultdata:' + data)
          const areaNames = []
          if (data == undefined) {
            return { results: areaNames }
          }
          $.each(data, (i, n) => {
            const option = {}
            option.id = n.code
            option.text = n.name
            areaNames.push(option)
          })
          return {
            results: areaNames
          }
        },
        cache: true
      }
    }).on('change', () => {
      const $selectedOption = $('select[name=districtId] option:selected')
      const districtId = $selectedOption.val()
      const areaName = $selectedOption.text()
      SessionStorage.set('SELECT2/areaOption', { districtId, areaName })
    })

    const urlArea = this.getQueryString('districtId')
    const areaOption = SessionStorage.get('SELECT2/areaOption')
    if (urlArea != null && areaOption != undefined && urlArea == areaOption.districtId) {
      this.areaSearch.append('<option value=' + areaOption.districtId + '>' + areaOption.areaName + '</option>')
      this.areaSearch.val(areaOption.districtId).trigger('change')
    } else {
      SessionStorage.del('SELECT2/areaOption')
    }

    // 供应商搜索
    this.supplierSearch.select2({
      placeholder: '请选择',
      allowClear: true,
      ajax: {
        url: '/api/customer/pagingSupplierBaseInfo?pageNo=1&pageSize=30',
        dataType: 'json',
        delay: 500,
        data (params) {
          if (params.term == undefined) {
            return { criteria: { name: '' } }
          }
          return {
            criteria: JSON.stringify({ name: params.term.trim() }) // search term
            // page: params.page
          }
        },
        error (e) {
          console.log(e)
        },
        processResults (data) {
          const supplierNames = []
          if (data.data == undefined) {
            return {
              results: supplierNames
            }
          }
          $.each(data.data, (i, n) => {
            const option = {}
            option.id = n.supplierId
            option.text = n.name
            supplierNames.push(option)
          })
          return {
            results: supplierNames
          }
        },
        cache: true
      }
    }).on('change', () => {
      const $selectedOption = $('select[name=supplierId] option:selected')
      const supplierId = $selectedOption.val()
      const supplierName = $selectedOption.text()
      SessionStorage.set('SELECT2/supplierOption', { supplierId, supplierName })
    })

    const urlSupplier = this.getQueryString('supplierId')
    const supplierOption = SessionStorage.get('SELECT2/supplierOption')
    if (urlSupplier != null && supplierOption != undefined && urlSupplier == supplierOption.supplierId) {
      this.supplierSearch.append('<option value=' + supplierOption.supplierId + '>' + supplierOption.supplierName + '</option>')
      this.supplierSearch.val(supplierOption.supplierId).trigger('change')
    } else {
      SessionStorage.del('SELECT2/supplierOption')
    }

    if (userCategory == '01') {
      this.userSearch.select2({
        placeholder: '请选择',
        allowClear: true,
        ajax: {
          url: '/api/purchaseSupervise/pagingDistinctPurchase',
          dataType: 'json',
          delay: 500,
          data (params) {
            if (params.term == undefined) {
              return { keyword: '' }
            }
            return {
              keyword: params.term.trim() // search term
              // page: params.page
            }
          },
          error (e) {
            console.log(e)
          },
          processResults (data) {
            const userNames = []
            if (data == undefined) {
              return { results: userNames }
            }
            $.each(data, (i, n) => {
              const option = {}
              option.id = n.id
              option.text = n.displayName
              userNames.push(option)
            })
            return {
              results: userNames
            }
          },
          cache: true
        }
      }).on('change', () => {
        const $selectedOption = $('select.user-id option:selected')
        const userId = $selectedOption.val()
        const userName = $selectedOption.text()
        SessionStorage.set('SELECT2/userOption', { userId, userName })
      })
    } else {
      // 用户搜索
      this.userSearch.select2({
        placeholder: '请选择',
        allowClear: true,
        ajax: {
          url: '/api/customer/pagingUser?pageNo=1&pageSize=30',
          dataType: 'json',
          delay: 500,
          data (params) {
            if (params.term == undefined) {
              return { keyword: '' }
            }
            return {
              keyword: params.term.trim() // search term
              // page: params.page
            }
          },
          error (e) {
            console.log(e)
          },
          processResults (data) {
            const userNames = []
            if (data.data == undefined) {
              return { results: userNames }
            }
            $.each(data.data, (i, n) => {
              const option = {}
              option.id = n.id
              option.text = n.displayName
              userNames.push(option)
            })
            return {
              results: userNames
            }
          },
          cache: true
        }
      }).on('change', () => {
        const $selectedOption = $('select.user-id option:selected')
        const userId = $selectedOption.val()
        const userName = $selectedOption.text()
        SessionStorage.set('SELECT2/userOption', { userId, userName })
      })
    }

    let urlUser
    if (window.location.pathname == '/customer/purchases') {
      urlUser = this.getQueryString('purchaserId')
    } else if (window.location.pathname == '/customer/requisitions') {
      urlUser = this.getQueryString('buyerId')
    } else {
      urlUser = this.getQueryString('userId')
    }
    const userOption = SessionStorage.get('SELECT2/userOption')
    if (urlUser != null && userOption != undefined && urlUser == userOption.userId) {
      this.userSearch.append('<option value=' + userOption.userId + '>' + userOption.userName + '</option>')
      this.userSearch.val(userOption.userId).trigger('change')
    } else {
      SessionStorage.del('SELECT2/purchaserOption')
    }
  }

  // 获取url参数  修改过，现只支持q方式
  getQueryString (name) {
    const param = $.query.get(name)
    let qParams = $.query.get('q')
    if (qParams) {
      qParams = JSON.parse(qParams)
    }
    if (param === true || !param) {
      return qParams[name] || null
    }
    return param
  }

  // 绑定页面操作事件
  bindBasicEvents () {
    // table展开事件
    this.dataTable.on('click', '.expand-btn', event => expand(event))

    function expand (event) {
      const $target = $(event.target)
      const drawPanel = $($target.closest('tr').next()).find('.drawer-panel')

      $target.toggleClass('expanded')
      $(drawPanel).toggle()
    }
  }
}

module.exports = CustomerUtil
