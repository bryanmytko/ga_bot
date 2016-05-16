var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('ga_bot.sqlite3');


function saveSecret(secret){
  db.run("CREATE TABLE queue (name VARCHAR(255))");
}

function CustomBot(bot, ta_id, admin_id, bot_flavor){
  this.bot = bot;
  this.ta_id = ta_id;
  this.admin_id = admin_id;
  this.bot_flavor = bot_flavor;
  this.getSecret();

  return this;
}

CustomBot.prototype.getSecret = function(){
  var self = this;

  db.get("SELECT * FROM secret LIMIT 1", function(err, row){
    console.log(row.value);
    self.secret = row.value;
  });
};

CustomBot.prototype.setSecret = function(text){
  var capture = /set secret\s*(\S*).*/.exec(text);
  var secret = capture[1];

  if(secret === "" || secret === undefined || secret === null){
    secret = Math.random().toString(36).substring(7);
  }

  var stmt = db.prepare("INSERT INTO secret (value) VALUES (?)");
  stmt.run(secret);

  this.secret = secret;
  console.log(this.bot_flavor.secret_set || "Secret word has been updated");
};

CustomBot.prototype.sendAttendanceMessage = function(msg){
  this.bot.sendMessage(
    this.message.channel,
    `${msg}\n`
  );
};

CustomBot.prototype.checkAttendance = function(){
  var self = this;

  db.get(
    "SELECT * FROM attendance WHERE name = '" + this.user + "' LIMIT 1",
    function(err, rows){
      if(!rows) self.insertAttendance();
    }
  );
};

CustomBot.prototype.insertAttendance = function(){
  var self = this;

  self.bot.api(
    "users.info",
    { user: self.message.user },
    function(data) {
      var name = data.user.real_name || data.user.name;
      var stmt = db.prepare("INSERT INTO attendance (name) VALUES (?)");
      stmt.run(data.user.id);

      self.sendAttendanceMessage(
         name + " " + (self.bot_flavor.present || "You've been marked as present!")
      );
    }
  );
};

CustomBot.prototype.parseMessageText = function(){
  var text = this.message.text || "";
  text = text.split(/<.*>:?\s*/)[1] || "";

  return (text === "") ? this.message.text : text.trim();
};

CustomBot.prototype.prettyQueue = function(){
  var self = this;

  var queue_names = this.queue.map(function(el) {
    var name = el.real_name || el.name;
    return (self.queue.indexOf(el) + 1) + ") " + name;
  });

  return "\n*Current Queue*\n" +
    (queue_names.length ? queue_names.join("\n") : "*_empty_*");
};

CustomBot.prototype.prettyAttendance = function(){
  var attendance_zero =
    this.bot_flavor.attendance_zero || "*_Really?! No one is here today?!_*";

  var presentArray = this.present.map(function(user){
    return "- " + (user.real_name || user.name);
  });

  return "*Attendance*\n" +
    (presentArray.length ? presentArray.join("\n") : attendance_zero);
};

CustomBot.prototype.randomQuote = function(){
  var quotes = this.bot_flavor.quotes || ["Hello!", ":D"];
  var quote = quotes[Math.floor(Math.random()*quotes.length)];

  return quote.replace(/<user>/g, this.full_name);
};

CustomBot.prototype.clearQueue = function(){
  var response = this.bot_flavor.queue_cleared || "Queue cleared";
  queue = [];
  this.bot.sendMessage(this.message.channel, response);
  this.backup(queue);
};

CustomBot.prototype.clearAttendance = function(){
  var response = this.bot_flavor.attendance_cleared || "Attendance cleared";
  present = [];
  this.bot.sendMessage(this.message.channel, response);
  this.backupAttendance(this.present, this.secret);
};

CustomBot.prototype.greet = function(){
  const greeting = this.bot_flavor.greeting || "Hello. Bot is online!";
  console.log(greeting);
};

CustomBot.prototype.removeMe = function(){
  var self = this;

  var userToRemove = this.queue.filter(
    function(user) {
      return user.id === self.user;
    }
  );

  if (userToRemove.length) {
    this.queue.splice(this.queue.indexOf(userToRemove[0]), 1);
    this.bot.sendMessage(
      this.channel,
      (this.bot_flavor.remove || ":wave:") + "\n" + this.prettyQueue()
    );
    this.backup(this.queue);
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
      this.bot_flavor.empty_queue || "The queue is empty."
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

CustomBot.prototype.sendQueueMessage = function(msg){
  this.bot.sendMessage(
    this.message.channel,
    `${msg}\n ${this.prettyQueue()}`
  );
};

CustomBot.prototype.addToQueue = function(){
  var user = this.message.user;

  if(this.queue.some(function(el){ return el.id === user; })){
    var queue_message = this.bot_flavor.already_queued || "Already in queue.";
    this.sendQueueMessage(queue_message);
  } else {
    var random_quote = this.randomQuote();
    var self = this;

    this.bot.api(
      "users.info",
      { user: user },
      function(data) {
        self.queue.push(data.user);
        self.backup(self.queue);
        self.sendQueueMessage(random_quote);
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
