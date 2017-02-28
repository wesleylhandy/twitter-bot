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

function likeTweet(tweetId) {
	client.post()
}

var delay;

//listen on twitter stream for new follows

// stream.on('follow', function (event) {
// 	console.log("New Follow");
// 	var name = event.source.name;
// 	var screen_name = event.source.screen_name;
// 	if (screen_name != myId) {
// 		console.log(`${name} @${screen_name} followed me.`);
// 		var newTweet = {status: `@${screen_name} Thank you for following me! Are you into coding too? This is a #nodejsautoreply`};
// 		function send() {
// 			postTweet(newTweet);
// 		}
// 		delay = setTimeout(send, 4000);
// 	}
// });

stream.on('tweet', function (event) {
	
	
	var data = JSON.stringify(event, null, 5);
	fs.writeFile('botlog.txt', data, function(err){
		if (err){
			console.log("error occurred writing file: " + err);
		}	
	});

	var replyto = event.in_reply_to_screen_name;
	var tweetText = event.text;
	var from = event.user.screen_name;

	if (tweetText.includes("@WesleyLHandy")) {
		fs.writeFile('mention.txt', JSON.stringify(event, null, 5), (err)=> {if (err){console.log(err);}});
		console.log(event);
	}

	if(replyto == myId) {
		console.log("New Tweet");
		console.log(`${from} tweeted to your stream this message: ${tweetText}`);
		var newTweet = {status: `@${from} Thank you for tweeting me! This is a #nodejs #autoreply`}
		function send() {
			// postTweet(newTweet);
		}
		delay = setTimeout(send, 4000);
	}
});

stream.on('favorite', function (event) {
  	//...
  	console.log("Favorite Event");
  	var from = event.source.screen_name;
	var target_user = event.target_object.user.screen_name;
	var target_id = event.target_object.id_str;
	var tweet_hashtags = event.target_object.entities.hashtags;
	console.log(`Favorite By ${from} on ${target_id}`);
  	fs.writeFile("favorite.txt", JSON.stringify(event,null,5), (err)=> {if(err){console.log(err)}});
  	console.log(target_user == myId && from != myId);
  	if(target_user == myId && from != myId) {
		var newTweet = {status: `@${from} Thank you for liking my tweet! This is a #nodejs #autoreply`}
		function send() {
			// postTweet(newTweet);
		}
		delay = setTimeout(send, 4000);
	}
});

stream.on('quoted_tweet', function (event) {
	console.log("Quote Event");
	var from = event.source.screen_name;
	var target_user = event.target.screen_name;
	var target_id = event.target_object.quoted_status_id_str;
	var tweet_hashtags = event.target_object.entities.hashtags;
	console.log(`Quoted By ${from} on ${target_id}`);
	fs.writeFile("quote.txt", JSON.stringify(event, null, 5), (err)=> {if(err){console.log(err)}});
});

stream.on('retweeted_retweet', function(event) {
	console.log("RT Event");
	var from = event.source.screen_name;
	var retweeted_from = event.target.screen_name;
	var retweeted_object_id = event.target_object.id_str;
	var retweeted_user = event.retweeted_status.user.screen_name;
	var original_target_id = event.retweeted_status.id_str;
	console.log(`Retweeted By ${from} on ${retweeted_object_id}`);
	fs.writeFile("rt.txt", JSON.stringify(event,null, 5), (err)=> {if(err){console.log(err)}});
});
  
stream.on('error', function(error) {
	console.log("Stream" + error);
});