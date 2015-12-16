var fs = require('fs'),
    bot_flavor = require('./bot-flavor');

var present =
      JSON.parse(fs.readFileSync("./attendance-db.json","utf8")).present,
    secret =
      JSON.parse(fs.readFileSync("./attendance-db.json", "utf8")).secret,
    queue =
      JSON.parse(fs.readFileSync("./db.json", "utf8")).queue;

function CustomBot(bot, ta_id, admin_id){
  this.bot = bot;
  this.ta_id = ta_id;
  this.admin_id = admin_id;

  return this;
}

CustomBot.prototype.backup = function(queue_array) {
  fs.writeFile(
    "./db.json",
    JSON.stringify({
      queue: queue_array
    })
  );
};

CustomBot.prototype.backupAttendance = function(present_array, secret){
  fs.writeFile(
    "./attendance-db.json",
    JSON.stringify({
      present: present_array,
      secret: secret
    })
  );
};

CustomBot.prototype.parseMessageText = function(){
  var text = this.message.text || "";
  text = text.split(/<.*>:?\s*/)[1] || "";

  return text.trim();
};

CustomBot.prototype.prettyQueue = function(){
  var queue_names = queue.map(function(el) {
    var name = el.real_name || el.name;
    return (queue.indexOf(el) + 1) + ") " + name;
  });

  return "\n*Current Queue*\n" +
    (queue_names.length ? queue_names.join("\n") : "*_empty_*");
};

CustomBot.prototype.prettyAttendance = function(){
  var attendance_zero =
    bot_flavor.attendance_zero || "*_Really?! No one is here today?!_*";

  var presentArray = present.map(function(user){
    return "- " + (user.real_name || user.name);
  });

  return "*Attendance*\n" +
    (presentArray.length ? presentArray.join("\n") : attendance_zero);
};

CustomBot.prototype.randomQuote = function(){
  var quotes = bot_flavor.quotes || ["Hello!", ":D"];
  var quote = quotes[Math.floor(Math.random()*quotes.length)];

  return quote.replace(/<user>/g, this.full_name);
};

CustomBot.prototype.clearQueue = function(){
  var response = bot_flavor.queue_cleared || "Queue cleared";
  queue = [];
  this.bot.sendMessage(this.message.channel, response);
  this.backup(queue);
};

CustomBot.prototype.clearAttendance = function(){
  var response = bot_flavor.attendance_cleared || "Attendance cleared";
  present = [];
  this.bot.sendMessage(this.message.channel, response);
  this.backupAttendance(present, secret);
};

CustomBot.prototype.greet = function(){
  const greeting = bot_flavor.greeting || "Hello. Bot is online!";
  console.log(greeting);
};

CustomBot.prototype.removeMe = function(){
  var self = this;

  var userToRemove = queue.filter(
    function(user) {
      return user.id === self.user;
    }
  );

  if (userToRemove.length) {
    queue.splice(queue.indexOf(userToRemove[0]), 1);
    this.bot.sendMessage(
      this.channel,
      (bot_flavor.remove || ":wave:") + "\n" + this.prettyQueue()
    );
    this.backup(queue);
  }
};

CustomBot.prototype.next = function(){
  var currentStudent = queue.shift();

  if(currentStudent){
    this.bot.sendMessage(
      this.channel,
      "Up now: <@" + currentStudent.id + ">! \n " + this.prettyQueue()
    );

    this.backup(queue);
  } else {
    this.bot.sendMessage(
      this.channel,
      bot_flavor.empty_queue || "The queue is empty."
    );
  }
};

CustomBot.prototype.help = function(){
  this.bot.sendMessage(
    this.message.channel,
    "All commands work only when you specifically mention me. " +
    "Type `queue me` or `q me` to queue yourself and `status` to check " +
    "current queue. Type `remove me` to remove yourself."
  );
};

CustomBot.prototype.attendance = function(){
  this.bot.sendMessage(this.channel, this.prettyAttendance());
};

CustomBot.prototype.setSecret = function(text){
  var capture = /set secret\s*(\S*).*/.exec(text);
  secret = capture[1];

  fs.writeFile(
    "./attendance-db.json",
    JSON.stringify({
      present: present,
      secret: secret
    })
  );

  console.log(bot_flavor.secret_set || "Secret word has been updated");
};

CustomBot.prototype.sendQueueMessage = function(msg){
  this.bot.sendMessage(
    this.message.channel,
    `${msg}\n ${this.prettyQueue()}`
  );
};

CustomBot.prototype.addToQueue = function(){
  var user = this.message.user;

  if(queue.some(function(el){ return el.id === user; })){
    var queue_message = bot_flavor.already_queued || "Already in queue.";
    this.sendQueueMessage(queue_message);
  } else {
    var random_quote = this.randomQuote();
    var self = this;

    this.bot.api(
      "users.info",
      { user: user },
      function(data) {
        queue.push(data.user);
        self.backup(queue);
        self.sendQueueMessage(random_quote);
      }
    );
  }
};

CustomBot.prototype.sendAttendanceMessage = function(msg){
  this.bot.sendMessage(
    this.message.channel,
    `${msg}\n`
  );
};

CustomBot.prototype.addToAttendance = function(){
  if(present.indexOf(this.user) == -1){
    var self = this;

    this.bot.api(
      "users.info",
      { user: this.message.user },
      function(data) {
        present.push(data.user);
        self.backupAttendance(present, secret);
        self.sendAttendanceMessage(
          (data.user.real_name || data.user.name) + " " +
            (bot_flavor.present || "You've been marked as present!")
        );
      }
    );
  }
};

CustomBot.prototype.getAccessLevel = function(){
  var access_level = 0;

  if(this.user === this.admin_id){
    access_level = 3;
  } else if(this.user === this.ta_id){
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
    case "status":
      this.bot.sendMessage(this.channel, this.prettyQueue());
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
    case secret:
      this.addToAttendance();
      break;
    case "clear queue":
      if(this.access_level >= 2) this.clearQueue();
      break;
    case "next":
      if(this.access_level >= 2) this.next();
      break;
    case "attendance":
      if(this.access_level >= 2) this.attendance();
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
