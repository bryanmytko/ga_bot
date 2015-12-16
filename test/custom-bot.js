var chai = require("chai"),
    expect = chai.expect,
    util   = require("util"),
    sinon  = require("sinon"),
    sinonChai = require("sinon-chai"),
    bot_flavor = require("../bot-flavor");

    chai.use(sinonChai);

var CustomBot = require("../custom-bot.js").CustomBot,
    bot = new CustomBot();

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
        bot.message = { text: "<@test_bot>: hello" }
        var result = bot.parseMessageText();

        expect(result).to.eq("hello");
      });
    });

    describe("when the message is invalid", function(){
      it("returns nothing", function(){
        bot.message = { text: "" }
        var result = bot.parseMessageText();

        expect(result).to.eq("");
      });
    });
  });
});
