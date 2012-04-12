describe("Hints", function() {

  beforeEach(function() {
    });

  it("should display hintmode input", function() {
    $("#linkHintsContainer").show();
    $("#HTMLReporter").hide();

    CancelKeyFunction();

    expect(getCmd().css('display')).toBeUndefined()
    Hint.start()


    expect(getCmd().css('display')).toEqual('inline-block')
    expect(getCmd().val()).toEqual('')
  });

  it("should select inputs", function() {
    CancelKeyFunction();
    Hint.start()
    simulateKey('2')
    expect(document.activeElement.id).toEqual('i2')

    CancelKeyFunction();
    Hint.start();
    simulateKey('1')
    simulateTyping('input');
    expect(document.activeElement.id).toEqual('i1')
    expect(document.activeElement.value).toEqual('input')
    document.activeElement.value = ''

    CancelKeyFunction();

  });

  it("should open one link in a new tab", function() {
    var wait = 500
    CancelKeyFunction()



    waits(2000);

    closeOtherTabs(function(tab){
      Hint.new_tab_start()
      simulateKey('3')

      setTimeout(function(){
        chrome.tabs.query({
          windowId: tab.windowId
        }, function(tabs) {
          expect(tabs.length).toEqual(2)
          expect(tabs[1].url).toEqual($('#uri1').attr('href'))

          closeOtherTabs(function(tab){
            Hint.new_tab_start()
            simulateTyping('vr')

            setTimeout(function(){
              chrome.tabs.query({
                windowId: tab.windowId
              }, function(tabs) {
                expect(tabs.length).toEqual(2)
                expect(tabs[1].url).toEqual($('#uri2').attr('href'))
              })
            }, wait)
          })

        })
      }, wait);
    })
  });


  it("should open multiple links in a new tab", function() {
    var wait = 500
    CancelKeyFunction()

    waits(2000);

    closeOtherTabs(function(tab){
      Hint.multi_mode_start()
      simulateKey('3')
      simulateKey('4')

      setTimeout(function(){
        chrome.tabs.query({
          windowId: tab.windowId
        }, function(tabs) {
          expect(tabs.length).toEqual(3)

          reset();

        })
      }, wait);
    })
  })

  function reset() {
    closeOtherTabs(function(tab){
      CancelKeyFunction()
      $(".testContainer").hide();
      $("#HTMLReporter").show();
    })
  }

});