var qs = require('querystring')
var websocket = require('websocket-stream')
var got = require('got')
var duplex = require('duplexify')
var debug = require('debug')('sleep-irccloud')

var baseUrl = 'https://www.irccloud.com'

module.exports = function (opts) {
  var stream = duplex.obj()
  var socketOpts =  {origin: 'https://www.irccloud.com', headers: {'Cookie': 'session=' + opts.session}}
  var ws = websocket('wss://www.irccloud.com/', socketOpts)
  ws.on('data', function (c) {
    try { c = JSON.parse(c) } catch (e) { return stream.destroy(e) }
    if (c.type !== 'oob_include') return // ignore other metadata
    var msgStream = got(baseUrl + c.url, {headers: {'Cookie': 'session=' + opts.session, 'Accept-Encoding': 'gzip'}})
    stream.setReadable(msgStream)
  })
  return stream
}

module.exports.login = function login (opts, cb) {
  got.post(baseUrl + '/chat/auth-formtoken', {json: true}, function (err, data) {
    debug(data)
    if (err) return cb(err)
    var headers = {'content-type': 'application/x-www-form-urlencoded', 'x-auth-formtoken': data.token}
    var body = qs.stringify({token: data.token, email: opts.email, password: opts.password})
    got.post(baseUrl + '/chat/login', {headers: headers, body: body}, function (err, data, resp) {
      debug(data)
      if (err) return cb(err)
      try { data = JSON.parse(data) } catch (e) { return cb(e) }
      cb(null, data)
    })
  })
}