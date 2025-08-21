const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Cria o client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Onde vamos guardar os comandos
client.commands = new Collection();

// Lê a pasta commands/
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[AVISO] O comando em ${filePath} está faltando "data" ou "execute".`);
		}
	}
}

// Quando o bot ficar pronto
client.once(Events.ClientReady, readyClient => {
	console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);
});

// Quando alguém usa slash command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Nenhum comando encontrado para ${interaction.commandName}.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: '❌ Ocorreu um erro ao executar esse comando!', ephemeral: true });
		} else {
			await interaction.reply({ content: '❌ Ocorreu um erro ao executar esse comando!', ephemeral: true });
		}
	}
});

// Login
client.login(token);
