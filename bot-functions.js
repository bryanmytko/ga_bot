module.exports = function(bot, taID, adminID){
  var CustomBot = require("./custom-bot").CustomBot;

  const custom_bot = new CustomBot(bot, taID, adminID);

  const custom_bot_functions = function(message, cb){
    console.log(Date() + ": " + message.type);

    if(message.type === "hello") custom_bot.greet(message);
    if(message.type === "message") custom_bot.respond(message);
  };

  return custom_bot_functions
};
