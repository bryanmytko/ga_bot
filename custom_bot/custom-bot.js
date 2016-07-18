var db = require("./database")();

function CustomBot(bot, ta_id, admin_id, bot_flavor){
  this.bot = bot;
  this.bot_flavor = bot_flavor;
  this.getSecret();

  this.ta_id = ta_id.split(",");
  this.admin_id = admin_id.split(",");

  return this;
}

CustomBot.prototype.greet = function(){
  const greeting = this.bot_flavor.greeting || "Hello. Bot is online!";
  console.log(greeting);
};

CustomBot.prototype.parseMessageText = function(){
  var text = this.message.text || "";
  text = text.split(/<.*>:?\s*/)[1] || "";

  return (text === "") ? this.message.text : text.trim();
};

CustomBot.prototype.help = function(){
  this.bot.sendMessage(
    this.message.channel,
    "All commands work only when you specifically mention me. " +
    "Type `queue me` or `q me` to queue yourself and `status` to check " +
    "current queue. Type `remove me` to remove yourself."
  );
};

CustomBot.prototype.getSecret = function(){
  var self = this;

  db.get("SELECT * FROM secret", function(err, row){
    if(row) self.secret = row.value;
    console.log("The current attendance secret is: " + self.secret);
  });
};

CustomBot.prototype.setSecret = function(text){
  var capture = /set secret\s*(\S*).*/.exec(text);
  var secret = capture[1];

  if(secret === "" || secret === undefined || secret === null){
    secret = Math.random().toString(36).substring(7);
  }

  var stmt = db.prepare("UPDATE secret SET value = (?)");
  stmt.run(secret);

  this.secret = secret;
  console.log(this.bot_flavor.secret_set || "Secret word has been updated");
};

CustomBot.prototype.randomQuote = function(){
  var quotes = this.bot_flavor.quotes || ["Hello!", ":D"];
  var quote = quotes[Math.floor(Math.random()*quotes.length)];

  return quote.replace(/<user>/g, this.full_name);
};

CustomBot.prototype.getAccessLevel = function(){
  var access_level = 0;

  if(this.admin_id.indexOf(this.user) != -1){
    access_level = 3;

  } else if(this.ta_id.indexOf(this.user) != -1){
    access_level = 2;
  }

  return access_level;
};

CustomBot.prototype.respond = function(message){
  this.message = message;
  this.channel = message.channel;
  this.user = message.user;
  this.full_name = `<@${this.user}>`;
  this.access_level = this.getAccessLevel();

  text = this.parseMessageText();

  switch(text){
    case "hello":
      this.bot.sendMessage(this.channel, `Hello, ${this.full_name}`);
      break;
    case "queue":
    case "status":
      this.bot.sendMessage(this.channel, this.printQueue());
      break;
    case "what is my user id?":
      this.bot.sendMessage(this.channel, "Your id is: " + this.user);
      break;
    case "q me":
    case "queue me":
      this.addToQueue();
      break;
    case "remove":
    case "remove me":
      this.removeMe();
      break;
    case "help":
      this.help();
      break;
    case this.secret:
      this.checkAttendance();
      break;
    case "clear queue":
      if(this.access_level >= 2) this.clearQueue();
      break;
    case "next":
      if(this.access_level >= 2) this.next();
      break;
    case "attendance":
      if(this.access_level >= 2) this.printAttendance();
      break;
    case "clear attendance":
      if(this.access_level >= 2) this.clearAttendance();
      break;
    default:
      if(/set secret\s*.*/.test(text)){
        if(this.access_level >= 3) this.setSecret(text);
      }
  }
};

exports.CustomBot = CustomBot;
