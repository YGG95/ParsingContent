var express = require('express');

var async = require('async');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var app = express();

var concurrencyCount = 0;
var cnodeUrl = 'https://cnodejs.org/';

app.get('/', function(req, res, next) {
	superagent.get(cnodeUrl)
		.end(function(err, sres) {
			if (err) {
				return console.error(err);
			}
			var topicUrls = [];
    		var $ = cheerio.load(sres.text);
    		$('#topic_list .topic_title').each(function (idx, element) {
      			var $element = $(element);
      			var href = url.resolve(cnodeUrl, $element.attr('href'));
      			topicUrls.push(href);
      		});

      		var fetchUrl = function (url, callback) {
      			var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  				concurrencyCount++;
  				console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
  				setTimeout(function () {
    				concurrencyCount--;
    				var htmlcontent = {};
    				superagent.get(url)
    				.end(function(err, ssres) {
    					var topicUrl = url;
    					var topicHtml = ssres.text;
    					var $ = cheerio.load(topicHtml);
    					htmlcontent = {
    						title: $('.topic_full_title').text().trim(),
          					href: topicUrl,
          					comment1: $('.reply_content').eq(0).text().trim(),
    					};
    					callback(null, htmlcontent);
    				});
  				}, delay);
      		};

      		async.mapLimit(topicUrls, 5, function (url, callback) {
    			fetchUrl(url, callback); 
    		}, function(err, result) {
    			console.log('Number of entries is: ');
  				console.log(result.length);
  				res.send(result);
    		});
		});
});
app.listen(3000, function() {
	console.log('app is listening at port 3000');
});
app.listen(process.env.PORT || 5000);
