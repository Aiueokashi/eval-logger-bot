const http = require('http');
http
	.createServer(function(req, res) {
		res.write('動いてりゅよฅ(＾・ω・＾ฅ)');
		res.end();
	})
	.listen(8080);
const {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler
} = require('discord-akairo');
const { stripIndents } = require('common-tags');
const winston = require('winston');
const path = require('path');
const CodeType = require('../types/code');
const Database = require('@replit/database');
const evaldb = new Database();

const timezoned = () => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: 'Asia/Tokyo'
	});
};

const defprefix = process.env.EVAL_PREFIX;
class Client extends AkairoClient {
	constructor() {
		super(
			{
				ownerID: [
					'475304856018616340',
					'648352593365434370',
					'489012602182041601'
				]
			},
			{
				disableMentions: 'everyone'
			}
		);
		this.commandHandler = new CommandHandler(this, {
			directory: './commands/',
			prefix: "!",
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 60000,
			fetchMembers: true,
			defaultCooldown: 1000,
			defaultPrompt: {
				modifyStart: (text, message) => stripIndents`
					${message.author}, ${text}
					Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
				`,
				modifyRetry: (text, message) => stripIndents`
					${message.author}, ${text}
					Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
				`,
				timeout: message => `${message.author}, cancelled command.`,
				ended: message =>
					`${
						message.author
					}, 2 tries and you still don't understand, cancelled command.`,
				cancel: message => `${message.author}, cancelled command.`,
				retries: 2,
				stopWord: 'finish'
			}
		});
		this.logger = winston.createLogger({
			transports: [new winston.transports.Console()],
			format: winston.format.combine(
				winston.format.timestamp({ format: timezoned }),
				winston.format.printf(
					log =>
						`[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`
				)
			)
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: './inhibitors/'
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: './listeners/'
		});
	}
	setup() {
		this.commandHandler.loadAll();
		this.commandHandler.resolver.addType('code', CodeType);
		this.inhibitorHandler.loadAll();
		this.listenerHandler.setEmitters({
			process: process,
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.loadAll();
	}
}
module.exports = Client;
