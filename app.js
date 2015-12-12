var request = require('request');
var slackbot = require('./slackbot-new');
var xml2js = require('xml2js');
var fs = require('fs');
var envVars = require('./env-vars');
var xmlParser = new xml2js.Parser();

var botKey = envVars['SLACKBOT_KEY'];
var taID = envVars['TA_ID'];
var adminID = envVars['ADMIN_ID'];

var bot = new slackbot(botKey);
var custom_bot = require('./custom-bot-functions')(bot, taID, adminID);
var easterEggs = require('./easter-eggs')(bot, taID);

bot.use(custom_bot);

for (var key in easterEggs) {
  bot.use(easterEggs[key]);
}

bot.connect();
