Debug = (->
  (str) ->
    
    # console.log(str);
    Post
      action: "debug"
      message: str

)()
D = (->
  log: (msg) ->
    if msg
      console.log msg.m
    else
      console.log msg
)()
