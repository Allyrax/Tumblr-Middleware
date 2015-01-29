var self = this;

var request = require('request');


var secUtils = require('./sec-utils');

var authToken;

// Authenticate via OAuth
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'Ksy2hE58totLjJ9IoQGD6XWTOjQetliNbBzWUoJtiAG4Wbh267',
  consumer_secret: 'ZST3QzBVBz61sfPOH44OdDCICAe5G29MyynNYQ2miZhYpUGXrh',
  token: 'avmrVE0nLLFKp9JUVe03F1SNlEuKqsAXpEfdCKzlt4NT1XYPEA',
  token_secret: '0rOQpuYTDiY2Jlo0PJuVvLtS4IyNN7bQBaFyH5Zanmp0kiDtQQ'
});

secUtils._getAuthToken(function(err, token) {
	console.log(token);
	
	authToken = token;

	if (err) {
		return callback(new Error('Internal service error: invalid credentials'));
	}
});

callDatabase = function (sqlQuery) {
	//console.log(authToken);		
	getOptions.url = dataHost + sqlQuery;
	getOptions.headers.Authorization = 'Bearer ' + authToken;
	//console.log(sqlQuery);
	
	//console.log(getOptions.url);
	
	var info = request(getOptions, postCallback);
	
	return info;
}

var dataHost = 'http://developer.kb.dexit.co/access/stores/Tumblr/query/?query=';
var getOptions = {
	url: dataHost,
	headers: {
		'Accept': 'application/json',
		'Authorization': ''
	}
};

function postCallback(error, response, body) {
    //console.log(response.statusCode);
    if (!error && response.statusCode == 200) {
        //console.log("Event Posted OK");
    }
}

setInterval(function() {
	
	callDatabase("DELETE from feedback");

	client.posts('dexbonus.tumblr.com', { notes_info: true }, function (err, data) {
		data.posts.forEach(function (post) {
			post.notes.forEach(function (note) {
				
				if( "added_text" in note) {
					callDatabase("INSERT INTO feedback VALUES(1," + note.post_id + ", " + note.post_id + ",'" + note.blog_name + "','" + note.added_text + "', " + note.timestamp +")");
				}
			});
		});
	});

  /*
  //put extract data
  self.extractData(id, function(err, data) {
    if (err){
        callback(err);
     } 
    //compute change
     self.diff(function(err, dat) {
         //save changes
         self.kbClient.persist(dat, callback);
      });
   });
  */

 }, 10000);

//poll on a 20 second interval

var _ = require('underscore');

var protocol;
function KBUtils(config) {

   if (!config || !config.kb) {
       throw new Error("Configuration is required!");
    }

   this.config = config;

   if (config.protocol === 'https') {
        protocol = require('https');
    }else {
        protocol = require('http');
    }
}

KBUtils.prototype.setToken = function(token) {
 this.token = token;
 return this;
};

KBUtils.prototype.persistSample = function(data, callback) {
   
    //convert data to insert:  this is specific to the structure for the data
    var query = "INSERT INTO post_data (blogId,postId, timestamp, noteInfo) VALUES (?,?,?,?)";
    var queryParams = [data.blogId, data.postId, data.timestamp, JSON.stringify(noteInfo)];

    this.executeQuery(this.token,query, queryParams, this.config.datastore, callback);

}

/**
 * Handle Http Request to KB
 * @param options {json} The request parameters
 * @param body {json} The body of the message
 * @param cb
 */
function makeHttpRequest(options, body, cb) {


    body= JSON.stringify(body);
    options.headers['Content-length'] = Buffer.byteLength(body);


   var req = protocol.request(options, function(response) {
        response.setEncoding('utf8');
       var str ='';
        response.on('data',function(chunk) {
            str += chunk;
        });
        response.on('end', function() {
           var code = response.statusCode;
           if (code === 200 || code === 204) {
               var err;
               var dat;
               try {
                    dat = JSON.parse(str);
                    err = null;
                }catch(e){
                    err = e;
                }
                cb(err,dat);
            }else {
               var errr = new Error('unexpected response code:'+code);
                errr.httpCode = 500;
                cb(errr);
            }
        });
        response.on('error', function(err){
           return cb(err);
        });
    });

    req.on('error', function(e) {
        console.error(e);
        cb(e);
    });
    req.write(body);
    req.end();

}

KBUtils.prototype.executeQuery = function (token,query, queryParams, dataStore, callback) {

    //this is the connection details to KB
   var options = {
        host: this.config.kb.host,
        port: this.config.kb.port,
        path: "/access/stores/" + dataStore + "/query",
        method: 'POST',
        headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
        }
    };
   //add token to header if present
   if (token) {
        options.headers.Authorization = 'Bearer ' + token;
    }

   //construct the query object
   var queryObject = {};
    queryObject.query = query;
   if (queryParams && queryParams.length > 0) {
        queryObject.parameters = queryParams;
    }


    makeHttpRequest(options, queryObject, function(err, data) {
       if (err){
           return callback(err);
        }
        callback(err,data);
    });

};
module.exports = KBUtils;