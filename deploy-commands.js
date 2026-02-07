const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Odtwórz muzykę z YouTube")
    .addStringOption(option =>
      option.setName("url").setDescription("Link YouTube").setRequired(true)
    ),
  new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Zatrzymaj muzykę i wyjdź z kanału"),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pomiń utwór"),
  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauza"),
  new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Wznów")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
).then(() => console.log("✅ Slash commands zarejestrowane"));
