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
  beforeEach(function(){
    sinon.spy(console, "log");
  });

  describe("#greeting()", function(){
    it("should return a greeting", function(){
      bot.greet();

      expect(console.log.calledOnce).to.be.true;
      expect(console.log.calledWith(
          bot_flavor.greeting || "Hello. Bot is online!"
      )).to.be.true;
    });
  });
});
