const { Command } = require('discord-akairo');
const { inspect } = require('util');
const { stripIndents } = require('common-tags');
const path = require('path');
const discord = require('discord.js');
const Database = require('@replit/database');
const evaldb = new Database();
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

module.exports = class EvalmodeCommand extends Command {
	constructor() {
		super('evalmode', {
			aliases: ['evalmode'],
			category: 'owner',
			description: 'set message channel to evalmode',
			ownerOnly: true,
			typing: false,
			allowMention: false
		});
	}

	exec(message) {
		const defpfx = '!';
		const prefix = message => {
			evaldb.get(`prefix_${message.guild.id}`).then(value => {
				if (value) {
			 var prefix = value; 
				return prefix;
				} else {
					return defpfx;
				}
			});
		};
		const [command, ...args] = message.content.slice(prefix.length).split(' ');
		switch (command) {
			case 'evalmode':
				switch (args[0]) {
					case 'on':
						logger.info(
							`[EVALMODE ON] in ${message.channel.name} by ${
								message.author.tag
							} channelID:${message.channel.id} userID:${message.author.id}`
						);
						evaldb.set(`evalm_${message.channel.id}`, true).then(() => {
							var msg = message.channel.send('evalmodeをオンにしました！');
						});
						break;
					case 'off':
						logger.info(
							`[EVALMODE OFF] in ${message.channel.name} by ${
								message.author.tag
							} channelID:${message.channel.id} userID:${message.author.id}`
						);
						evaldb.delete(`evalm_${message.channel.id}`).then(() => {
							var msg = message.channel.send('evalmodeをオフにしました！');
						});
						break;
				}
		}
	}
};
