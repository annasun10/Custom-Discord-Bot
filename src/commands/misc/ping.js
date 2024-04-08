module.exports = {
    name: 'ping',
    description: 'pong',
    //devOnly: Boolean,
    testOnly: true,
    //options: Object[],
    //deleted: Boolean,

    callback: (client, interaction) => {
        interaction.reply(`pong ${client.ws.ping}ms`);
    },
};