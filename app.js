var request = require('request');
var slackbot = require('./slackbot-new');
var xml2js = require('xml2js');
var fs = require('fs');
var envVars = require('./env-vars');
var xmlParser = new xml2js.Parser();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ga_bot.sqlite3');

var botKey = envVars['SLACKBOT_KEY'];
var taID = envVars['TA_ID'];
var adminID = envVars['ADMIN_ID'];

var bot = new slackbot(botKey);
var bot_functions = require('./bot-functions')(bot, taID, adminID);

bot
  .use(bot_functions)
  .connect()
