/*!
 Copyright 2013 Hewlett-Packard Development Company, L.P.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';
/**
 *  Provides access to HTTP services.
 *
 * @module caf_iot_http/plug_iot_http
 * @augments external:caf_iot/gen_plug_iot
 *
 */
var assert = require('assert');
var request = require('request');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var url = require('url');
var caf_iot = require('caf_iot');
var myUtils = caf_iot.caf_components.myUtils;
var genPlugIoT = caf_iot.gen_plug_iot;
var util = require('util');


exports.newInstance = function($, spec, cb) {
    try {

        var that = genPlugIoT.constructor($, spec);

        assert.equal(typeof spec.env.cloudSync, 'boolean',
                     "'spec.env.cloudSync' not a boolean");

        $._.$.log && $._.$.log.debug('New HTTP plug');

        that.__iot_dirtyCall__ = function(targetURL, args, cb0) {
            var f = function(cb1) {
                try {
                    var u = url.parse(targetURL);
                    if (args) {
                        u.query = args;
                    }
                    request.post({url: url.format(u), json: true},
                                 function(err, response, body) {
                                     cb1(err, body);
                                 });
                } catch (err) {
                    cb1(err);
                }
            };
            myUtils.retryWithDelay(f, spec.env.maxRetries, spec.env.retryDelay,
                                   cb0);
        };


        that.__iot_dirtyCallPromise__ = util.promisify(that.__iot_dirtyCall__);


        that.__iot_startStream__ = function(targetURL, args, methodName) {
            var u = url.parse(targetURL);
            if (args) {
                u.query = args;
            }
            var r = request({url: url.format(u)});
            r.pipe(JSONStream.parse())
                .pipe(es.mapSync(function (data) {
                    $._.$.queue &&
                        $._.$.queue.process(methodName, [data],
                                            {noSync: !spec.env.cloudSync});
                    return data;
                }));
            return r;
        };

        that.__iot_stopStream__ = function(id) {
            id.abort();
        };

        cb(null, that);
    } catch (err) {
        cb(err);
    }
};
