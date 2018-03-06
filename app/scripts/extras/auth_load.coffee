do ->
  if $("#js-auth-load").length
    window.resource = $("#js-auth-load").data("auth")
    # $("#js-auth-load").removeAttr "data-auth"

