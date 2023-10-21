const {ApplicationCommandType, EmbedBuilder} = require("discord.js")

module.exports = {
  name: "ping", 
  description: "View the bot's ping", 
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction,handleVideo, queue, disconnectToChannel) => {
    
    let ping = client.ws.ping;

    let embed = new EmbedBuilder()
    .setDescription(`**🏓 ${ping}ms**`)
    .setColor("Random");
    
    interaction.reply({ content: "Ping..." }).then( () => {
        setTimeout( () => {
            interaction.editReply({content: "", embeds: [embed] })
        }, 2000)
    })
  }
}