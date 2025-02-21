const { getDB } = require("../utils/db");
const config = require("../config"); // Import config.js

// Fungsi untuk menambah exp
async function addExp(userId, username, expToAdd) {
  const db = getDB();
  const usersCollection = db.collection("users");

  let user = await usersCollection.findOne({ userId });

  if (!user) {
    user = {
      userId,
      username,
      level: 1,
      exp: 0,
      diamond: 0,
    };
    await usersCollection.insertOne(user);
  }

  user.exp += expToAdd;

  const expRequired = user.level * 100;
  if (user.exp >= expRequired) {
    user.level += 1;
    user.exp = 0;
  }

  await usersCollection.updateOne({ userId }, { $set: user });
  return user;
}

// Fungsi untuk mengambil level
async function getLevel(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });
  return user ? user.level : 1;
}

// Fungsi untuk mengambil exp
async function getExp(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });
  return user ? user.exp : 0;
}

// Fungsi untuk menambah diamond
async function addDiamond(userId, diamondToAdd) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedDiamond = (user.diamond || 0) + diamondToAdd;
  await usersCollection.updateOne({ userId }, { $set: { diamond: updatedDiamond } });

  return updatedDiamond;
}

// Fungsi untuk mengambil jumlah diamond
async function getDiamond(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });
  return user ? user.diamond : 0;
}

// Fungsi untuk mengurangi diamond
async function deductDiamond(userId, diamondToDeduct) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.diamond < diamondToDeduct) {
    throw new Error("Diamond tidak cukup");
  }

  const updatedDiamond = user.diamond - diamondToDeduct;
  await usersCollection.updateOne({ userId }, { $set: { diamond: updatedDiamond } });

  return updatedDiamond;
}

// Command untuk mengecek level dan diamond
function setupLevelCommands(bot) {
  bot.command("stat", async (ctx) => {
    const userId = ctx.from.id;
    const level = await getLevel(userId);
    const exp = await getExp(userId);
    const diamond = await getDiamond(userId);

    ctx.reply(`Level: ${level}\nExp: ${exp}\n💎 Diamond: ${diamond}`);
  });

  // Command untuk menambah diamond (hanya admin atau owner)
  bot.command("isidm", async (ctx) => {
    const userId = ctx.from.id;

    // Cek apakah user adalah admin atau owner
    const isAdmin = config.admins.includes(userId);
    const isOwner = config.owners.includes(userId);

    if (!isAdmin && !isOwner) {
      return ctx.reply("❌ Hanya admin atau owner yang bisa menggunakan command ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
      return ctx.reply("❌ Format: /isidm <user_id> <jumlah_diamond>");
    }

    const targetUserId = parseInt(args[1]);
    const diamondToAdd = parseInt(args[2]);

    if (isNaN(targetUserId) || isNaN(diamondToAdd)) {
      return ctx.reply("❌ User ID atau jumlah diamond tidak valid.");
    }

    try {
      const newDiamond = await addDiamond(targetUserId, diamondToAdd);
      ctx.reply(`✅ Berhasil menambahkan ${diamondToAdd} diamond ke user ${targetUserId}. Total diamond sekarang: ${newDiamond}`);
    } catch (error) {
      ctx.reply(`❌ Gagal menambahkan diamond: ${error.message}`);
    }
  });

  // Command untuk mengecek user ID
  bot.command("myid", (ctx) => {
    const userId = ctx.from.id;
    ctx.reply(`User ID Anda adalah: ${userId}`);
  });
}

module.exports = {
  addExp,
  getLevel,
  getExp,
  addDiamond,
  getDiamond,
  deductDiamond,
  setupLevelCommands, // Ekspor fungsi setupLevelCommands
};
