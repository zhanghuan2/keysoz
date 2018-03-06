$.fn.amount = (options)->
  $(@).each (d, i) ->
    options = _.extend({}, options)
    $container = $(i)
    $input = $(".count-number", $container)
    $minus = $(".minus", $container)
    $plus = $(".plus", $container)
    MAX_VALUE = Number.MAX_VALUE

    getStep = () =>
      step = $.trim $container.data("step")
      if step then parseInt step else  1

    getMin = () =>
      min = $.trim $container.data("min")
      if min or min is "0" then parseInt min else 1

    getMax = () =>
      max = $.trim $container.data("max")
      if max or max is "0" then parseInt getFitStepMax(max) else MAX_VALUE

    getFitStepMax = (max) =>
      step = getStep()
      Math.floor(max / step) * step


    toggleDisable = (el, type) =>
      if type
        $(el).removeClass("disabled")
      else
        $(el).addClass("disabled")

    getCount = () =>
      value = $.trim($input.val())
      if value then parseInt(value) else "0"

    getOptions = () =>
      min = getMin()
      max = getMax()
      step = getStep()
      count = getCount()

      [min, max, step, count]

    minusOrPlus = (data) =>
      if data.judge
        $input.val(data.result)
        $input.trigger("change")
        toggleDisable($plus, true)
        toggleDisable($minus, true)
        if parseInt($input.val()) is data.value
          toggleDisable(data.container, false)
      else if data.count is data.value
        toggleDisable(data.container, false)
      else
        $input.val(data.value)
        $input.trigger("change")

    $input.on "change", ->
      [min, max, step, count] = getOptions()

      oldValue = parseInt($input.data("old")) || min
      newValue = parseInt($.trim $input.val())
      # 新值不是数字 直接设为旧值返回
      if (!_.isNumber(newValue)) or isNaN(newValue)
        $input.val(oldValue)

      # 新值小于1 设为1
      if (newValue < min)
        $input.val(min)

      if (newValue > max)
        $input.val(max)


      if newValue is min
        toggleDisable($minus, false)
      else
        toggleDisable($minus, true)

      if newValue is max
        toggleDisable($plus, false)
      else
        toggleDisable($plus, true)

      options.changeCallback?({container: $container})

      $input.data("old", newValue)

    #数量减号动作
    $minus.on "click", ->
      [min, max, step, count] = getOptions()
      result = count - step
      value = min
      judge = result >= value

      minusOrPlus({result, judge, value, container: $minus})

    #数量加号动作
    $plus.on "click", ->
      [min, max, step, count] = getOptions()
      result = count + step
      value = max
      judge = result <= value

      minusOrPlus({result, judge, value, container: $plus})
