const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const { checkUserAccess } = require("./sewabot");
const config = require("../config");

module.exports = function bussid(bot) {
  bot.command("bussid", async (ctx) => {
    const userId = ctx.from.id;

    // Cek apakah user memiliki akses sewa atau termasuk owner
    const hasAccess = await checkUserAccess(userId);
    if (!hasAccess && !config.owners.includes(userId)) {
      return ctx.reply("❌ Anda tidak memiliki akses ke fitur ini. Silakan hubungi admin untuk menyewa akses.");
    }

    ctx.reply("Silakan masukkan Device ID atau X-Auth Token:");

    // Menggunakan 'once' agar hanya menangkap satu input
    bot.once("text", async (ctx) => {
      const input = ctx.message.text;
      let sessionTicket = "";

      if (input.startsWith("AUTH-")) {
        sessionTicket = input;
      } else {
        sessionTicket = await loginWithDevice(input);
      }

      if (sessionTicket) {
        showMenu(ctx, sessionTicket, bot);
      } else {
        ctx.reply("❌ Gagal login. Coba lagi.");
      }
    });
  });
};

async function loginWithDevice(deviceId) {
  try {
    const response = await axios.post("https://4ae9.playfabapi.com/Client/LoginWithAndroidDeviceID", {
      AndroidDevice: "AndroidPhone",
      AndroidDeviceId: deviceId,
      CreateAccount: true,
      TitleId: "4AE9",
    }, {
      headers: { "Content-Type": "application/json", "User-Agent": "UnityPlayer/2021.3.40f1" },
    });
    return response.data.data?.SessionTicket || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function addRp(xAuth, value, label) {
  try {
    await axios.post("https://4ae9.playfabapi.com/Client/ExecuteCloudScript", {
      FunctionName: "AddRp",
      FunctionParameter: { addValue: value },
      GeneratePlayStreamEvent: false,
      RevisionSelection: "Live",
    }, { headers: { "Content-Type": "application/json", "X-Authorization": xAuth } });

    return `✅ Inject ${label} berhasil!`;
  } catch (error) {
    console.error(error);
    return `❌ Gagal inject ${label}. Coba lagi nanti.`;
  }
}

function showMenu(ctx, sessionTicket, bot) {
  const userId = ctx.from.id;

  ctx.reply("Pilih jumlah UB yang ingin diinject:", Markup.inlineKeyboard([
    [Markup.button.callback("500k UB", "inject_500k"), Markup.button.callback("800k UB", "inject_800k")],
    [Markup.button.callback("1jt UB", "inject_1m"), Markup.button.callback("Kurangi 50jt UB", "reduce_50m")],
    [Markup.button.callback("Kurangi 200jt UB", "reduce_200m")],
    config.owners.includes(userId) ? [Markup.button.callback("Manual Input", "manual_input")] : [],
    [Markup.button.callback("Keluar", "exit")]
  ].filter(row => row.length > 0))).then((sentMessage) => {
    const menuMessageId = sentMessage.message_id;

    bot.on("callback_query", async (ctx) => {
      const action = ctx.callbackQuery.data;

      try {
        if (action === "manual_input") {
          if (!config.owners.includes(ctx.from.id)) {
            return ctx.reply("❌ Anda tidak memiliki izin untuk menggunakan fitur ini.");
          }

          ctx.reply("Masukkan jumlah UB yang ingin diinject:");
          
          // Menggunakan 'once' agar hanya menangkap satu input
          bot.once("text", async (ctx) => {
            const inputValue = parseInt(ctx.message.text);
            if (isNaN(inputValue)) return ctx.reply("❌ Input tidak valid. Masukkan angka saja!");

            await ctx.reply(await addRp(sessionTicket, inputValue, `${inputValue} UB`));
          });
        } else {
          switch (action) {
            case "inject_500k":
              await ctx.reply(await addRp(sessionTicket, 500000, "500k UB"));
              break;
            case "inject_800k":
              await ctx.reply(await addRp(sessionTicket, 800000, "800k UB"));
              break;
            case "inject_1m":
              await ctx.reply(await addRp(sessionTicket, 1000000, "1jt UB"));
              break;
            case "reduce_50m":
              await ctx.reply(await addRp(sessionTicket, -50000000, "Kurangi 50jt UB"));
              break;
            case "reduce_200m":
              await ctx.reply(await addRp(sessionTicket, -200000000, "Kurangi 200jt UB"));
              break;
            case "exit":
              await ctx.reply("Keluar dari menu.");
              await ctx.deleteMessage(menuMessageId);
              break;
            default:
              await ctx.reply("❌ Pilihan tidak valid.");
          }
        }
      } catch (error) {
        console.error(error);
        await ctx.reply("❌ Terjadi kesalahan saat memproses permintaan Anda.");
      }

      await ctx.answerCbQuery();
    });
  });
}

