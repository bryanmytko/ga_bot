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

var admin_id = '1,2';
var ta_id = '3,4,5';

var CustomBot = require("../custom_bot/custom-bot.js").CustomBot,
    bot = new CustomBot(bot, admin_id, ta_id, bot_flavor);

var CustomBot = require("../custom_bot/custom-bot").CustomBot;
var Attendance = require("../custom_bot/attendance")(CustomBot);
var Queue = require("../custom_bot/queue")(CustomBot);

describe("CustomBot", function(){
  var sendMessage = sinon.stub(slackbot.prototype, "sendMessage");

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

  describe("#parse_message_text()", function(){
    describe("when the message is valid", function(){
      it("returns the parsed text", function(){
        bot.message = { text: "<@test_bot>: hello" };
        var result = bot.parse_message_text();

        expect(result).to.eq("hello");
      });
    });

    describe("when the message is invalid", function(){
      it("returns nothing", function(){
        bot.message = { text: "" };
        var result = bot.parse_message_text();

        expect(result).to.eq("");
      });
    });
  });

  describe("#help()", function(){
    beforeEach(function(){
      sendMessage.reset();
    });

    it("sends the help information message", function(){
      bot.help();

      expect(sendMessage.calledOnce).to.be.true;
      expect(sendMessage.calledWith(bot.message.channel)).to.be.true;
    });
  });

  describe("#getAccessLevel()", function(){
    beforeEach(function(){
      bot.admin_id = '1,2';
      bot.ta_id = '3,4,5';

      var admin_access_level = 3;
      var ta_access_level = 2;
      var student_access_level = 0;
    });

    it("returns the correct access level for an admin", function(){
      bot.user = '1';
      var access_level = bot.getAccessLevel();

      expect(access_level).to.eq(3);
    });

    it("returns the correct access level for a TA", function(){
      bot.user = '3';
      var access_level = bot.getAccessLevel();

      expect(access_level).to.eq(2);
    });

    it("returns the correct access level with singular TA", function(){
      bot.ta_id = '3';
      bot.user = '3';
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

  describe("#respond", function(){
    beforeEach(function(){
      sendMessage.reset();
    });

    it("responds to message: hello", function(){
      var message = { text: "<@test_bot>: hello" };
      bot.respond(message);

      expect(sendMessage.calledOnce).to.be.true;
    });

    it("responds to status / queue", function(){
      var message = { text: "<@test_bot>: queue" };
      bot.respond(message);
      var message = { text: "<@test_bot>: status" };
      bot.respond(message);

      expect(sendMessage.calledTwice).to.be.true;
    });

    it("responds to what is my user id", function(){
      var message = { text: "<@test_bot>: what is my user id?" };
      bot.respond(message);

      expect(sendMessage.calledOnce).to.be.true;
    });

    it("responds to queue me", function(){
      var addToQueue = sinon.stub(bot, "add_to_queue");
      var message = { text: "<@test_bot>: queue me" };
      bot.respond(message);

      expect(addToQueue.calledOnce).to.be.true;
    });

    it("responds to set secret", function(){
      var setSecret = sinon.stub(bot, "setSecret");
      var message = { user: admin_id, text: "<@test_bot>: set secret foo" };
      bot.respond(message);

      expect(setSecret.calledOnce).to.be.true;
    });
  });
});
