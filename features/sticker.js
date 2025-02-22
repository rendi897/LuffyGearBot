const axios = require("axios");
const sharp = require("sharp");

module.exports = function (bot) => {
  bot.on("photo", async (ctx) => {
    // Mendapatkan file gambar yang dikirim
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await bot.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    try {
      // Unduh gambar dengan axios
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

      // Pastikan gambar berhasil diunduh dan imageBuffer ada
      const imageBuffer = Buffer.from(response.data, "binary");

      // Gunakan sharp untuk memanipulasi gambar
      const text = `LuffyBot\nby R3NZGG`;
      
      // Resize gambar dan tambahkan teks di atas gambar
      const processedImageBuffer = await sharp(imageBuffer)
        .resize(512) // Resize gambar ke 512px
        .composite([{
          input: Buffer.from(`<svg width="512" height="512">
                              <text x="10" y="500" font-size="32" fill="white">${text}</text>
                             </svg>`),
          top: 0,
          left: 0,
        }])
        .toBuffer();

      // Kirim gambar sebagai stiker
      await ctx.replyWithSticker({ source: processedImageBuffer });
    } catch (error) {
      console.error("Error processing image:", error);
      ctx.reply("❌ Gagal membuat stiker.");
    }
  });
};
