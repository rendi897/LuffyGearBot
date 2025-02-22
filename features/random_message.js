const config = require("../config"); // Ambil konfigurasi dari config.js

const messages = [
    "こんにちは! (Konnichiwa!) Selamat siang, semuanya! ☀️",
    "Senpai, aku butuh bantuanmu! 😳",
    "Keep fighting! Never give up, never surrender! 💪🔥",
    "Pagi-pagi enaknya minum kopi sambil nonton anime 🍵",
    "Ayo terus berjuang, seperti seorang shounen protagonist! 💥",
    "Jangan lupa istirahat! Tidur cukup itu penting 😴",
    "Ganbatte! Semangat terus ya, teman-teman! 💪",
    "Ore wa saikyou da! (Aku yang terkuat!) 🏆",
    "Kamu adalah karakter utama dalam hidupmu sendiri! 🌟",
    "Jangan menyerah, bahkan Goku pun harus latihan keras dulu! 🏋️",
    "Kalo lelah, dengerin lagu anime bisa bikin semangat lagi! 🎶",
    "Henshin! Saatnya berubah jadi lebih baik! 🔥",
    "Hajimemashite! Senang bertemu dengan kalian semua 😊",
    "Boku wa kimi no tame ni tatakau! (Aku akan bertarung demi kamu!) ⚔️",
    "Mimpi itu harus dikejar! Jangan cuma jadi NPC di dunia nyata! 🌍",
    "Shinzo wo sasageyo! (Persembahkan hatimu!) 💂‍♂️",
    "Siapa yang suka isekai anime? Dunia lain itu menarik banget! 🌏",
    "You can do it! Aku percaya kamu pasti bisa! 💪",
    "Terkadang, hidup ini kayak slice of life anime. Nikmati aja! 🎭",
    "Sasuga, senpai! Kamu memang hebat! 👏",
    "Hari ini enaknya rewatch anime klasik, nostalgia banget 🎥",
    "Cie yang diam-diam suka tsundere 🤭",
    "Kamu harus percaya pada kekuatan persahabatan! 🤝✨",
    "Jangan pernah bilang 'aku gagal', coba lagi seperti seorang ninja! 🏯",
    "Sabar... One Piece masih belum tamat! 📖",
    "Kamu lebih kuat dari yang kamu kira! ⚡",
    "Dunia ini luas! Yuk, belajar sesuatu yang baru hari ini! 🌎",
    "Jika dunia nyata punya skill tree, aku bakal upgrade 'sabar' dulu 🧘‍♂️",
    "Nani?! Apa yang barusan terjadi?! 🤯",
    "Jangan cuma nonton anime, baca manganya juga seru loh! 📚",
    "Ada yang suka waifu atau husbando di sini? 🤔",
    "Power up! Saatnya naik level hari ini! ⬆️",
    "Kawaii desu ne! (Sangat imut, bukan?) 🥰",
    "Dare mo shiranai mirai ga matteru yo! (Masa depan yang tak diketahui menunggumu!) 🔮",
    "Saatnya farming exp dan grinding seperti di game RPG! 🎮",
    "Boku wa tomodachi ga sukunai... (Aku nggak punya banyak teman... 😢)",
    "Eiyuu wa itsumo koko ni iru! (Pahlawan selalu ada di sini!) 🦸‍♂️",
    "Ayo baca light novel sambil minum teh 🍵",
    "Onee-chan! Tolong bantu aku dong! 🥺",
    "Kamu harus percaya pada dirimu sendiri! 🌟",
    "Anime + kopi = mood booster terbaik ☕",
    "Berani coba makanan khas Jepang? 🍣",
    "Siapa yang udah nunggu episode terbaru?! 🤩",
    "Henshin! Saatnya berubah menjadi versi terbaik dari dirimu! 💥",
    "Boku wa ore no shinjiru michi o iku! (Aku akan berjalan di jalanku sendiri!) 🚶",
    "Jangan cuma AFK di dunia nyata, lakukan sesuatu yang hebat! 🎯",
    "Jadilah karakter utama dalam cerita hidupmu sendiri! 📖",
    "Anime terbaik adalah anime yang kamu nikmati! 🎬"
];

function getRandomInterval() {
    return Math.floor(Math.random() * (3 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000 + 1)) + 1 * 60 * 60 * 1000;
}

function sendRandomMessage(bot) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    if (!config.group_id.length) {
        console.error("Daftar Group ID kosong di config.js");
        return;
    }

    config.group_id.forEach((chatId) => {
        bot.telegram.sendMessage(chatId, randomMessage).catch(console.error);
    });

    setTimeout(() => sendRandomMessage(bot), getRandomInterval());
}

module.exports = function (bot) {
    setTimeout(() => sendRandomMessage(bot), getRandomInterval());
};
