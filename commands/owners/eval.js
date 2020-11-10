const { Command } = require('discord-akairo');
const { inspect } = require('util');
const { stripIndents } = require('common-tags');
const path = require('path');
const discord = require('discord.js');
const DClient = new discord.Client();
const winston = require('winston')
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

module.exports = class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval'],
			category: 'owner',
			description: 'evaluate command',
			ownerOnly: true,
			typing: false,
			cooldown: 2000,
			allowMention: false
		});
	}
	async exec(message) {
		const prefix = process.env.EVAL_PREFIX;
		const args = message.content.slice(prefix.length + 4).split(' ');
		let evaled;
		var sourceStr = message.content;
		var code = sourceStr.slice(prefix.length + 4);
		try {
			evaled = await eval(args.join(' '));
			message.react('✅');
			//console.log(inspect(evaled));
			logger.info(`[EVAL] Used by ${message.author.tag} ID:${message.author.id}`)
		} catch (error) {
			logger.error(`[EVAL ERR] Used by ${message.author.tag} ID:${message.author.id}`);
			//console.log(error)
			var errormsg = message.channel.send({
				embed: {
					color: 0x00ae86,
					title: 'ERROR',
					description: 'コード```javascript\n' + code + '```ERROR内容```ml\n' + error + '```'
				}
			});
			message.react('❎');
		}
	}
};
