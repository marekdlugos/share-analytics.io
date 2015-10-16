console.log('Loading function');
var request = require("request");

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

	request({
	      method: 'GET',
	      uri: "http://graph.facebook.com/?id="+event.url
	}, function(error,response, body) {
	    //console.log(response, body);
		var data = {
			"facebook": body
		};
		console.log(data);		
		context.succeed(data);
	});
};
