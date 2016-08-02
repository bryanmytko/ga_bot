var db = require("./database")();

module.exports = function(CustomBot){
  CustomBot.prototype.add_to_queue = function(details){
    this.details = details;

    this.bot.api(
      "users.info",
      { user: this.message.user },
      function(data) {
        this.name = data.user.name;

        db.get(
          "SELECT name FROM queue WHERE name='" + this.name + "' LIMIT 1",
          this.check_and_insert.bind(this)
        );
      }.bind(this)
    );
  };

  CustomBot.prototype.check_and_insert = function(err, rows){
    if(rows){
      var queue_message = this.bot_flavor.already_queued;
      this.bot.sendMessage(this.channel, queue_message);
    } else {
      var stmt = db.run(
        "INSERT INTO queue (user_id, name, details) VALUES (?, ?, ?)",
        [this.user, this.name, this.details.trim()]
      );

      this.print_queue();
    }
  };

  CustomBot.prototype.remove = function(users){
    if(users){
      var names_to_remove = users.replace(/ /g, ",").split(',');
      var stmt = db.prepare("DELETE FROM queue WHERE name IN (?)");
      names_to_remove.forEach(function(el){ stmt.run(el) });
    } else {
      var stmt = db.prepare("DELETE FROM queue WHERE user_id IN (?)");
      stmt.run(this.user);
    }

    stmt.finalize();

    this.bot.sendMessage(
      this.channel,
      this.bot_flavor.remove
    );

    this.print_queue();
  };

  CustomBot.prototype.clearQueue = function(){
    db.run("DELETE FROM queue");
    var response = this.bot_flavor.queue_cleared;
    this.bot.sendMessage(this.message.channel, response);
  };

  CustomBot.prototype.next = function(){
    db.get("SELECT * FROM queue", function(err, row){
      if(row){
        this.bot.sendMessage(
          this.channel,
          "Up now: <@" + row.name + ">! \n "
        );
        db.run(
          "DELETE FROM queue WHERE user_id = ?",
          row.user_id,
          this.print_queue.bind(this)
        );
      } else {
        this.bot.sendMessage(
          this.channel,
          this.bot_flavor.empty_queue
        );
      }
    }.bind(this));
  };

  CustomBot.prototype.print_queue = function(){
    var str =
      this.bot_flavor.empty_queue,
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
