// Declaring Modules and variables used in file
var fs = require('fs');
var bot_flavor = require('./bot_flavor');
var queue;
var present;
var secret;

/* Method to write queue in JSON to db.json file
** @params: array
** @return: void
*/
function backup(queueArray) {
  fs.writeFile('./db.json', JSON.stringify({queue: queueArray}));
}

/* Method to write attendance record in attendance.json file along with the secret word
** @params: array
** @return: void
*/
function backupAttendance(presentArray,secretWord){
  fs.writeFile('./attendance-db.json',JSON.stringify({present: presentArray,secret: secretWord}));
}


/* Try/Catch block to make sure queue is present and formatted correctly
*/
try {
  queue = JSON.parse(fs.readFileSync('./db.json', 'utf8')).queue;
} catch(e) {
  queue = [];
  backup(queue);
}

/* Try/Catch block to make sure attendance array is present and formatted correctly
*/
try {
  present = JSON.parse(fs.readFileSync('./attendance-db.json','utf8')).present;
} catch(e) {
  present = [];
  secret = "";
  backupAttendance(present,secret);
}


var prettyAttendance = function(){
  var presentArray = present.map(function(user){
    return "- " + user.real_name;
  });
  return "*Attendance*\n"
    + (presentArray.length ? presentArray.join("\n") : "*_Really?! No one is here today?!_*");
}

/********************************
/* Old code still not refactored
*********************************/
      //
      // } else if (message.text.indexOf("remove me") > -1) {
      //   // removing a user
      //   var userToRemove = queue.filter(function(user) {return user.id === message.user});
      //   if (userToRemove.length) {
      //     queue.splice(queue.indexOf(userToRemove[0]), 1);
      //     bot.sendMessage(message.channel, ":wave: \n" + prettyQueue());
      //     backup(queue);
      //   }
      //
      // } else if (message.text.indexOf("next") > -1 && message.user === taID) {
      //   // next student
      //   var currentStudent = queue.shift();
      //   if (currentStudent) {
      //     bot.sendMessage(message.channel, "Up now: <@" + currentStudent.id + "> -- \n " + prettyQueue());
      //     backup(queue);
      //   }
      //
      // } else if (message.text.indexOf("help") > -1) {
      //   // help message
      //   bot.sendMessage(message.channel, "All commands work only when you specifically mention me. Type `queue me` or `q me` to queue yourself and `status` to check current queue. Type `remove me` to remove yourself.")
      //
      // } else if (message.text.indexOf("attendance") && message.user === adminID){
      //   console.log(present);
      //   bot.sendMessage(message.channel, prettyAttendance());
      // } else if (message.text.indexOf("secret") && message.user === adminID){
      //   secret = message.text.split(" ")[1];
      //   backupAtttendance(present,secret);
      //   bot.sendMessage(message.channel, "Secret word has been set to " + secret);
      // } else if (message.text.indexOf(secret)){
      //   present.push(data.user);
      //   backupAttendance(present,secret);
      // }


function CustomBot(bot){
  this.bot = bot;
  return this;
}

CustomBot.prototype.parseMessageText = function(){
  text = this.message.text.split(/<.*>:?\s*/)[1];

  if(text !== undefined){
    return text.trim();
  }
}

CustomBot.prototype.prettyQueue = function() {
  var queue_names = queue.map(function(el) {
    var name = el.real_name || el.name
    return (queue.indexOf(el) + 1) + ") " + name;
  });

  return "\n*Current Queue*\n"
    + (queue_names.length ? queue_names.join("\n") : "*_empty_*");
};

CustomBot.prototype.randomQuote = function(){
  var quotes = bot_flavor["quotes"] || ["Hello!", ":D"];
  var quote = quotes[Math.floor(Math.random()*quotes.length)];

  return quote.replace(/<user>/g, this.full_name);
};

CustomBot.prototype.addToQueue = function(){
  var user = this.message.user;

  if(queue.some(function(el){ return el.id === user })){
    var queue_message = bot_flavor.queue || "Already in queue.";

    this.bot.sendMessage(
      this.message.channel,
      `${queue_message}\n ${this.prettyQueue()}`
    );
  } else {
    var random_quote = this.randomQuote();

    var bot_api_call = new Promise(
      this.bot.api(
        "users.info",
        { user: this.message.user },
        function(data) {
          queue.push(data.user);
          backup(queue);
        }
      );
    );

    this.bot.sendMessage(
      this.message.channel,
      `${random_quote}\n ${this.prettyQueue()}`
    );
  }
};

CustomBot.prototype.clearQueue = function(){
  //@TODO ONLY if TA / Admin
  var response = bot_flavor.cleared || "Queue cleared";
  queue = [];
  this.bot.sendMessage(this.message.channel, response);
  backup(queue);
};

CustomBot.prototype.greet = function(){
  const greeting = bot_flavor.greeting || "Hello. Bot is online!";
  console.log(greeting);
};

CustomBot.prototype.respond = function(message){
  this.message = message;
  this.channel = message.channel;
  this.user = message.user;
  this.full_name = `<@${this.user}>`;

  text = this.parseMessageText();

  switch(text){
    case "hello":
      this.bot.sendMessage(
        this.channel, `Hello, ${this.full_name}`
      );
      break;
    case "status":
      this.bot.sendMessage(this.channel, prettyQueue());
      break;
    case "what is my user id?":
      this.bot.sendMessage(
        this.channel, "Your id is: " + this.user
      );
      break;
    case "q me": // fall-through
    case "queue me":
      this.addToQueue();
      break;
    case "clear queue":
      this.clearQueue();
      break;
  }
};

/* @TODO Make this more clear:
 * Why returning a function that returns function?
 */
module.exports = function(bot, taID, adminID) {
  const custom_bot = new CustomBot(bot);

  const custom_bot_functions = function(message, cb) {
    if(message.type === "hello") custom_bot.greet(message);
    if(message.type === "message") custom_bot.respond(message);
  };

  return custom_bot_functions;
};

// cb(null, 'core-bot'); what is this for?
