var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/ga_bot.sqlite3');

db.serialize(function() {
  db.run("CREATE TABLE attendance (real_name VARCHAR(255), name VARCHAR(255), created_at DATETIME)");
  db.run("CREATE TABLE secret (value VARCHAR(255))");
  db.run("CREATE TABLE queue (user_id VARCHAR(255), name VARCHAR(255), details VARCHAR(255))");
  db.run("INSERT INTO secret (value) VALUES ('default_secret')");
});

db.close();
