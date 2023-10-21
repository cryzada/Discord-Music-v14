const { ApplicationCommandType } = require('discord.js');
  
  module.exports = {
  name: "loop", 
  description: "Loop em Música", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});
    serverQueue.loop = !serverQueue.loop;

    return interaction.reply({content: `Comando loop ${serverQueue.loop ? `**Ativado**`: `**Desativado**`}`});
  
  }
  }