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
      bot.once("text", async (ctx) => {
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

// Fungsi untuk menampilkan menu dengan inline keyboard
function showMenu(ctx, sessionTicket, bot) {
  const userId = ctx.from.id;

  ctx.reply("Pilih opsi yang diinginkan:", Markup.inlineKeyboard([
    [
      Markup.button.callback("Tambahkan 500k UB", "inject_500k"),
      Markup.button.callback("Tambahkan 800k UB", "inject_800k"),
      Markup.button.callback("Tambahkan 1jt UB", "inject_1m")
    ],
    [
      Markup.button.callback("Kurangi 50jt UB", "reduce_50m"),
      Markup.button.callback("Kurangi 200jt UB", "reduce_200m")
    ],
    [
      Markup.button.callback("Periksa Status Akun", "check_status"),
      Markup.button.callback("Cek Log Aktivitas", "check_log")
    ],
    [
      Markup.button.callback("Keluar", "exit")
    ]
  ]));

  bot.on("callback_query", async (ctx) => {
    const action = ctx.callbackQuery.data;

    try {
      if (action === "exit") {
        await ctx.reply("Keluar dari menu.");
        delete userSessions[ctx.from.id]; // Hapus sesi login
        await ctx.deleteMessage(); // Menghapus pesan menu
      } else if (["inject_500k", "inject_800k", "inject_1m", "reduce_50m", "reduce_200m"].includes(action)) {
        let value = 0;
        let label = "";

        switch (action) {
          case "inject_500k":
            value = 500000;
            label = "500k UB";
            break;
          case "inject_800k":
            value = 800000;
            label = "800k UB";
            break;
          case "inject_1m":
            value = 1000000;
            label = "1jt UB";
            break;
          case "reduce_50m":
            value = -50000000;
            label = "Kurangi 50jt UB";
            break;
          case "reduce_200m":
            value = -200000000;
            label = "Kurangi 200jt UB";
            break;
        }

        await ctx.reply(await addRp(sessionTicket, value, label));
      } else if (action === "check_status") {
        // Implement status account check (misalnya, tampilkan data akun pengguna)
        await ctx.reply("Akun Anda aktif dan siap digunakan.");
      } else if (action === "check_log") {
        // Implement log activity check (misalnya, tampilkan aktivitas terbaru)
        await ctx.reply("Log aktivitas terbaru: Semua aktivitas telah sukses.");
      } else {
        await ctx.reply("❌ Pilihan tidak valid.");
      }
    } catch (error) {
      console.error("❌ Error dalam menangani input:", error);
      await ctx.reply("❌ Terjadi kesalahan saat memproses permintaan Anda.");
    }

    await ctx.answerCbQuery(); // Menyelesaikan callback
  });
}
