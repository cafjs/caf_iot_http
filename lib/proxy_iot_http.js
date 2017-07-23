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
 * A proxy to access  HTTP services.
 *
 * @module caf_iot_http/proxy_iot_http
 * @augments external:caf_components/gen_proxy
 *
 */
var caf_iot = require('caf_iot');
var caf_comp = caf_iot.caf_components;
var genProxy = caf_comp.gen_proxy;

/**
 * Factory method to access external HTTP services.
 *
 * @see caf_components/supervisor
 */
exports.newInstance = function($, spec, cb) {

    var that = genProxy.constructor($, spec);

    /**
     * Calls an external http service.
     *
     * It does not respect transaction semantics, and it will not be delayed
     * or rollbacked.
     *
     * @param {string} url A URL for the service.
     * @param {Object} args A map with optional arguments to form a query
     * string.
     * @param {caf.cb} cb A callback with results or an error.
     *
     * @memberof! module:caf_iot_http/proxy_iot_http#
     * @alias dirtyCall
     */
    that.dirtyCall = function(url, args, cb) {
        $._.__iot_dirtyCall__(url, args, cb);
    };

    /**
     * Starts an http stream returning JSON objects.
     *
     *
     * @param {string} url A URL for the service.
     * @param {Object} args A map with optional arguments to form a query
     * string.
     * @param {string} methodName A method to process the stream objects. The
     * method signature is `function(Object, caf.cb)`.
     * @return {caf.request} A request id for this stream.
     *
     * @memberof! module:caf_iot_http/proxy_iot_http#
     * @alias startStream
     *
     */
    that.startStream = function(url, args, methodName) {
        return $._.__iot_startStream__(url, args, methodName);
    };

    /**
     * Stops streaming.
     *
     * @param {caf.request} The id of the http stream
     *
     * @memberof! module:caf_iot_http/proxy_iot_http#
     * @alias stopStream
     */
    that.stopStream = function(id) {
        return $._.__iot_stopStream__(id);
    };

    Object.freeze(that);

    cb(null, that);
};
