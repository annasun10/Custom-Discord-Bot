const {Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder} = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const {Font, RankCardBuilder} = require('canvacord');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if(!interaction.inGuild()) {
            interaction.reply('you can only run this command inside a server');
            return;
        }

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await Level.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
        });

        if(!fetchedLevel) {
            interaction.editReply(
                mentionedUserId ? `${targetUserObj.user.tag} doesn't have any levels yet` : "you don't have any levels yet"
            );
            return;
        }

        let allLevels = await Level.find({guildId: interaction.guild.id}).select('-_id userId level xp');

        allLevels.sort((a, b) => {
            if(a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        Font.loadDefault();
        const rank = new RankCardBuilder()
            .setDisplayName(targetUserObj.user.displayName)
            .setUsername(targetUserObj.user.username)
            .setAvatar(targetUserObj.user.displayAvatarURL({size: 256}))
            .setCurrentXP(fetchedLevel.xp)
            .setRequiredXP(calculateLevelXp(fetchedLevel.level))
            .setLevel(fetchedLevel.level)
            .setRank(currentRank)
            .setStatus(targetUserObj.presence.status);
        rank.setStyles({
            progressbar: {
                thumb: {
                    style: {
                        backgroundColor: '#A0CCFF',
                    },
                },
            },
        });
        const data = await rank.build({
            format: 'png'
        });
        const attachment = new AttachmentBuilder(data);
        interaction.editReply({files: [attachment]});
    },

    name: 'level',
    description: "shows your/someone's level",
    options: [
        {
            name: 'target-user',
            description: 'the user whose level you want to see',
            type: ApplicationCommandOptionType.Mentionable,
        }
    ]
}