class Vrome
   @enable: ->
     chrome.browserAction.setIcon path: 'images/logo.png'
     chrome.browserAction.setTitle title:"Vrome (enabled)"

   @disable: ->
     chrome.browserAction.setIcon path: 'images/logo-disable.png'
     chrome.browserAction.setTitle title: 'Vrome (disabled)'


root = exports ? window
root.Vrome = Vrome
