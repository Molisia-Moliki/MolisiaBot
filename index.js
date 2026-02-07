const { Client, GatewayIntentBits, Collection } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const queue = new Map();

client.once("ready", () => {
  console.log("✅ Bot muzyczny online");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, member } = interaction;

  if (!member.voice.channel) {
    return interaction.reply({ content: "❌ Wejdź na kanał głosowy", ephemeral: true });
  }

  let serverQueue = queue.get(guildId);

  // 🎶 /play
  if (commandName === "play") {
    const url = interaction.options.getString("url");
    if (!ytdl.validateURL(url)) {
      return interaction.reply({ content: "❌ Zły link YouTube", ephemeral: true });
    }

    const song = { url };

    if (!serverQueue) {
      const player = createAudioPlayer();

      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      serverQueue = {
        songs: [],
        player,
        connection
      };

      queue.set(guildId, serverQueue);

      serverQueue.songs.push(song);
      playSong(guildId);

      interaction.reply("🎶 Gram muzykę!");
    } else {
      serverQueue.songs.push(song);
      interaction.reply("➕ Dodano do kolejki");
    }
  }

  // ⏭️ /skip
  if (commandName === "skip") {
    if (!serverQueue) return interaction.reply("❌ Nic nie gra");
    serverQueue.player.stop();
    interaction.reply("⏭️ Pominięto");
  }

  // ⏹️ /stop 
  if (commandName === "stop") {
    if (!serverQueue) {
    return interaction.reply("❌ Bot nie jest na kanale");
  }

  serverQueue.songs = [];        // czyści kolejkę
  serverQueue.player.stop();     // zatrzymuje muzykę
  serverQueue.connection.destroy(); // wychodzi z kanału

  queue.delete(guildId);

  return interaction.reply("⏹️ Zatrzymano muzykę i wyszedłem z kanału 👋");
  }

  // ⏸️ /pause
  if (commandName === "pause") {
    if (!serverQueue) return interaction.reply("❌ Nic nie gra");
    serverQueue.player.pause();
    interaction.reply("⏸️ Pauza");
  }

  // ▶️ /resume
  if (commandName === "resume") {
    if (!serverQueue) return interaction.reply("❌ Nic nie gra");
    serverQueue.player.unpause();
    interaction.reply("▶️ Wznawiam");
  }
});

function playSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue || serverQueue.songs.length === 0) {
    serverQueue.connection.destroy();
    queue.delete(guildId);
    return;
  }

  const song = serverQueue.songs[0];
  const stream = ytdl(song.url, { filter: "audioonly", highWaterMark: 1 << 25 });
  const resource = createAudioResource(stream);

  serverQueue.player.play(resource);
  serverQueue.connection.subscribe(serverQueue.player);

  serverQueue.player.once(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    playSong(guildId);
  });
}

client.login(process.env.TOKEN);
