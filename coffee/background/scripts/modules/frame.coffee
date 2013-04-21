class Frame
  current_frame_urls = {}

  nextUrl = (frames, current_frame_url, count) ->
    uniq_urls = $.unique(frame.url for frame in frames when not /doubleclick\.|qzone\.qq\.com|plusone\.google\.com|about:blank/.test(frame.url)).reverse()
    cur_index = uniq_urls.indexOf(current_frame_url) || 0
    new_index = rabs(cur_index + count, uniq_urls.length)
    uniq_urls[new_index]

  @next: (msg) ->
    tab = getTab(arguments)

    chrome.webNavigation.getAllFrames tabId: tab.id, (frames) ->
      current_frame_urls[tab.id] = nextUrl(frames, current_frame_urls[tab.id], msg.count)
      Post tab, {action: "Frame.select", href: current_frame_urls[tab.id]}

root = exports ? window
root.Frame = Frame
