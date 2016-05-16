var db = require("./database")();

module.exports = function(CustomBot){
  CustomBot.prototype.prettyQueue = function(){
    // @TODO
    // var self = this;
    //
    // var queue_names = this.queue.map(function(el) {
    //   var name = el.real_name || el.name;
    //   return (self.queue.indexOf(el) + 1) + ") " + name;
    // });
    //
    // return "\n*Current Queue*\n" +
    //   (queue_names.length ? queue_names.join("\n") : "*_empty_*");
  };

  CustomBot.prototype.clearQueue = function(){
    // @TODO
    // var response = this.bot_flavor.queue_cleared || "Queue cleared";
    // queue = [];
    // this.bot.sendMessage(this.message.channel, response);
    // this.backup(queue);
  };

  CustomBot.prototype.removeMe = function(){
    // @TODO
    // var self = this;
    //
    // var userToRemove = this.queue.filter(
    //   function(user) {
    //     return user.id === self.user;
    //   }
    // );
    //
    // if (userToRemove.length) {
    //   this.queue.splice(this.queue.indexOf(userToRemove[0]), 1);
    //   this.bot.sendMessage(
    //     this.channel,
    //     (this.bot_flavor.remove || ":wave:") + "\n" + this.prettyQueue()
    //   );
    //   this.backup(this.queue);
    // }
  };

  CustomBot.prototype.next = function(){
    // @TODO
    // var currentStudent = queue.shift();
    //
    // if(currentStudent){
    //   this.bot.sendMessage(
    //     this.channel,
    //     "Up now: <@" + currentStudent.id + ">! \n " + this.prettyQueue()
    //   );
    //
    //   this.backup(queue);
    // } else {
    //   this.bot.sendMessage(
    //     this.channel,
    //     this.bot_flavor.empty_queue || "The queue is empty."
    //   );
    // }
  };

  CustomBot.prototype.addToQueue = function(){
    // @TODO
    // var user = this.message.user;
    //
    // if(this.queue.some(function(el){ return el.id === user; })){
    //   var queue_message = this.bot_flavor.already_queued || "Already in queue.";
    //   this.sendQueueMessage(queue_message);
    // } else {
    //   var random_quote = this.randomQuote();
    //   var self = this;
    //
    //   this.bot.api(
    //     "users.info",
    //     { user: user },
    //     function(data) {
    //       self.queue.push(data.user);
    //       self.backup(self.queue);
    //       self.sendQueueMessage(random_quote);
    //     }
    //   );
    // }
  };
};
