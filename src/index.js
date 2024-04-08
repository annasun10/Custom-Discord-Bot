require('dotenv').config();
const mongoose = require('mongoose');
const{Client, IntentsBitField, Events} = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to DB");
        eventHandler(client);

        client.login(process.env.TOKEN);
    } catch(error) {
        console.log(`Error: ${error}`);
    }
})();

const reactions = require('./models/Reaction');
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if(!reaction.message.guildId) return;
    if(user.bot) return;

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if(!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await reactions.findOne({Guild: reaction.message.guildId, Message: reaction.message.id, Emoji: cID});
    if(!data) return;

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    const member = await guild.members.cache.get(user.Id);

    try {
        await member.roles.add(data.Role);
    } catch(e) {
        return;
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if(!reaction.message.guildId) return;
    if(user.bot) return;

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if(!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await reactions.findOne({Guild: reaction.message.guildId, Message: reaction.message.id, Emoji: cID});
    if(!data) return;

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    const member = await guild.members.cache.get(user.Id);

    try {
        await member.roles.remove(data.Role);
    } catch(e) {
        return;
    }
});

// // client.on('messageCreate', (message) => {
// //     if(message.author.bot) {
// //         return;
// //     }

// //     if(message.content == 'hello') {
// //         message.reply('hello');
// //     }
// // });

