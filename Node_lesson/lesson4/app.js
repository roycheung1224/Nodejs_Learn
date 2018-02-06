var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');

var url = require('url');
var cnodeUrl = 'https://cnodejs.org/';

var app = express();

app.get('/', function (req, res, next){
	superagent.get('https://cnodejs.org/')
	.end(function (err, sres){
		if (err){
			return console.error(err);
		}
		var topicUrls = [];
		var $ = cheerio.load(sres.text);

		$('#topic_list .topic_title').each(function(idx, element){
			var $element = $(element);
			var href = url.resolve(cnodeUrl, $element.attr('href'));
	
			topicUrls.push(href);
			topicUrls.push('\n');
		});

		res.send(topicUrls);
	});
});

app.listen(3000, function (req, res){
	console.log('app is running at por 3000');
});
