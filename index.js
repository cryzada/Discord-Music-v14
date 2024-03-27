// Importa os módulos necessários
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

// Importa configurações e módulos adicionais
const config = require("./config.json");
const PlayDL = require("play-dl");

// Cria uma mapa para armazenar as filas de reprodução
const queue = new Map();

// Cria um cliente Discord
const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildVoiceStates",
        "GuildMessageTyping",
        "GuildIntegrations",
        "MessageContent",
        "DirectMessageTyping",
        "DirectMessages",
        GatewayIntentBits.Guilds
    ]
});

module.exports = client;
client.slashCommands = new Collection();
client.commands = new Collection();

// Manipula interações com o cliente
client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild) return;

    if (interaction.isCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;
        cmd.run(client, interaction, handleVideo, queue, disconnectToChannel);
    }

    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction, handleVideo, queue, disconnectToChannel);
    }
});

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log("Estou pronta!");
});

// Inicia o sistema de manipulação de comandos
require('./handler')(client);

// Função para conectar a um canal de voz
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

// Função para desconectar de um canal de voz
async function disconnectToChannel(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.destroy();
}

// Função para lidar com a reprodução de vídeo
async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);

    console.log(video) // ID de informações do vídeo

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

// Função para iniciar a reprodução de música
async function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        disconnectToChannel(serverQueue.voiceChannel);
        queue.delete(guild.id);
        return;
    }

    serverQueue.textChannel.send(`Tocando: **${song.title}**`);

    const sond = await PlayDL.stream(song.url, {
        quality: 2, // qualidade: [0 = mais baixa, 1 = média, 2 = mais alta]
    });

    const resource = createAudioResource(sond.stream, {
        inputType: sond.type,
        inlineVolume: true // Deixe verdadeiro se quiser alterar o volume da música
    });

    serverQueue.player.play(resource);

    entersState(serverQueue.player, AudioPlayerStatus.Playing);

    serverQueue.player.on(AudioPlayerStatus.Idle, async () => {

        if (serverQueue.stopLoop) {
            clearTimeout(serverQueue.stopLoop);
            serverQueue.stopLoop = setTimeout(() => serverQueue.stopLoop = false, 5000);
            return;
        }

        serverQueue.stopLoop = setTimeout(() => serverQueue.stopLoop = false, 5000);

        if (!serverQueue.loop) serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);

    });

    resource.volume.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.connection = resource;
}

// Faz login com o token fornecido no arquivo de configuração
client.login(config.token);
