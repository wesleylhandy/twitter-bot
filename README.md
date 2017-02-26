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

This bot is programmed to automatically tweet a thank you message to anyone who adds you as a follower (be sure to change your response message in the `bots.js` file), to automatically reply to any those who reply to one of your messages, or to automatically thank those who favorite one of your tweets. **TODO: add functionality for automatically thanking users for RTs, quotes or other mentions.**
