var db = require("./database")();

module.exports = function(CustomBot){
  CustomBot.prototype.sendAttendanceMessage = function(msg){
    this.bot.sendMessage(
      this.message.channel,
      `${msg}\n`
    );
  };

  CustomBot.prototype.checkAttendance = function(){
    var self = this;
    var today = new Date();

    db.get(
      "SELECT * FROM attendance WHERE name = '"
        + this.user
        + "' AND created_at = '"
        + today.setHours(0,0,0,0)
        + "' LIMIT 1",
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
        var today = new Date();
        var stmt = db.prepare(
          "INSERT INTO attendance (real_name, name, created_at) VALUES (?,?,?)"
        );
        stmt.run(data.user.name, data.user.id, today.setHours(0,0,0,0));

        self.sendAttendanceMessage(
           name
             + " "
             + (self.bot_flavor.present || "You've been marked as present!")
        );
      }
    );
  };

  CustomBot.prototype.printAttendance = function(){
    var str =
      this.bot_flavor.attendance_zero || "*No one is here yet.*",
      today = new Date().setHours(0,0,0,0),
      self = this;

    db.all(
      "SELECT * FROM attendance WHERE created_at = '" + today + "'",
      function(err, rows){
        var attendance = rows.map(function(row){
          return "\t• " + row.real_name;
        });

        if(attendance.length !== 0)
          str = "*Attendance:*\n" + attendance.join("\n");

        self.bot.sendMessage(self.channel, str);
      }
    );
  };

  CustomBot.prototype.clearAttendance = function(){
    db.run("DELETE FROM attendance");
    var response = this.bot_flavor.attendance_cleared || "Attendance cleared";
    this.bot.sendMessage(this.message.channel, response);
  };
};
