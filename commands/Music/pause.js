const { ApplicationCommandType } = require('discord.js');
  
  module.exports = {
  name: "pause", 
  description: "Pausar a música atual", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {

    const serverQueue = queue.get(interaction.guild.id);

    if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.audioPlayer.pause();
        return interaction.reply({content: '⏸ Pausou'});
    }

    interaction.reply({content: "Não a nada tocando."});
  
  }
  }
  