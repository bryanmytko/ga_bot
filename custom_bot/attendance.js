var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/ga_bot.sqlite3');

module.exports = function(CustomBot){
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

  CustomBot.prototype.prettyAttendance = function(){
    var attendance_zero =
      this.bot_flavor.attendance_zero || "*_Really?! No one is here today?!_*";

    var presentArray = this.present.map(function(user){
      return "- " + (user.real_name || user.name);
    });

    return "*Attendance*\n" +
      (presentArray.length ? presentArray.join("\n") : attendance_zero);
  };

  CustomBot.prototype.clearAttendance = function(){
    var response = this.bot_flavor.attendance_cleared || "Attendance cleared";
    present = [];
    this.bot.sendMessage(this.message.channel, response);
    this.backupAttendance(this.present, this.secret);
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
};
