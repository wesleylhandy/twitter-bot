# twitter-bot
A node.js bot designed to respond to new followers and mentions on a given account.

## Installation Instructions

1. Fork this Repo and Clone your forked copy to your local machine
2. Run `npm install`
3. Create a file called `config.js`.
4. Go to https://dev.twitter.com and create a new App. After the app is created, create new user tokens. Save your keys in tokens in `config.js` according to the following example:


```javascript
exports.twitterKeys = {
  consumer_key: '<input here>',
  consumer_secret: '<input here>',
  access_token_key: '<input here>',
  access_token_secret: '<input here>'
}
```

5. In the bots.js file, where you see the screen_name defined as `wesleylhandy`, which is my twitter screen name, and you should [follow me](https://twitter.com/WesleyLHandy), by the way, replace my screen name with your own.
6. From the command-line, initiliaze heroku for deployment: `heroku git:remote -a <your heroku app name>`. Then run `git push heroku master`

### What does it do?

The bot listens to the Twitter Stream API for a given user. In response to mentions, quotes, retweets and favorites, this bot will respond accordingly.

* For new 'Follow' events, the bot will tweet a kind thank you message to the new follower.
* For mentions, the bot will "Favorite" the tweet with the mention and will follow the other user.
* For 'Favorite' events, the bot will follow the other user.
* For 'Quote' events, the bot will favorite the quoted tweet and add follow the other user.
* For 'Retweet' events, the bot will favorite both the retweeted tweet and the original tweet and follow the other user.