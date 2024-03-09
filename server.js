var express = require('express');
var app = express();
var path = require('path');
var view = __dirname + "/views/";
var public = __dirname + "/public/";

app.get('/', function(req, res) {
    res.sendFile(path.join(view + "home.html"));
});
app.use('/', express.static(public));
app.listen(8080);

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	], 
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

const fs = require('fs');
const config = require('./config.json');
require('dotenv').config()

/* ------------------ COLLECTIONS ------------------ */
client.commands = new Collection()
client.aliases = new Collection()
client.events = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix

module.exports = client;

const MODEL_NAME = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
  
	if (message.mentions.has(client.user)) {
	  const userMessage = message.content
		.replace(`<@!${client.user.id}>`, "")
		.trim();
	  console.log(`Pesan pengguna: ${userMessage}`);
	  if (userMessage === userMessage) {
		message.reply("> ### ↺ load message \n> " + userMessage)
	  }
	  try {
		// Attempt to generate response using Google Generative AI
  
		const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
		const generationConfig = {
		  temperature: 0.9,
		  topK: 1,
		  topP: 1,
		  maxOutputTokens: 2048,
		};
  
		const parts = [
		  {
			text: `input: ${userMessage}`,
		  },
		];
  
		const result = await model.generateContent({
		  contents: [{ role: "user", parts }],
		  generationConfig,
		});
  
		const reply = await result.response.text();
		console.log(`Bot replied: ${reply}`);
  
		if (reply.length > 2000) {
		  const replyArray = reply.match(/[\s\S]{1,2000}/g);
		  replyArray.forEach(async (msg) => {
			await message.reply(msg);
		  });
		  return;
		}
  
		message.reply(reply);
		if (reply === "") {
		  message.reply("Maaf, saya mengalami masalah saat memproses pesan Anda.")
		};
	  } catch (error) {
		console.error("Error generating response:", error); // Log the error
		message.reply("bot error please report it to the developer\n[❒ EDTLY](https://discord.gg/uRDcjESqeB)"); // Inform user about the error
	  }
	}
  });


fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client)
});


client.login(process.env.TOKEN)