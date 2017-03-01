const config = require("./config.js");
const Twitter = require("twit");
const fs = require("fs");

var client = new Twitter(config.twitterKeys);
var stream = client.stream("user");

const myId = 'WesleyLHandy';


/***********************************/
/****** RESTFUL API FUNCTIONS ******/
/***********************************/

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
	client.post('favorites/create', {id: tweetId}, function(error, data, response) {
		if(error) {
			console.log("Something went Wrong!" + error);
		} else {
			console.log("Favorite Added Successfully");
		}
	});
}

function befriendUser(userId) {
	client.post('friendships/create', {user_id: userId}, function(error, data, response) {
		if(error) {
			console.log("Something went Wrong!" + error);
		} else {
			console.log("Friend Added Successfully");
		}
	});
}

var delay; //initializing variable for timeouts


/*************************************/
/****** STREAMING API LISTENERS ******/
/*************************************/

//listen on twitter stream for new follows
stream.on('follow', function (event) {

	console.log("New Follow");

	var name = event.source.name;
	var screen_name = event.source.screen_name;

	updateLogs(event, "follow.txt");
	
	if (screen_name != myId) {
		console.log(`${name} @${screen_name} followed me.`);

		var newTweet = {status: `@${screen_name} Thank you for following me! Are you into coding too? This is a #nodejsautoreply`};
		// post a tweet in response to new follows

		function send() {
			postTweet(newTweet);
		}
		
		delay = setTimeout(send, 4000);
	}
});

//constant stream of tweets from user's stream
stream.on('tweet', function (event) {
		
	// var data = JSON.stringify(event, null, 5);
	// fs.writeFile('botlog.txt', data, function(err){
	// 	if (err){
	// 		console.log("error occurred writing file: " + err);
	// 	}	
	// });

	var replyto = event.in_reply_to_screen_name;
	var tweetText = event.text;
	var from = event.user.screen_name;
	var fromId = event.user.id_str;
	
	//write most recent mention to a file, for records
	if (tweetText.includes("@WesleyLHandy")) {
		updateLogs(event, 'mention.txt');
	}
	//do something if current user in mentioned
	if(replyto == myId || tweetText.includes("@WesleyLHandy")) {

		var target_id = event.target_object.id_str;

		function send() {
			likeTweet(target_id);
		}
		delay = setTimeout(send, 4000);
	}
});

//listen for when a tweet is favorited by another user
stream.on('favorite', function (event) {
  	//...
  	console.log("Favorite Event");
  	
  	var from = event.source.screen_name;
  	var fromId = event.source.id_str;
	var target_user = event.target_object.user.screen_name;
	var target_id = event.target_object.id_str;
	var tweet_hashtags = event.target_object.entities.hashtags;
	
	console.log(`Favorite By ${from} on ${target_id}`);
  	
  	updateLogs(event, "favorite.txt");
  	
  	//follow any users who favorite one of my tweets
  	if(target_user == myId && from != myId) {
		
		function send() {
			befriendUser(fromId);
		}
		delay = setTimeout(send, 4000);
	}
});

//listen for quotes of my tweets
stream.on('quoted_tweet', function (event) {
	
	console.log("Quote Event");
	
	var from = event.source.screen_name;
	var fromId = event.source.id_str;
	var target_user = event.target.screen_name;
	var target_id = event.target_object.quoted_status_id_str;
	var tweet_hashtags = event.target_object.entities.hashtags;
	
	console.log(`Quoted By ${from} on ${target_id}`);
	
	updateLogs(event, "quote.txt");
	
	//like the tweet and befriend the user who quotes my tweets
	if(target_user == myId && from != myId) {
		
		function send() {
			likeTweet(target_id);
			befriendUser(fromId);
		}

		delay = setTimeout(send, 4000);
	}
});

//listen for retweets (quotes and retweets are similar, a quote will include some added content by the user)
stream.on('retweeted_retweet', function(event) {
	console.log("RT Event");

	var from = event.source.screen_name;
	var fromId = event.source.id_str;
	var retweeted_from = event.target.screen_name;
	var retweeted_object_id = event.target_object.id_str;
	var retweeted_user = event.retweeted_status.user.screen_name;
	var original_target_id = event.retweeted_status.id_str;

	console.log(`Retweeted By ${from} on ${retweeted_object_id}`);

	updateLogs(event, "rt.txt");
	
	//like the retweet and the original tweet then befriend user
	if(target_user == myId && from != myId) {
		
		function send() {
			likeTweet(retweeted_object_id);
			likeTweet(original_target_id);
			befriendUser(fromId);
		}
		delay = setTimeout(send, 4000);
	}
});
  
stream.on('error', function(error) {
	console.log("Stream" + error);
});

//function for adding tweets to the various logs without overwriting previous data
function updateLogs(object, file) {

	if (!fs.existsSync(file)) {
		fs.writeFileSync(file, "[" + JSON.stringify(object) + "]");
	} else {
		fs.readFile(file, 'utf-8', (err, data) => {
			if (err) {
				console.log(err);
			}

			var arr = [];

			if (data) {
				arr = JSON.parse(data);
			}

			arr.push(object);

			fs.writeFile(file, JSON.stringify(arr, null, 5), (err) => {
					if (err) console.log(err);
			});	
		});
	}
}