const { getDB } = require("../utils/db");

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
      console.log(`[registerUser] User registered: ${userId}`);
    }

    return user;
  } catch (error) {
    console.error("[registerUser] Error:", error);
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

    const expRequired = user.level * 100; // Level up setiap 100 exp
    if (user.exp >= expRequired) {
      user.level += 1;
      user.exp = 0;
      console.log(`[addExp] User ${userId} leveled up to level ${user.level}`);
    }

    await usersCollection.updateOne({ userId }, { $set: user });
    return user;
  } catch (error) {
    console.error("[addExp] Error:", error);
    throw new Error("Failed to add exp");
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

    console.log(`[addDiamond] Diamond added to user ${userId}. New diamond: ${updatedDiamond}`);
    return updatedDiamond;
  } catch (error) {
    console.error("[addDiamond] Error:", error);
    throw new Error("Failed to add diamond");
  }
}

// Fungsi untuk mengambil statistik pengguna (level, exp, diamond)
async function getUserStats(userId) {
  const db = getDB();
  const usersCollection = db.collection("users");

  try {
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      throw new Error("User not found");
    }
    return {
      level: user.level,
      exp: user.exp,
      diamond: user.diamond,
    };
  } catch (error) {
    console.error("[getUserStats] Error:", error);
    throw new Error("Failed to get user stats");
  }
}

module.exports = {
  registerUser,
  addExp,
  addDiamond,
  getUserStats,
};
