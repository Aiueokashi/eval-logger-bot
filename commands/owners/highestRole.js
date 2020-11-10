const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js')

class HighestRoleCommand extends Command {
	constructor() {
		super('highestRole', {
			aliases: ['highestRole','hirole'],
			disableMention:true,
			ownerOnly:true,
			args: [
				{
					id: 'member',
					type: 'member',
					default: message => message.member
				}
			],
			channel: 'guild'
		});
	}

	exec(message, args) {
		return message.reply(new MessageEmbed().setColor("BLUE").setTitle("highestRole").setDescription(`<@&${args.member.roles.highest.id}>`));
		
	}
}

module.exports = HighestRoleCommand;
