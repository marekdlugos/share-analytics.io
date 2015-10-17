console.log('Loading function');
var Q = require("q");
var request = Q.denodeify(require("request"));

function elapsedTime (start) {
	var precision = 3; // 3 decimal places
	var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
	return process.hrtime(start)[0] + "s, " + elapsed.toFixed(precision) + "ms";
}

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

	if (!event.url || event.url == '') {
		context.fail('Missing parameter url');
		return;
	}


	var start = process.hrtime();
	var data = {url: event.url};

	var p1 = request({
	      method: 'GET',
	      uri: "http://graph.facebook.com/?id="+event.url
	}).then(function(response, body) {
//		console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);
		data["facebook-shares"] = b['shares'] ? b['shares'] : 0;
		data["facebook-comments"] = b['comments'] ? b['comments'] : 0;
		console.log("Facebook", elapsedTime(start));
	}).fail(function(e) {
		console.log(e);
	});

	var p2 = request({
		method: 'GET',
		uri: "http://cdn.api.twitter.com/1/urls/count.json?url="+event.url
	}).then(function(response, body) {
		//console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);
		data["twitter"] = b['count'] ? b['count'] : 0;
		console.log("Twitter", elapsedTime(start));
	}).fail(function(e) {
		console.log(e);
	});

	var p3 = request({
		method: 'GET',
		uri: "http://www.linkedin.com/countserv/count/share?format=json&url="+event.url
	}).then(function(response, body) {
		//console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);

		console.log("linkedin", elapsedTime(start));
		data["linkedin"] = b['count'] ? b['count'] : 0;
	}).fail(function(e) {
		console.log(e);
	});

	var p4 = request({
		method: 'POST',
		json: true,
		body: [{
			"method":"pos.plusones.get",
			"id":"p",
			"params":{
				"nolog":true,
				"id":event.url,
				"source":"widget",
				"userId":"@viewer",
				"groupId":"@self"
			},
			"jsonrpc":"2.0",
			"key":"p",
			"apiVersion":"v1"
		}],
		uri: "https://clients6.google.com/rpc?key=AIzaSyAES4Ya_kcxHLtbSacbHYPmiLE6Nrfmp-4"
	}).then(function(response, body) {
		console.log(response[0], response[0].body);
		var b = JSON.parse(response[0].body);

		console.log("googleplus", elapsedTime(start));
		var cnt = b[0]['result']['id'];
		data["googleplus"] = cnt ? cnt : 0;
	}).fail(function(e) {
		console.log(e);
	});

	Q.allSettled([p1, p2, p3, p4]).then(function() {
		console.log(data);
		context.succeed(data);
	}).done();
};
