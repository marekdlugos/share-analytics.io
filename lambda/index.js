console.log('Loading function');
var Q = require("q");
var request = Q.denodeify(require("request"));

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

	if (!event.url || event.url == '') {
		context.fail('Missing parameter url');
		return;
	}

	var data = {url: event.url};

	var p1 = request({
	      method: 'GET',
	      uri: "http://graph.facebook.com/?id="+event.url
	}).then(function(response, body) {
//		console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);
		data["facebook-shares"] = b['shares'];
		data["facebook-comments"] = b['comments'];
		//console.log("Facebook", data);
	}).fail(function(e) {
		console.log(e);
	});

	var p2 = request({
		method: 'GET',
		uri: "http://cdn.api.twitter.com/1/urls/count.json?url="+event.url
	}).then(function(response, body) {
		//console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);
		data["twitter"] = b['count'];
		//console.log("Twitter", data);
	}).fail(function(e) {
		console.log(e);
	});

	var p3 = request({
		method: 'GET',
		uri: "http://www.linkedin.com/countserv/count/share?format=json&url="+event.url
	}).then(function(response, body) {
		//console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);

		data["linkedin"] = b['count'];
		//console.log("LinkedIn", data);
	}).fail(function(e) {
		console.log(e);
	});

	Q.allSettled([p1, p2, p3]).then(function() {
		console.log(data);
		context.succeed(data);
	}).done();
};
