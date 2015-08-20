var qs = require('querystring')
var websocket = require('websocket-stream')
var got = require('got')
var duplex = require('duplexify')
var debug = require('debug')('sleep-irccloud')

var baseUrl = 'https://www.irccloud.com'

module.exports.socket = function (opts) {
  var socketOpts =  {origin: baseUrl, headers: {'Cookie': 'session=' + opts.session}}
  return websocket('wss://api.irccloud.com/websocket/2', socketOpts)
}

module.exports.archive = function (opts) {
  var stream = duplex.obj()
  
  getExports(function (exports) {
    console.log('inprogress', exports.inprogress)
    var ws = module.exports.socket(opts)
    // trigger new export
    if (exports.inprogress.length === 0) {
      var auth = JSON.stringify({"timezone":"Europe/Copenhagen","_reqid":1,"_method":"export-log"})
      ws.write(auth)
    }
  })
  
  function getExports (cb) {
    got(baseUrl + '/chat/log-exports', {json: true, headers: {'Cookie': 'session=' + opts.session}}, function (err, data) {
      if (err) return stream.destroy(err)
      cb(exports)
    })
  }
}

module.exports.backlog = function (opts) {
  var stream = duplex.obj()
  var ws = module.exports.socket(opts)
  ws.on('data', function (c) {
    try { c = JSON.parse(c) } catch (e) { return stream.destroy(e) }
    if (c.type !== 'oob_include') return // ignore other metadata
    var msgUrl = baseUrl + c.url
    var headers =  {'Cookie': 'session=' + opts.session, 'Accept-Encoding': 'gzip'}
    debug(msgUrl, headers)
    var msgStream = got.stream(msgUrl, {headers: headers})
    stream.setReadable(msgStream)
  })
  ws.on('error', function (e) {
    stream.destroy(e)
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