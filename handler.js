const fs = require("fs");

module.exports = async (client) => {
  const SlashsArray = [];

  const loadSlashCommands = async () => {

    const slashFolders = fs.readdirSync('./commands');

    for (const subfolder of slashFolders) {

      const slashFiles = fs.readdirSync(`./commands/${subfolder}/`).filter(file => file.endsWith('.js'));
     

      for (const file of slashFiles) {

        const command = require(`./commands/${subfolder}/${file}`);

        if (!command.name) continue;

        client.slashCommands.set(command.name, command);

        SlashsArray.push(command);

      }
    }
  };

  await loadSlashCommands();

  const arrayOfSlashCommands = [];

  SlashsArray.map((value) => {

    const file = value
    if (!file?.name) return;
    client.slashCommands.set(file.name, file);
      
    if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
    arrayOfSlashCommands.push(file);

    });

    client.on("ready", async () => {
        await client.application.commands.set(arrayOfSlashCommands);
    });


};