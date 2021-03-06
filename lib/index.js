'use strict';

// Assumptions:
//   you have a project with a web app such as ~/my-project/lib/server.js
//   you will place the certs in ~/my-project/certs/
//
// git clone https://github.com/Daplie/localhost.daplie.com-certificates.git ../certs

var fs = require('fs');
var path = require('path');

//
// SSL Certificates
//
var tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'privkey.pem'))
, cert: fs.readFileSync(path.join(__dirname, '..', 'fullchain.pem'))
, requestCert: false
, rejectUnauthorized: true
};
var secureContext = require('tls').createSecureContext(tlsOptions);
var options = {
  key: tlsOptions.key
, cert: tlsOptions.cert
, requestCert: tlsOptions.requestCert
, rejectUnauthorized: tlsOptions.rejectUnauthorized

  // If you need to use SNICallback you should be using io.js >= 1.x (possibly node >= 0.12)
, SNICallback: function (domainname, cb) {
    // null means all requests will default to this certificate
    // var secureContext = null;
    // Instead we explicitly set the context to this one (for example's sake)

    if ('function' === typeof cb) {
      cb(null, secureContext);
    } else {
      console.error('your version of node is too old to properly handle SNICallback');
      return secureContext;
    }
  }
, NPNProtocols: ['http/1.1']
};

module.exports = options.options = options;
module.exports.create = function (opts) {
  opts = opts || {};

  var newObj = {};
  Object.keys(opts).forEach(function (key) {
    newObj[key] = opts[key];
  });

  return module.exports.merge(newObj);
};
module.exports.merge = function (opts) {
  opts = opts || {};

  Object.keys(options).forEach(function (key) {
    if (!(key in opts)) {
      opts[key] = options[key];
    }
  });

  // prevent circular refs (until v2.0.0 when this can be removed)
  delete opts.merge;
  delete opts.create;
  delete opts.options;
  return opts;
};
// var server = https.createServer(options || require('localhost.daplie.com-certificates'));
// server.on('request', function (req, res) { res.end('hello'); });
// server.listen(443, function () { console.log('<https://localhost.daplie.com>'); });
