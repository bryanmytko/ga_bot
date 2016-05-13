module.exports = function(bot, taID, adminID){
  var CustomBot = require("./custom-bot").CustomBot;

  var fs = require('fs'),
      bot_flavor = require('./bot-flavor');

  var present =
        JSON.parse(fs.readFileSync("./attendance-db.json","utf8")).present,
      secret =
        JSON.parse(fs.readFileSync("./attendance-db.json", "utf8")).secret,
      queue =
        JSON.parse(fs.readFileSync("./db.json", "utf8")).queue;

  const custom_bot = new CustomBot(
        bot,
        taID,
        adminID,
        present,
        secret,
        queue,
        bot_flavor
      );

  const custom_bot_functions = function(message, cb){
    console.log(Date() + ": " + message.type);

    if(message.type === "hello") custom_bot.greet(message);
    if(message.type === "message") custom_bot.respond(message);
  };

  return custom_bot_functions
};
