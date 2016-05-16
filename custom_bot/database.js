module.exports = function(){
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('db/ga_bot.sqlite3');
  return db;
};
