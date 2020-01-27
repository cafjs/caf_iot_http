const hello = require('./hello/main.js');
const helloIoT = require('./hello/iot/main.js');
const caf_iot = require('caf_iot');
const caf_components = caf_iot.caf_components;
const cli = caf_iot.caf_cli;
const myUtils = caf_components.myUtils;
const async = caf_components.async;
const app = hello;
const appIoT = helloIoT;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception: " + err);
    console.log(myUtils.errToPrettyStr(err));
    process.exit(1);
});

const CA_NAME = 'antonio-' + crypto.randomBytes(16).toString('hex');
process.env['MY_ID'] = CA_NAME;

/* Assumes a python bodysnatcher service running locally at port 7090*/

module.exports = {
    setUp: function (cb) {
        const self = this;
        app.load(null, {name: 'top'}, 'framework.json', null,
                 function(err, $) {
                     if (err) {
                         console.log('setUP Error' + err);
                         console.log('setUP Error $' + $);
                         // ignore errors here, check in method
                         cb(null);
                     } else {
                         self.$ = $;
                         cb(err, $);
                     }
                 });
    },
    tearDown: function (cb) {
        const self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    hello: function(test) {
        test.expect(3);
        var s;
        async.series([
            function(cb) {
                console.log('**********1');
                const self = this;
                appIoT.load(null, {name: 'topIoT'}, null, null,
                 function(err, $) {
                     if (err) {
                         console.log('setUP Error' + err);
                         console.log('setUP Error $' + $);
                         // ignore errors here, check in method
                         cb(null);
                     } else {
                         self.$IoT = $;
                         cb(err, $);
                     }
                 });
            },
            function(cb) {
                console.log('**********2');
                setTimeout(function() {cb(null);}, 5000);
            },
            function(cb) {
                console.log('**********3');
                s = new cli.Session('http://root-helloiot.vcap.me:3000',
                                    CA_NAME, {from: CA_NAME,
                                              log: function(x) {
                                                  console.log(x);
                                              }});
                var id = null;
                s.onopen = function() {
                    const cb1 = function(err, data) {
                        test.ifError(err);
                        console.log('GOT: '+ JSON.stringify(data));
                        cb(err, data);
                    };
                    async.series([
                        function(cb2) {
                            // input, pullup
                            s.call('http://localhost:7090/calibrate', null,
                                   cb2);
                        },
                        function(cb2) {
                            s.startStream('http://localhost:7090/parts',
                                          null, cb2);
                        },
                        function(cb2) {
                            setTimeout(function() {
                                s.stopStream(cb2);
                            }, 10000);
                        }
                    ], cb1);
                };
            },
            function(cb) {
                if (!this.$IoT) {
                    cb(null);
                } else {
                    this.$IoT.topIoT.__ca_graceful_shutdown__(null, cb);
                }
            },
            function(cb) {
                s.onclose = function(err) {
                    console.log(err);
                    test.ifError(err);
                    cb(null);
                };
                s.close();
            }
        ], function(err, res) {
            test.ifError(err);
            test.done();
        });
    }
};
