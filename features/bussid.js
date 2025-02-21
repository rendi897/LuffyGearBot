const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const { checkUserAccess } = require("./sewabot");
const config = require("../config");

// Simpan sesi login pengguna
const userSessions = {};

module.exports = function bussid(bot) {
  bot.command("bussid", async (ctx) => {
    const userId = ctx.from.id;

    // Cek apakah user memiliki akses sewa atau termasuk owner
    try {
      const hasAccess = await checkUserAccess(userId);
      if (!hasAccess && !config.owners.includes(userId)) {
        return ctx.reply("❌ Anda tidak memiliki akses ke fitur ini. Silakan hubungi admin untuk menyewa akses.");
      }

      ctx.reply("Silakan masukkan Device ID atau X-Auth Token:");

      // Menggunakan 'once' agar hanya menangkap satu input
      bot.on("text", async (ctx) => {
        const input = ctx.message.text;
        let sessionTicket = "";

        if (input.startsWith("AUTH-")) {
          sessionTicket = input;
        } else {
          sessionTicket = await loginWithDevice(input);
        }

        if (sessionTicket) {
          userSessions[userId] = sessionTicket; // Simpan sesi login
          showMenu(ctx, sessionTicket, bot);
        } else {
          ctx.reply("❌ Gagal login. Coba lagi.");
        }
      });
    } catch (error) {
      console.error("❌ Error dalam command bussid:", error);
      ctx.reply("❌ Terjadi kesalahan saat memproses permintaan Anda.");
    }
  });
};

// Fungsi untuk login dengan Device ID
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
    console.error("❌ Gagal login dengan Device ID:", error);
    return null;
  }
}

// Fungsi untuk menambah atau mengurangi RP (Resource Points)
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
    console.error("❌ Gagal inject RP:", error);
    return `❌ Gagal inject ${label}. Coba lagi nanti.`;
  }
}

// Fungsi untuk menampilkan menu dengan reply keyboard
function showMenu(ctx, sessionTicket, bot) {
  const userId = ctx.from.id;

  ctx.reply("Pilih jumlah UB yang ingin diinject:", Markup.keyboard([
    ["500k UB", "800k UB", "1jt UB"],
    ["Kurangi 50jt UB", "Kurangi 200jt UB"],
    ["Keluar"]
  ])
  .resize()
  .oneTime()
  );

  bot.on("text", async (ctx) => {
    const action = ctx.message.text;

    try {
      if (action === "Keluar") {
        await ctx.reply("Keluar dari menu.");
        delete userSessions[ctx.from.id]; // Hapus sesi login
      } else if (["500k UB", "800k UB", "1jt UB", "Kurangi 50jt UB", "Kurangi 200jt UB"].includes(action)) {
        let value = 0;
        let label = "";

        switch (action) {
          case "500k UB":
            value = 500000;
            label = "500k UB";
            break;
          case "800k UB":
            value = 800000;
            label = "800k UB";
            break;
          case "1jt UB":
            value = 1000000;
            label = "1jt UB";
            break;
          case "Kurangi 50jt UB":
            value = -50000000;
            label = "Kurangi 50jt UB";
            break;
          case "Kurangi 200jt UB":
            value = -200000000;
            label = "Kurangi 200jt UB";
            break;
        }

        await ctx.reply(await addRp(sessionTicket, value, label));
      } else if (action.startsWith("/inject")) {
        // Handle /inject command
        const match = action.match(/^\/inject (\d+)$/);
        if (match) {
          const inputValue = parseInt(match[1]);
          if (isNaN(inputValue)) {
            return ctx.reply("❌ Input tidak valid. Masukkan angka saja!");
          }

          await ctx.reply(await addRp(sessionTicket, inputValue, `${inputValue} UB`));
        } else {
          await ctx.reply("❌ Format command tidak valid. Gunakan /inject <value>.");
        }
      } else {
        await ctx.reply("❌ Pilihan tidak valid.");
      }
    } catch (error) {
      console.error("❌ Error dalam menangani input:", error);
      await ctx.reply("❌ Terjadi kesalahan saat memproses permintaan Anda.");
    }
  });
}
