describe("Hints", function() {

  var wait = 500;

  beforeEach(function() {});

  it("", function() {
    $("#linkHintsContainer").show();
    $("#HTMLReporter").hide();

    Option.defaultOptions['hintkeys'] = 'af'

    CancelKeyFunction();
  })


  it("should display hintmode input", function() {
    $("#linkHintsContainer").show();
    $("#HTMLReporter").hide();

    CancelKeyFunction();

    expect(getCmd().css('display')).toBeUndefined()
    Hint.start()

    expect($('#__vim_hint_highlight').children().length).toBeGreaterThan(0)


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
    CancelKeyFunction()

    waits(2000);

    closeOtherTabs(function(tab) {
      Hint.new_tab_start()
      simulateKey('3')

      setTimeout(function() {
        chrome.tabs.query({
          windowId: tab.windowId
        }, function(tabs) {
          expect(tabs.length).toEqual(2)
          expect(tabs[1].url).toEqual($('#uri1').attr('href'))

          closeOtherTabs(function(tab) {
            Hint.new_tab_start()
            simulateTyping('vr')

            setTimeout(function() {
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




  it("should show information about an element ", function() {
    // '<a id="uri2" href="https://github.com/jinzhu/vrome">Vrome page</a>'
    var info = document.getElementById('uri2').outerHTML
    CancelKeyFunction()

    Hint.start()
    simulateKey('?')
    simulateKey('4')

    expect(CmdBox.get().title).toEqual(info)

  })

  it("should focus on an element ", function() {
    CancelKeyFunction()

    Hint.start()
    simulateKey(';')
    simulateKey('3')

    expect(document.activeElement.id).toEqual('uri1')

  })

  it("should copy the URL", function() {
    CancelKeyFunction()

    Hint.start()
    simulateTyping('[4')

    waits(300)


    Post({
      action: "Clipboard.getContent",
      redirect: "HintSubActionsTest.testSubActionCopy"
    });


  })

  it("should copy the text", function() {
    CancelKeyFunction()

    Hint.start()
    simulateTyping('{4')

    waits(300)

    Post({
      action: "Clipboard.getContent",
      redirect: "HintSubActionsTest.testSubActionCopyText"
    });
  })

  it("should open multiple links in a new tab", function() {
    CancelKeyFunction()

    waits(2000);

    closeOtherTabs(function(tab) {
      Hint.multi_mode_start()
      simulateKey('3')
      simulateKey('4')

      setTimeout(function() {
        chrome.tabs.query({
          windowId: tab.windowId
        }, function(tabs) {
          expect(tabs.length).toEqual(3)

          closeOtherTabs(function(tab) {})

        })
      }, wait);
    })
  })

  it("should start hint mode using strings", function() {
    CancelKeyFunction()
    Hint.start_string()
    expect($('#__vim_hint_highlight_span').text()).toEqual('aa')
  })

  it("should update the mnemonics as I type", function() {
    expect($('#__vim_hint_highlight').children().length).toEqual(4)

    simulateTyping('a')
    expect($('#__vim_hint_highlight_span').text()).toEqual('a')
    expect($('#__vim_hint_highlight').children().length).toEqual(2)

    simulateTyping('a')
    expect(document.activeElement.id).toEqual('i1')
  })


  it("should use letters OR numbers based on custom configuration", function() {
    CancelKeyFunction()

    Hint.start()
    expect($('#__vim_hint_highlight_span').text()).toEqual('1')

    Option.defaultOptions['useletters'] = 1

    Hint.start()
    expect($('#__vim_hint_highlight_span').text()).toEqual('aa')

    Option.defaultOptions['useletters'] = 0
  })


  it("should open links in a new tab using letters ", function() {
    CancelKeyFunction()

    waits(20000)

    closeOtherTabs(function(tab) {
      Hint.new_tab_start_string()
      simulateTyping('af')
      setTimeout(function() {
        chrome.tabs.query({
          windowId: tab.windowId
        }, function(tabs) {
          expect(tabs.length).toEqual(2)
          expect(tabs[1].url).toEqual($('#uri1').attr('href'))

          closeOtherTabs(function(tab) {
            // it should open multiple links + update the cmd-box as we type
            CancelKeyFunction()
            Hint.multi_mode_start_string()
            simulateTyping('af')
            simulateTyping('ff')

            setTimeout(function() {
              chrome.tabs.query({
                windowId: tab.windowId
              }, function(tabs) {
                expect(tabs.length).toEqual(3)

                // it should open multiple tabs + keep the first upper case letter
                closeOtherTabs(function(tab) {
                  CancelKeyFunction()
                  Hint.new_tab_start_string()
                  simulateTyping('Af')
                  simulateTyping('f')

                  setTimeout(function() {
                    chrome.tabs.query({
                      windowId: tab.windowId
                    }, function(tabs) {
                      expect(tabs.length).toEqual(3)
                    })
                  }, wait)

                })

              })

            }, wait);


          })

        })
      }, wait)
    })

  })

  it("", function() {
    reset()
  })

  function reset() {
    closeOtherTabs(function(tab) {
      CancelKeyFunction()
      $(".testContainer").hide();
      $("#HTMLReporter").show();
    })
  }


});


var HintSubActionsTest = (function() {
  function testSubActionCopy(msg) {
    expect(msg.data).toEqual($('#uri2').attr('href'))
  }

  function testSubActionCopyText(msg) {
    expect(msg.data).toEqual('Vrome page')
  }

  return {
    testSubActionCopy: testSubActionCopy,
    testSubActionCopyText: testSubActionCopyText
  };
})();
