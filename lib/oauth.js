/**
 * Copyright Digital Engagement Xperience 2014
 * Created by  shawn
 * @description
 */

/*jslint node: true */
"use strict";
var https = require('https'),
    _ = require('underscore'),
    formUrlEncoded = require('form-urlencoded');

function OAuth2Authentication(config) {
    if (!config || !config.oauth2 || !config.auth) {
        console.log("resource:OAuth2Authentication, action:initialization, error: oauth2 or auth configuration is undefined");
        throw new Error("Missing configuration:config or config.oauth2 or config.auth");
    }
    this.protocol = https;
    this.host = config.oauth2.host;
    this.port = config.oauth2.port;
    this.path = '/openam/oauth2';
}

OAuth2Authentication.prototype.authenticate = function (userId, password, realm, callback) {
    var self = this;

    var body = formUrlEncoded.encode({
        grant_type: 'password',
        username: userId,
        password: password
    });

    var options = {
        host: this.host,
        port: this.port,
        path: this.path + '/access_token' + (realm ? "?realm=/" + realm : ""),
        method: 'POST',
        auth: this.clientId + ':' + this.clientSecret,
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
			"Authorization": 'Basic ZHgtc2VydmljZToxMjMtNDU2LTc4OQ=='
            //"Content-length": Buffer.byteLength(body)
        },
        msgbody: body
    };
    //Create the request
    var req = this.protocol.request(options, function (res) {
        self._handleResponse(res, function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(err, result.access_token);
            }
        });
    });
    //End the request
    req.on("error", function (e) {
        self._handleError(e, callback);
    });
    req.end(options.msgbody);
};

/**
 * Retrieve the token details to validate
 * @param token The token identifier
 * @param callback
 * @returns {*}
 */
OAuth2Authentication.prototype.checkTokenValidity = function (token, callback) {
    var self = this;
    if (!token) {
        return callback(null, false);
    }
    var options = {
        host: this.host,
        port: this.port,
        path: this.path + '/tokeninfo?access_token=' + token,
        method: 'GET'
    };
    //Create the request
    var req = this.protocol.request(options, function (res) {
        self._handleResponse(res, function (err, result) {
            if (err) {
                callback(err);
            } else if (result && result.expires_in) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        }, true);
    });
    //End the request
    req.on("error", function (e) {
        self._handleError(e, callback);
    });
    req.end(options.msgbody);
};


/**
 * Log and return error
 * @param e The error that occurred
 * @param callback
 * @private
 */
OAuth2Authentication.prototype._handleError = function(e, callback) {
    console.log('Error with OAuth2Authentication request:'+ e.message);
    callback(e);
};

/**
 * Utility to handle response codes
 * @param res The response
 * @param callback
 * @private
 */
OAuth2Authentication.prototype._handleResponse= function(res, callback) {

    //Variable to deal with the response
    var str = '';
    //Set the encoding of the response to UTF8
    res.setEncoding('utf8');

    //chunked data
    res.on('data', function (chunk) {
        //Append the chunk of data to the string
        str += chunk;
    });

    //End of the response - Response Received
    res.on('end', function () {

        var error, data;

        switch (res.statusCode) {
            case 200:
            case 201:
                if(str) {
                    try {
                        data = JSON.parse(str);
                    } catch(e){
                        data = str;
                    }
                }
                break;
            default:
                error = new Error("Bad request:"+res.statusCode);
        }

        if(error){
            error.status = res.statusCode;
        }
        callback( error, data );
    });
};

module.exports = OAuth2Authentication;