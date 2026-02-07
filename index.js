const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const queue = new Map();
const player = createAudioPlayer();

client.once("ready", () => console.log("✅ Bot muzyczny online"));

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, guildId, member } = interaction;

  if (!member.voice.channel) return interaction.reply({ content: "❌ Wejdź na kanał głosowy", ephemeral: true });

  let serverQueue = queue.get(guildId);

  if (commandName === "play") {
    const url = interaction.options.getString("url");
    if (!ytdl.validateURL(url)) return interaction.reply({ content: "❌ Podaj poprawny link YouTube", ephemeral: true });

    const song = { url };

    if (!serverQueue) {
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      serverQueue = {
        songs: [song],
        connection,
        player: crea
