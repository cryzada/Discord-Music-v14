const {
  Client,
  GatewayIntentBits,
  InteractionType,
  Collection,
  EmbedBuilder,
  ActivityType,
  escapeMarkdown,
  Partials,
  AttachmentBuilder
} = require("discord.js");

const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	createReadStream,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel
} = require('@discordjs/voice');

const config = require("./config.json");
const PlayDL = require("play-dl");
const queue = new Map();

const client = new Client({ 
  intents: [
    "Guilds",
	"GuildMembers",
	"GuildMessageReactions",
    "GuildMessages",
    "GuildVoiceStates",
    "GuildMessageTyping",
    "GuildIntegrations",
	"GuildEmojisAndStickers",
	"GuildBans",
	"GuildInvites",
	"DirectMessageReactions",
	"GuildPresences",
	"GuildWebhooks",
    "MessageContent",
    "DirectMessageTyping",
    "DirectMessages",
	"AutoModerationConfiguration",
	"AutoModerationExecution",
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.DirectMessageTyping
       ],
	   'partials': [Partials.Channel]
    });

module.exports = client;
client.slashCommands = new Collection();
client.commands = new Collection();

client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild) return;

    if (interaction.isCommand()) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return;
		
		cmd.run(client, interaction,handleVideo, queue, disconnectToChannel);

    }
	
    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction,handleVideo, queue, disconnectToChannel);

    }
});

client.on('ready', () => {
    console.log("Estou pronta!"); 
});

require('./handler')(client);

async function connectToChannel(channel) {
    const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

async function disconnectToChannel(channel) {

	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	
    connection.destroy();
}
			
	
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);

	console.log(video) // ID de informações do video

	const song = {
		id: video.id,
		title: escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
		/*
		Se você quiser personalizar o bot completamente do seu jeito, adicione mais informações a este objeto
		*/
	};

	if (!serverQueue) {

		const queueConstruct = {
            player: createAudioPlayer(),
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
			loop: false, 
            stopLoop: false // Uma solução para interromper o loop no final da música
		};

		queue.set(msg.guild.id, queueConstruct);
	
		queueConstruct.songs.push(song);
	
		try {
			const connection = await connectToChannel(voiceChannel);
			connection.subscribe(queueConstruct.player);
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`Eu não pude entrar no canal de voz: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Eu não pude entrar no canal de voz: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`Agora **${song.title}** foi adicionado a lista!`);
	}
		return undefined;
	}
	
async function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		disconnectToChannel(serverQueue.voiceChannel);
		queue.delete(guild.id);
		return;
	}
	
	serverQueue.textChannel.send(`Tocando: **${song.title}**`);
	
	const sond = await PlayDL.stream(song.url,{
        quality: 2, // quality: [ 0 = Lowest, 1 = Medium, 2 = Highest ]
    }); 

	const resource = createAudioResource(sond.stream, {
        inputType: sond.type,
        inlineVolume: true // Deixe verdadeiro se quiser alterar o volume da música
    });

	serverQueue.player.play(resource);

	entersState(serverQueue.player, AudioPlayerStatus.Playing);

	serverQueue.player.on(AudioPlayerStatus.Idle,async () => {

        if(serverQueue.stopLoop){
            clearTimeout(serverQueue.stopLoop);
			serverQueue.stopLoop = setTimeout(() => serverQueue.stopLoop = false, 5000);
            return;
        }

        serverQueue.stopLoop = setTimeout(() => serverQueue.stopLoop = false, 5000);

		if(!serverQueue.loop) serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);
		
	});

	resource.volume.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.connection = resource;
		
}

client.login(config.token)



