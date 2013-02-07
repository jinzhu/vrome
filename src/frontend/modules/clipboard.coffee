Clipboard = (->
  copy = (value) -> #String
    Post
      action: "Clipboard.copy"
      value: value

  copy: copy
)()
