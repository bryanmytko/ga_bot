var chai = require("chai"),
    expect = chai.expect,
    util   = require("util"),
    sinon  = require("sinon"),
    sinonChai = require("sinon-chai");

var slackbot = require('../slackbot-new'),
    envVars = require('../env-vars'),
    botKey = envVars['SLACKBOT_KEY'],
    bot_flavor = require("../custom_bot/bot-flavor"),
    bot = new slackbot(botKey);

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

  describe ("#parseMessageText()", function(){
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
});

describe("Messages", function(){
  describe("what is my user id?", function(){
    bot.respond("what is my user id?");
  });
});
