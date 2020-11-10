const discord = require('discord.js');
const client = new discord.Client();
const { inspect } = require('util');
const { EVAL_OWNERS } = process.env;
const Database = require("@replit/database");
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

exports.eval = async function(client, message, args) {
	if (EVAL_OWNERS.includes(message.author.id)) {
		let evaled;
        var sourceStr = message.content;
        try {
        evaled = await eval(args.join(" "));
        message.react("✅");
			  logger.info(`[EVAL MODE] Used by ${message.author.tag} ID:${message.author.id}`)
        //console.log(inspect(evaled));
        } catch (error) {
        logger.info(`[EVAL MODE ERR] Used by ${message.author.tag} ID:${message.author.id}`)
        //console.error(error);
        message.channel.send({
            embed: {
            color: 0x00ae86,
            title: "ERROR",
					  description: 'code```javascript\n' + code + '```ERROR内容```ml\n' + error + '```'
            }
        });
        message.react("❌");
        }
	}
};
