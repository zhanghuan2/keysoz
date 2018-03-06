###*
 * 将16进制的颜色转换成RGB
 * @param  {Hex} sColor 待转换的16进制 ex: #ffffff
 * @return {RGB}        转换完成的RGB或者无法转换的原字符串 ex: 255, 255, 255
###
module.exports = (sColor) ->
  if sColor
    sColor = sColor.toLowerCase()
    reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    if reg.test(sColor)
      if(sColor.length is 4)
        sColorNew = "#"
        for i in [1..3]
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        sColor = sColorNew
      # 处理六位的颜色值
      sColorChange = []
      for i in [1..6] by 2
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)))
      return sColorChange.join(", ")
  else
    return sColor
