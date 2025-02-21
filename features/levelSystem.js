const { getDB } = require("../utils/db");

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

module.exports = { addExp, getLevel, getExp, addDiamond, getDiamond, deductDiamond };
