const os = require("os");
const moment = require("moment");

module.exports = (bot) => {
  // Fungsi untuk mengirimkan banner
  const sendBanner = (ctx) => {
    const uptime = moment.duration(os.uptime(), "seconds").humanize();
    const botVersion = "LuffyBot v1.0"; // Ubah sesuai versi
    const author = "Your Name"; // Ganti dengan nama author Anda

    const banner = `
      =======================
      *${botVersion}*
      Author: ${author}
      Uptime: ${uptime}
      =======================
    `;

    ctx.reply(banner);
  };

  // Ekspor fungsi sendBanner agar bisa dipanggil di fitur lain
  return sendBanner;
};
