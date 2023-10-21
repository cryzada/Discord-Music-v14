const { 
    ApplicationCommandType,
    ApplicationCommandOptionType,
  } = require('discord.js');
  
  module.exports = {
  name: "volume", 
  description: "Modificar o volume atual", 
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "volume",
      description: "Cuidado ao escolher o volume, pode estourar o áudio!",
      type: ApplicationCommandOptionType.Number,
      required: false
    }
  ],
  
  run: async (client, interaction, handleVideo, queue) => {

    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});

    const args = interaction.options.getNumber("volume");
    if(!args) return interaction.reply({content: `Volume Atual: **${serverQueue.volume}**`});

    serverQueue.connection.volume.setVolumeLogarithmic(args / 5);
    serverQueue.volume = args;

    interaction.reply({content: `Volume: **${serverQueue.volume}**`});
            
  }
  }
  