var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');

var url = require('url');
var cnodeUrl = 'https://cnodejs.org/';

var app = new express();
var topicUrls = [];

var ep = new eventproxy();

app.get('/', function (req, res, next){
	superagent.get('https://cnodejs.org/')
	.end(function (err, sres){
		if (err){
			return console.error(err);
		}

		var $ = cheerio.load(sres.text);

		$('#topic_list .topic_title').each(function(idx, element){
			var $element = $(element);
			var href = url.resolve(cnodeUrl, $element.attr('href'));
	
			topicUrls.push(href);
		});

		console.log(topicUrls);

		ep.after('topic_html', topicUrls.length, function(topics){
			topics = topics.map(function (topicPair){
				var topicUrl = topicPair[0];
				var topicHtml = topicPair[1];
				var $ = cheerio.load(topicHtml);
				return ({
					title: $('.topic_full_title').text().trim(),
					href: topicUrl,
					comment1: $('.reply_content').eq(0).text().trim(),
				});
			});

			console.log('final:');
			console.log(topics);

			res.send(topics);
		});

		topicUrls.forEach(function (topicUrl){
			superagent.get(topicUrl)
			.end(function(err,res){
				ep.emit('topic_html', [topicUrl, res.text]);
			});
		});
	});
});

app.listen(3000, function (req, res){
	console.log('app is running at por 3000');
});
