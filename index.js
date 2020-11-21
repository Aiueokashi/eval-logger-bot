require('dotenv').config();
const { EVAL_TOKEN, EVAL_PREFIX, EVAL_OWNERS } = process.env;
const Database = require('@replit/database');
const evaldb = new Database();
const Client = require('./structures/Client');
const discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	prefix: EVAL_PREFIX,
	ownerID: EVAL_OWNERS.split(','),
	disableEveryone: true,
	disabledEvents: []
});
const winston = require('winston');
const activities = require('./assets/json/activity');
const { stripIndents } = require('common-tags');
const codeblock = /```(?:(\S+)\n)?\s*([^]+?)\s*```/i;
const runLint = message => {
	if (message.channel.type !== 'text' || message.author.bot) return null;
	if (!codeblock.test(message.content)) return null;
	if (
		!message.channel
			.permissionsFor(message.client.user)
			.has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])
	)
		return null;
	const parsed = codeblock.exec(message.content);
	const code = {
		code: parsed[2],
		lang: parsed[1] ? parsed[1].toLowerCase() : null
	};
	return client.commandHandler.modules.get('lint');
	/*.exec(message, { code, amber: false }, true);*/
};
//logger
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
var simpLogger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: timezoned }),
		winston.format.printf(log => `[${log.timestamp}]:${log.message}`)
	)
});

client.setup();
client.on('message', message => runLint(message));

client.on('message', async message => {
	const [...args] = message.content.split(' ');
	evaldb.get(`evalm_${message.channel.id}`).then(value => {
		if (value == true) {
			if (EVAL_OWNERS.includes(message.author.id)) {
				if (message.content.includes('token')) {
					message.react('🖕');
					return;
				}
				if (message.content.includes('env')) {
					message.react('🖕');
					return;
				}
				if (message.content.includes('evalmode')) {
					return;
				}
				const { eval } = require('./modules/evalmode.js');
				eval(client, message, args);
			} else if (message.author.id === client.user.id) {
			} else {
				message.delete({ timeout: 500 }).then(async message => {
					var msg = await message.channel.send(
						'<@' +
							message.author.id +
							'>\nevalmode is on!!\nyou are not owner!!!'
					);
					await msg.delete({ timeout: 3000 });
				});
			}
		}
	});
});

client.on('messageUpdate', (oldMessage, message) => runLint(message));

client.on('channelCreate', function(channel) {
	client.logger.info(
		`[CHANNEL CREATE]: ${channel.name} in ${channel.guild.name}`
	);
	evaldb.get(`channellogger_${channel.guild.id}`).then(value => {
		if (value) {
			client.channels.cache.get(value).send(
				new MessageEmbed()
					.setTitle('ChannelCreate')
					.setDescription(`[CHANNEL CREATE]:${channel}`)
					.addField(
						`[CHANNEL NAME]:\n\`\`\`${channel.name}\`\`\``,
						`[CHANNEL ID]:\`\`\`ml\n${channel.id}\`\`\``
					)
			);
		}
	});
});

client.on('channelDelete', function(channel) {
	client.logger.info(
		`[CHANNEL DELETE]: ${channel.name} in ${channel.guild.name}`
	);
	evaldb.get(`channellogger_${channel.guild.id}`).then(value => {
		if (value) {
			client.channels.cache.get(value).send(
				new MessageEmbed()
					.setTitle('ChannelDelete')
					.setDescription(`[CHANNEL NAME]:${channel}`)
					.addField(
						`[CHANNEL NAME]:\n\`\`\`${channel.name}\`\`\``,
						`[CHANNEL ID]:\`\`\`ml\n${channel.id}\`\`\``
					)
			);
		}
	});
});

client.on('channelUpdate', function(oldChannel, newChannel) {
	client.logger.info(
		`[CHANNEL UPDATE]: ${oldChannel.name} => ${newChannel.name} in ${
			oldChannel.guild.name
		}`
	);
	evaldb.get(`channellogger_${oldChannel.guild.id}`).then(value => {
		if (value) {
			client.channels.cache
				.get(value)
				.send(
					new MessageEmbed()
						.setTitle('channelUpdate')
						.setDescription(
							`[CHANNEL]:${newChannel}\n[OLD CHANNEL NAME]:\`\`\`${
								oldChannel.name
							}\`\`\`\n[NEW CHANNEL NAME]:\`\`\`${
								newChannel.name
							}\`\`\`\n[CHANNEL ID]:\`\`\`ml\n${newChannel.id}\`\`\``
						)
				);
		}
	});
});

client.on('guildMemberAdd', function(member) {
	evaldb.get(`channellogger_${member.guild.id}`).then(value => {
		if (value) {
			client.channels.cache
				.get(value)
				.send(
					new MessageEmbed()
						.setTitle('guildMemberAdd')
						.setDescription(
							`[GUILD]:${member.guild.name}\n[JOIN MEMBER]:\`\`\`${
								member.user.tag
							}\`\`\`\n[MEMBER ID]:\`\`\`${
								member.user.id
							}\`\`\`\n[MEMBER ACCOUNT CREATED]:\`\`\`ml\n${
								member.createdAt
							}\`\`\``
						)
				);
		}
	});
	evaldb.get(`blacklist_${member.user.id}`).then(value => {
		if (!value === member.user.id) {
			return;
		} else {
			member
				.ban()
				.then(() => {
					evaldb.get(`channellogger_${member.guild.id}`).then(value => {
						if (value) {
							client.channels.cache
								.get(value)
								.send(
									new MessageEmbed()
										.setTitle('AUTO GUILD PROTECTION')
										.setDescription(
											`[GUILD PROTECTED] Successfully banned blacklisted user:${
												member.tag
											}`
										)
								);
						}
					});
				})
				.catch(err => {
					logger.error(err);
				});
		}
	});
});

client.on('messageDelete', function(message) {
	client.logger.info(`[MESSAGE DELETED]:${message.id} was deleted!`);
	if (!message.partial) {
		console.log(
			`[DELETE MESSGE CONTENT]: It had content: "${message.content}"`
		);
	}
	evaldb.get(`channellogger_${message.guild.id}`).then(value => {
		if (value) {
			if (!message.partial) {
				client.channels.cache.get(value).send(
					new MessageEmbed()
						.setTitle('MessageDelete')
						.setDescription(`[MESSAGE DELETED]:${message.author}\n
							[DELETE MESSAGDE CHANNEL]:\n<#${message.channel.id}>\n
							[DELETED MESSAGE ID]:\`\`\`ml\n${message.id}\`\`\`\n
							[DELETED MESSAGE CONTENT]:\`\`\`ml\n${message.content}\`\`\`\n
							[DELETED MESSAGE ATTACHMENT]:\`\`\`ml\n${message.attachment}\`\`\``)
						
				);
			}else{
			  return;
			}
		}
	});
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch();

	client.logger.info(
		`[REACTION ADD]:${reaction.message.author.tag}'s message "${
			reaction.message.content
		}" gained a reaction!`
	);

	if (reaction.partial) await reaction.fetch();

	client.logger.info(
		`[REACTION COUNT]:${
			reaction.count
		} user(s) have given the same reaction to this message!`
	);
});

client.on('ready', () => {
	client.logger.info(
		`[READY] Logged in as ${client.user.tag}! ID: ${client.user.id}`
	);
	client.setInterval(() => {
		const activity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(activity.text, { type: activity.type });
	}, 15000);
});

client.on('disconnect', event => {
	client.logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
	process.exit(0);
});

client.on('error', err => client.logger.error(err));

client.on('warn', warn => client.logger.warn(warn));

client.listenerHandler.on('ready', listener => {
	client.logger.info(`[LISTENING] listening ${listener.name} `);
});

client.listenerHandler.on('error', (listener, err) => {
	client.logger.info(`[LISTENING] error: ${listener.name} `);
});

client.commandHandler.on('error', (err, msg, command) => {
	client.logger.error(
		`[COMMAND${command ? `:${command.name}` : ''}]\n${err.stack}`
	);
	client.logger
		.error(
			stripIndents`
		実行時エラー: \`${err.message}\`exit...`
		)
		.catch(() => null);
});

client.login(EVAL_TOKEN);
