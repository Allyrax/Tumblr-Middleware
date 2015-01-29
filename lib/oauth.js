/**
 * Copyright Digital Enagement Xperience 2014
 * Created by  shawn on 14-10-31.
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
    }
   this.protocol = https;
   this.host = config.oauth2.host;
   this.port = config.oauth2.port;
   this.path = '/openam/oauth2';
   this.clientId = config.oauth2.clientId;
   this.clientSecret = config.oauth2.clientSecret;
   this.realm = config.auth.realm;
}

OAuth2Authentication.prototype.authenticate = function (userId, password, realm, callback) {
   if (_.isFunction(realm)) {
        callback = realm;
        realm = null;
    }

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
           "Content-length": body.length
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
        utils.handleRequestError(e, callback);
    });
    req.end(options.msgbody);
};

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
        self._handleError((e, callback));
    });
    req.end(options.msgbody);
};


/**
 * Handle errors
 * @param res
 * @param callback
 * @private
 */
OAuth2Authentication.prototype._handleError = function(res, callback) {

};

/**
 * Utility to handle response codes
 * @param res
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
           case 400:
                error = new Error("Bad request");
               break;

           case 401:
                error = new Error("Unauthorized");
               break;

           case 403:
                error = new Error("Forbidden");
               break;
           case 404:
                error = new Error('not found');
               break;

           default:
                error = new Error("unhandled response");
               break;
        }

       if(error){
            error.status = res.statusCode;
        }
        callback( error, data );
    });
};


OAuth2Authentication.prototype.logout = function (token, callback) {
    console.log("OAuth2 logout not supported");
    callback(null, undefined);
};

module.exports = OAuth2Authentication;