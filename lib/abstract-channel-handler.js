/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

var HttpCodeError = require('./util/http-code-error');
var logger = require('./util/logger');

// Authenticate via OAuth
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: 'Ksy2hE58totLjJ9IoQGD6XWTOjQetliNbBzWUoJtiAG4Wbh267',
  consumer_secret: 'ZST3QzBVBz61sfPOH44OdDCICAe5G29MyynNYQ2miZhYpUGXrh',
  token: 'avmrVE0nLLFKp9JUVe03F1SNlEuKqsAXpEfdCKzlt4NT1XYPEA',
  token_secret: '0rOQpuYTDiY2Jlo0PJuVvLtS4IyNN7bQBaFyH5Zanmp0kiDtQQ'
});

var blogName = "";

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
 * Determine whether a channel instance is compatible with the handler.
 *
 * @param {Object} channel channel instance to test
 * @return {Boolean} true if accepted, false otherwise
 */
AbstractChannelHandler.prototype.accept = function (channel) {
    logger.info(buildLogMsg("accept", "msg: not supported by this channel handler"));
	
	client.userInfo(function (err, data) {
		data.user.blogs.forEach(function (blog) {
			console.log(blog.name);
			blogName = blog.name;
		});
	});
    return false;
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
    callback(new HttpCodeError(200, 'Post Created... probably'));
	
	client.text(blogName, {body: 'Testing the tests of testingness'}, function (err, data) {
		// ...
	});
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
    logger.info(buildLogMsg("getFeedback", "msg: not supported by this channel handler"));
    callback(new HttpCodeError(200, 'Feedback unappreciated and will be ignored'));
	
	client.posts('squirrellymcgee.tumblr.com', { id: 109121936743, notes_info: true }, function (err, data) {
		data.posts.forEach(function (post) {
			post.notes.forEach(function (note) {
				console.log(note.blog_name);
			});
		});
	});
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
    callback(new HttpCodeError(200, 'Remove implemented, proably improperly'));
	
	// Make the request
	client.deletePost('squirrellymcgee.tumblr.com', 109159388435, function (err, data) {
		// ...
	});
};


module.exports = AbstractChannelHandler;