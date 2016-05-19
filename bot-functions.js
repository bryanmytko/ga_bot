module.exports = function(bot, taID, adminID){
  var CustomBot = require("./custom_bot/custom-bot").CustomBot;
  var Attendance = require("./custom_bot/attendance")(CustomBot);
  var Queue = require("./custom_bot/queue")(CustomBot);

  var fs = require('fs'),
      bot_flavor = require('./custom_bot/bot-flavor');

  const custom_bot = new CustomBot(
        bot,
        taID,
        adminID,
        bot_flavor
      );

  const custom_bot_functions = function(message, cb){
    console.log(Date() + ": " + message.type);

    if(message.type === "hello") custom_bot.greet(message);
    if(message.type === "message") custom_bot.respond(message);
  };

  return custom_bot_functions
};
