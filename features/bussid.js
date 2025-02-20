const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const config = require("../config");

module.exports = function bussidInjector(bot) {
  bot.command("bussid", async (ctx) => {
    if (!isAuthorized(ctx.from.id)) {
      ctx.reply("Anda tidak memiliki izin untuk menggunakan fitur ini.");
      return;
    }

    ctx.reply("Silakan masukkan Device ID atau X-Auth Token:");

    bot.on("text", async (ctx) => {
      const input = ctx.message.text;
      let sessionTicket = "";

      // Cek apakah input sudah valid atau login dengan device
      if (input.startsWith("AUTH-")) {
        sessionTicket = input;
      } else {
        sessionTicket = await loginWithDevice(input);
      }

      if (sessionTicket) {
        showMenu(ctx, sessionTicket, bot); // Pass bot ke showMenu
      } else {
        ctx.reply("Gagal login. Coba lagi.");
      }
    });
  });
};

function isAuthorized(userId) {
  return isOwner(userId) || isAdmin(userId) || isUser(userId);
}

function isOwner(userId) {
  return config.owners.includes(userId);
}

function isAdmin(userId) {
  return config.admins.includes(userId);
}

function isUser(userId) {
  return config.users.includes(userId);
}

async function loginWithDevice(deviceId) {
  try {
    const response = await axios.post("https://4ae9.playfabapi.com/Client/LoginWithAndroidDeviceID", {
      AndroidDevice: "AndroidPhone",
      AndroidDeviceId: deviceId,
      CreateAccount: true,
      TitleId: "4AE9",
    }, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "UnityPlayer/2021.3.40f1",
      },
    });
    return response.data.data?.SessionTicket || null;
  } catch (error) {
    console.error(error);  // Menambahkan log untuk error debugging
    return null;
  }
}

// Fungsi untuk menambahkan atau mengurangi RP
async function addRp(xAuth, value, label) {
  try {
    const response = await axios.post("https://4ae9.playfabapi.com/Client/ExecuteCloudScript", {
      FunctionName: "AddRp",
      FunctionParameter: { addValue: value },
      GeneratePlayStreamEvent: false,
      RevisionSelection: "Live",
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": xAuth,
      },
    });
    return `Inject ${label} berhasil!`;
  } catch (error) {
    console.error(error);
    return `Gagal inject ${label}. Coba lagi nanti.`;
  }
}

// Show Menu with Inline Buttons
function showMenu(ctx, sessionTicket, bot) {
  // Kirimkan tombol untuk memilih opsi
  ctx.reply("Pilih jumlah UB yang ingin diinject:", Markup.inlineKeyboard([
    [
      Markup.button.callback("500k UB", "inject_500k"),
      Markup.button.callback("800k UB", "inject_800k"),
    ],
    [
      Markup.button.callback("1jt UB", "inject_1m"),
      Markup.button.callback("Kurangi 50jt UB", "reduce_50m"),
    ],
    [
      Markup.button.callback("Kurangi 200jt UB", "reduce_200m"),
      Markup.button.callback("Keluar", "exit"),
    ]
  ]));

  // Handle callback dari tombol yang dipilih secara asinkron
  bot.on("callback_query", async (ctx) => {
    const action = ctx.callbackQuery.data;

    try {
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
          break;
        default:
          await ctx.reply("Pilihan tidak valid.");
      }
    } catch (error) {
      console.error(error);
      await ctx.reply("Terjadi kesalahan saat memproses permintaan Anda.");
    }

    // Acknowledge callback dan hapus tombol setelah dipilih
    await ctx.answerCbQuery();
  });
}
