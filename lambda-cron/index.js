console.log('Loading function');
var Q = require("q");
var uuid = require('node-uuid');
var knex = require('./model.js').knex;
var aws = require('aws-sdk');

var sqs = new aws.SQS({
	region: 'eu-west-1',
	accessKeyId: 'AKIAIBZXUL4J7DZ64O7A',
	secretAccessKey: '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',

	// For every request in this demo, I'm going to be using the same QueueUrl; so,
	// rather than explicitly defining it on every request, I can set it here as the
	// default QueueUrl to be automatically appended to every request.
	params: {
		QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/352718585477/crawl-data'
	}
});

var sendMessageBatch = Q.nbind( sqs.sendMessageBatch, sqs );

function sendMessage(items) {
	var mp = sendMessageBatch({
		Entries: items,
	}).then(function( data ) {

		console.log( "Messages sent");

	}).catch(function( error ) {

		console.log( "Unexpected Error:", error.message );

	});

	return mp;
}

function handleUrl() {
	var deferred = Q.defer();

	knex.select().table('urls')
		.orderBy('updated_at', 'desc')
		.then(function(list) {
		var promise = Q(true);

		var arr = [];

		list.forEach(function(row) {
			console.log(row.url_id);

			arr.push({
				Id: row.url_id,
				MessageBody: JSON.stringify({
					url_id: row.url_id,
					url: row.url
				})
			});

			if (arr.length == 10) {
				var copy = arr;
				arr = [];

				var mp = sendMessage(copy);

				promise = promise.then(function() {
					return mp;
				});

			}
		});

		/* send the rest */
		if (arr.length > 0) {
			var copy = arr;
			arr = [];

			var mp = sendMessage(copy);

			promise = promise.then(function() {
				return mp;
			});
		}

		promise.then(function() {
			console.log("Array Length", list.length);
			deferred.resolve();
		});

		return promise;
	}).catch(function(e) {
		console.trace(e, e.stack.split("\n"));
		throw e;
	});

	return deferred.promise;
}

exports.handler = function(event, context) {
    console.log('Received event');

	handleUrl().then(function() {
		context.succeed("");
	}).catch(function(e) {
		console.trace(e, e.stack.split("\n"));
		throw e;
	}).done();

};
