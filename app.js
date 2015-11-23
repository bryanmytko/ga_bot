var request = require('request');
var slackbot = require('./slackbot-new');
var xml2js = require('xml2js');
var fs = require('fs');
var envVars = require('./env-vars');
var xmlParser = new xml2js.Parser();

//var botKey = process.env.SLACK_BOT_KEY;
var botKey = envVars['slackbot'];
var taID = envVars['taID'];

var bot = new slackbot(botKey);

var mugatubot = require('./core-bot-functions')(bot, taID);
var easterEggs = require('./easter-eggs')(bot, taID);

bot.use(mugatubot);

for (var key in easterEggs) {
	bot.use(easterEggs[key]);
}

bot.connect();

