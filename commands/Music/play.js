const { 
    ApplicationCommandType,
    EmbedBuilder,
    ApplicationCommandOptionType,
    StringSelectMenuBuilder,
    ActionRowBuilder
  } = require('discord.js');

  const playdl = require("play-dl");
  
  module.exports = {
  name: "play", 
  description: "Iniciar musica", 
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "pesquisa",
      description: "Faça uma pesquisa no youtube || URL || PLAYLIST",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const searchString = interaction.options.getString("pesquisa");
    if(!searchString) return interaction.reply({content: `🆘 Não consegui obter nenhum resultado de pesquisa.`});
    const url = searchString.replace(/<(.+)>/g, '$1');
    const serverQueue = queue.get(interaction.guild.id);
  
    if(!serverQueue){
      const voice_channel_id = interaction.guild.members.cache.get(interaction.member.user.id).voice.channelId;
      if(!voice_channel_id) return interaction.reply({content: `Me desculpe, mas você precisa estar em um canal de voz para tocar música!`});
      var channelID = voice_channel_id
    }else {
      var channelID = serverQueue.voiceChannel.id
    }
    
    const channel = interaction.guild.channels.cache.get(channelID);
    if(!channel) return interaction.reply({content: "Me desculpe, mas não consegui encontrar o canal de voz."});
    if(!channel.permissionsFor(client.user).has('Connect')) return interaction.reply({content: "Não consigo me conectar ao seu canal de voz, verifique se tenho as permissões adequadas !!"});
    if(!channel.permissionsFor(client.user).has('Speak')) return interaction.reply({content: "Eu não posso falar neste canal de voz, verifique se eu tenho as permissões adequadas !!"});
    
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        const playlist = await playdl.playlist_info(url)
        const videos = await playlist.videos;

        for (const video of Object.values(videos)) {
            await handleVideo(video, interaction, channel, true); 
        }

        return interaction.reply({content: `Adc Playlist: **${playlist.title}** foi bem adicionada a lista!`});
    } else {
        try {
            var video = await playdl.video_info(url);
            handleVideo(video.video_details, interaction, channel);
            return interaction.reply({content: `${video.video_details.title} foi adcionada a lista!`});

        } catch (error) {
            try {
                var videos = await playdl.search(searchString, {limit: 10});
                var yt_list = [];
                videos.map((videoID, i) => yt_list.push({label: `${i+1} - ${videoID.title.slice(0,80)}`, value: `${i}`}));
    
                const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                .setCustomId("menu")
                .setPlaceholder("Menu de músicas")
                .addOptions(yt_list)
                );
    
                let m = await interaction.reply({content: `${videos.map((videoID, i) => `**${i+1}** - ${videoID.title}`).join("\n")}`,components: [row] });
    
                const filterRow = (inter) => inter.isSelectMenu();
                
                await m.createMessageComponentCollector({max: 1,time: 60000,filter: filterRow})
                .on("collect",async (c)=> {
                    let value = c.values[0];
                    c.deferUpdate();
                    
                    handleVideo(videos[value], interaction, channel);
                    
                    await m.edit({content: `**${videos[value].title}** foi adicionada a lista!`, components: []})
                });
    
                } catch (err) {
                    console.error(err);
                    return interaction.reply({content: '🆘 Não consegui obter nenhum resultado de pesquisa.', components: [] });
                }
        }
    
        }
  
}
}
