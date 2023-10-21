const { ApplicationCommandType } = require('discord.js');
  
  module.exports = {
  name: "skip", 
  description: "Pular música", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});

    serverQueue.connection.audioPlayer.stop();

    interaction.reply({content: "Skip ✅"});
  
  }
  }