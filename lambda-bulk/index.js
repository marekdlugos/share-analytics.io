console.log('Loading function');
var Q = require("q");
var uuid = require('node-uuid');
var knex = require('./model.js').knex;

function handleUrl(url, results) {
	var data = {url: url};
	var deferred = Q.defer();
	console.log("URL", url);

	knex.select('urls.url_id', 'twitter', 'facebook-shares', 'facebook-comments', 'googleplus').table('urls')
		.leftJoin('url_responses', 'urls.url_id', '=', 'url_responses.url_id')
		.orderBy('url_responses.created_at', 'desc')
		.limit(1)
		.where({"url": url}).then(function(list) {
			console.log(list);
			if (list.length > 0) {
				var row = list[0];
				data['uuid'] = row['url_id'];

				if (row['googleplus'] || row['twitter'] || row['facebook-shares']) {
					data['googleplus'] = row['googleplus'];
					data['twitter'] = row['twitter'];
					data['linkedin'] = row['linkedin'];
					data['facebook-shares'] = row['facebook-shares'];
					data['facebook-comments'] = row['facebook-comments'];
				}

				results[url] = data;
				deferred.resolve();
			} else {
				var dbEntry = {
					url: url,
					"url_id": uuid.v4(),
					updated_at: new Date(),
					created_at: new Date()
				};

				data['uuid'] = dbEntry['url_id'];
				results[url] = data;

				/* return promise to wait for */
				knex.table('urls').insert(dbEntry).then(function() {
					deferred.resolve();
				}).catch(function(e) {
					console.trace(e, e.stack.split("\n"));
					throw e;
				}).done();
			}
	}).catch(function(e) {
		console.trace(e, e.stack.split("\n"));
		throw e;
	}).done();

	return deferred.promise;
}

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

	if (!event.urls || event.urls == '') {
		context.fail('Missing parameter urls');
		return;
	}

	var urls = event.urls.split("\n");

	var promise = Q(true);

	var results = {};

	urls.forEach(function (url) {
		promise = promise.then(function() {
			return handleUrl(url, results);
		});
	});

	promise.then(function() {
		console.log(results);
		context.succeed(results);
	}).catch(function(e) {
		console.trace(e, e.stack.split("\n"));
		throw e;
	}).done();

};
