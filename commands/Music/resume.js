const { ApplicationCommandType } = require('discord.js');
  
  module.exports = {
  name: "resume", 
  description: "Resumir Música atual", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);

    if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.audioPlayer.unpause();
        return interaction.reply({content: '▶ Rusumindo'});
    }

    interaction.reply({content: "Não a nada tocando."});
  
  }
  }