const Twitter = require("twit");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const twitterKeys = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

const client = new Twitter(twitterKeys);
const stream = client.stream("user");

const myId = 'WesleyLHandy';

console.log('...listening, stalking, whatever, you be the judge...');
/***********************************/
/****** RESTFUL API FUNCTIONS ******/
/***********************************/

function postTweet(tweet) {
    client.post('statuses/update', tweet, function(error, data, response) {
        if (error) {
            console.error(`PostTweet Error: Something went Wrong! ${error}`);
        } else {
            console.log("Tweet Posted Successfully");
        }
    });
}

function likeTweet(tweetId) {
    client.post('favorites/create', { id: tweetId }, function(error, data, response) {
        if (error) {
            console.error(`LikeTweet Error: Something went Wrong! ${error}`);
        } else {
            console.log("Favorite Added Successfully");
        }
    });
}

function befriendUser(userId) {
    client.post('friendships/create', { user_id: userId }, function(error, data, response) {
        if (error) {
            console.error(`BefriendUser Error: Something went Wrong! ${error}`);
        } else {
            console.log("Friend Added Successfully");
        }
    });
}

var delay; //initializing variable for timeouts

const ReplyMessages = function() {
    this.textArray = [
        'Hey, thanks for the follow! Tell me what you are coding at the moment...',
        'Thank you for following me! Are you into coding too?',
        'TYVM for following. Whats your favorite dev language?',
        'Hello friend, have you read any cool articles lately related to coding?',
        'Greetings, do you like JavaScript as much as I do?',
        'Thanks for following! What piqued your interest in being a twitter-friend?',
        'Sweet! Many thanks for following. What more would you like to hear from me on coding?'
    ]
    this.currentIndex = 0;
}

ReplyMessages.prototype.shuffle = function() {
    this.queue = this.textArray.slice();
    let len = this.queue.length - 1;
    for (len; len > 0; len--) {
        let randomIndex = Math.floor(Math.random() * (len + 1))
        let text = this.queue[randomIndex];
        this.queue[randomIndex] = this.queue[len];
        this.queue[len] = text
    }
}

ReplyMessages.prototype.replyText = function() {
    return this.queue[this.currentIndex]
}

ReplyMessages.prototype.increment = function() {
    this.currentIndex++;
    if (this.currentIndex >= this.queue.length) {
        this.currentIndex = 0;
        this.shuffle();
    }
}

const messageList = new ReplyMessages();
messageList.shuffle();

/*************************************/
/****** STREAMING API LISTENERS ******/
/*************************************/

//listen on twitter stream for new follows
stream.on('follow', function(event) {

    console.log("New Follow");

    const name = event.source.name;
    const screen_name = event.source.screen_name;

    if (screen_name != myId) {
        console.log(`${name} @${screen_name} followed me.`);

        const message = messageList.replyText();
        messageList.increment();

        const newTweet = { status: `@${screen_name} ${message} #loveNodeJS` };
        // post a tweet in response to new follows

        function send() {
            postTweet(newTweet);
        }

        delay = setTimeout(send, 4000);
    } else {
        console.log(`${myId} followed ${screen_name}`)
    }
});

//constant stream of tweets from user's stream
stream.on('tweet', function(event) {

    const replyto = event.in_reply_to_screen_name;
    const tweetText = event.text;
    const from = event.user.screen_name;
    const fromId = event.user.id_str;

    //do something if current user in mentioned
    if (replyto == myId || tweetText.includes("@WesleyLHandy")) {

        const target_id = event.id_str;

        function send() {
            likeTweet(target_id);
            befriendUser(fromId);
        }
        delay = setTimeout(send, 4000);
    }
});

//listen for when a tweet is favorited by another user
stream.on('favorite', function(event) {
    //...
    console.log("Favorite Event");

    const from = event.source.screen_name;
    const fromId = event.source.id_str;
    const target_user = event.target_object.user.screen_name;
    const target_id = event.target_object.id_str;
    const tweet_hashtags = event.target_object.entities.hashtags;

    console.log(`Favorite By ${from} on https://www.twitter.com/${target_user}/status/${target_id}`);

    //follow any users who favorite one of my tweets
    if (target_user == myId && from != myId) {

        function send() {
            befriendUser(fromId);
        }
        delay = setTimeout(send, 4000);
    }
});

//listen for quotes of my tweets
stream.on('quoted_tweet', function(event) {

    console.log("Quote Event");

    const from = event.source.screen_name;
    const fromId = event.source.id_str;
    const target_user = event.target.screen_name;
    const target_id = event.target_object.quoted_status_id_str;
    const tweet_hashtags = event.target_object.entities.hashtags;

    console.log(`Quoted By ${from} on https://www.twitter.com/${target_user}/status/${target_id}`);

    //like the tweet and befriend the user who quotes my tweets
    if (target_user == myId && from != myId) {

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

    const from = event.source.screen_name;
    const fromId = event.source.id_str;
    const retweeted_from = event.target.screen_name;
    const retweeted_object_id = event.target_object.id_str;
    const retweeted_user = event.hasOwnProperty('retweeted_status') && event.retweeted_status.hasOwnProperty('user') ? event.retweeted_status.user.screen_name : null;
    const original_target_id = event.hasOwnProperty('retweeted_status') ? event.retweeted_status.id_str : null;

    console.log(`Retweeted By ${from} on ${retweeted_object_id}`);

    //like the retweet and the original tweet then befriend user
    if (retweeted_from == myId && from != myId) {

        function send() {
            likeTweet(retweeted_object_id);
            befriendUser(fromId);
            if (original_target_id) likeTweet(original_target_id);
        }
        delay = setTimeout(send, 4000);
    }
});

stream.on('error', function(error) {
    console.error(`Stream Error: ${error}`);
});