const { Command } = require('discord-akairo');
const util = require('util');
const discord = require('discord.js');
const { stripIndents } = require('common-tags');
const { escapeRegex } = require('../../util/Util');
const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');
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

module.exports = class Eval2Command extends Command {
	constructor() {
		super('eval2', {
			aliases: ['exec', 'eval2'],
			category: 'owner',
			description: 'executes command',
			ownerOnly: true,
			args: [
				{
					id: 'script',
					prompt: {
						start: 'What code would you like to evaluate?',
						retry: 'You provided an invalid script. Please try again.'
					},
					match: 'content',
					type: 'code'
				}
			]
		});

		this.lastResult = null;
	}

	exec(message, { script }) {
	  logger.info(`[EVAL2] by ${message.author.tag} ID:${message.author.id}`)
		const { client, lastResult } = this;
		const doReply = val => {
			if (val instanceof Error) {
				message.reply(`[Execute] コールバックエラー: \`${val}\``);
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
				if (Array.isArray(result)) {
					for (const item of result) message.reply(item);
				} else {
					message.reply(result);
				}
			}
		};

		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(script.code);
			hrDiff = process.hrtime(hrStart);
		} catch (err) {
			return message.util.reply(`[Execute] 実行時エラー: \`${err}\``);
		}

		this.hrStart = process.hrtime();
		return message.util.reply(this.makeResultMessages(this.lastResult, hrDiff, script.code));
	}

	makeResultMessages(result, hrDiff, input = null) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\''
			? split[split.length - 1]
			: inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if (input) {
			return discord.splitMessage(stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		} else {
			return discord.splitMessage(stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}
	}

	get sensitivePattern() {
		if (!this._sensitivePattern) {
			let pattern = '';
			if (this.client.token) pattern += escapeRegex(this.client.token);
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
		}
		return this._sensitivePattern;
	}
};
