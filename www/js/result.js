$(document).ready(function(){
	var url = location.search.split('url=')[1];

	$.ajax({
		url: "https://t4fzdgrbyi.execute-api.eu-west-1.amazonaws.com/prod?url=" + url,
		contentType: "application/json",
		success : function(data) {
			if(data['facebook-shares'] == undefined)data['facebook-shares'] = 0;
			if(data['twitter'] == undefined)data['twitter'] = 0;
			if(data['linkedin'] == undefined)data['linkedin'] = 0;
			if(data['googleplus'] == undefined)data['googleplus'] = 0;

			var facebook_min = parseInt(data['facebook-shares']) - 200 > 0 ? parseInt(data['facebook-shares']) - 200 : 0;
			animateValue("facebook", facebook_min, data['facebook-shares'], 1000);

			var twitter_min = parseInt(data['twitter']) - 200 > 0 ? parseInt(data['twitter'])-200 : 0;
			animateValue("twitter",twitter_min, data['twitter'], 1000);

			var linkedin_min = parseInt(data['linkedin']) - 200 > 0 ? parseInt(data['linkedin'])-200 : 0;
			animateValue("linkedin",linkedin_min, data['linkedin'], 1000);

			if(data['googleplus'] == -1) {
				$('#google').innerHTML = "Moc";
			}
			else {
				var google_min = parseInt(data['googleplus']) - 200 > 0 ? parseInt(data['googleplus']) - 200 : 0;
				animateValue("google", google_min, data['googleplus'], 1000);
			}

		},
		error : function(error) {

		}
	})
});
