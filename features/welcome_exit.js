module.exports = function (bot) => {
    const welcomeMessages = [
    "Sugoi {name}-kun! Kamu sekarang bagian dari grup ini! 🎌",
    "Bienvenido {name}! Selamat datang di sini! 🇪🇸",
    "Ahlan wa sahlan, {name}! Semoga nyaman di sini. 🌟",
    "Wilujeng sumping {name}! Nikmati suasananya. 🌿",
    "Konnichiwa {name}-san! Selamat siang! ☕",
    "Boku wa {name}-san no tomodachi desu! (Aku temanmu!) 🤝",
    "Irasshaimase, {name}! (Selamat datang!) 🎉",
    "Salut {name}! Kita tunggu ceritamu di sini! 📝",
    "Ni hao {name}! Mari berteman baik! 🤗",
    "Annyeong haseyo {name}! Jangan sungkan untuk ngobrol. 🇰🇷",
    "Welcome home, {name}-san! 🏠",
    "Hajimemashite {name}! Ayo kita bersenang-senang! 🎌",
    "Kita kedatangan member baru, {name}-kun! 🔥",
    "Chào mừng {name}! Mari berbincang seru! 🇻🇳",
    "Selamat datang, {name}! Semoga hari-harimu menyenangkan! 🎶",
    "Shalom {name}! Kami senang kamu bergabung! ✨",
    "Welkom {name}, let's have fun together! 🇳🇱",
    "Bonjour {name}, c’est un plaisir de te voir ici! 🇫🇷",
    "Witaj {name}! Jesteśmy szczęśliwi, że tu jesteś! 🇵🇱",
    "Sawasdee {name}-san! Mari kita bersenang-senang! 🇹🇭",
    "Benvenuto {name}! Grup ini semakin seru denganmu! 🇮🇹",
    "Velkommen {name}! Jangan ragu untuk berbagi cerita! 🇩🇰",
    "Okaerinasai {name}-san! (Selamat pulang!) 🏡",
    "Välkommen {name}! Have a great time here! 🇸🇪",
    "Bem-vindo {name}! Ayo ngobrol bareng! 🇧🇷",
    "Guten Tag {name}! Jangan ragu untuk bertanya! 🇩🇪",
    "Namaste {name}! Kamu pasti betah di sini! 🇮🇳",
    "Moshi moshi {name}-san! Yuk ngobrol! ☎️",
    "Cześć {name}! Selamat datang di komunitas ini! 🇵🇱",
    "As-salamu alaykum {name}! Nikmati obrolannya! ☪️",
    "Yay {name}-kun! Kita punya teman baru! 🎉",
    "Dōzo yoroshiku {name}-san! (Senang berkenalan!) 🙇‍♂️",
    "Hello {name}-chan! Ready to have fun? 💃",
    "Suteki {name}! (Kamu luar biasa!) ✨",
    "Halo {name}! Udah siap jadi bagian dari keluarga ini? 🎌",
    "Zdravstvuyte {name}! Enjoy the moment! 🇷🇺",
    "Selamat datang {name}! Let's build good memories! 🌸",
    "Ayo ngobrol santai, {name}! Kami tunggu cerita serumu! 🎤",
    "Hola {name}! Hope you have a great time! 🇪🇸",
    "Kamu nggak sendirian, {name}. Kita di sini bareng-bareng! 🤗",
    "Daijoubu {name}-kun! Semua pasti menyenangkan di sini! 🎭",
    "Horeee {name}-san gabung! 🎊 Semoga betah ya!",
    "Vítej {name}! We're happy to have you here! 🇨🇿",
    "Dame da ne, dame yo~ Tapi masuk sini seru loh, {name}! 🎵"
];

const exitMessages = [
    "Auf Wiedersehen, {name}! Semoga hari-harimu menyenangkan! 🇩🇪",
    "Nos vemos pronto, {name}! Jangan lupakan kami! 🇪🇸",
    "Sad to see you go, {name}! Stay safe! 💔",
    "Dewa mata, {name}! (Sampai jumpa lagi!) 🏯",
    "Kita pasti bertemu lagi, {name}! 🌸",
    "Farewell {name}, may you find happiness! 🌟",
    "Au revoir {name}! Kami menunggu kedatanganmu lagi! 🇫🇷",
    "Annyeong {name}-ssi! Semoga kita bertemu di lain waktu! 🇰🇷",
    "Vale {name}! Hope to see you again soon! 🇮🇹",
    "Até logo, {name}! Take care always! 🇧🇷",
    "Wah {name}, kamu keluar... Padahal masih seru nih 😢",
    "Terima kasih sudah bergabung, {name}! Sampai ketemu lagi! 👋",
    "Hei {name}, kami akan merindukanmu di grup ini! 💙",
    "Masih ingat dengan kita ya, {name}! Jangan lupakan kenangan di sini! 🏆",
    "We had great moments, {name}! Safe travels! ✈️",
    "Boku wa {name}-san no koto wasurenai yo! (Aku takkan melupakanmu!) 🥺",
    "Zai jian, {name}! Keep doing your best! 🇨🇳",
    "Sayonara, {name}-san! You were a great member! 🌠",
    "You will be missed, {name}! 💔",
    "We'll keep a seat for you, {name}, anytime you come back! 🪑",
    "Selamat jalan, {name}! Tetap semangat ya! 🔥",
    "Arigatou gozaimasu, {name}-san! Sampai jumpa lagi! 🎭",
    "Sayonara {name}-san! Hope we meet again! 😢",
    "Hampa banget tanpa {name} di sini... 😭",
    "Jaa ne, {name}! Sampai jumpa di dunia lain! 🎌",
    "Makasih udah nemenin kita, {name}! 🎶",
    "Ngga nyangka {name} keluar... Padahal baru kenal 😔",
    "Next time, kita nobar anime bareng lagi ya {name}! 🍿",
    "Gitu aja pergi, {name}? Kita bakal kehilanganmu! 💔",
    "Seriusan {name} ninggalin kita gini aja? 😢",
    "Jangan lupa mampir lagi ke grup ini ya, {name}! 🏡",
    "We hope you had a good time, {name}! 💕",
    "Masih ingat obrolan kita tadi, {name}? Seru banget loh! 😆",
    "You were part of our story, {name}. Goodbye! 📖",
    "Bai-bai {name}-kun! Sampai ketemu di tempat lain! 🚀"
];

    bot.on("new_chat_members", (ctx) => {
        ctx.message.new_chat_members.forEach((user) => {
            const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
                .replace("{name}", user.first_name);

            // Kirim pesan ke grup
            ctx.reply(message);

            // Log ke terminal
            console.log(`[JOIN] ${user.first_name} (${user.id}) bergabung di grup ${ctx.chat.title}`);
        });
    });

    bot.on("left_chat_member", (ctx) => {
        const message = exitMessages[Math.floor(Math.random() * exitMessages.length)]
            .replace("{name}", ctx.message.left_chat_member.first_name);

        // Kirim pesan ke grup
        ctx.reply(message);

        // Log ke terminal
        console.log(`[EXIT] ${ctx.message.left_chat_member.first_name} (${ctx.message.left_chat_member.id}) keluar dari grup ${ctx.chat.title}`);
    });
};
