const { Command } = require('discord-akairo');
const winston = require('winston');
const { MessageEmbed } = require('discord.js');
const Database = require('@replit/database');
const evaldb = new Database();
const timezoned = () => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo'
	});
};
var logger = winston.createLogger({
	transports: [new winston.transports.Console()],
	format: winston.format.combine(
		winston.format.timestamp({ format: timezoned }),
		winston.format.printf(
			log => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`
		)
	)
});

class GbanCommand extends Command {
	constructor() {
		super('Gban', {
			aliases: ['Gban'],
			ownerOnly: true,
			category: 'owner'
		});
	}

	exec(message) {
		const prefix = process.env.EVAL_PREFIX;
		const [command, ...args] = message.content.slice(prefix.length).split(' ');
		if (!args[0]) {
			message.reply('PLZ Set User ID');
		} else {
					evaldb.set(`blacklist_${args[0]}`, args[0]).then(() => {
						logger.info(
							`[GLOBAL BAN] by ${message.author.tag} |ID:${message.author.id}`
						);
					});
		}
	}
}

module.exports = GbanCommand;
