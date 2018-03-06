
var _ = require('lodash')
var moment = require('moment')
var handlebars = require('handlebars')

// var debug = require('debug')('zcyjiggly:helpers')

require('./i18n_helpers')

function translateJavaDateFormat (formatStr) {
  if (!formatStr || _.isObject(formatStr)) {
    return 'YYYY-MM-DD HH:mm:ss'
  }
  formatStr = _.replace(formatStr, 'yyyy', 'YYYY')
  formatStr = _.replace(formatStr, 'dd', 'DD')
  return formatStr
}

// handlebars.registerHelper('helperMissing', function () {
//   return 'missing helper'
// })

handlebars.registerHelper('cdnPath', function (a, b, c, options) {
  if (!a) {
    return
  }
  if (a.indexOf('upaiyun') !== -1) {
    return a + '!' + b + 'x' + b
  }
  if (!c) {
    return a
  }
  if (!options) {
    return a.substring(0, a.lastIndexOf('.')) + b + '_0.jpg'
  }
  return a.substring(0, a.lastIndexOf('.')) + b + '_' + c + '.jpg'
})

handlebars.registerHelper('equals', function (a, b, options) {
  if (a == b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('lt', function (a, b, options) {
  if (a < b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('gt', function (a, b, options) {
  if (parseFloat(a) > parseFloat(b)) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('and', function (a, b, options) {
  if (a && b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('neither', function (a, b, options) {
  if (!a && !b) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('mod', function (a, b, options) {
  if (!a || !b) {
    return options.inverse(this)
  }
  if ((a + 1) % b !== 0) {
    return options.inverse(this)
  } else {
    return options.fn(this)
  }
})

handlebars.registerHelper('of', function (a, b, options) {
  if (!a || !b) {
    return options.inverse(this)
  }
  var values = b.split(',')
  if (_.includes(values, a.toString())) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('formatDate', function (date, type, options) {
  if (!date || !moment(date).isValid()) {
    return
  }
  type = translateJavaDateFormat(type)
  switch (type) {
    case 'gmt':
      return moment(date).format('EEE MMM DD HH:mm:ss Z YYYY')
    case 'day':
      return moment(date).format('YYYY-MM-DD')
    case 'minute':
      return moment(date).format('YYYY-MM-DD HH:mm')
    default:
      if (typeof type === 'string') {
        return moment(date).format(type)
      } else {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
  }
})

handlebars.registerHelper('json', function (json, options) {
  return JSON.stringify(json || this)
})

handlebars.registerHelper('size', function (a, options) {
  if (!a) {
    return 0
  }
  if (a.length) {
    if (_.isFunction(a.length)) {
      return a.length()
    }
    return a.length
  }
  if (a.size) {
    if (_.isFunction(a.size)) {
      return a.size()
    }
    return a.size
  }
  return 0
})

handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  var isTrue = (function () {
    switch (operator) {
      case '==':
        return v1 == v2
      case '!=':
        return v1 != v2
      case '===':
        return v1 === v2
      case '!==':
        return v1 !== v2
      case '&&':
        return v1 && v2
      case '||':
        return v1 || v2
      case '<':
        return v1 < v2
      case '<=':
        return v1 <= v2
      case '>':
        return v1 > v2
      case '>=':
        return v1 >= v2
      default:
        return eval('' + v1 + operator + v2)
    }
  })()
  if (isTrue) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('or', function (/* any, any, ..., options */) {
  var argLength = arguments.length - 1
  var options = arguments[argLength]
  var success = false
  var i = 0
  while (i < argLength) {
    if (arguments[i]) {
      success = true
      break
    }
    i++
  }
  if (success) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

handlebars.registerHelper('add', function (a, b) {
  return a + b
})

handlebars.registerHelper('subtract', function (a, b) {
  return a - b
})

handlebars.registerHelper('divide', function (a, b) {
  return a / b
})

handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})

handlebars.registerHelper('formatBudgetAmount', function (amount, len) {
  if (!amount) {
    return 0
  }
  return (parseFloat(amount) / 100.0 / 10000.0).toFixed(len)
})

handlebars.registerHelper('formatPrice', function (price, len) {
  if (!price) {
    return 0
  }
  return (price / 100.0).toFixed(len || 2)
})

handlebars.registerHelper('formatFileSize', function (size, len) {
  if (!size) {
    return 0
  }
  var result = parseInt(size)
  if (result >= 0 && result < 1024) {
    return result.toFixed(0) + 'B'
  }
  if (result >= 1024 && result < 1048576) {
    return (result / 1024).toFixed(0) + 'KB'
  }

  return (result / 1048576).toFixed(0) + 'MB'
})

handlebars.registerHelper('formatBankAccount', function (num) {
  if (!num) {
    return ''
  }
  return num.replace(/(.{4})/g, '$1 ')
})

handlebars.registerHelper('between', function (a, b, c, options) {
  return a >= b && a <= c ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('formDoubleStr', function (num) {
  if (!num) {
    return 0
  }
  return (num - 0).toFixed(2)
})
