const config = require("./config.js");
const Twitter = require("twit");
const fs = require("fs");

var client = new Twitter(config.twitterKeys);
var stream = client.stream("user");

const myId = 'WesleyLHandy';

function postTweet(tweet) {
	client.post('statuses/update', tweet, function(error, data, response) {
		if (error) {
			console.log("Something went Wrong! " + error);
		} else {
			console.log("Tweet Posted Successfully");
		}
	});
}

var delay;

//listen on twitter stream for new follows

stream.on('follow', function (event) {
	console.log("New Follow");
	var name = event.source.name;
	var screen_name = event.source.screen_name;
	if (screen_name != myId) {
		console.log(`${name} @${screen_name} followed me.`);
		var newTweet = {status: `@${screen_name} Thank you for following me! Are you into coding too? This is a #nodejsautoreply`};
		function send() {
			postTweet(newTweet);
		}
		delay = setTimeout(send, 4000);
	}
});

stream.on('tweet', function (event) {
	
	console.log("New Tweet");
	var data = JSON.stringify(event, null, 5);
	fs.writeFile('botlog.txt', data, function(err){
		if (err){
			console.log("error occurred writing file: " + err);
		}	
	});

	var replyto = event.in_reply_to_screen_name;
	var tweetText = event.text;
	var from = event.user.screen_name;

	console.log(`${from} tweeted to your stream this message: ${tweetText}`);

	if(replyto == myId) {
		var newTweet = {status: `@${from} Thank you for tweeting me! This is a #nodejsautoreply`}
		function send() {
			postTweet(newTweet);
		}
		delay = setTimeout(send, 4000);
	}
});
  
stream.on('error', function(error) {
	console.log("Stream" + error);
});