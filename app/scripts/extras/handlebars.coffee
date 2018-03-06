Handlebars.registerHelper 'pp', (json, options) ->
  JSON.stringify(json)

Handlebars.registerHelper 'add', (a,b, options) ->
  a + b

Handlebars.registerHelper "formatPrice", (price, type, options) ->
  return if not price?
  if type is 1
    formatedPrice = (price / 100)
    roundedPrice = parseInt(price / 100)
  else
    formatedPrice = (price / 100).toFixed(2)
    roundedPrice = parseInt(price / 100).toFixed(2)
  if `formatedPrice == roundedPrice` then roundedPrice else formatedPrice

Handlebars.registerHelper "formatDate", (date, type, options) ->
  return unless date
  switch type
    when "gmt" then moment(parseInt date).format("EEE MMM dd HH:mm:ss Z yyyy")
    when "day" then moment(parseInt date).format("YYYY-MM-DD")
    when "minute" then moment(parseInt date).format("YYYY-MM-DD HH:mm")
    else
      if typeof(type) is "string"
        moment(parseInt date).format(type)
      else
        moment(parseInt date).format("YYYY-MM-DD HH:mm:ss")

Handlebars.registerHelper "lt", (a, b, options) ->
  if a < b
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper "gt", (a, b, options) ->
  if a > b
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper 'of', (a, b, options) ->
  if a and b
    values = b.split(",")
    if _.contains values, a.toString()
      options.fn(this)
    else
      options.inverse(this)
  else
    options.inverse(this)


Handlebars.registerHelper 'length', (a, options) ->
  length = a.length

Handlebars.registerHelper 'gtTime', (a, b, options) ->
  nowTime = moment()
  switch b
    when "dayStart" then benchmarkTime = new Date(nowTime.format("YYYY-MM-DD")).valueOf()
    when "now" then benchmarkTime = nowTime.valueOf()
    when "dayEnd" then benchmarkTime = new Date(moment().date(nowTime.date()+1).format("YYYY-MM-DD")).valueOf()
    else benchmarkTime = moment(b).valueOf()
  if moment(a).valueOf() > benchmarkTime
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper "isArray", (a, options) ->
  if _.isArray a
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper "size", (a, options) ->
  try
    a.length
  catch
    # console.log "#{a} is not a array"

Handlebars.registerHelper "between", (a, b, c, options) ->
  if  a >= b and a <= c
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper "addStar", (userName) ->
  if userName.length >= 2
    userName.charAt(0) + "***" + userName.charAt(userName.length - 1)

Handlebars.registerHelper "withPerm", (resource) ->
  authResources = window.resource
  if authResources.length is 1 and authResources[0] is ""
    options.fn(this)
  else if _.contains authResources, resource
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper 'cdnPath', (a, b, c, options) ->
  unless a
    return "http://zcy-dev.img-cn-hangzhou.aliyuncs.com/system/error/image_not_found.001.jpeg"

  if a.indexOf "aliyuncs.com" > -1
    return a
  else
    a1 = a.split "."
    a += "@"

    cType = $.type c
    if cType is "object"
      a += b + "h_" + b + "w" + "_1e"
    else if b is "0"
      a += c + "w"
    else if c is "0"
      a += b + "h"
    else
      a += b + "h_" + c + "w" + "_1e"

    # png格式的图片，在处理完之后需要再在末尾加上".png"，以防压缩后的图片背景被填充
    if a1[a1.length - 1] is "png"
      a += ".png"
    return a

Handlebars.registerHelper "divide", (a, b, options) ->
  a / (if b then b else 100)

Handlebars.registerHelper "urlEncode", (a, options) ->
  encodeURIComponent a

Handlebars.registerHelper 'isEmpty', (a, options) ->
  if _.isArray(a) and a.length isnt 0
    options.inverse(this)
  else
    options.fn(this)

# only in frontend
Handlebars.registerHelper "equalsRemainder", (a, b, c, options) ->
  if (a + 1) % b is c
    options.fn(this)
  else
    options.inverse(this)

Handlebars.registerHelper 'splitter', (a, b, c, options) ->
  if typeof(a) is "string"
    a.split(b)[c]
    
Handlebars.registerHelper "formatFileSize", (size,options) ->
  result = parseInt(size)
  if result >= 0 and result < 1024
    (result).toFixed(0)+"B"
  else if result >= 1024 and result < 1048576
    (result/1024).toFixed(0)+"KB"
  else
    (result/1048576).toFixed(0)+"MB"
