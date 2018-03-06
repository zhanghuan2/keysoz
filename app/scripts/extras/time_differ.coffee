class TimeDiffer
  init: (@totalDiffer)->
    @dayDiffer = Math.floor(@totalDiffer/(24*3600*1000))
    @dayElse = @totalDiffer%(24*3600*1000)
    @hourDiffer = Math.floor(@dayElse/(3600*1000))
    @hourElse = @dayElse%(3600*1000)
    @minuteDiffer = Math.floor(@hourElse/(60*1000))
    @minuteElse = @hourElse%(60*1000)
    @secondDiffer = (@minuteElse/1000).toFixed(1)

  getDate: ->
    @dayDiffer

  getHour: ->
    @hourDiffer

  getMinute: ->
    @minuteDiffer

  getSecond: ->
    @secondDiffer

module.exports = TimeDiffer::
