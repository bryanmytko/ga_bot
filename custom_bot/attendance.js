var db = require("./database")();

module.exports = function(CustomBot){
  CustomBot.prototype.sendAttendanceMessage = function(msg){
    this.bot.sendMessage(
      this.message.channel,
      `${msg}\n`
    );
  };

  CustomBot.prototype.checkAttendance = function(){
    var today = new Date();

    db.get(
      "SELECT * FROM attendance WHERE name = '"
        + this.user
        + "' AND created_at = '"
        + today.setHours(0,0,0,0)
        + "' LIMIT 1",
      function(err, rows){
        if(!rows) this.insertAttendance();
      }.bind(this)
    );
  };

  CustomBot.prototype.insertAttendance = function(){
    this.bot.api(
      "users.info",
      { user: this.message.user },
      function(data) {
        var name = data.user.real_name || data.user.name;
        var today = new Date();
        var stmt = db.prepare(
          "INSERT INTO attendance (real_name, name, created_at) VALUES (?,?,?)"
        );
        stmt.run(data.user.name, data.user.id, today.setHours(0,0,0,0));

        this.sendAttendanceMessage(
           name
             + " "
             + (this.bot_flavor.present || "You've been marked as present!")
        );
      }.bind(this)
    );
  };

  CustomBot.prototype.printAttendance = function(){
    var today = new Date().setHours(0,0,0,0);

    db.all(
      "SELECT * FROM attendance WHERE created_at = '" + today + "'",
      function(err, rows){
        var attendance = rows.map(function(row){
          return "\t• " + row.real_name;
        });

        if(attendance.length !== 0)
          var str = "*Attendance:*\n" + attendance.join("\n");
        else
          var str = this.bot_flavor.attendance_zero

        this.bot.sendMessage(this.channel, str);
      }.bind(this)
    );
  };

  CustomBot.prototype.clearAttendance = function(){
    db.run("DELETE FROM attendance");

    this.bot.sendMessage(
      this.message.channel,
      this.bot_flavor.attendance_cleared
    )
  };
};
