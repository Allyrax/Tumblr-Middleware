/**
 * Copyright Digital Engagement Xperience 2014
 * Created by  shawn.
 * @description
 */

var config = {
    kb: {
        host: process.env.KB_HOST || 'developer.kb.dexit.co',
        port: process.env.KB_PORT || 80,
        protocol: process.env.KB_PROTOCOL || 'http'
    },
    eb :  {
        host: process.env.EB_HOST || 'eb.dexit.co',
        port: process.env.EB_PORT || 80,
        protocol: process.env.EB_PROTOCOL || 'http'
    },
    timer: {
        startLength:  process.env.START_LENGTH || 1000,
        winnerLength: process.env.WINNER_LENGTH || 1000
    },
    defaultOffset: process.env.DEFAULT_OFFSET || 20000,
    event: {
        id:  process.env.UPDATE_EVENT,
        producerId: process.env.ENTITY_KEY
    },
    oauth2: {
        host: process.env.OAUTH2_HOST || 'sso.dexit.co',
        port: process.env.OAUTH2_PORT || 443,
        clientId: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET
    },
    auth: {
        userName: process.env.USERNAME,
        password: process.env.PASSWORD,
        tenant: process.env.TENANT
    }
};

module.exports = config;