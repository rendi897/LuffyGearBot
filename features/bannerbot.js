const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  bot.use(async (ctx, next) => {
    await next();
    if (ctx.message && ctx.replyWithPhoto) {
      const bannerPath = path.join(__dirname, "../assets/banner.jpg");
      if (fs.existsSync(bannerPath)) {
        await ctx.replyWithPhoto({ source: bannerPath }, { caption: "🤖 LuffyBot - Your Friendly Group Assistant!" });
      } else {
        await ctx.reply("🤖 LuffyBot - Your Friendly Group Assistant!");
      }
    }
  });
};
