Pagination = require "pokeball/components/pagination"
Modal = require "pokeball/components/modal"

class TextTool
  constructor: ->
    @bindEvent()

  bindEvent:->
    @textTool()

  textTool: =>
    editor = new wysihtml5.Editor("wysihtml5-editor", {
        toolbar:     "wysihtml5-editor-toolbar",
        parserRules: wysihtml5ParserRules
      })

    editor.on "load", ->
      composer = editor.composer

    $(".wysihtml5-sandbox").addClass("text-tool-iframe")
    @fileupload()

  fileUpload: =>
    $self = $("input[name=file]")
    $selecter = $self.closest(".image-selecter")
    $self.fileupload
      url: "api/user/files/upload"
      dataType: "html"
      done: (evt, data) =>
        url = JSON.parse(data.result)[0].userFile.path
        $selecter.find(".image-input").val(url)

module.exports = TextTool
