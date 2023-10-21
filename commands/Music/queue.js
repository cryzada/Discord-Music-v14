const { ApplicationCommandType } = require('discord.js');
  
  module.exports = {
  name: "queue", 
  description: "Ver lista de reprodução atual", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});

    interaction.reply({
        content: `${serverQueue.songs.map((song, i) => `**${i+1}** - ${song.title}`).join('\n')}

Tocando agora: **${serverQueue.songs[0].title}**`
    });
  
  }
  }