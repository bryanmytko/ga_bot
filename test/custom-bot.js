var chai = require("chai"),
    expect = chai.expect,
    util   = require("util"),
    sinon  = require("sinon"),
    sinonChai = require("sinon-chai");

var slackbot = require('../slackbot-new'),
    envVars = require('../env-vars'),
    botKey = envVars['SLACKBOT_KEY'],
    bot_flavor = require("./bot-flavor"),
    bot = new slackbot(botKey),
    ws = require('ws');

    chai.use(sinonChai);

var CustomBot = require("../custom_bot/custom-bot.js").CustomBot,
    bot = new CustomBot(bot, 1, 2, bot_flavor);

var CustomBot = require("../custom_bot/custom-bot").CustomBot;
var Attendance = require("../custom_bot/attendance")(CustomBot);

describe("CustomBot", function(){
  describe("#greeting()", function(){
    beforeEach(function(){
      sinon.spy(console, "log");
    });

    it("should return a greeting", function(){
      bot.greet();

      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWith(
          bot_flavor.greeting || "Hello. Bot is online!"
      )).to.be.true;
    });
  });

  describe("#parseMessageText()", function(){
    describe("when the message is valid", function(){
      it("returns the parsed text", function(){
        bot.message = { text: "<@test_bot>: hello" };
        var result = bot.parseMessageText();

        expect(result).to.eq("hello");
      });
    });

    describe("when the message is invalid", function(){
      it("returns nothing", function(){
        bot.message = { text: "" };
        var result = bot.parseMessageText();

        expect(result).to.eq("");
      });
    });
  });

  describe("#help()", function(){

    it("sends the help information message", function(){
      var send = sinon.stub(slackbot.prototype, "sendMessage");

      bot.help();

      expect(send.calledOnce).to.be.true;
      expect(send.calledWith(bot.message.channel)).to.be.true;
    });
  });

  describe("#getAccessLevel()", function(){
    beforeEach(function(){
      bot.admin_id = 1;
      bot.ta_id = 2;

      var admin_access_level = 3;
      var ta_access_level = 2;
      var student_access_level = 0;
    });

    it("returns the correct access level for an admin", function(){
      bot.user = bot.admin_id;
      var access_level = bot.getAccessLevel();

      expect(access_level).to.eq(3);
    });

    it("returns the correct access level for a TA", function(){
      bot.user = bot.ta_id;
      var access_level = bot.getAccessLevel();

      expect(access_level).to.eq(2);
    });

    it("returns the correct access level for a student", function(){
      bot.user = 12345;
      var access_level = bot.getAccessLevel();

      expect(access_level).to.eq(0);
    });
  });

  describe("#randomQuote", function(){
    it("returns a random quote", function(){
      var quote = bot.randomQuote();
      expect(quote).to.be.oneOf(["Hello!", ":D"]);
    });
  });
});
