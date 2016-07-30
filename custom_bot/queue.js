var db = require("./database")();

module.exports = function(CustomBot){
  CustomBot.prototype.addToQueue = function(details){
    var self = this;

    var check_and_insert = function(err, rows){
      if(rows){
        var queue_message =
          self.bot_flavor.already_queued || "You're already in queue.";
        self.bot.sendMessage(self.channel, queue_message);
      } else {
        db.run(
            "INSERT INTO queue (user_id, name, details) "
            + "VALUES ('"
            + self.user
            +"', '"
            + self.name
            +"', '"
            + details.trim()
            +"')"
        );
        self.printQueue();
      }
    };

    self.bot.api(
      "users.info",
      { user: self.message.user },
      function(data) {
        self.name = data.user.name;

        db.get(
          "SELECT name FROM queue WHERE name='" + self.name + "' LIMIT 1",
          check_and_insert
        );
      }
    )
  };

  CustomBot.prototype.removeMe = function(){
    var user_id = this.user;
    db.run("DELETE FROM queue WHERE user_id='" + user_id + "'");
    this.bot.sendMessage(
      this.channel,
      this.bot_flavor.remove || ":wave:"
    );
    this.printQueue()
  };

  CustomBot.prototype.clearQueue = function(){
    db.run("DELETE FROM queue");
    var response = this.bot_flavor.queue_cleared || "Queue cleared";
    this.bot.sendMessage(this.message.channel, response);
  };

  CustomBot.prototype.next = function(){
    var self = this;

    db.get("SELECT * FROM queue", function(err, row){
      if(row){
        self.bot.sendMessage(
          self.channel,
          "Up now: <@" + row.name + ">! \n "
        );
        db.run("DELETE FROM queue WHERE user_id='" + row.user_id + "'");
        self.printQueue();
      } else {
        self.bot.sendMessage(
          self.channel,
          self.bot_flavor.empty_queue || "_The queue is empty._"
        );
      }
    });
  };

  CustomBot.prototype.printQueue = function(){
    var str =
      this.bot_flavor.empty_queue || "_Empty_",
      self = this;

    db.all(
      "SELECT * FROM queue",
      function(err, rows){
        var queue = rows.map(function(row, i){
          var str = "\t" + (i + 1) + ". *" + row.name + "*";
          if(row.details)
            str += " - " + row.details;

          return str;
        });

        if(queue.length !== 0)
          str = queue.join("\n");

        self.bot.sendMessage(self.channel, "*Current Queue:*\n" + str);
      }
    );
  };
};
