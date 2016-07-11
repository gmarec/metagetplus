// A module to fetch HTML meta tags from a remote URL
var cheerio = require('cheerio');
var request = require('request');
var iconv  = require('iconv-lite');
var charset = require('charset');

module.exports = {
	fetch: function (uri, user_options, callback) {
		var options = {
			url: uri,
			headers: {
				'User-Agent': 'request'
			},
                        encoding: null
		};
		
		//  setup the args/user_options
		var user_args = [];
		for (var i = 0; i < arguments.length; i++) {
			user_args.push(arguments[i]);
		}
		
		// remove these from arg array
		uri = user_args.shift();
		callback = user_args.pop();
		
		// get user_options if specified
		if(user_args.length > 0){
			user_options = user_args.shift();
		}else{
			user_options = null;
		}

		// override default headers
		if(user_options){
			options.headers = user_options.headers;
		}
		
		request.get(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
                     if (charset(response.headers['content-type']) == 'iso-8859-1') {
                       var utf8String = iconv.decode(new Buffer(body), "ISO-8859-1");
                       var $ = cheerio.load(utf8String);
                     } else {
                       var $ = cheerio.load(body);
                     }


				var meta = $('meta');
				var link = $('link');
				var title = $('title').text();
				var keys = Object.keys(meta);
				var lkeys = Object.keys(link);
				var global_obj = {};
				var meta_obj = {};
				var link_obj = [];
				keys.forEach(function (key){
					if (meta[key].attribs != undefined) {
						if (meta[key].attribs.property && meta[key].attribs.content) {
							meta_obj[meta[key].attribs.property] = meta[key].attribs.content;
						}
						if (meta[key].attribs.name && meta[key].attribs.content) {
							meta_obj[meta[key].attribs.name] = meta[key].attribs.content;
						}
					}
				});
				lkeys.forEach(function (key){
					if (link[key].attribs != undefined && (link[key].attribs.rel.indexOf('icon') > -1 || link[key].attribs.rel == 'manifest')) {
				        	link_obj.push(link[key].attribs);
					}
				});
				global_obj.meta = meta_obj;
				global_obj.link = link_obj;
				global_obj.title = title;
				
				callback(null, global_obj);
			}else{
				callback(new Error('Bad Request' + response.statusCode));
			}
		});
	}
};
