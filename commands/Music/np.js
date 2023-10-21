const { 
    ApplicationCommandType

  } = require('discord.js');
  
  module.exports = {
  name: "np", 
  description: "Ver Música atual", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});

    interaction.reply({
        content: `Tocando agora: **${serverQueue.songs[0].title}**`
    });
  
  }
  }