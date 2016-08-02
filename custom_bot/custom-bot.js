var db = require("./database")();

function CustomBot(bot, ta_id, admin_id, bot_flavor){
  this.bot = bot;
  this.bot_flavor = bot_flavor;
  this.getSecret();

  this.ta_id = ta_id.split(",");
  this.admin_id = admin_id.split(",");

  this.start();

  return this;
}

/* Currently testing if this is horrible :P */
CustomBot.prototype.start = function(){
  var self = this;
  var random_quote = function(){
    var max = 100000;
    var rand = Math.floor(Math.random() * (max)) + 1;
    var rand2 = Math.floor(Math.random() * (max)) + 1;
    if(rand === rand2){
      self.bot.sendMessage(
        self.channel,
        self.randomQuote()
      );
    }
  }

  setInterval(random_quote, 1000);
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
    "All commands work only when you specifically mention me, or send me a private message. " +
    "Type `queue me` or `q me` to queue yourself. You can pass an additional parameter to let the TA know what topic you want to discuss like: `queue me Javascript is hard`." +
    "Use `status` to check the current queue." +
    "Type `remove me` to remove yourself." +
    "For a more thorough list of commands see the documentation: http://bit.ly/2atTknS"
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

  var text = this.parseMessageText(),
      tmp_result;

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
    case (tmp_result = /(q|queue)\sme(.*)/.exec(text) || {}).input:
      this.addToQueue(tmp_result[2]);
      break;
    case "remove":
    case "remove me":
      this.remove();
      break;
    case (tmp_result = /remove\s+([a-zA-Z, ]*)/.exec(text) || {}).input:
      if(this.access_level >= 2) this.remove(tmp_result[1]);
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
      /* @TODO Make this like the other regex matches; This is old. */
      if(/set secret\s*.*/.test(text)){
        if(this.access_level >= 3) this.setSecret(text);
      }
  }
};

exports.CustomBot = CustomBot;
