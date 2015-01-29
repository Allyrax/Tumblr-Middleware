/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

var HttpCodeError = require('./util/http-code-error');
var logger = require('./util/logger');

// Authenticate via OAuth
var tumblr = require('tumblr.js');

var KBUtils = require('./KBUtils');

var client = tumblr.createClient({
  consumer_key: 'Ksy2hE58totLjJ9IoQGD6XWTOjQetliNbBzWUoJtiAG4Wbh267',
  consumer_secret: 'ZST3QzBVBz61sfPOH44OdDCICAe5G29MyynNYQ2miZhYpUGXrh',
  token: 'avmrVE0nLLFKp9JUVe03F1SNlEuKqsAXpEfdCKzlt4NT1XYPEA',
  token_secret: '0rOQpuYTDiY2Jlo0PJuVvLtS4IyNN7bQBaFyH5Zanmp0kiDtQQ'
});

var blogName = "squirrellymcgee";

/**
 * Constructor for abstract channel handlers.
 * This class should be extended as necessary by concrete handler implementations.
 * @constructor
 */
function AbstractChannelHandler() {
}

function buildLogMsg(action, msg) {
    return "resource: abstract channel handler, action: " + action + ", " + msg;
}

/**

	client.userInfo(function (err, data) {
		data.user.blogs.forEach(function (blog) {
			console.log(blog.name);
			blogName = blog.name;
		});
	});



 * Determine whether a channel instance is compatible with the handler.
 *
 * @param {Object} channel channel instance to test
 * @return {Boolean} true if accepted, false otherwise
 */
AbstractChannelHandler.prototype.accept = function (channel) {
    logger.info(buildLogMsg("accept", "msg: not supported by this channel handler"));
	
	if( "name" in channel && "description" in channel && "type" in channel && "url" in channel && "id" in channel && "location" in channel && "state" in channel ) {
		console.log("JSON accepted");
		if( channel.url.indexOf("tumblr.com") > -1) {
			console.log("URL from tumblr.com");			
	 		return true;
		}
	}
	
    return true;
};

/**
 * Deliver a content playlist to a channel instance.
 * Result should be an array of objects corresponding to the posted SC instances.
 *
 * Result objects must at a minimum consist of { scObjectId: '...' } and should be
 * extended with any other data necessary to uniquely reference the deployed content
 * (e.g. post ID).
 *
 * @param {Object} params delivery parameters
 * @param {Object} playlist content playlist
 * @param {Function} callback invoked as callback([error], [result]) when finished
 */
AbstractChannelHandler.prototype.deliver = function (params, playlist, callback) {
    logger.info(buildLogMsg("deliver", "msg: not supported by this channel handler"));
	
	console.log(JSON.stringify(playlist));
	
	var returnObject;
	
	for(var i = 0; i < playlist.length; i++){
		
		//for each text item in the playlist
		for(var j = 0; j < playlist[i].multimedia.text.length; j++) {
			
			var title = playlist[i].multimedia.text[j].property.content;
			var content = playlist[i].multimedia.text[j].property.content;
						
			console.log(content);
			
			if(playlist[i].multimedia.image.length == 0) {
				client.text(blogName, {title: 'text', body: 'text'}, function (err, data) {
								
					returnObject = {"scObjectId": "test", "postId": data.id };
					callback(null, returnObject);
				});
			}
		}
		
		//for each image in the playlist
		for(var j = 0; j < playlist[i].multimedia.image.length; j++) {
			
			var caption = playlist[i].multimedia.text[j].property.content;
			var location = playlist[i].multimedia.image[j].property.location;
						
			console.log(location);
			
			client.photo(blogName, {source: location}, function (err, data) {
				
				returnObject = {"scObjectId": "test", "postId": data.id };
				callback(null, returnObject);
			});
		}
		
		//for each video in the playlist
		for(var j = 0; j < playlist[i].multimedia.video.length; j++) {
			
			var caption = playlist[i].multimedia.text[j].property.content;
			var embed = playlist[i].multimedia.video[j].property.location;
						
			console.log(embed);
			
			var embedCode = "<video controls><source src=" + embed + " type='video/mp4'>Your browser does not support HTML5 video.</video>";
			
			client.video(blogName, {caption: caption, embed: embedCode}, function (err, data) {
				
				returnObject = '{"scObjectId": ' + '", postId": "' + data.id + '"}';

			});
		}
		
		//for each audio item in the playlist
		for(var j = 0; j < playlist[i].multimedia.audio.length; j++) {
			
			var caption = playlist[i].multimedia.text[j].property.content;
			var external_url = playlist[i].multimedia.audio[j].property.location;
						
			console.log(external_url);
			
			client.audio(blogName, {caption: caption, external_url: external_url}, function (err, data) {
				// ...
			});
		}
		
		//for each link item in the playlist
		for(var j = 0; j < playlist[i].multimedia.link.length; j++) {	
			
			var title = playlist[i].multimedia.text[j].property.content;
			var url = playlist[i].multimedia.audio[j].property.location;
						
			console.log(title);
			
			client.link(blogName, {title: title, url: url}, function (err, data) {
				// ...
			});
		}
				
    }
	
	returnObject += "}";
};

/**
 * Get feedback (e.g. replies, comments) from previously delivered content.
 * Result should be an array of objects which use the format provided by
 * translateFeedback().
 *
 * @param {Object} params content parameters
 * @param {Function} callback invoked as callback([error], [result]) when finished
 */
AbstractChannelHandler.prototype.getFeedback = function (params, callback) {
	var returnObject = "{notes: [";
	
    logger.info(buildLogMsg("getFeedback", "msg: not supported by this channel handler"));
	
	client.posts('squirrellymcgee.tumblr.com', { id: 108870155203, notes_info: true }, function (err, data) {
		console.log(data);
		data.posts.forEach(function (post) {
			post.notes.forEach(function (note) {
				
				if( "added_text" in note) {
					returnObject += translateFeedback( note.post_id, blog_url, blog_name, added_text, timestamp ) + ",";
				}
			});
		});
	});
	returnObject += "]}";
	
	return returnObject;
};

/**
 * Remove previously delivered content from the channel instance.
 *
 * The SC instance objects passed in will match those which were provided in the
 * response to the deliver() call.	
 *
 * @param {Object[]} scInstances SC instances to be deleted
 * @param {Function} callback invoked as callback([error]) when finished
 */

AbstractChannelHandler.prototype.remove = function (scInstances, callback) {
    logger.info(buildLogMsg("remove", "msg: not supported by this channel handler"));
	
	console.log(JSON.stringify(scInstancecs));
	
	client.deletePost('squirrellymcgee.tumblr.com', scInstances.postId, function (err, data) {
		// ...
		callback(null);
	});
	
};

/*

{
   "scObjectId": "testing",
   "postId": "sample1",
}

*/


module.exports =	AbstractChannelHandler;