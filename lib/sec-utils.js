/**
 * Copyright Digital Engagement Xperience 2014
 * Created by shawn
 * @description
 */
/*jslint node: true */
"use strict";

var authToken = null;
var config = require('../config');	
var OAuth2Authentication = require('./oauth');
var authManager = new OAuth2Authentication(config);
exports.authToken = authToken;
/**
 * Retrieves the specified auth token using the configured username, password, and tenant
 * @param callback
 * @private
 */
exports._getAuthToken = function(callback){

    function getToken(callback) {

        authManager.authenticate('mlaing7@uwo.ca', 'D@7.......', 'techiesindev',function(err, token) {
            if (err) {
                console.log("Error logging in and creating a token:"+err.message);
                return callback(err);
            }
            authToken = token;
            callback(null,token);
        })

    }

    if (!authToken) {
        getToken(callback);
    } else {
        authManager.checkTokenValidity(authToken,function(err, result) {
            if (err){
                console.warn("Error validating system token "+authToken+ ":"+err.message);
            }
            if(result) {
                callback(null,authToken);
            }else {
                //renew token
                getToken(callback);
            }

        });
    }
};