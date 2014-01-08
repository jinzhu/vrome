class Completer
  db = openDatabase('vrome', '1.0', 'Vrome Data', 100 * 1024 * 1024)

  sql = (str) ->
    db.executeSql(str)

  @build_index: ->
    sql('CREATE TABLE IF NOT EXISTS urls (id NUMERIC DEFAULT 0, url TEXT, title TEXT, frecency NUMERIC DEFAULT -1)')
    sql('INSERT OR REPLACE INTO urls (url, type, title, frecency, queuedfordeletion, typedVisitIds) VALUES (?, ?, ?, ?, ?, ?)', [historyItem.url, 1, historyItem.title, frecency, 0, visitId])
    # v1 t1, v2 t2, v3 t3, v4 t4, v5 t5

root = exports ? window
root.Completer = Completer
