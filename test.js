var ic = require('./index.js')
var prompt = require('prompt-sync')
var ndjson = require('ndjson')
var through = require('through2')
var jsonfilter = require('jsonfilter')

// prompt.init()
// console.error('Email: ')
// var email = prompt.prompt()
// console.error('Password:')
// var password = prompt.prompt({hidden: true, echo: '*'})

var opts = {email: 'mogden@gmail.com', password: 'yerevan'}

// ic.login(opts, function (err, session) {
//   if (err) throw err
//   var msgs = ic.backlog(session)
//   var filter = jsonfilter('*')
//   var select = through.obj(function (obj, enc, next) {
//     next(null, obj)
//     return
//     if (obj.type && obj.type === 'buffer_msg') {
//       var ts = obj.eid.toString()
//       ts = ts.slice(0, ts.length - 3) // micro -> milli
//       obj.date = new Date(+ts)
//       next(null, obj)
//     }
//     else next()
//   })
//   // parse, trim, select, serialize
//   msgs.pipe(filter).pipe(ndjson.parse()).pipe(select).pipe(ndjson.serialize()).pipe(process.stdout)
// })


ic.login(opts, function (err, session) {
  if (err) throw err
  var msgs = ic.archive(session)
})
