const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = (bot) => {
  bot.command("addcash", async (ctx) => {
    const senderId = ctx.from.id;
    const isAdmin = ctx.chat.type !== "private" ? await ctx.getChatMember(senderId).then(member => ["administrator", "creator"].includes(member.status)) : false;
    
    if (senderId != process.env.OWNER_ID && !isAdmin) {
      return ctx.reply("❌ Anda tidak memiliki izin untuk menambahkan cash.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
      return ctx.reply("Format salah! Gunakan: /addcash [user_id] [jumlah]");
    }

    const userId = parseInt(args[1]);
    const amount = parseInt(args[2]);

    if (isNaN(userId) || isNaN(amount)) {
      return ctx.reply("User ID dan jumlah harus berupa angka.");
    }

    const { data, error } = await supabase
      .from("users")
      .select("cash")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return ctx.reply("Terjadi kesalahan saat mengakses database.");
    }

    const newCash = (data?.cash || 0) + amount;
    await supabase.from("users").upsert({ id: userId, cash: newCash });

    ctx.reply(`✅ Berhasil menambahkan ${amount} cash ke user ${userId}. Total: ${newCash}`);
  });
};
