const { getDB } = require("../utils/db");
const config = require("../config");

// Fungsi untuk mendaftarkan pengguna secara otomatis
async function registerUser(userId, username) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
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

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
}

// Fungsi untuk menambah exp
async function addExp(userId, expToAdd) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    let user = await usersCollection.findOne({ userId });

    if (!user) {
      throw new Error("User not found");
    }

    user.exp += expToAdd;

    const expRequired = user.level * 100;
    if (user.exp >= expRequired) {
      user.level += 1;
      user.exp = 0;
    }

    await usersCollection.updateOne({ userId }, { $set: user });
    return user;
  } catch (error) {
    console.error("Error adding exp:", error);
    throw new Error("Failed to add exp");
  }
}

// Fungsi untuk mengambil level
async function getLevel(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    const user = await usersCollection.findOne({ userId });
    return user ? user.level : 1;
  } catch (error) {
    console.error("Error getting level:", error);
    throw new Error("Failed to get level");
  }
}

// Fungsi untuk mengambil exp
async function getExp(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    const user = await usersCollection.findOne({ userId });
    return user ? user.exp : 0;
  } catch (error) {
    console.error("Error getting exp:", error);
    throw new Error("Failed to get exp");
  }
}

// Fungsi untuk menambah diamond
async function addDiamond(userId, diamondToAdd) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    let user = await usersCollection.findOne({ userId });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedDiamond = (user.diamond || 0) + diamondToAdd;
    await usersCollection.updateOne({ userId }, { $set: { diamond: updatedDiamond } });

    return updatedDiamond;
  } catch (error) {
    console.error("Error adding diamond:", error);
    throw new Error("Failed to add diamond");
  }
}

// Fungsi untuk mengambil jumlah diamond
async function getDiamond(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    const user = await usersCollection.findOne({ userId });
    return user ? user.diamond : 0;
  } catch (error) {
    console.error("Error getting diamond:", error);
    throw new Error("Failed to get diamond");
  }
}

// Fungsi untuk mengurangi diamond
async function deductDiamond(userId, diamondToDeduct) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
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
  } catch (error) {
    console.error("Error deducting diamond:", error);
    throw new Error("Failed to deduct diamond");
  }
}

// Command untuk mengecek level dan diamond
function setupLevelCommands(bot) {
  // Event listener untuk setiap pesan yang dikirim
  bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    try {
      // Mendaftarkan pengguna secara otomatis
      await registerUser(userId, username);

      // Menambahkan exp setiap kali pengguna mengirim pesan
      await addExp(userId, 5); // Tambahkan 5 exp setiap pesan
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  bot.command("stat", async (ctx) => {
    const userId = ctx.from.id;

    try {
      const level = await getLevel(userId);
      const exp = await getExp(userId);
      const diamond = await getDiamond(userId);

      ctx.reply(`Level: ${level}\nExp: ${exp}\n💎 Diamond: ${diamond}`);
    } catch (error) {
      ctx.reply("❌ Gagal mengambil statistik pengguna.");
    }
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
  registerUser,
  addExp,
  getLevel,
  getExp,
  addDiamond,
  getDiamond,
  deductDiamond,
  setupLevelCommands,
};
